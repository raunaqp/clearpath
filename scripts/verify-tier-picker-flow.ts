/**
 * Phase 2c tier-picker fix — list recent assessments to manually walk
 * the fixed main-journey flow in a browser.
 */
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}

import { getServiceClient } from "@/lib/supabase";

(async () => {
  const sb = getServiceClient();
  const { data } = await sb
    .from("assessments")
    .select(
      "id, status, email, share_token, meta, wizard_answers, created_at"
    )
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(10);

  console.log("Recent completed assessments (newest first):\n");
  for (const a of data ?? []) {
    const tierBDone = !!(a.meta as Record<string, unknown> | null)?.[
      "tier_b_completed_at"
    ];
    const persona = (a.wizard_answers as Record<string, unknown> | null)?.[
      "persona"
    ];
    const { data: orders } = await sb
      .from("tier2_orders")
      .select("id, status, tier_choice")
      .eq("assessment_id", a.id);
    const orderSummary = (orders ?? [])
      .map((o) => `${o.tier_choice ?? "?"}/${o.status}`)
      .join(", ");
    console.log(
      `  ${a.id.slice(0, 8)} | persona=${persona ?? "—"} | tierB=${tierBDone} | orders=[${orderSummary}]`
    );
    console.log(`    /upgrade/${a.id}`);
  }
})();
