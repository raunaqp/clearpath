/**
 * Question definitions for the Tier A wizard. Single source of truth for
 * step → label, helper, options, required flag. Q1-Q7 mirror
 * docs/specs/clearpath_copy_scope.md §4.2–§4.8 and apply to every persona.
 * Q8-Q9 (Phase 2c) are a hardware-persona suffix — bible §4.D #6 + #2 —
 * surfaced only when wizard_answers.persona === "manufacturer_hardware".
 */

import type { Persona } from "./types";

export type WizardOption = {
  value: string;
  label: string;
  description?: string;
};

export type WizardQuestion = {
  step: number;
  kind: "radio" | "checkbox";
  required: boolean;
  prompt: string;
  helper?: string;
  options: WizardOption[];
  /** Phase 2c — when set, the question only renders for matching personas.
   * Used for include-list gating (e.g. Q8/Q9 only appear for hardware). */
  personaGate?: Persona[];
  /** Phase 2c — when set, the question is HIDDEN for matching personas
   *  and the synthesizer infers the answer from the one-liner / pitch
   *  extract, surfacing it as a card inference marker. Used for the
   *  hardware persona to drop Q2 (info significance — not used by the
   *  hardware class branch) and Q4 (year-1 users — defaults to under_10k).
   *  Q5/Q6 stay asked because they drive demo-visible DPDP/ABDM verdicts. */
  personaExclude?: Persona[];
};

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    step: 1,
    kind: "radio",
    required: true,
    prompt: "What clinical state does your product address?",
    helper: "This determines how critical any error would be.",
    options: [
      {
        value: "critical",
        label: "Critical / life-threatening",
        description:
          "Conditions where delay or error could result in death or severe harm. E.g. cardiac arrest, stroke, sepsis.",
      },
      {
        value: "serious",
        label: "Serious / chronic",
        description:
          "Timely intervention matters but not immediately life-threatening. E.g. diabetes, hypertension, cancer screening.",
      },
      {
        value: "non_serious",
        label: "Non-serious / preventive",
        description:
          "Wellness, prevention, low-risk conditions. E.g. fitness tracking, sleep monitoring.",
      },
      {
        value: "varies",
        label: "Not sure / varies",
        description: "Multiple use cases with different clinical states.",
      },
    ],
  },
  {
    step: 2,
    kind: "radio",
    required: true,
    prompt: "How much does your product influence clinical decisions?",
    helper:
      '“Inform” = displays data. “Drive” = suggests action. “Diagnose/treat” = makes or executes clinical decisions.',
    // Phase 2c — hardware class derivation does not use Q2 (SaMD-specific
    // significance×situation matrix). For hardware founders the synthesizer
    // infers an information-role from device type / one-liner keywords and
    // surfaces it as an [ESTIMATED] marker. Low blast radius — defaulting
    // wrong has no impact on the live demo card verdicts.
    personaExclude: ["manufacturer_hardware"],
    options: [
      {
        value: "informs_only",
        label: "Informs — displays information only",
        description: "Shows data or trends. Clinician interprets and decides.",
      },
      {
        value: "drives",
        label: "Drives — flags or suggests",
        description:
          "Highlights abnormalities or suggests next steps. Clinician reviews and acts.",
      },
      {
        value: "diagnoses_treats",
        label: "Diagnoses or treats — makes clinical decisions",
        description:
          "Outputs a diagnosis, treatment recommendation, or automated action.",
      },
    ],
  },
  {
    step: 3,
    kind: "radio",
    required: true,
    prompt: "Who uses your product?",
    options: [
      {
        value: "hcps",
        label: "Healthcare professionals",
        description: "Doctors, nurses, lab techs.",
      },
      {
        value: "patients",
        label: "Patients / general public",
      },
      {
        value: "both",
        label: "Both HCPs and patients",
      },
      {
        value: "admin",
        label: "Hospital administrators / back-office",
      },
    ],
  },
  {
    step: 4,
    kind: "radio",
    required: false,
    prompt: "How many users do you expect in Year 1?",
    helper:
      "Rough estimate is fine. Affects DPDP SDF classification at significant scale.",
    // Phase 2c — Q4 only matters at scale (over 10 lakh users → SDF tier).
    // Hardware founders rarely cross that threshold in Year 1 and the
    // default `under_10k` is correct for the overwhelming majority.
    // Inferred for hardware persona, marked [ASSUMED] on the card.
    personaExclude: ["manufacturer_hardware"],
    options: [
      { value: "under_10k", label: "Under 10,000 users" },
      { value: "10k_to_1l", label: "10,000 – 1 lakh users" },
      { value: "1l_to_10l", label: "1 lakh – 10 lakh users" },
      { value: "over_10l", label: "Over 10 lakh users" },
    ],
  },
  {
    step: 5,
    kind: "radio",
    required: false,
    prompt: "Does your product integrate with ABDM, HIS, or hospital systems?",
    options: [
      {
        value: "abdm",
        label: "Yes — ABDM (Health ID, ABHA, UHI)",
      },
      {
        value: "hospital",
        label: "Yes — hospital systems (HIS, LIS, PACS)",
      },
      {
        value: "both",
        label: "Both",
      },
      {
        value: "neither",
        label: "Neither — standalone product",
      },
    ],
  },
  {
    step: 6,
    kind: "checkbox",
    required: false,
    prompt: "What kind of data does your product handle?",
    helper: "Multi-select allowed.",
    options: [
      { value: "phi", label: "Patient health records (PHI)" },
      {
        value: "imaging",
        label: "Imaging data (X-ray, MRI, ultrasound)",
      },
      { value: "genomic", label: "Genomic / lab results" },
      { value: "prescription", label: "Prescription or medication data" },
      { value: "insurance", label: "Insurance / financial health data" },
      { value: "none", label: "None of the above" },
    ],
  },
  {
    step: 7,
    kind: "radio",
    required: false,
    prompt: "Where are you in your commercial journey?",
    options: [
      { value: "pre_mvp", label: "Pre-MVP / prototype" },
      { value: "mvp", label: "MVP with pilot customers" },
      { value: "scaling", label: "Revenue-generating, scaling" },
      {
        value: "filed",
        label: "Already filed with CDSCO (iteration / follow-up)",
      },
    ],
  },
  // Phase 2c — hardware-persona Tier A suffix. Bible §4.D #6 (predicate
  // existence) + §4.D #2 (patient-contact tier). Every other hardware
  // signal (sterile, drug, radiation, mfg-location, veterinary, measuring,
  // sterilization-mode) is inferred and surfaced as [ESTIMATED]/[ASSUMED]
  // on the card / report / pack — founder corrects in the editor.
  {
    step: 8,
    kind: "radio",
    required: true,
    prompt: "Is there a similar device already approved in India?",
    helper:
      "If no Indian predicate exists, your device likely needs a separate pre-permission application (MD-26/MD-27) before the manufacturing license — adds a review cycle. International approvals can be cited but typically aren't enough on their own.",
    personaGate: ["manufacturer_hardware"],
    options: [
      {
        value: "yes_indian",
        label: "Yes — a CDSCO-approved device exists",
        description:
          "A similar device is already licensed in India (you can name it or describe it later in your editor).",
      },
      {
        value: "yes_only_foreign",
        label: "Only foreign — US FDA / CE / Japan",
        description:
          "Approved overseas but not yet in India. Citable, but you'll likely still need the no-predicate path.",
      },
      {
        value: "no",
        label: "No — this is a novel device",
        description:
          "Nothing comparable approved anywhere. Expect a heavier evidence requirement.",
      },
      {
        value: "not_sure",
        label: "Not sure",
        description:
          "We'll assume a novel device for now — you can correct this in your workspace if you find a predicate.",
      },
    ],
  },
  {
    step: 9,
    kind: "radio",
    required: true,
    prompt: "How does the device touch the patient's body?",
    helper:
      "Pick the deepest type of contact. This determines biocompatibility testing tier (ISO 10993) and helps us estimate your risk class.",
    personaGate: ["manufacturer_hardware"],
    options: [
      {
        value: "no_contact",
        label: "Doesn't touch the patient",
        description: "Used near the patient but doesn't make physical contact.",
      },
      {
        value: "surface_intact_skin",
        label: "Touches intact skin only",
        description: "E.g. stethoscope, BP cuff, ECG electrodes.",
      },
      {
        value: "surface_mucosal",
        label: "Touches mouth, eyes, or other mucosal surfaces",
        description: "E.g. dental probe, contact lens, endoscope sheath.",
      },
      {
        value: "blood_path_indirect",
        label: "Touches blood indirectly",
        description: "E.g. IV tubing, dialysis circuit (blood passes through).",
      },
      {
        value: "blood_path_direct",
        label: "Touches blood directly",
        description: "E.g. catheter, syringe, surgical instrument.",
      },
      {
        value: "invasive_transient_lt_24h",
        label: "Enters the body briefly (under 24 hours)",
        description: "E.g. needle, scalpel, short procedure tools.",
      },
      {
        value: "invasive_long_term_30d",
        label: "Stays inside the body for up to 30 days",
        description: "E.g. urinary catheter for days, short-term wound drain.",
      },
      {
        value: "implant_gt_30d",
        label: "Is implanted long-term (over 30 days)",
        description: "E.g. orthopaedic implant, pacemaker, stent, IUD.",
      },
    ],
  },
];

