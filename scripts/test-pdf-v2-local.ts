#!/usr/bin/env tsx
/**
 * Phase 6 local PDF smoke test.
 * Starts a Next dev server, runs Chrome against /draft/[id]?print=1,
 * saves PDF to /tmp.
 *
 * Pre-reqs:
 *   - LOCAL_CHROME_PATH set in .env.local
 *   - INTERNAL_PRINT_TOKEN set in .env.local
 *   - `next dev` running in another terminal on localhost:3000
 *
 * Run: npx tsx --env-file=.env.local scripts/test-pdf-v2-local.ts [assessment_id]
 */
import { writeFileSync } from "node:fs";
import { renderDraftPackPdfV2 } from "../lib/pdf/draft-pack-pdf-v2";

const DEFAULT_ID = "39c844a1-9091-45d0-af5f-c17c431fc734";

async function main() {
  const id = process.argv[2] ?? DEFAULT_ID;
  const baseUrl = process.env.PDF_TEST_BASE_URL ?? "http://localhost:3000";
  console.log(`\n=== PDF v2 smoke test: ${baseUrl}/draft/${id}?print=1 ===\n`);

  const { pdf, durationMs } = await renderDraftPackPdfV2({
    assessmentId: id,
    baseUrl,
  });

  const outPath = `/tmp/draft-pack-v2-${id.slice(0, 8)}.pdf`;
  writeFileSync(outPath, pdf);
  console.log(`PDF written to: ${outPath}`);
  console.log(`Size:           ${(pdf.byteLength / 1024).toFixed(1)} KB`);
  console.log(`Duration:       ${(durationMs / 1000).toFixed(1)} s`);
}

main().catch((err) => {
  console.error("\ncrashed:", err);
  process.exit(1);
});
