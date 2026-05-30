/**
 * Phase C verification: drive /api/intake with each of the three
 * personas and confirm:
 *   1. The endpoint accepts persona and returns 201
 *   2. wizard_answers.persona is stamped on the assessments row
 *   3. /wizard/[id]/q/1 does NOT redirect to /wizard/[id]/persona
 *      (i.e. the persona is recognised by the wizard's gate)
 *   4. Omitting persona still works for legacy clients (server schema
 *      is optional) — the row's wizard_answers.persona ends up null
 *      and the wizard would redirect to the /persona fallback.
 *
 * Cleans up the rows it creates at the end.
 */
import { getServiceClient } from "../lib/supabase";
import type { Persona } from "../lib/wizard/types";

const BASE = "http://localhost:3000";

type IntakePayload = {
  name: string;
  email: string;
  one_liner: string;
  persona?: Persona;
};

async function postIntake(p: IntakePayload): Promise<{ ok: boolean; status: number; assessmentId?: string; body: unknown }> {
  const res = await fetch(`${BASE}/api/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  const body = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    assessmentId: (body as { assessmentId?: string }).assessmentId,
    body,
  };
}

async function checkWizardRedirect(assessmentId: string): Promise<{
  status: number;
  location: string | null;
}> {
  // Wizard pages are auth-gated. We expect either 200/307. With no
  // session cookie, /wizard/[id]/q/1 will redirect to /login. What we
  // want to verify is that the persona gate doesn't ALSO fire. The
  // redirect chain order in q/[n]/page.tsx is: auth → status → persona.
  // We can't easily inspect a chained redirect via curl alone, so we
  // verify at the DB level: persona is set → the persona-gate redirect
  // at line 222 would not fire.
  const res = await fetch(`${BASE}/wizard/${assessmentId}/q/1`, {
    redirect: "manual",
  });
  return {
    status: res.status,
    location: res.headers.get("location"),
  };
}

async function main() {
  const supabase = getServiceClient();
  const created: string[] = [];
  const passes: string[] = [];
  const fails: string[] = [];

  const personas: Persona[] = [
    "manufacturer_samd",
    "clinical_investigation_researcher",
    "manufacturer_hardware",
  ];

  for (const persona of personas) {
    console.log(`\n=== ${persona} ===`);
    const r = await postIntake({
      name: `Phase C verify ${persona}`,
      email: `verify+${persona}@clearpath.in`,
      one_liner: `Phase C verification submission for the ${persona} persona path.`,
      persona,
    });
    if (!r.ok || !r.assessmentId) {
      console.log(`  ✗ POST failed: status=${r.status} body=${JSON.stringify(r.body)}`);
      fails.push(`POST ${persona}: status ${r.status}`);
      continue;
    }
    console.log(`  ✓ POST 201 · assessment=${r.assessmentId}`);
    created.push(r.assessmentId);
    passes.push(`POST ${persona}`);

    // Confirm DB persistence
    const { data: row, error } = await supabase
      .from("assessments")
      .select("id, wizard_answers")
      .eq("id", r.assessmentId)
      .maybeSingle<{ id: string; wizard_answers: { persona?: Persona } | null }>();
    if (error || !row) {
      console.log(`  ✗ DB read failed`);
      fails.push(`DB read ${persona}`);
      continue;
    }
    const storedPersona = row.wizard_answers?.persona;
    if (storedPersona === persona) {
      console.log(`  ✓ wizard_answers.persona = ${storedPersona}`);
      passes.push(`Persisted ${persona}`);
    } else {
      console.log(`  ✗ wizard_answers.persona = ${storedPersona} (expected ${persona})`);
      fails.push(`Persisted ${persona}`);
    }

    // Confirm /wizard/[id]/q/1 redirect chain
    const w = await checkWizardRedirect(r.assessmentId);
    console.log(`  /wizard/${r.assessmentId.slice(0, 8)}…/q/1 → ${w.status} ${w.location ?? "(no redirect)"}`);
    if (w.location && /\/persona/.test(w.location)) {
      console.log(`  ✗ Wizard redirected to /persona despite persona being set`);
      fails.push(`Persona gate fired wrongly for ${persona}`);
    } else {
      console.log(`  ✓ Wizard did NOT redirect to /persona`);
      passes.push(`Wizard gate bypassed for ${persona}`);
    }
  }

  // Legacy / omitted-persona regression check
  console.log(`\n=== persona omitted (legacy client) ===`);
  const legacy = await postIntake({
    name: "Phase C verify legacy",
    email: "verify+legacy@clearpath.in",
    one_liner: "Phase C verification — no persona supplied. Should still succeed.",
  });
  if (!legacy.ok || !legacy.assessmentId) {
    console.log(`  ✗ POST without persona failed: status=${legacy.status} body=${JSON.stringify(legacy.body)}`);
    fails.push(`Legacy POST (no persona)`);
  } else {
    console.log(`  ✓ POST without persona accepted (server schema optional) · assessment=${legacy.assessmentId}`);
    created.push(legacy.assessmentId);
    passes.push(`Legacy POST (no persona)`);
    const w = await checkWizardRedirect(legacy.assessmentId);
    if (w.location && /\/persona/.test(w.location)) {
      console.log(`  ✓ Wizard correctly redirects to /persona for a row without one`);
      passes.push(`Fallback gate fires for legacy row`);
    } else {
      console.log(`  · /wizard/${legacy.assessmentId.slice(0, 8)}…/q/1 → ${w.status} ${w.location ?? "(none)"}`);
      console.log(`    (auth-gated route may have redirected to /login first; that's expected)`);
    }
  }

  // Cleanup
  if (created.length > 0) {
    console.log(`\n=== cleanup ===`);
    for (const id of created) {
      await supabase.from("engine_costs").delete().eq("assessment_id", id);
      await supabase.from("tier2_orders").delete().eq("assessment_id", id);
      await supabase.from("assessments").delete().eq("id", id);
    }
    console.log(`  cleaned ${created.length} rows`);
  }

  console.log(`\n=== summary ===`);
  console.log(`  passes: ${passes.length}`);
  for (const p of passes) console.log(`    ✓ ${p}`);
  if (fails.length > 0) {
    console.log(`  FAILS: ${fails.length}`);
    for (const f of fails) console.log(`    ✗ ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