/**
 * Phase 2c — return the visible question list for a given persona,
 * honouring both `personaGate` (include-list) and `personaExclude`
 * (exclude-list). For hardware persona: Q1, Q3, Q5, Q6, Q7, Q8, Q9
 * (7 questions). For SaMD / clinical / null persona: Q1-Q7 (7 questions).
 */
export function getQuestionsForPersona(
  persona: Persona | null | undefined
): WizardQuestion[] {
  return WIZARD_QUESTIONS.filter((q) => {
    if (q.personaGate) {
      if (!persona) return false;
      if (!q.personaGate.includes(persona)) return false;
    }
    if (q.personaExclude && persona && q.personaExclude.includes(persona)) {
      return false;
    }
    return true;
  });
}

export function getQuestion(step: number): WizardQuestion | null {
  return WIZARD_QUESTIONS.find((q) => q.step === step) ?? null;
}

/**
 * Phase 2c — total step count is the count of VISIBLE questions for
 * the persona (always 7 today: 7 for SaMD/clinical, 7 for hardware
 * with a different mix). The legacy no-arg form keeps the SaMD count
 * for backward compatibility with any caller that hasn't been
 * threaded through yet.
 */
export function totalSteps(persona?: Persona | null): number {
  return getQuestionsForPersona(persona).length;
}

