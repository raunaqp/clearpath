/**
 * Phase 1.6 — Tier 1 ₹499 "Regulatory Readiness Report" generator.
 *
 * Lighter than the v2 Draft Pack generator. Composes the 6-section
 * report from:
 *   - readiness_card (existing Tier 0 output, no new generation)
 *   - wizard_answers (existing)
 *   - three static lookup libraries (effort/cost, reviewer
 *     priorities, smart examples — moat content, reviewable seeds)
 *   - 4 small Opus calls for tone-shift + per-item tailoring
 *
 * Cost target: ~$0.05–0.10 per report (≈ 5–7× cheaper than v2). The
 * v2 generator is left UNTOUCHED — Tier 2 (₹2,499 Submission
 * Workspace) keeps its current behaviour.
 *
 * Boundary: this is decision-support content. Never produce DMF /
 * QMS / RMF / full ACP write-ups here — that's Tier 2.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ReadinessCard } from "@/lib/schemas/readiness-card";
import {
  ReadinessReportSchema,
  type ReadinessReport,
  type Pathway,
  type GapAnalysis,
  type ReviewerInsight,
  type SmartExample,
  type Scorecard,
  type TimelineCost,
  type GapRow,
} from "@/lib/schemas/readiness-report";
import { softenCertainty } from "@/lib/engine/soften-certainty";
import {
  matchEffortCost,
  formatEffort,
  formatInrLakhs,
} from "@/lib/engine/tier1-effort-cost-lookup";
import {
  selectReviewerPriorities,
  type ReviewerContext,
  type CdscoClass,
  type DataSensitivity,
} from "@/lib/engine/tier1-reviewer-priorities-library";
import { selectSmartExamples } from "@/lib/engine/tier1-smart-examples-library";
import {
  calculateCallCost,
  trackApiCost,
  type TokenUsage,
  type ModelKey,
} from "@/lib/engine/cost-calculator";
import { recordEngineCost } from "@/lib/engine/cost-recorder";
import type { WizardAnswers } from "@/lib/wizard/types";

const MODEL: ModelKey = "claude-opus-4-7";
const MAX_TOKENS_PATHWAY = 800;
const MAX_TOKENS_GAPS = 1200;
const MAX_TOKENS_INSIGHTS = 1200;
const MAX_TOKENS_EXAMPLES = 1000;
const STRICT_SUFFIX =
  "\n\nReturn STRICT JSON ONLY. No preamble. No trailing text.";

const SHARED_TONE_RULES = `
- Tone: premium SaaS-onboarding, founder-friendly, calm, concise. Stripe Atlas / ClearTax / Mercury feel.
- Avoid: "Furthermore", "Pursuant to", "Herein", "The applicant shall", "As per", "In accordance with".
- Never use "definitely", "absolutely", "certainly", "must", "always", "will be".
- Always use "likely", "may", "typically", "based on published guidance".
- Distinguish Readiness (preparedness) from Risk (exposure).
- If unsure about a regulation applying, say "conditional" not "required".
- This is decision-support content, not submission text. Do not draft MD-7 sections, DMFs, QMS docs, or RMFs.
`.trim();

// ─────────────────────────────────────────────────────────────
// Inputs / orchestration
// ─────────────────────────────────────────────────────────────

export interface ReadinessReportInput {
  assessment_id: string;
  company_name: string;
  product_name: string;
  scoped_feature: string | null;
  readiness_card: ReadinessCard;
  wizard_answers: WizardAnswers;
}

export interface ReadinessReportResult {
  report: ReadinessReport;
  usage: TokenUsage;
  cost_usd: number;
}

export async function generateReadinessReport(
  input: ReadinessReportInput
): Promise<ReadinessReportResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("readiness-report: ANTHROPIC_API_KEY missing");
  }
  const client = new Anthropic({ apiKey });

  const card = input.readiness_card;
  const ctx = buildReviewerContext(card, input.wizard_answers);

  // ── Deterministic sections (no LLM) ──────────────────────
  const scorecard = buildScorecard(input, card, ctx);
  const timelineCost = buildTimelineCost(card, ctx);
  const pathwayDeterministic = buildPathwaySkeleton(card, ctx);

  // ── Pre-select dynamic content ──────────────────────────
  const gapRowSeeds = buildGapRowSeeds(card);
  const reviewerPrioritySeeds = selectReviewerPriorities(ctx, 5);
  const smartExampleSeeds = selectSmartExamples(
    { cdsco_class: ctx.cdsco_class, ai_ml_flag: ctx.ai_ml_flag },
    3
  );

  // ── 4 LLM calls in parallel ─────────────────────────────
  const productLine = formatProductLine(input, card);

  const [
    pathwayCall,
    gapsCall,
    insightsCall,
    examplesCall,
  ] = await Promise.all([
    callPathwayNarrative(client, {
      assessment_id: input.assessment_id,
      productLine,
      pathwayDeterministic,
      card,
    }),
    callGapWhyItMatters(client, {
      assessment_id: input.assessment_id,
      productLine,
      ctx,
      gapRowSeeds,
    }),
    callReviewerInsights(client, {
      assessment_id: input.assessment_id,
      productLine,
      ctx,
      seeds: reviewerPrioritySeeds.map((p) => ({
        key: p.key,
        title: p.title,
        seed: p.what_reviewers_look_for_seed,
      })),
    }),
    callSmartExamples(client, {
      assessment_id: input.assessment_id,
      productLine,
      ctx,
      seeds: smartExampleSeeds.map((s) => ({
        key: s.key,
        topic: s.topic,
        category: s.category,
        good: s.good_snippet,
        bad: s.bad_snippet,
        seed: s.why_this_is_safer_seed,
      })),
    }),
  ]);

  // ── Assemble final report ───────────────────────────────
  const pathway: Pathway = {
    ...pathwayDeterministic,
    why_this_class_applies: pathwayCall.why_this_class_applies,
  };

  const gapAnalysis: GapAnalysis = {
    rows: gapRowSeeds.map((seed) => {
      const why = gapsCall.rowsByKey[seed.lookupKey] ?? seed.fallbackWhy;
      return {
        priority: seed.priority,
        gap: seed.gap_title,
        why_it_matters: why,
        suggested_next_step: seed.fix_action,
        estimated_effort: seed.estimated_effort,
        dim: seed.dim,
      } satisfies GapRow;
    }),
  };

  const reviewerInsights: ReviewerInsight[] = reviewerPrioritySeeds.map((p) => ({
    priority: p.title,
    what_reviewers_look_for:
      insightsCall.rowsByKey[p.key] ?? p.what_reviewers_look_for_seed,
  }));

  const smartExamples: SmartExample[] = smartExampleSeeds.map((s) => ({
    category: s.category,
    topic: s.topic,
    good_snippet: s.good_snippet,
    bad_snippet: s.bad_snippet,
    why_this_is_safer:
      examplesCall.rowsByKey[s.key] ?? s.why_this_is_safer_seed,
  }));

  const raw: ReadinessReport = {
    meta: {
      company_name: input.company_name,
      product_name: input.product_name,
      scoped_feature: input.scoped_feature,
      generated_at: new Date().toISOString(),
      source_assessment_id: input.assessment_id,
    },
    scorecard,
    pathway,
    gap_analysis: gapAnalysis,
    timeline_cost: timelineCost,
    reviewer_insights: reviewerInsights,
    smart_examples: smartExamples,
  };

  // Generator-stage softening pass (the renderer applies a second one
  // at PDF render time — belt and braces).
  const softened = softenReport(raw);
  const validated = ReadinessReportSchema.parse(softened);

  // ── Aggregate cost + telemetry ──────────────────────────
  const totalUsage: TokenUsage = {
    input_tokens:
      pathwayCall.usage.input_tokens +
      gapsCall.usage.input_tokens +
      insightsCall.usage.input_tokens +
      examplesCall.usage.input_tokens,
    cache_read:
      pathwayCall.usage.cache_read +
      gapsCall.usage.cache_read +
      insightsCall.usage.cache_read +
      examplesCall.usage.cache_read,
    cache_write:
      pathwayCall.usage.cache_write +
      gapsCall.usage.cache_write +
      insightsCall.usage.cache_write +
      examplesCall.usage.cache_write,
    output_tokens:
      pathwayCall.usage.output_tokens +
      gapsCall.usage.output_tokens +
      insightsCall.usage.output_tokens +
      examplesCall.usage.output_tokens,
  };
  const totalCost =
    pathwayCall.cost + gapsCall.cost + insightsCall.cost + examplesCall.cost;

  await trackApiCost({
    feature: "readiness_report_v1",
    model: MODEL,
    usage: totalUsage,
    cost_usd: totalCost,
    cache_hit: totalUsage.cache_read > 0,
  });
  await recordEngineCost({
    call_layer: "readiness_report_v1",
    model: MODEL,
    usage: totalUsage,
    cost_usd: totalCost,
    assessment_id: input.assessment_id,
  });

  return { report: validated, usage: totalUsage, cost_usd: totalCost };
}

// ─────────────────────────────────────────────────────────────
// Context builder
// ─────────────────────────────────────────────────────────────

function buildReviewerContext(
  card: ReadinessCard,
  wiz: WizardAnswers
): ReviewerContext {
  return {
    cdsco_class: card.classification.cdsco_class,
    class_qualifier: card.classification.class_qualifier,
    ai_ml_flag: card.classification.ai_ml_flag,
    acp_required: card.classification.acp_required,
    novel_or_predicate: card.classification.novel_or_predicate,
    recommended_path: card.recommended_path,
    data_sensitivity: deriveDataSensitivity(card, wiz),
    abdm_in_scope: card.regulations.abdm.verdict !== "not_applicable",
    use_environment_home: wiz.b2_use_environment === "home",
    drives_or_diagnoses:
      wiz.q2 === "drives" || wiz.q2 === "diagnoses_treats",
  };
}

function deriveDataSensitivity(
  card: ReadinessCard,
  wiz: WizardAnswers
): DataSensitivity {
  const dpdpVerdict = card.regulations.dpdp.verdict;
  if (dpdpVerdict === "required") return "high";
  const q6 = wiz.q6 ?? [];
  const sensitive = q6.some((x) =>
    ["phi", "imaging", "genomic", "prescription"].includes(x as string)
  );
  if (sensitive) return "high";
  if (dpdpVerdict === "conditional" || dpdpVerdict === "optional") return "medium";
  return "low";
}

// ─────────────────────────────────────────────────────────────
// Section 1 — Scorecard (deterministic)
// ─────────────────────────────────────────────────────────────

function buildScorecard(
  input: ReadinessReportInput,
  card: ReadinessCard,
  ctx: ReviewerContext
): Scorecard {
  const cls = card.classification;
  const classification_label = buildClassLabel(cls.cdsco_class, cls.class_qualifier);
  const confidence = inferConfidence(card);
  const complexity = inferComplexity(cls.cdsco_class);
  const pathwayForms = card.regulations.cdsco_mdr.forms ?? [];
  const pathwayLabel = buildPathwayLabel(card.recommended_path, pathwayForms);
  const clinicalInvestigationLikely =
    card.recommended_path === "clinical_investigation";
  const costRangeDisplay = buildOverallCostRange(card);
  const topGapTitles = card.top_gaps.slice(0, 3).map((g) => g.gap_title);
  const recommendedNextAction = buildRecommendedNextAction(card);
  const triggers = buildTriggers(card, ctx);

  return {
    classification_label,
    classification_class: cls.cdsco_class,
    classification_qualifier: cls.class_qualifier,
    confidence,
    complexity,
    pathway_label: pathwayLabel,
    clinical_investigation_likely: clinicalInvestigationLikely,
    timeline_display: card.timeline.display,
    cost_range_inr_display: costRangeDisplay,
    readiness_score: card.readiness.score,
    readiness_band: card.readiness.band,
    risk_level: card.risk.level,
    top_gap_titles: topGapTitles,
    recommended_next_action: recommendedNextAction,
    triggers,
  };
}

function buildClassLabel(
  cls: CdscoClass,
  qualifier: ReadinessCard["classification"]["class_qualifier"]
): string {
  if (cls === null) return "Likely not a medical device";
  const classPart = `Class ${cls}`;
  if (!qualifier) return classPart;
  const qualifierLabel =
    qualifier === "AI-CDS"
      ? "AI-CDS"
      : qualifier === "IVD"
        ? "IVD"
        : qualifier === "IVD-SaMD"
          ? "IVD-SaMD"
          : qualifier === "scoped"
            ? "scoped sub-feature"
            : qualifier === "novel"
              ? "novel"
              : qualifier === "unclear"
                ? "qualifier TBD"
                : "";
  return qualifierLabel ? `${classPart} · ${qualifierLabel}` : classPart;
}

function inferConfidence(
  card: ReadinessCard
): "high" | "medium" | "low" {
  // Confidence proxy: band quality and presence of an unresolved conflict.
  if (card.meta.conflict_resolved) return "medium";
  if (card.readiness.band === "green" || card.readiness.band === "green_plus") {
    return "high";
  }
  if (card.readiness.band === "red") return "low";
  return "medium";
}

function inferComplexity(
  cls: CdscoClass
): "low" | "moderate" | "high" {
  if (cls === "A" || cls === "B") return "low";
  if (cls === "C") return "moderate";
  if (cls === "D") return "high";
  return "low";
}

function buildPathwayLabel(
  path: ReadinessCard["recommended_path"],
  forms: string[]
): string {
  const pri = forms[0] ?? "MD-3 / MD-7";
  if (path === "clinical_investigation") {
    return `${pri} (Central) · likely MD-22 / MD-12 test licence path`;
  }
  if (path === "manufacturing_license") {
    return `${pri} (Manufacturing licence path)`;
  }
  return `${pri} · path TBD`;
}

function buildOverallCostRange(card: ReadinessCard): string {
  // Heuristic overall band tied to class.
  const cls = card.classification.cdsco_class;
  if (cls === null) return "—";
  if (cls === "A") return formatInrLakhs(2, 6);
  if (cls === "B") return formatInrLakhs(6, 18);
  if (cls === "C") return formatInrLakhs(18, 32);
  return formatInrLakhs(28, 60);
}

function buildRecommendedNextAction(card: ReadinessCard): string {
  // Prefer the highest-severity gap's fix_action; otherwise a path-tied default.
  const high = card.top_gaps.find((g) => g.severity === "high");
  if (high) return high.fix_action;
  const path = card.recommended_path;
  if (path === "clinical_investigation") {
    return "Engage a CDSCO-experienced regulatory consultant to scope the MD-22 clinical-investigation application alongside the MD-7 path.";
  }
  if (path === "manufacturing_license") {
    return "Engage a regulatory consultant for an ISO 13485 gap assessment and lock the Intended Use Statement before submission planning.";
  }
  return "Engage a regulatory consultant for a formal CDSCO classification review before any marketing claims are finalised.";
}

function buildTriggers(
  card: ReadinessCard,
  ctx: ReviewerContext
): string[] {
  const t: string[] = [];
  if (ctx.ai_ml_flag) t.push("AI-assisted diagnosis");
  if (ctx.drives_or_diagnoses) t.push("Influences clinical management");
  if (card.classification.novel_or_predicate === "novel") {
    t.push("Novel indication (no Indian predicate)");
  }
  if (ctx.data_sensitivity === "high") t.push("Sensitive patient data");
  if (card.classification.acp_required) t.push("Adaptive AI model");
  if (ctx.use_environment_home) t.push("Home-use / lay-user environment");
  if (ctx.abdm_in_scope) t.push("ABDM integration in scope");
  return t.length > 0 ? t : ["Class-based regulatory exposure"];
}

// ─────────────────────────────────────────────────────────────
// Section 2 — Pathway skeleton (deterministic; LLM fills narrative)
// ─────────────────────────────────────────────────────────────

function buildPathwaySkeleton(
  card: ReadinessCard,
  ctx: ReviewerContext
): Omit<Pathway, "why_this_class_applies"> {
  const forms = card.regulations.cdsco_mdr.forms ?? [];
  const formList = forms.length > 0 ? forms : ["MD-7"];
  const authority = inferAuthority(card.classification.cdsco_class);
  const steps = buildStepSequence(card, formList);
  return {
    authority,
    forms: formList,
    step_sequence: steps,
    test_licence_note:
      card.recommended_path === "clinical_investigation"
        ? "A test licence (MD-12) typically precedes the clinical investigation. The investigation itself runs under MD-22 / MD-23 permissions before the device can be cleared for commercial manufacture."
        : null,
    acp_note: card.classification.acp_required
      ? "Adaptive AI/ML behaviour means an Algorithm Change Protocol (ACP / PCCP) typically accompanies the MD-7 file per the Oct 2025 CDSCO SaMD draft."
      : null,
  };
}

function inferAuthority(cls: CdscoClass): string {
  if (cls === "A" || cls === "B") return "CDSCO State Licensing Authority";
  if (cls === "C" || cls === "D") return "CDSCO Central Licensing Authority";
  return "CDSCO authority TBD pending classification";
}

function buildStepSequence(
  card: ReadinessCard,
  forms: string[]
): Pathway["step_sequence"] {
  const steps: Pathway["step_sequence"] = [];
  if (card.classification.novel_or_predicate === "novel") {
    steps.push({
      step: "MD-26 / MD-27 pre-permission",
      what_happens:
        "File the pre-permission application before MD-7 because no Indian predicate is claimed. Adds a separate review cycle.",
      duration: "2–4 months",
    });
  }
  if (card.recommended_path === "clinical_investigation") {
    steps.push({
      step: "MD-12 test licence",
      what_happens:
        "Apply for the test licence so a small number of devices can be made for the clinical investigation.",
      duration: "2–3 months",
    });
    steps.push({
      step: "MD-22 clinical-investigation permission + EC approval",
      what_happens:
        "Design the multi-centre study, get EC clearance, register on CTRI, enrol participants.",
      duration: "9–14 months",
    });
  }
  steps.push({
    step: `${forms[0] ?? "MD-7"} manufacturing licence`,
    what_happens:
      "File the manufacturing licence with QMS evidence, technical file, predicate or substantial-equivalence narrative, and risk file.",
    duration: "6–9 months",
  });
  if (card.classification.acp_required) {
    steps.push({
      step: "ACP / PCCP submission",
      what_happens:
        "File the Algorithm Change Protocol alongside the manufacturing licence — modification scope, retraining triggers, validation thresholds, human oversight.",
      duration: "in parallel",
    });
  }
  return steps;
}

// ─────────────────────────────────────────────────────────────
// Section 3 — Gap row seeds
// ─────────────────────────────────────────────────────────────

interface GapRowSeed {
  lookupKey: string;
  priority: GapRow["priority"];
  gap_title: string;
  dim: string;
  fix_action: string;
  estimated_effort: string;
  fallbackWhy: string;
}

function buildGapRowSeeds(card: ReadinessCard): GapRowSeed[] {
  return card.top_gaps.map((g, idx) => {
    const entry = matchEffortCost(g.gap_title, g.dim);
    return {
      lookupKey: entry.key,
      priority: priorityFromSeverityOrIndex(g.severity, idx),
      gap_title: g.gap_title,
      dim: g.dim,
      fix_action: g.fix_action,
      estimated_effort: formatEffort(entry),
      fallbackWhy: entry.why_it_matters_seed,
    } satisfies GapRowSeed;
  });
}

function priorityFromSeverityOrIndex(
  sev: "high" | "medium" | "low",
  idx: number
): GapRow["priority"] {
  if (sev === "high") return "P1";
  if (sev === "medium") return "P2";
  if (sev === "low") return "P3";
  // Fallback by order — defensive, should never hit.
  return idx === 0 ? "P1" : idx === 1 ? "P2" : "P3";
}

// ─────────────────────────────────────────────────────────────
// Section 4 — Timeline + Cost (deterministic)
// ─────────────────────────────────────────────────────────────

function buildTimelineCost(
  card: ReadinessCard,
  ctx: ReviewerContext
): TimelineCost {
  const overall = card.timeline.display;
  const cls = card.classification.cdsco_class;
  const phases = buildPhases(card, ctx);
  const bottlenecks = buildBottlenecks(card, ctx);
  return {
    total_range_display: overall,
    total_anchor: card.timeline.anchor,
    phases,
    bottlenecks,
  };
}

function buildPhases(
  card: ReadinessCard,
  ctx: ReviewerContext
): TimelineCost["phases"] {
  const ph: TimelineCost["phases"] = [];
  ph.push({
    name: "Phase 1 — Foundational compliance",
    duration: "3–6 months",
    what_happens:
      "Engage an ISO 13485 consultant for a gap assessment, document the Intended Use Statement, and lock the classification rationale.",
    cost_range_inr: formatInrLakhs(3, 6),
  });
  ph.push({
    name: "Phase 2 — Technical documentation",
    duration: "4–6 months",
    what_happens:
      "Build the IEC 62304 software lifecycle file, ISO 14971 risk file, IEC 81001-5-1 cybersecurity controls, and IEC 62366-1 usability evidence.",
    cost_range_inr: formatInrLakhs(3, 7),
  });
  if (ctx.recommended_path === "clinical_investigation") {
    ph.push({
      name: "Phase 3 — Clinical validation",
      duration: "9–14 months",
      what_happens:
        "Design and run a multi-centre clinical investigation with EC approval and CTRI registration. Typically the longest item on the critical path.",
      cost_range_inr: formatInrLakhs(8, 18),
    });
  } else {
    ph.push({
      name: "Phase 3 — Performance evaluation",
      duration: "3–6 months",
      what_happens:
        "Run analytical and clinical performance evaluations against the intended use, gather Indian-population data where applicable.",
      cost_range_inr: formatInrLakhs(3, 8),
    });
  }
  ph.push({
    name: "Phase 4 — Submission preparation",
    duration: "2–3 months",
    what_happens:
      "Assemble the Device Master File, labelling, IFU, predicate or SE narrative, and pre-submission review.",
    cost_range_inr: formatInrLakhs(2, 5),
  });
  ph.push({
    name: "Phase 5 — CDSCO review cycle",
    duration: "4–8 months",
    what_happens:
      "Submission filing, queries-and-responses cycle, possible site inspection, licence grant.",
    cost_range_inr: formatInrLakhs(1, 3),
  });
  return ph;
}

function buildBottlenecks(
  card: ReadinessCard,
  ctx: ReviewerContext
): string[] {
  const b: string[] = [];
  if (ctx.recommended_path === "clinical_investigation") {
    b.push(
      "Clinical investigation timeline (EC + CTRI + enrolment + follow-up) dominates the schedule."
    );
  }
  const highGap = card.top_gaps.find((g) => g.severity === "high");
  if (highGap) {
    b.push(`Top high-severity gap: ${highGap.gap_title}.`);
  }
  if (card.classification.novel_or_predicate === "novel") {
    b.push(
      "Novel device path adds MD-26 / MD-27 pre-permission ahead of MD-7."
    );
  }
  if (card.classification.acp_required) {
    b.push(
      "ACP filing introduces additional review back-and-forth alongside the main licence."
    );
  }
  return b.slice(0, 5);
}

// ─────────────────────────────────────────────────────────────
// LLM helpers
// ─────────────────────────────────────────────────────────────

function extractText(response: Anthropic.Message): string {
  const first = response.content[0];
  return first && first.type === "text" ? first.text : "";
}

function stripFences(text: string): string {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : stripped;
}

function usageFrom(response: Anthropic.Message): TokenUsage {
  return {
    input_tokens: response.usage.input_tokens,
    cache_read: response.usage.cache_read_input_tokens ?? 0,
    cache_write: response.usage.cache_creation_input_tokens ?? 0,
    output_tokens: response.usage.output_tokens,
  };
}

interface CallOpusJsonInput<T> {
  client: Anthropic;
  label: string;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  maxTokens: number;
}

interface CallOpusJsonResult<T> {
  value: T;
  usage: TokenUsage;
  cost: number;
}

async function callOpusJson<T>(
  input: CallOpusJsonInput<T>
): Promise<CallOpusJsonResult<T>> {
  let accUsage: TokenUsage = {
    input_tokens: 0,
    cache_read: 0,
    cache_write: 0,
    output_tokens: 0,
  };
  let accCost = 0;
  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const systemText =
      input.systemPrompt + (attempt === 2 ? STRICT_SUFFIX : "");
    const response = await input.client.messages.create({
      model: MODEL,
      max_tokens: input.maxTokens,
      system: [
        {
          type: "text",
          text: systemText,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: input.userPrompt }],
    });
    const usage = usageFrom(response);
    accUsage = {
      input_tokens: accUsage.input_tokens + usage.input_tokens,
      cache_read: accUsage.cache_read + usage.cache_read,
      cache_write: accUsage.cache_write + usage.cache_write,
      output_tokens: accUsage.output_tokens + usage.output_tokens,
    };
    accCost += calculateCallCost(MODEL, usage);
    try {
      const raw = extractText(response);
      const cleaned = stripFences(raw);
      const parsed: unknown = JSON.parse(cleaned);
      const value = input.schema.parse(parsed);
      return { value, usage: accUsage, cost: accCost };
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `readiness-report ${input.label}: JSON/schema validation failed after retry: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`
  );
}

function formatProductLine(
  input: ReadinessReportInput,
  card: ReadinessCard
): string {
  const cls = card.classification.cdsco_class;
  const qual = card.classification.class_qualifier;
  const classBit = cls ? `Class ${cls}${qual ? ` · ${qual}` : ""}` : "classification TBD";
  const path = card.recommended_path ?? "unclear";
  return `${input.product_name} — ${classBit} — recommended path: ${path}`;
}

// ─────────────────────────────────────────────────────────────
// LLM call 1 — pathway narrative tone-shift
// ─────────────────────────────────────────────────────────────

const PathwayCallSchema = z.object({
  why_this_class_applies: z.string().min(80).max(800),
});

async function callPathwayNarrative(
  client: Anthropic,
  args: {
    assessment_id: string;
    productLine: string;
    pathwayDeterministic: Omit<Pathway, "why_this_class_applies">;
    card: ReadinessCard;
  }
) {
  const systemPrompt = `
You write a single paragraph (90–180 words) for the "Your Likely Regulatory Pathway" section of a ₹499 founder-facing regulatory report.

${SHARED_TONE_RULES}

The paragraph answers: "Why does this likely class apply to THIS product?" It must:
- Reference the specific product type and indication in plain English.
- Tie the classification to the IMDRF dimensions (clinical state × information significance) without naming the framework explicitly.
- Use "likely" / "may" framing throughout.
- End by naming the form pathway (e.g., "MD-7 via the Central Licensing Authority") in one short sentence.
- Avoid restating the full step sequence — that's a separate table.

Output STRICT JSON: { "why_this_class_applies": "..." }
`.trim();

  const userPrompt = [
    `Product: ${args.productLine}`,
    `Pathway authority: ${args.pathwayDeterministic.authority}`,
    `Forms: ${args.pathwayDeterministic.forms.join(", ")}`,
    `Test licence note: ${args.pathwayDeterministic.test_licence_note ?? "n/a"}`,
    `ACP note: ${args.pathwayDeterministic.acp_note ?? "n/a"}`,
    `Existing classification rationale (concise): ${truncate(args.card.regulations.cdsco_mdr.rationale, 600)}`,
    `Risk rationale (concise): ${truncate(args.card.risk.rationale, 400)}`,
    `Top 3 gap titles: ${args.card.top_gaps.slice(0, 3).map((g) => g.gap_title).join(" | ")}`,
    "",
    "Write the paragraph now.",
  ].join("\n");

  const result = await callOpusJson({
    client,
    label: "pathway",
    systemPrompt,
    userPrompt,
    schema: PathwayCallSchema,
    maxTokens: MAX_TOKENS_PATHWAY,
  });
  return {
    why_this_class_applies: result.value.why_this_class_applies,
    usage: result.usage,
    cost: result.cost,
  };
}

// ─────────────────────────────────────────────────────────────
// LLM call 2 — gap why-it-matters (batched)
// ─────────────────────────────────────────────────────────────

const GapWhyCallSchema = z.object({
  rows: z
    .array(
      z.object({
        key: z.string(),
        why_it_matters: z.string().min(40).max(450),
      })
    )
    .min(1),
});

async function callGapWhyItMatters(
  client: Anthropic,
  args: {
    assessment_id: string;
    productLine: string;
    ctx: ReviewerContext;
    gapRowSeeds: GapRowSeed[];
  }
) {
  const systemPrompt = `
You write the "Why it matters" column of the Readiness Gap Analysis table in a ₹499 founder-facing regulatory report.

${SHARED_TONE_RULES}

For each gap below, return ONE softened, founder-friendly sentence (or two short sentences) explaining what reviewers will likely expect and what happens if the gap is not closed. Use the seed phrase as a starting point — tailor it to the specific product and class.

Avoid: "nonconformity", "regulatory noncompliance", "conformance obligations".
Use: "Reviewers will likely expect…", "Without this, submission may be delayed…", "Typically requested before…".

Output STRICT JSON:
{
  "rows": [
    { "key": "<lookupKey>", "why_it_matters": "..." },
    ...
  ]
}

Return one row per input gap, with the same "key" values. Do not invent new keys.
`.trim();

  const userPrompt = [
    `Product: ${args.productLine}`,
    `Class: ${args.ctx.cdsco_class ?? "TBD"} · AI/ML: ${args.ctx.ai_ml_flag} · Data sensitivity: ${args.ctx.data_sensitivity}`,
    "",
    "Gaps (process every entry):",
    ...args.gapRowSeeds.map(
      (g) =>
        `- key=${g.lookupKey} | gap=${g.gap_title} | dim=${g.dim} | priority=${g.priority} | seed=${g.fallbackWhy}`
    ),
  ].join("\n");

  const result = await callOpusJson({
    client,
    label: "gap_why",
    systemPrompt,
    userPrompt,
    schema: GapWhyCallSchema,
    maxTokens: MAX_TOKENS_GAPS,
  });

  const rowsByKey: Record<string, string> = {};
  for (const row of result.value.rows) {
    rowsByKey[row.key] = row.why_it_matters;
  }
  return { rowsByKey, usage: result.usage, cost: result.cost };
}

// ─────────────────────────────────────────────────────────────
// LLM call 3 — reviewer insights (batched)
// ─────────────────────────────────────────────────────────────

const ReviewerInsightsCallSchema = z.object({
  rows: z
    .array(
      z.object({
        key: z.string(),
        what_reviewers_look_for: z.string().min(60).max(450),
      })
    )
    .min(1),
});

async function callReviewerInsights(
  client: Anthropic,
  args: {
    assessment_id: string;
    productLine: string;
    ctx: ReviewerContext;
    seeds: Array<{ key: string; title: string; seed: string }>;
  }
) {
  const systemPrompt = `
You write the "what reviewers will likely look for" descriptions in Section 5 (Reviewer Insights) of a ₹499 founder-facing regulatory report.

${SHARED_TONE_RULES}

For each reviewer priority below, return ONE softened, product-tailored paragraph (60–110 words) explaining what CDSCO reviewers typically expect to see. Tailor the seed phrase to the product specifics — name the indication / patient population / data type when relevant.

Output STRICT JSON:
{
  "rows": [
    { "key": "<key>", "what_reviewers_look_for": "..." },
    ...
  ]
}

Return one row per input priority, with the same "key" values. Do not invent new keys.
`.trim();

  const userPrompt = [
    `Product: ${args.productLine}`,
    `Class: ${args.ctx.cdsco_class ?? "TBD"} · AI/ML: ${args.ctx.ai_ml_flag} · Novel: ${args.ctx.novel_or_predicate === "novel"}`,
    "",
    "Reviewer priorities (process every entry):",
    ...args.seeds.map(
      (s) => `- key=${s.key} | title=${s.title} | seed=${s.seed}`
    ),
  ].join("\n");

  const result = await callOpusJson({
    client,
    label: "reviewer_insights",
    systemPrompt,
    userPrompt,
    schema: ReviewerInsightsCallSchema,
    maxTokens: MAX_TOKENS_INSIGHTS,
  });
  const rowsByKey: Record<string, string> = {};
  for (const row of result.value.rows) {
    rowsByKey[row.key] = row.what_reviewers_look_for;
  }
  return { rowsByKey, usage: result.usage, cost: result.cost };
}

// ─────────────────────────────────────────────────────────────
// LLM call 4 — smart example annotations (batched)
// ─────────────────────────────────────────────────────────────

const SmartExampleAnnotationsSchema = z.object({
  rows: z
    .array(
      z.object({
        key: z.string(),
        why_this_is_safer: z.string().min(60).max(450),
      })
    )
    .min(1),
});

async function callSmartExamples(
  client: Anthropic,
  args: {
    assessment_id: string;
    productLine: string;
    ctx: ReviewerContext;
    seeds: Array<{
      key: string;
      topic: string;
      category: string;
      good: string;
      bad: string;
      seed: string;
    }>;
  }
) {
  const systemPrompt = `
You write the "Why this wording is safer" annotation in Section 6 (Smart Examples) of a ₹499 founder-facing regulatory report.

${SHARED_TONE_RULES}

For each example pair (good + bad snippet) below, return ONE softened annotation (60–110 words) explaining why the good wording is regulator-defensible and why the bad wording typically invites questions or stricter classification. Tailor to product specifics where relevant; otherwise stay close to the seed.

Boundary: the snippet pairs themselves are static. You annotate, not rewrite, the snippets.

Output STRICT JSON:
{
  "rows": [
    { "key": "<key>", "why_this_is_safer": "..." },
    ...
  ]
}

Return one row per input example, with the same "key" values. Do not invent new keys.
`.trim();

  const userPrompt = [
    `Product: ${args.productLine}`,
    `Class: ${args.ctx.cdsco_class ?? "TBD"} · AI/ML: ${args.ctx.ai_ml_flag}`,
    "",
    "Example pairs (process every entry):",
    ...args.seeds.map(
      (s) =>
        `- key=${s.key} | topic=${s.topic} | category=${s.category}\n  good=${s.good}\n  bad=${s.bad}\n  seed=${s.seed}`
    ),
  ].join("\n");

  const result = await callOpusJson({
    client,
    label: "smart_examples",
    systemPrompt,
    userPrompt,
    schema: SmartExampleAnnotationsSchema,
    maxTokens: MAX_TOKENS_EXAMPLES,
  });
  const rowsByKey: Record<string, string> = {};
  for (const row of result.value.rows) {
    rowsByKey[row.key] = row.why_this_is_safer;
  }
  return { rowsByKey, usage: result.usage, cost: result.cost };
}

// ─────────────────────────────────────────────────────────────
// Softening pass
// ─────────────────────────────────────────────────────────────

function softenReport(r: ReadinessReport): ReadinessReport {
  return {
    ...r,
    scorecard: {
      ...r.scorecard,
      classification_label: softenCertainty(r.scorecard.classification_label),
      pathway_label: softenCertainty(r.scorecard.pathway_label),
      cost_range_inr_display: r.scorecard.cost_range_inr_display,
      recommended_next_action: softenCertainty(r.scorecard.recommended_next_action),
      triggers: r.scorecard.triggers.map(softenCertainty),
      top_gap_titles: r.scorecard.top_gap_titles.map(softenCertainty),
    },
    pathway: {
      ...r.pathway,
      why_this_class_applies: softenCertainty(r.pathway.why_this_class_applies),
      authority: softenCertainty(r.pathway.authority),
      test_licence_note: r.pathway.test_licence_note
        ? softenCertainty(r.pathway.test_licence_note)
        : null,
      acp_note: r.pathway.acp_note ? softenCertainty(r.pathway.acp_note) : null,
      step_sequence: r.pathway.step_sequence.map((s) => ({
        ...s,
        step: softenCertainty(s.step),
        what_happens: softenCertainty(s.what_happens),
      })),
    },
    gap_analysis: {
      rows: r.gap_analysis.rows.map((row) => ({
        ...row,
        gap: softenCertainty(row.gap),
        why_it_matters: softenCertainty(row.why_it_matters),
        suggested_next_step: softenCertainty(row.suggested_next_step),
      })),
    },
    timeline_cost: {
      ...r.timeline_cost,
      phases: r.timeline_cost.phases.map((p) => ({
        ...p,
        name: softenCertainty(p.name),
        what_happens: softenCertainty(p.what_happens),
      })),
      bottlenecks: r.timeline_cost.bottlenecks.map(softenCertainty),
    },
    reviewer_insights: r.reviewer_insights.map((i) => ({
      priority: softenCertainty(i.priority),
      what_reviewers_look_for: softenCertainty(i.what_reviewers_look_for),
    })),
    smart_examples: r.smart_examples.map((e) => ({
      ...e,
      topic: softenCertainty(e.topic),
      // good/bad snippets are curated — do NOT auto-soften, they're verbatim by design.
      good_snippet: e.good_snippet,
      bad_snippet: e.bad_snippet,
      why_this_is_safer: softenCertainty(e.why_this_is_safer),
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// Small util
// ─────────────────────────────────────────────────────────────

function truncate(s: string | null | undefined, n: number): string {
  if (!s) return "n/a";
  return s.length <= n ? s : `${s.slice(0, n)}…`;
}
