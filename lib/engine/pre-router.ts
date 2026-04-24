import Anthropic from "@anthropic-ai/sdk";
import { PRE_ROUTER_SYSTEM_PROMPT } from "./system-prompts";
import { computeSonnetCost, trackApiCost, type TokenUsage } from "./cost";

export type PreRouterPdf =
  | { type: "cached"; sha256: string; summary: string }
  | { type: "fresh"; sha256: string; base64: string; filename: string };

export type PreRouterInput = {
  oneLiner: string;
  urlContent: string | null;
  pdfs: PreRouterPdf[];
};

export type ConflictSeverity = "high" | "medium" | "low" | "none";
export type SignalSource = "pdf" | "url" | "one_liner";
export type SignalConfidence = "high" | "medium" | "low";
export type AuthorityUsed = "pdf" | "url" | "one_liner";

export type ConflictDetails = {
  one_liner_interpretation: string;
  pdf_interpretation: string | null;
  url_interpretation: string | null;
  authority_used: AuthorityUsed;
  severity: ConflictSeverity;
};

export type DetectedCertification = {
  name: string;
  source: SignalSource;
  confidence: SignalConfidence;
  evidence_quote: string;
};

export type DetectedPartnership = {
  type: "clinical_site" | "testing_lab" | "manufacturer" | "tech_partner";
  name: string;
  source: "pdf" | "url";
  confidence: SignalConfidence;
};

export type DetectedPriorWork = {
  type:
    | "cdsco_filing"
    | "clinical_trial"
    | "cdsco_test_license"
    | "fda_submission";
  reference: string;
  source: "pdf" | "url";
  confidence: SignalConfidence;
};

export type DetectedSignals = {
  certifications: DetectedCertification[];
  partnerships: DetectedPartnership[];
  prior_regulatory_work: DetectedPriorWork[];
  has_physical_facility: "yes" | "no" | "unclear";
  facility_details: string | null;
};

export type PreRouterResult = {
  product_type:
    | "product"
    | "platform"
    | "hardware_software"
    | "export_only"
    | "regulator"
    | "investor"
    | "out_of_scope";
  next_action: "run_wizard" | "run_decomposer" | "reject";
  rejection_reason: string | null;
  rationale: string;
  conflict_detected: boolean;
  conflict_note: string | null;
  conflict_details: ConflictDetails | null;
  detected_signals: DetectedSignals;
  pdf_summaries: Array<{ sha256: string; summary: string }>;
  usage: {
    input_tokens: number;
    cache_read: number;
    cache_write: number;
    output_tokens: number;
  };
  cost_usd: number;
  raw_model_response: string;
};

const EMPTY_SIGNALS: DetectedSignals = {
  certifications: [],
  partnerships: [],
  prior_regulatory_work: [],
  has_physical_facility: "unclear",
  facility_details: null,
};

const MODEL = "claude-sonnet-4-6";

type ParsedModelJson = {
  product_type?: unknown;
  next_action?: unknown;
  rejection_reason?: unknown;
  rationale?: unknown;
  conflict_detected?: unknown;
  conflict_note?: unknown;
  conflict_details?: unknown;
  detected_signals?: unknown;
  pdf_summaries?: unknown;
};

