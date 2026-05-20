/**
 * Phase 1.6 — Tier 1 Regulatory Readiness Report static lookup:
 * smart examples (good-vs-bad snippets, never full forms).
 *
 * Purpose: drives Section 6 (Smart Examples) of the ₹499 report.
 *
 * The library is a curated set of good-vs-bad wording pairs. Each
 * entry is indexed by a profile filter (AI/ML, class band, path).
 * The generator selects 2–4 entries that match the product profile;
 * the Opus call tailors each `why_this_is_safer_seed` to the
 * specific product. Snippets are NEVER LLM-generated — quality and
 * regulator alignment depend on curated wording.
 *
 * Boundary: snippets only. Never reconstruct full forms / IFUs /
 * Device Master Files from these examples — that's Tier 2.
 *
 * REVIEW STATUS: every entry is `estimate` until founder/consultant
 * signs off. See `docs/seed-tables/tier1-smart-examples-library.md`.
 */

import type { SmartExampleCategory } from "../schemas/readiness-report";
import type { CdscoClass } from "./tier1-reviewer-priorities-library";

export type ReviewStatus = "estimate" | "reviewed";

export interface SmartExampleEntry {
  key: string;
  category: SmartExampleCategory;
  topic: string;
  good_snippet: string;
  bad_snippet: string;
  why_this_is_safer_seed: string;
  applies_to: {
    requires_ai_ml: boolean;
    class_bands: CdscoClass[];
  };
  weight: number;
  review_status: ReviewStatus;
}

export interface SmartExampleContext {
  cdsco_class: CdscoClass;
  ai_ml_flag: boolean;
}

