/**
 * Demo packets — pre-filled assessments for live demos to incubators,
 * founders, and partners.
 *
 * Each packet maps to a real Indian medtech product so the resulting
 * card is calibrated and screenshot-worthy. Packets are tagged
 * `meta.is_demo = true` in the assessments table for filtering in
 * admin/analytics.
 *
 * Used by:
 *   - components/landing/DemoPacketBar.tsx (intake CTA)
 *   - app/api/intake/demo/route.ts (server-side prefill)
 *
 * Wellness/non-MD examples NOT included — these are deliberately
 * regulated-product cases to showcase the engine's core value.
 */

import type { WizardAnswers } from "@/lib/wizard/types";

export type DemoPacket = {
  /** Stable ID — used in URL like /start?demo=cerviai */
  id: string;
  /** Short human label for the CTA button */
  label: string;
  /** One-line description shown next to the button */
  hint: string;
  /** Pre-fills the intake form */
  prefill: {
    name: string;
    email: string;
    mobile: string;
    one_liner: string;
    url: string;
  };
  /** Pre-fills wizard answers so we land on the card in <30 seconds */
  wizard_answers: Required<
    Pick<WizardAnswers, "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7">
  >;
  /** Expected outcome for sanity-checking demo */
  expected: {
    cdsco_class: "A" | "B" | "C" | "D" | null;
    risk_level: "high" | "medium" | "low";
    trl_level: number;
    mdr_verdict: string;
  };
};

export const DEMO_PACKETS: DemoPacket[] = [
  {
    id: "cerviai",
    label: "Vyuhaa CerviAI",
    hint: "AI cervical cancer screening — Class C IVD-SaMD, novel",
    prefill: {
      name: "Demo: Vyuhaa CerviAI",
      email: "demo+cerviai@clearpath.in",
      mobile: "9999900001",
      one_liner:
        "AI-powered cervical cancer screening from colposcopy images, deployed in primary care clinics.",
      url: "https://www.vyuhaa.com",
    },
    wizard_answers: {
      q1: "serious",
      q2: "diagnoses_treats",
      q3: "hcps",
      q4: "10k_to_1l",
      q5: "hospital",
      q6: ["phi", "imaging"],
      q7: "mvp",
    },
    expected: {
      cdsco_class: "C",
      risk_level: "high",
      trl_level: 3,
      mdr_verdict: "required",
    },
  },
  {
    id: "ekascribe",
    label: "EkaScribe (sub-feature)",
    hint: "AI clinical scribe — scoped sub-feature of Eka Care platform",
    prefill: {
      name: "Demo: EkaScribe",
      email: "demo+ekascribe@clearpath.in",
      mobile: "9999900002",
      one_liner:
        "AI clinical scribe — listens to doctor-patient consultations and drafts SOAP notes for clinician review. Sub-feature of Eka Care EHR platform.",
      url: "https://www.eka.care",
    },
    wizard_answers: {
      q1: "non_serious",
      q2: "drives",
      q3: "hcps",
      q4: "over_10l",
      q5: "abdm",
      q6: ["phi", "prescription"],
      q7: "scaling",
    },
    expected: {
      cdsco_class: "B",
      risk_level: "high",
      trl_level: 3,
      mdr_verdict: "required_sub_feature",
    },
  },
  {
    id: "forus",
    label: "Forus 3nethra",
    hint: "Class D portable retinal camera — established CDSCO posture",
    prefill: {
      name: "Demo: Forus Health 3nethra",
      email: "demo+forus@clearpath.in",
      mobile: "9999900003",
      one_liner:
        "Portable fundus camera (3nethra) for retinal disease screening at primary health centres. Class D ophthalmic device with CDSCO manufacturing license history.",
      url: "https://www.forushealth.com",
    },
    wizard_answers: {
      q1: "serious",
      q2: "diagnoses_treats",
      q3: "hcps",
      q4: "1l_to_10l",
      q5: "hospital",
      q6: ["phi", "imaging"],
      q7: "filed",
    },
    expected: {
      cdsco_class: "D",
      risk_level: "high",
      trl_level: 8,
      mdr_verdict: "core_compliance_achieved",
    },
  },
];

export function getDemoPacket(id: string): DemoPacket | null {
  return DEMO_PACKETS.find((p) => p.id === id) ?? null;
}
