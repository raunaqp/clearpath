#!/usr/bin/env tsx
/**
 * Phase 5.5.D — migration 014 validator.
 *
 * Run AFTER applying supabase/migration-014-attachments-doc-type.sql.
 * Run: npx tsx --env-file=.env.local scripts/validate-migration-014.ts
 *
 * One check: draft_pack_attachments.doc_type column is selectable.
 */
import { getServiceClient } from "../lib/supabase";

const supabase = getServiceClient();

async function main() {
  console.log("\nPhase 5.5.D — migration 014 validator\n");
  const { error } = await supabase
    .from("draft_pack_attachments")
    .select("id, doc_type")
    .limit(0);
  if (error) {
    console.log("  ✗ draft_pack_attachments.doc_type — ", error.message);
    process.exit(1);
  }
  console.log("  ✓ draft_pack_attachments.doc_type column exists");
  console.log("\n1/1 checks passed.\n");
}

main().catch((err) => {
  console.error("crashed:", err);
  process.exit(1);
});
