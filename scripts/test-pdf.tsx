// Render the Draft Pack template with sample data and write to /tmp.
// Run: npm run pdf:test
//
// Verifies: template imports, no React-PDF render errors, file written, > 5 KB.
import { renderToFile } from "@react-pdf/renderer";
import React from "react";
import { existsSync, statSync } from "node:fs";
import { DraftPackDocument, type DraftPackData } from "../lib/pdf/draft-pack-template";

const sample: DraftPackData = {
  product_name: "AcmeScan AI Retinal Screening",
  generated_date: "25 April 2026",
  assessment_id: "00000000-0000-0000-0000-000000000000",
  share_token: "sample-token",
  applicant_name: "Sample Applicant",
  applicant_email: "sample@example.com",
};

const out = "/tmp/sample-draft-pack.pdf";

async function main() {
  await renderToFile(<DraftPackDocument data={sample} />, out);

  if (!existsSync(out)) {
    console.error(`FAIL: ${out} was not created`);
    process.exit(1);
  }
  const size = statSync(out).size;
  if (size < 5_000) {
    console.error(`FAIL: ${out} is suspiciously small (${size} bytes)`);
    process.exit(1);
  }
  console.log(`OK: ${out} (${size.toLocaleString()} bytes)`);
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
