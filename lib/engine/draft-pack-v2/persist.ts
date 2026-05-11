/**
 * Draft Pack v2 — source-data loader + per-section persistence.
 *
 * Sprint 2 Story 2.5 Phase 4b. dryRun mode skips DB writes entirely;
 * live mode writes to draft_pack_sections + draft_pack_citations
 * (migration 009 + 011). Both modes return the SectionOutput so the
 * caller (orchestrator) can use it for downstream sections.
 */

import { getServiceClient } from "@/lib/supabase";
import { ReadinessCardSchema } from "@/lib/schemas/readiness-card";
import type { WizardAnswers } from "@/lib/wizard/types";
import type {
  AiExtractedRow,
  PitchAiExtracted,
} from "@/lib/intake/ai-extract";
import type { SectionOutput, SourceData } from "./types";

export class SourceDataError extends Error {
  constructor(public step: string, message: string) {
    super(message);
    this.name = "SourceDataError";
  }
}

/** Load everything a section generator might need. Single round-trip. */
export async function loadSourceData(
  assessmentId: string
): Promise<SourceData> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id, name, email, one_liner, url, url_fetched_content, uploaded_docs, wizard_answers, readiness_card, ai_extracted"
    )
    .eq("id", assessmentId)
    .maybeSingle();

  if (error) {
    throw new SourceDataError("fetch_assessment", error.message);
  }
  if (!data) {
    throw new SourceDataError(
      "fetch_assessment",
      `Assessment ${assessmentId} not found`
    );
  }
  if (!data.readiness_card) {
    throw new SourceDataError(
      "missing_readiness_card",
      "Assessment has no readiness_card — generate the Risk Card first"
    );
  }

  // Schema-validate the readiness_card so downstream sections can rely
  // on the typed shape. Soften behavior: if parsing fails on optional
  // fields, log + continue; if required fields are missing, throw.
  const cardParsed = ReadinessCardSchema.safeParse(data.readiness_card);
  if (!cardParsed.success) {
    throw new SourceDataError(
      "readiness_card_invalid",
      `readiness_card schema validation failed: ${cardParsed.error.issues[0]?.message ?? "unknown"}`
    );
  }

  // Resolve the latest paid order for this assessment, if any.
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id")
    .eq("assessment_id", assessmentId)
    .neq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const aiExtracted = data.ai_extracted as AiExtractedRow | null;
  const aiFields: PitchAiExtracted | null =
    aiExtracted?.status === "complete" ? aiExtracted.fields : null;

  return {
    assessment_id: data.id,
    order_id: order?.id ?? null,
    intake: {
      name: data.name,
      email: data.email,
      one_liner: data.one_liner,
      url: data.url,
      url_fetched_content: data.url_fetched_content,
      uploaded_docs: Array.isArray(data.uploaded_docs)
        ? (data.uploaded_docs as Array<{
            filename: string;
            sha256: string;
            doc_type?: string | null;
          }>)
        : [],
    },
    wizard_answers: (data.wizard_answers as WizardAnswers | null) ?? {},
    readiness_card: cardParsed.data,
    ai_extracted: aiFields,
  };
}

/** Persist one section to draft_pack_sections + draft_pack_citations.
 *  No-op when dryRun is true. Returns the section unchanged so the
 *  orchestrator can pass it on to downstream sections. */
export async function persistSection(
  orderId: string | null,
  section: SectionOutput,
  dryRun: boolean,
  log?: (msg: string) => void
): Promise<SectionOutput> {
  if (dryRun) {
    log?.(`  [dryRun] section ${section.section_key} not persisted`);
    return section;
  }
  if (!orderId) {
    // Live mode but no order — caller should have prevented this.
    throw new Error(
      `persistSection called in live mode without an order_id for ${section.section_key}`
    );
  }

  const supabase = getServiceClient();

  // Upsert the section row, keying on (order_id, section_key).
  const { data: row, error: insErr } = await supabase
    .from("draft_pack_sections")
    .upsert(
      {
        order_id: orderId,
        section_key: section.section_key,
        title: section.title,
        content: section.content,
        completion_status: section.completion_status,
        word_count: section.word_count,
        last_regenerated_at: new Date().toISOString(),
        meta: section.meta,
      },
      { onConflict: "order_id,section_key" }
    )
    .select("id")
    .single();

  if (insErr || !row) {
    throw new Error(
      `persistSection: upsert failed for ${section.section_key}: ${insErr?.message ?? "no row returned"}`
    );
  }

  // Replace this section's citations (delete + insert; cleanest for
  // regeneration). Skip if no citations to write.
  if (section.citations.length > 0) {
    await supabase
      .from("draft_pack_citations")
      .delete()
      .eq("section_id", row.id);

    const citationRows = section.citations.map((c) => ({
      section_id: row.id,
      citation_id: c.citation_id,
      source_doc: c.source_doc,
      quote: c.quote,
      exact_reference: c.exact_reference,
    }));
    const { error: citErr } = await supabase
      .from("draft_pack_citations")
      .insert(citationRows);
    if (citErr) {
      // Citations failing is non-fatal — section text already persisted.
      console.warn(
        `[draft-pack-v2] citation insert failed for ${section.section_key}: ${citErr.message}`
      );
    }
  }

  log?.(
    `  persisted ${section.section_key} · ${section.word_count} words · ${section.citations.length} citations`
  );
  return section;
}
