import { redirect } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { PersonaGate } from "@/components/wizard/PersonaGate";
import type { Persona, WizardAnswers } from "@/lib/wizard/types";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  status: string;
  wizard_answers: WizardAnswers | null;
};

/**
 * Sprint 3 Phase 2a — pre-Q1 persona gate.
 *
 * Three personas (founder-locked):
 *   - manufacturer_samd                 → existing default SaMD path
 *   - clinical_investigation_researcher → MD-22/23 (bible §9)
 *   - manufacturer_hardware             → MD-3/MD-7 (bible §4)
 *
 * Resume behaviour: if persona is already saved, skip the gate and
 * jump to /q/1 (or wherever the user left off — the q/[n] page picks
 * the right step from the URL the user navigates to). The gate is
 * a one-time lock per assessment.
 */
export default async function PersonaGatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, status, wizard_answers")
    .eq("id", id)
    .maybeSingle<Row>();

  if (error || !data) {
    return <NotFoundPanel />;
  }
  if (data.status === "draft") redirect(`/assess/${id}`);
  if (data.status === "rejected") redirect(`/declined/${id}`);

  // Already chosen → don't re-ask. Send the user into Q1.
  const existing: Persona | undefined = data.wizard_answers?.persona;
  if (existing) {
    redirect(`/wizard/${id}/q/1`);
  }

  return (
    <main className="flex-1 flex justify-center">
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-12">
        <PersonaGate assessmentId={id} />
      </div>
    </main>
  );
}

function NotFoundPanel() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#993C1D] mb-3">
          Not found
        </p>
        <h1 className="font-serif font-normal text-2xl text-[#0E1411] mb-3">
          We couldn&apos;t find this assessment.
        </h1>
        <Link
          href="/start"
          className="inline-block bg-[#0F6E56] text-white font-medium text-sm px-6 py-3 rounded-full hover:bg-[#0d5c48] transition-colors"
        >
          Start over →
        </Link>
      </div>
    </main>
  );
}
