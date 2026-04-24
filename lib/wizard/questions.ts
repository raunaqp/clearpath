/**
 * Question definitions for the 7-Q wizard. Single source of truth for
 * step → label, helper, options, required flag. Copy mirrors
 * docs/specs/clearpath_copy_scope.md §4.2–§4.8.
 */

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
];

export function getQuestion(step: number): WizardQuestion | null {
  return WIZARD_QUESTIONS.find((q) => q.step === step) ?? null;
}

export function totalSteps(): number {
  return WIZARD_QUESTIONS.length;
}
