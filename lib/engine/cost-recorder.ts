/**
 * Best-effort writer for the engine_costs table.
 *
 * Cost telemetry must NEVER break user-facing engine calls. Failures are
 * logged, never thrown. Missing parent IDs (would violate the
 * must_have_parent CHECK constraint on engine_costs) are caught locally
 * — we skip the write rather than relying on the DB to reject it.
 *
 * Pure DB writer — does no calculation. Cost computation lives in
 * lib/engine/cost-calculator.ts (single source of truth).
 */

import { getServiceClient } from "@/lib/supabase";
import type { TokenUsage, ModelKey } from "./cost-calculator";

export type CallLayer =
  | "pre_router"
  | "synthesizer"
  | "draft_pack"
  | "form_fill"
  | "pitch_extraction"; // Story 2.5 Phase 2 — pitch-deck AI extraction at intake

export type RecordEngineCostInput = {
  call_layer: CallLayer;
  model: ModelKey;
  usage: TokenUsage;
  cost_usd: number;
  // At least one parent ID must be set (matches engine_costs.must_have_parent CHECK).
  assessment_id?: string;
  order_id_tier2?: string;
};

export async function recordEngineCost(input: RecordEngineCostInput): Promise<void> {
  if (!input.assessment_id && !input.order_id_tier2) {
    console.warn("[recordEngineCost] missing parent ID — skipping write", {
      call_layer: input.call_layer,
      model: input.model,
    });
    return;
  }

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from("engine_costs").insert({
      assessment_id: input.assessment_id ?? null,
      order_id_tier2: input.order_id_tier2 ?? null,
      call_layer: input.call_layer,
      model: input.model,
      input_tokens: input.usage.input_tokens,
      output_tokens: input.usage.output_tokens,
      cache_read_tokens: input.usage.cache_read,
      cache_write_tokens: input.usage.cache_write,
      cost_usd: input.cost_usd,
    });
    if (error) {
      console.error("[recordEngineCost] insert failed", {
        call_layer: input.call_layer,
        error: error.message,
      });
    }
  } catch (err) {
    console.error("[recordEngineCost] threw", {
      call_layer: input.call_layer,
      err: err instanceof Error ? err.message : String(err),
    });
  }
}
