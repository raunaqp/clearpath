import Anthropic from "@anthropic-ai/sdk";
import {
  DraftPackContentSchema,
  type DraftPackContent,
  DRAFT_PACK_SYSTEM_PROMPT,
} from "@/lib/engine/draft-pack-prompts";
import { softenCertainty } from "@/lib/engine/soften-certainty";
import {
  computeOpusCost,
  trackApiCost,
  type OpusUsage,
} from "@/lib/engine/opus-cost";

const MODEL = "claude-opus-4-7";
const MAX_TOKENS = 8000;
const STRICT_SUFFIX =
  "\n\nReturn STRICT JSON ONLY. No preamble. No trailing text.";

export type DraftPackInput = {
  productName: string;
  oneLiner: string;
  urlContent: string | null;
  wizardAnswers: Record<string, unknown>;
  readinessCard: unknown;
};

export type DraftPackResult = {
  content: DraftPackContent;
  usage: OpusUsage;
  costUsd: number;
};

function stripFences(text: string): string {
  const stripped = text.replace(/```json\s*|```/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : stripped;
}

function softenContent(c: DraftPackContent): DraftPackContent {
  return {
    executive_summary: {
      body: softenCertainty(c.executive_summary.body),
      product_class: softenCertainty(c.executive_summary.product_class),
      pathway: softenCertainty(c.executive_summary.pathway),
      headline_gaps: c.executive_summary.headline_gaps.map(softenCertainty),
    },
    intended_use: {
      indication: softenCertainty(c.intended_use.indication),
      intended_user: softenCertainty(c.intended_use.intended_user),
      use_environment: softenCertainty(c.intended_use.use_environment),
      contraindications: softenCertainty(c.intended_use.contraindications),
    },
    device_description: {
      components_architecture: softenCertainty(
        c.device_description.components_architecture
      ),
      principle_of_operation: softenCertainty(
        c.device_description.principle_of_operation
      ),
      materials_standards: softenCertainty(
        c.device_description.materials_standards
      ),
      variants_accessories: softenCertainty(
        c.device_description.variants_accessories
      ),
      lifecycle_disposal: softenCertainty(
        c.device_description.lifecycle_disposal
      ),
    },
    risk_classification: {
      imdrf_significance: softenCertainty(
        c.risk_classification.imdrf_significance
      ),
      imdrf_situation: softenCertainty(c.risk_classification.imdrf_situation),
      imdrf_category: c.risk_classification.imdrf_category,
      imdrf_rationale: softenCertainty(c.risk_classification.imdrf_rationale),
      cdsco_class: c.risk_classification.cdsco_class,
      cdsco_rationale: softenCertainty(c.risk_classification.cdsco_rationale),
    },
    clinical_context: {
      clinical_need: softenCertainty(c.clinical_context.clinical_need),
      predicate_devices: softenCertainty(c.clinical_context.predicate_devices),
      evidence_plan: softenCertainty(c.clinical_context.evidence_plan),
    },
    algorithm_change_protocol: {
      applicable: c.algorithm_change_protocol.applicable,
      pccp: c.algorithm_change_protocol.pccp
        ? softenCertainty(c.algorithm_change_protocol.pccp)
        : null,
      change_protocol: c.algorithm_change_protocol.change_protocol
        ? softenCertainty(c.algorithm_change_protocol.change_protocol)
        : null,
      real_world_monitoring: c.algorithm_change_protocol.real_world_monitoring
        ? softenCertainty(c.algorithm_change_protocol.real_world_monitoring)
        : null,
    },
  };
}

function usageFrom(response: Anthropic.Message): OpusUsage {
  return {
    input_tokens: response.usage.input_tokens,
    cache_read: response.usage.cache_read_input_tokens ?? 0,
    cache_write: response.usage.cache_creation_input_tokens ?? 0,
    output_tokens: response.usage.output_tokens,
  };
}

export async function generateDraftPackContent(
  input: DraftPackInput
): Promise<DraftPackResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("draft-pack: ANTHROPIC_API_KEY missing");
  }
  const client = new Anthropic({ apiKey });

  const userMessage = JSON.stringify(
    {
      product_name: input.productName,
      one_liner: input.oneLiner,
      url_content: input.urlContent,
      wizard_answers: input.wizardAnswers,
      readiness_card: input.readinessCard,
    },
    null,
    2
  );

  let totalUsage: OpusUsage = {
    input_tokens: 0,
    cache_read: 0,
    cache_write: 0,
    output_tokens: 0,
  };
  let totalCost = 0;
  let lastRawText = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    const systemText =
      DRAFT_PACK_SYSTEM_PROMPT + (attempt === 2 ? STRICT_SUFFIX : "");

    // Note: temperature is deprecated for Opus 4.7 — model uses
    // its own internal sampling. See Anthropic API changelog.
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: systemText,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    const usage = usageFrom(response);
    totalUsage = {
      input_tokens: totalUsage.input_tokens + usage.input_tokens,
      cache_read: totalUsage.cache_read + usage.cache_read,
      cache_write: totalUsage.cache_write + usage.cache_write,
      output_tokens: totalUsage.output_tokens + usage.output_tokens,
    };
    totalCost += computeOpusCost(usage);

    const first = response.content[0];
    const rawText = first && first.type === "text" ? first.text : "";
    lastRawText = rawText;

    try {
      const cleaned = stripFences(rawText);
      const parsed: unknown = JSON.parse(cleaned);
      const validated = DraftPackContentSchema.parse(parsed);
      const softened = softenContent(validated);

      await trackApiCost({
        feature: "draft-pack",
        model: MODEL,
        usage: totalUsage,
        cost_usd: totalCost,
        cache_hit: totalUsage.cache_read > 0,
      });

      return { content: softened, usage: totalUsage, costUsd: totalCost };
    } catch (err) {
      if (attempt === 2) {
        await trackApiCost({
          feature: "draft-pack",
          model: MODEL,
          usage: totalUsage,
          cost_usd: totalCost,
          cache_hit: totalUsage.cache_read > 0,
        });
        throw new Error(
          `draft-pack: JSON/schema validation failed after retry: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }

  throw new Error(
    `draft-pack: unreachable. Last raw text length=${lastRawText.length}`
  );
}