export const SMART_EXAMPLES_LIBRARY: SmartExampleEntry[] = [
  // ──────────────────────────────────────────────────────────
  // INTENDED USE — AI/ML clinical-decision-support framing
  // ──────────────────────────────────────────────────────────
  {
    key: "intended_use_ai_cds_scoped",
    category: "intended_use",
    topic: "Scoped vs. autonomous Intended Use",
    good_snippet:
      "The device assists radiologists by flagging brain-MRI studies with imaging features suggestive of early-stage Alzheimer's, presented as an advisory output for clinician review. It does not perform autonomous diagnosis; the radiologist remains the responsible decision-maker.",
    bad_snippet:
      "The device automatically diagnoses Alzheimer's disease from brain-MRI scans and generates a final diagnostic report.",
    why_this_is_safer_seed:
      "The first phrasing explicitly scopes the device as advisory and names the clinician as the responsible decision-maker — both expectations under the Oct 2025 CDSCO SaMD draft. The second phrasing claims autonomous diagnosis, typically pushing the device into a stricter class and inviting reviewer questions on how clinician oversight is enforced.",
    applies_to: { requires_ai_ml: true, class_bands: ["B", "C", "D"] },
    weight: 10,
    review_status: "estimate",
  },
  {
    key: "intended_use_non_ai_assistive",
    category: "intended_use",
    topic: "Concrete user + setting + function",
    good_snippet:
      "Intended for use by qualified clinicians in hospital settings to assist in routine monitoring of [parameter]. Output is advisory and supplements, but does not replace, standard clinical assessment.",
    bad_snippet:
      "Helps patients and doctors manage health better through AI-powered insights and predictions.",
    why_this_is_safer_seed:
      "Reviewers cross-check Intended Use against labelling, the IFU, and marketing material. The first phrasing names the user, the setting, the function, and the advisory boundary — all things a reviewer can verify. The second phrasing is marketing copy, not a regulatory Intended Use.",
    applies_to: { requires_ai_ml: false, class_bands: ["A", "B", "C", "D"] },
    weight: 8,
    review_status: "estimate",
  },

  // ──────────────────────────────────────────────────────────
  // CLAIM WORDING — keeping safety/efficacy claims defensible
  // ──────────────────────────────────────────────────────────
  {
    key: "claim_wording_performance",
    category: "claim_wording",
    topic: "Performance claim with study basis",
    good_snippet:
      "In a retrospective evaluation on a held-out test set of [N] cases at [centre], the device demonstrated [sensitivity]% sensitivity and [specificity]% specificity at the operating point [threshold]. Performance on prospective Indian-population data is pending.",
    bad_snippet:
      "The device achieves expert-level accuracy in detecting Alzheimer's from brain MRI scans.",
    why_this_is_safer_seed:
      "The first phrasing names the study type, sample, centre, operating point, and what is still pending. The second uses an unverifiable comparator ('expert-level') and an unbounded claim ('detecting Alzheimer's'). Reviewers typically ask for the study report behind any performance claim before clearing the submission.",
    applies_to: { requires_ai_ml: true, class_bands: ["B", "C", "D"] },
    weight: 9,
    review_status: "estimate",
  },
  {
    key: "claim_wording_indication",
    category: "claim_wording",
    topic: "Indication scope vs. label creep",
    good_snippet:
      "Intended for adults aged 50+ undergoing brain-MRI for evaluation of cognitive decline, when ordered by a treating clinician. The device is not validated for paediatric use, screening of asymptomatic populations, or differential diagnosis between dementia subtypes.",
    bad_snippet:
      "Suitable for early detection of dementia and related neurodegenerative conditions in adults.",
    why_this_is_safer_seed:
      "The first phrasing names the indication, the population, the trigger for use, and the explicit exclusions. The second is broad and invites label-creep — reviewers will likely ask which population the validation evidence covers and refuse claims beyond it.",
    applies_to: { requires_ai_ml: false, class_bands: ["B", "C", "D"] },
    weight: 8,
    review_status: "estimate",
  },

  // ──────────────────────────────────────────────────────────
  // RISK JUSTIFICATION — ISO 14971 hazard → mitigation framing
  // ──────────────────────────────────────────────────────────
  {
    key: "risk_justification_false_negative",
    category: "risk_justification",
    topic: "False-negative risk justification",
    good_snippet:
      "Hazard: missed early-stage Alzheimer's signal. Hazardous situation: clinician deprioritises further work-up based on a negative device output. Harm: delayed treatment of a missed case. Mitigation: device output framed as advisory only; clinical workflow requires independent radiologist read; operating point set to favour sensitivity (typically published sensitivity ≥ X%); residual risk monitored under PMS.",
    bad_snippet:
      "The device is highly accurate and reliable, so false negatives are unlikely.",
    why_this_is_safer_seed:
      "The first phrasing follows ISO 14971's hazard → situation → harm chain, names the mitigation steps, and acknowledges residual risk under PMS. The second handwaves the risk and provides no auditable trail — reviewers will likely treat it as a non-answer and ask for the underlying analysis.",
    applies_to: { requires_ai_ml: true, class_bands: ["B", "C", "D"] },
    weight: 9,
    review_status: "estimate",
  },
  {
    key: "risk_justification_residual",
    category: "risk_justification",
    topic: "Residual risk acceptance",
    good_snippet:
      "After applying the documented controls, the residual risk of [hazard] is judged acceptable in light of the device's clinical benefit, because [specific evidence reference]. Residual risk is monitored under the post-market surveillance plan, with quarterly review of complaint and adverse-event signals.",
    bad_snippet:
      "All residual risks have been accepted as low and require no further action.",
    why_this_is_safer_seed:
      "The first phrasing references specific evidence, ties acceptance to clinical benefit, and names a monitoring mechanism (PMS) — the three things ISO 14971 §7 expects. The second is a bare assertion with no rationale, no evidence reference, and no monitoring plan.",
    applies_to: { requires_ai_ml: false, class_bands: ["B", "C", "D"] },
    weight: 7,
    review_status: "estimate",
  },
];

/**
 * Select 2–4 smart-example entries that match the product profile,
 * weighted by relevance.
 */
export function selectSmartExamples(
  ctx: SmartExampleContext,
  limit = 3
): SmartExampleEntry[] {
  const matching = SMART_EXAMPLES_LIBRARY.filter((e) => {
    if (e.applies_to.requires_ai_ml && !ctx.ai_ml_flag) return false;
    if (
      ctx.cdsco_class !== null &&
      !e.applies_to.class_bands.includes(ctx.cdsco_class)
    ) {
      return false;
    }
    return true;
  });
  // Prefer one example per category before doubling up. Sort by weight
  // within category, then interleave categories so the rendered set
  // spans intended_use, claim_wording, and risk_justification.
  const byCategory: Record<SmartExampleCategory, SmartExampleEntry[]> = {
    intended_use: [],
    claim_wording: [],
    risk_justification: [],
  };
  for (const e of matching.sort((a, b) => b.weight - a.weight)) {
    byCategory[e.category].push(e);
  }
  const picks: SmartExampleEntry[] = [];
  const order: SmartExampleCategory[] = [
    "intended_use",
    "claim_wording",
    "risk_justification",
  ];
  let i = 0;
  while (picks.length < limit) {
    const cat = order[i % order.length];
    const next = byCategory[cat].shift();
    if (next) picks.push(next);
    i++;
    if (i > order.length * 4) break; // safety net
  }
  return picks;
}