function extractJson(text: string): ParsedModelJson {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("pre-router: no JSON object found in model response");
  }
  try {
    return JSON.parse(match[0]) as ParsedModelJson;
  } catch (err) {
    throw new Error(
      `pre-router: JSON parse failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

const VALID_PRODUCT_TYPES = new Set<PreRouterResult["product_type"]>([
  "product",
  "platform",
  "hardware_software",
  "export_only",
  "regulator",
  "investor",
  "out_of_scope",
]);

const VALID_NEXT_ACTIONS = new Set<PreRouterResult["next_action"]>([
  "run_wizard",
  "run_decomposer",
  "reject",
]);

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asStringOrNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function asBool(v: unknown): boolean {
  return v === true;
}

function asPdfSummaries(
  v: unknown
): Array<{ sha256: string; summary: string }> {
  if (!Array.isArray(v)) return [];
  const out: Array<{ sha256: string; summary: string }> = [];
  for (const item of v) {
    if (
      item &&
      typeof item === "object" &&
      "sha256" in item &&
      "summary" in item
    ) {
      const rec = item as { sha256: unknown; summary: unknown };
      if (typeof rec.sha256 === "string" && typeof rec.summary === "string") {
        out.push({ sha256: rec.sha256, summary: rec.summary });
      }
    }
  }
  return out;
}

const VALID_SEVERITY = new Set<ConflictSeverity>([
  "high",
  "medium",
  "low",
  "none",
]);
const VALID_AUTHORITY = new Set<AuthorityUsed>(["pdf", "url", "one_liner"]);
const VALID_SOURCE = new Set<SignalSource>(["pdf", "url", "one_liner"]);
const VALID_PARTNERSHIP_SOURCE = new Set<"pdf" | "url">(["pdf", "url"]);
const VALID_CONFIDENCE = new Set<SignalConfidence>(["high", "medium", "low"]);
const VALID_PARTNERSHIP_TYPE = new Set<DetectedPartnership["type"]>([
  "clinical_site",
  "testing_lab",
  "manufacturer",
  "tech_partner",
]);
const VALID_PRIOR_WORK_TYPE = new Set<DetectedPriorWork["type"]>([
  "cdsco_filing",
  "clinical_trial",
  "cdsco_test_license",
  "fda_submission",
]);
const VALID_FACILITY = new Set<DetectedSignals["has_physical_facility"]>([
  "yes",
  "no",
  "unclear",
]);

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asConflictDetails(v: unknown): ConflictDetails | null {
  if (!isObj(v)) return null;
  const sev = v.severity;
  const auth = v.authority_used;
  if (typeof sev !== "string" || !VALID_SEVERITY.has(sev as ConflictSeverity)) {
    return null;
  }
  if (typeof auth !== "string" || !VALID_AUTHORITY.has(auth as AuthorityUsed)) {
    return null;
  }
  return {
    one_liner_interpretation:
      typeof v.one_liner_interpretation === "string"
        ? v.one_liner_interpretation
        : "",
    pdf_interpretation:
      typeof v.pdf_interpretation === "string" ? v.pdf_interpretation : null,
    url_interpretation:
      typeof v.url_interpretation === "string" ? v.url_interpretation : null,
    authority_used: auth as AuthorityUsed,
    severity: sev as ConflictSeverity,
  };
}

function asCertifications(v: unknown): DetectedCertification[] {
  if (!Array.isArray(v)) return [];
  const out: DetectedCertification[] = [];
  for (const item of v) {
    if (!isObj(item)) continue;
    const { name, source, confidence, evidence_quote } = item;
    if (typeof name !== "string" || !name.trim()) continue;
    if (typeof source !== "string" || !VALID_SOURCE.has(source as SignalSource)) continue;
    if (
      typeof confidence !== "string" ||
      !VALID_CONFIDENCE.has(confidence as SignalConfidence)
    )
      continue;
    out.push({
      name,
      source: source as SignalSource,
      confidence: confidence as SignalConfidence,
      evidence_quote:
        typeof evidence_quote === "string" ? evidence_quote.slice(0, 400) : "",
    });
  }
  return out;
}

function asPartnerships(v: unknown): DetectedPartnership[] {
  if (!Array.isArray(v)) return [];
  const out: DetectedPartnership[] = [];
  for (const item of v) {
    if (!isObj(item)) continue;
    const { type, name, source, confidence } = item;
    if (
      typeof type !== "string" ||
      !VALID_PARTNERSHIP_TYPE.has(type as DetectedPartnership["type"])
    )
      continue;
    if (typeof name !== "string" || !name.trim()) continue;
    if (
      typeof source !== "string" ||
      !VALID_PARTNERSHIP_SOURCE.has(source as "pdf" | "url")
    )
      continue;
    if (
      typeof confidence !== "string" ||
      !VALID_CONFIDENCE.has(confidence as SignalConfidence)
    )
      continue;
    out.push({
      type: type as DetectedPartnership["type"],
      name,
      source: source as "pdf" | "url",
      confidence: confidence as SignalConfidence,
    });
  }
  return out;
}

function asPriorWork(v: unknown): DetectedPriorWork[] {
  if (!Array.isArray(v)) return [];
  const out: DetectedPriorWork[] = [];
  for (const item of v) {
    if (!isObj(item)) continue;
    const { type, reference, source, confidence } = item;
    if (
      typeof type !== "string" ||
      !VALID_PRIOR_WORK_TYPE.has(type as DetectedPriorWork["type"])
    )
      continue;
    if (typeof reference !== "string" || !reference.trim()) continue;
    if (
      typeof source !== "string" ||
      !VALID_PARTNERSHIP_SOURCE.has(source as "pdf" | "url")
    )
      continue;
    if (
      typeof confidence !== "string" ||
      !VALID_CONFIDENCE.has(confidence as SignalConfidence)
    )
      continue;
    out.push({
      type: type as DetectedPriorWork["type"],
      reference,
      source: source as "pdf" | "url",
      confidence: confidence as SignalConfidence,
    });
  }
  return out;
}

function asDetectedSignals(v: unknown): DetectedSignals {
  if (!isObj(v)) return { ...EMPTY_SIGNALS };
  const facility = v.has_physical_facility;
  const has_physical_facility =
    typeof facility === "string" &&
    VALID_FACILITY.has(facility as DetectedSignals["has_physical_facility"])
      ? (facility as DetectedSignals["has_physical_facility"])
      : "unclear";
  return {
    certifications: asCertifications(v.certifications),
    partnerships: asPartnerships(v.partnerships),
    prior_regulatory_work: asPriorWork(v.prior_regulatory_work),
    has_physical_facility,
    facility_details:
      typeof v.facility_details === "string" ? v.facility_details : null,
  };
}

export async function runPreRouter(
  input: PreRouterInput
): Promise<PreRouterResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("pre-router: ANTHROPIC_API_KEY missing");
  }

  const client = new Anthropic({ apiKey });

  const cachedPdfs = input.pdfs.filter(
    (p): p is Extract<PreRouterPdf, { type: "cached" }> => p.type === "cached"
  );
  const freshPdfs = input.pdfs.filter(
    (p): p is Extract<PreRouterPdf, { type: "fresh" }> => p.type === "fresh"
  );

  const cachedSummariesBlock =
    cachedPdfs.length === 0
      ? "N/A"
      : cachedPdfs
          .map(
            (p, i) =>
              `${i + 1}. [cached sha256: ${p.sha256}] ${p.summary}`
          )
          .join("\n");

  const headerText = `One-liner: ${input.oneLiner}
URL content: ${input.urlContent ?? "N/A"}
Cached PDF summaries:
${cachedSummariesBlock}

${freshPdfs.length === 0 ? "No fresh PDFs attached." : `Fresh PDFs (${freshPdfs.length}) follow, each preceded by its sha256 marker.`}`;

  const userContent: Anthropic.MessageParam["content"] = [
    { type: "text", text: headerText },
  ];

  for (const pdf of freshPdfs) {
    userContent.push({
      type: "text",
      text: `[PDF sha256: ${pdf.sha256}] filename: ${pdf.filename}`,
    });
    userContent.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: pdf.base64,
      },
    });
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: [
      {
        type: "text",
        text: PRE_ROUTER_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const firstBlock = response.content[0];
  const rawText = firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

  const parsed = extractJson(rawText);

  const productType = asString(parsed.product_type) as PreRouterResult["product_type"];
  const nextAction = asString(parsed.next_action) as PreRouterResult["next_action"];
  if (!VALID_PRODUCT_TYPES.has(productType)) {
    throw new Error(`pre-router: invalid product_type "${String(parsed.product_type)}"`);
  }
  if (!VALID_NEXT_ACTIONS.has(nextAction)) {
    throw new Error(`pre-router: invalid next_action "${String(parsed.next_action)}"`);
  }

  const usage: TokenUsage = {
    input_tokens: response.usage.input_tokens,
    cache_read: response.usage.cache_read_input_tokens ?? 0,
    cache_write: response.usage.cache_creation_input_tokens ?? 0,
    output_tokens: response.usage.output_tokens,
  };

  const cost_usd = computeSonnetCost(usage);
  const cache_hit = usage.cache_read > 0;

  await trackApiCost({
    feature: "pre_router",
    model: MODEL,
    usage,
    cost_usd,
    cache_hit,
  });

  const conflict_detected = asBool(parsed.conflict_detected);
  const conflict_details = conflict_detected
    ? asConflictDetails(parsed.conflict_details)
    : null;

  return {
    product_type: productType,
    next_action: nextAction,
    rejection_reason: asStringOrNull(parsed.rejection_reason),
    rationale: asString(parsed.rationale),
    conflict_detected,
    conflict_note: asStringOrNull(parsed.conflict_note),
    conflict_details,
    detected_signals: asDetectedSignals(parsed.detected_signals),
    pdf_summaries: asPdfSummaries(parsed.pdf_summaries),
    usage,
    cost_usd,
    raw_model_response: rawText,
  };
}
