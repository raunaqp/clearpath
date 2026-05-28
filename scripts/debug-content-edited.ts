#!/usr/bin/env tsx
/**
 * Debug Bug 4: save not persisting.
 *
 * Write a sentinel value to draft_pack_sections.content_edited for
 * §1 of the CardioRhythm assessment, read it back, and report.
 * After this, the founder can visit /draft/39c844a1.../?print=1 (with
 * the internal token) and confirm whether the sentinel shows up.
 */
import { getServiceClient } from "../lib/supabase";

const ASSESSMENT_ID = "39c844a1-9091-45d0-af5f-c17c431fc734";
const SECTION_KEY = "01_executive_summary";
const SENTINEL = `## DEBUG SENTINEL ${Date.now()}\n\nIf you see this, the page is correctly reading content_edited.`;

async function main() {
  const supabase = getServiceClient();

  // Look up order + section
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id, status")
    .eq("assessment_id", ASSESSMENT_ID)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  console.log("order:", order);
  if (!order) {
    console.log("no order — abort");
    return;
  }

  const { data: section, error } = await supabase
    .from("draft_pack_sections")
    .select("id, content, content_edited, edited_at, edited_by")
    .eq("order_id", order.id)
    .eq("section_key", SECTION_KEY)
    .maybeSingle();
  if (error) {
    console.log("section lookup error:", error.message);
    return;
  }
  if (!section) {
    console.log("section not found — abort");
    return;
  }

  console.log("\nBEFORE write:");
  console.log("  id:                       ", section.id);
  console.log("  content length:           ", section.content?.length ?? 0);
  console.log("  content_edited length:    ", section.content_edited?.length ?? 0);
  console.log("  edited_at:                ", section.edited_at);
  console.log("  edited_by:                ", section.edited_by);

  // Write sentinel
  const { error: upErr } = await supabase
    .from("draft_pack_sections")
    .update({
      content_edited: SENTINEL,
      edited_at: new Date().toISOString(),
      edited_by: "debug-script",
    })
    .eq("id", section.id);
  if (upErr) {
    console.log("UPDATE failed:", upErr.message);
    return;
  }

  // Re-read
  const { data: after } = await supabase
    .from("draft_pack_sections")
    .select("content, content_edited, edited_at, edited_by")
    .eq("id", section.id)
    .single();

  console.log("\nAFTER write:");
  console.log("  content length:           ", after?.content?.length ?? 0);
  console.log("  content_edited length:    ", after?.content_edited?.length ?? 0);
  console.log("  content_edited starts with:", JSON.stringify(after?.content_edited?.slice(0, 80)));
  console.log("  edited_at:                ", after?.edited_at);
  console.log("  edited_by:                ", after?.edited_by);

  console.log("\nSentinel: ", JSON.stringify(SENTINEL.slice(0, 80)));
}

main().catch((err) => {
  console.error("crashed:", err);
  process.exit(1);
});
