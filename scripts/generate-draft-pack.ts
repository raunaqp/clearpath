/**
 * CLI: npm run generate-draft-pack -- --order-id <uuid> [--dry-run] [--skip-email]
 *
 * Thin wrapper over `lib/engine/draft-pack-generator.ts`. The same logic
 * runs server-side from /api/admin/generate-draft-pack — keep them
 * behaviourally identical.
 *
 * Useful for: manual recovery (CLI exits non-zero on failure so retry
 * is obvious), debugging (--dry-run writes the merged PDF to disk
 * without touching DB / Storage / email), or running on a machine
 * that has RESEND_API_KEY when the deployed function doesn't.
 */
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}

import { generateDraftPack } from "../lib/engine/draft-pack-generator";

const ORDER_ID_FLAG = "--order-id";
const DRY_RUN_FLAG = "--dry-run";
const SKIP_EMAIL_FLAG = "--skip-email";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type CliArgs = {
  orderId: string;
  dryRun: boolean;
  skipEmail: boolean;
};

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  const idx = argv.indexOf(ORDER_ID_FLAG);
  if (idx < 0 || idx === argv.length - 1) {
    console.error(
      `Usage: npm run generate-draft-pack -- ${ORDER_ID_FLAG} <uuid> [${DRY_RUN_FLAG}] [${SKIP_EMAIL_FLAG}]`
    );
    process.exit(2);
  }
  const orderId = argv[idx + 1];
  if (!UUID_RE.test(orderId)) {
    console.error(`Invalid order_id: ${orderId}`);
    process.exit(2);
  }
  return {
    orderId,
    dryRun: argv.includes(DRY_RUN_FLAG),
    skipEmail: argv.includes(SKIP_EMAIL_FLAG),
  };
}

async function main() {
  const args = parseArgs();
  if (args.dryRun) console.log("(dry-run: no DB / Storage / email writes)");
  if (args.skipEmail) console.log("(skip-email: no Resend call)");

  const result = await generateDraftPack({
    orderId: args.orderId,
    dryRun: args.dryRun,
    skipEmail: args.skipEmail,
    log: (msg) => console.log(msg),
  });

  if (!result.ok) {
    console.error(
      `\n✗ Generation failed at step "${result.errorStep}": ${result.error}`
    );
    process.exit(1);
  }

  if (result.mode === "dryRun") {
    const out = path.resolve(
      process.cwd(),
      `draft-pack-${result.orderId}.pdf`
    );
    fs.writeFileSync(out, result.pdfBuffer);
    console.log(`\n✓ dry-run complete · wrote PDF to ${out}`);
    console.log(`  pages=${result.pageCount} · cost ≈ $${result.opusCostUsd.toFixed(4)}`);
    console.log(`  appendices: ${result.appendedFormIds.join(", ") || "(none)"}`);
    return;
  }

  console.log(`\n✓ Draft Pack delivered for order ${result.orderId}`);
  console.log(`  PDF: ${result.pdfUrl}`);
  console.log(`  pages=${result.pageCount} · cost ≈ $${result.opusCostUsd.toFixed(4)}`);
  console.log(`  appendices: ${result.appendedFormIds.join(", ") || "(none)"}`);
  console.log(
    `  email: ${result.emailSent ? `sent to ${result.emailRecipient}` : "skipped"}`
  );
}

main().catch((err) => {
  console.error(
    "\n✗ Generation threw:",
    err instanceof Error ? err.message : err
  );
  process.exit(1);
});