/**
 * Phase 2c — true when the absolute step is visible for the persona.
 * The wizard page uses this to redirect hidden steps to the next
 * visible step on resume / direct-URL hits.
 */
export function isStepVisibleFor(
  step: number,
  persona: Persona | null | undefined
): boolean {
  const q = getQuestion(step);
  if (!q) return false;
  if (q.personaGate && (!persona || !q.personaGate.includes(persona))) {
    return false;
  }
  if (q.personaExclude && persona && q.personaExclude.includes(persona)) {
    return false;
  }
  return true;
}

/**
 * Phase 2c — return the next absolute step number that is visible for
 * the persona, or null if `currentStep` is already the last visible
 * step. Used by WizardClient to compute the Next button destination
 * (skipping hidden Q2/Q4 for hardware).
 */
export function getNextVisibleStep(
  currentStep: number,
  persona: Persona | null | undefined
): number | null {
  const visible = getQuestionsForPersona(persona);
  const sorted = visible
    .map((q) => q.step)
    .filter((s) => s > currentStep)
    .sort((a, b) => a - b);
  return sorted[0] ?? null;
}

/**
 * Phase 2c — return the previous absolute step number that is visible
 * for the persona, or null if `currentStep` is the first visible step.
 */
export function getPrevVisibleStep(
  currentStep: number,
  persona: Persona | null | undefined
): number | null {
  const visible = getQuestionsForPersona(persona);
  const sorted = visible
    .map((q) => q.step)
    .filter((s) => s < currentStep)
    .sort((a, b) => b - a);
  return sorted[0] ?? null;
}

/**
 * Phase 2c — return the 1-based ordinal position of `currentStep`
 * among the visible questions for `persona`. Used for the
 * "Question N of total" header — so a hardware founder on absolute
 * step 5 (Q5, the third visible question after Q1 and Q3) sees
 * "Question 3 of 7" rather than "Question 5 of 7".
 */
export function getVisibleOrdinal(
  currentStep: number,
  persona: Persona | null | undefined
): number {
  const visible = getQuestionsForPersona(persona);
  const ix = visible.findIndex((q) => q.step === currentStep);
  return ix === -1 ? currentStep : ix + 1;
}

/**
 * Phase 2c — short labels for the right-pane / stepper, indexed by
 * visible ordinal (1..total). Labels match the question intent in
 * plain language, persona-specific.
 *
 *   SaMD / clinical / null persona → ["Clinical state", "Decision
 *     influence", "Users", "Year 1 scale", "Integrations", "Data types",
 *     "Commercial stage"]
 *   Hardware → ["Clinical state", "Users", "Integrations", "Data types",
 *     "Commercial stage", "Predicate", "Patient contact"]
 */
const STEP_LABEL_BY_ABSOLUTE: Record<number, string> = {
  1: "Clinical state",
  2: "Decision influence",
  3: "Users",
  4: "Year 1 scale",
  5: "Integrations",
  6: "Data types",
  7: "Commercial stage",
  8: "Predicate",
  9: "Patient contact",
};

export function getStepLabelsForPersona(
  persona: Persona | null | undefined
): string[] {
  return getQuestionsForPersona(persona).map(
    (q) => STEP_LABEL_BY_ABSOLUTE[q.step] ?? `Step ${q.step}`
  );
}
