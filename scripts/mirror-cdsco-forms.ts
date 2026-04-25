// One-off setup: download CDSCO MD-series form PDFs, mirror them to a public
// Supabase Storage bucket (cdsco_forms), and write lib/cdsco/forms-registry.ts.
//
// Run:  tsx scripts/mirror-cdsco-forms.ts
// Idempotent: bucket creation + uploads use upsert.
//
// Why mirror at all? cdsco.gov.in goes down, URLs change between portal
// migrations, and we want the Draft Pack email to ship with stable links.

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local manually — Next.js does this automatically at runtime, but
// this is a standalone tsx script.
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const BUCKET = "cdsco_forms";

// Canonical mapping per docs/specs/clearpath_regulations.md.
// `urls` lists candidates in priority order — we use the first that returns 200.
type FormSpec = {
  id: string;
  description: string;
  urls: string[];
};

const CDSCO_BASE = "https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/medical-device";

const FORMS: FormSpec[] = [
  { id: "MD-5",  description: "Manufacturing license, Class A/B (state authority)",       urls: [`${CDSCO_BASE}/FormMD5n.pdf`, `${CDSCO_BASE}/FormMD5.pdf`] },
  { id: "MD-7",  description: "Application for manufacturing license, Class C/D",         urls: [`${CDSCO_BASE}/FormMD7n.pdf`] },
  { id: "MD-9",  description: "Manufacturing license, Class C/D (central authority)",     urls: [`${CDSCO_BASE}/FormMD9n.pdf`, `${CDSCO_BASE}/FormMD9.pdf`] },
  { id: "MD-12", description: "Test license (clinical investigation)",                    urls: [`${CDSCO_BASE}/MDMD12Tooltip.pdf`, `${CDSCO_BASE}/FormMD12.pdf`] },
  { id: "MD-14", description: "Import license",                                            urls: [`${CDSCO_BASE}/FormMD14n.pdf`] },
  { id: "MD-20", description: "Export No Objection Certificate (NOC)",                    urls: [`${CDSCO_BASE}/FormMD20n.pdf`, `${CDSCO_BASE}/FormMD20.pdf`] },
  { id: "MD-22", description: "Clinical Investigation approval",                          urls: [`${CDSCO_BASE}/FormMD22.pdf`] },
  { id: "MD-23", description: "Clinical Performance Evaluation for IVDs",                 urls: [`${CDSCO_BASE}/FormMD23.pdf`, `${CDSCO_BASE}/FormMD23n.pdf`] },
];

type Outcome =
  | { id: string; description: string; status: "uploaded"; source_url: string; storage_path: string; public_url: string; bytes: number }
  | { id: string; description: string; status: "missing"; tried: string[] };

async function downloadFirstAvailable(urls: string[]): Promise<{ url: string; buf: Uint8Array } | null> {
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") ?? "";
      const buf = new Uint8Array(await res.arrayBuffer());
      // Magic-byte check: real PDFs start with "%PDF-".
      const isPdf = buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
      if (!isPdf) {
        console.warn(`  ${url}  not a PDF (content-type=${ct}), skipping`);
        continue;
      }
      return { url, buf };
    } catch (err) {
      console.warn(`  ${url}  fetch error: ${(err as Error).message}`);
    }
  }
  return null;
}

async function ensureBucket(supa: ReturnType<typeof createClient>) {
  const { data: buckets, error: listErr } = await supa.storage.listBuckets();
  if (listErr) throw listErr;
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (exists) {
    // Make sure it's public (createBucket would set this; updateBucket guarantees it).
    await supa.storage.updateBucket(BUCKET, { public: true });
    console.log(`bucket "${BUCKET}" already exists — ensured public=true`);
    return;
  }
  const { error: createErr } = await supa.storage.createBucket(BUCKET, { public: true });
  if (createErr) throw createErr;
  console.log(`bucket "${BUCKET}" created (public)`);
}

function buildRegistryFile(outcomes: Outcome[]): string {
  const entries = outcomes
    .map((o) => {
      if (o.status === "uploaded") {
        return `  "${o.id}": {
    description: ${JSON.stringify(o.description)},
    url: ${JSON.stringify(o.public_url)},
    source_url: ${JSON.stringify(o.source_url)},
    bytes: ${o.bytes},
    status: "uploaded",
  }`;
      }
      return `  "${o.id}": {
    description: ${JSON.stringify(o.description)},
    url: null,
    source_url: null,
    bytes: 0,
    status: "missing_v1",
    tried: ${JSON.stringify(o.tried)},
  }`;
    })
    .join(",\n");

  return `// AUTO-GENERATED by scripts/mirror-cdsco-forms.ts. Do not edit by hand.
// Re-run the script to refresh URLs (idempotent).
//
// Forms marked "missing_v1" weren't downloadable from cdsco.gov.in at mirror
// time. Feature 6a should fall back to a "see CDSCO portal" link in the
// Submission Guide for those.

export type CDSCOFormStatus = "uploaded" | "missing_v1";

export type CDSCOFormEntry = {
  description: string;
  url: string | null;
  source_url: string | null;
  bytes: number;
  status: CDSCOFormStatus;
  tried?: string[];
};

export const CDSCO_FORMS = {
${entries},
} as const satisfies Record<string, CDSCOFormEntry>;

export type CDSCOFormId = keyof typeof CDSCO_FORMS;
`;
}

async function main() {
  const supa = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  await ensureBucket(supa);

  const outcomes: Outcome[] = [];

  for (const spec of FORMS) {
    console.log(`\n${spec.id} — ${spec.description}`);
    const dl = await downloadFirstAvailable(spec.urls);
    if (!dl) {
      console.log(`  ✗ none of ${spec.urls.length} URLs returned a valid PDF`);
      outcomes.push({ id: spec.id, description: spec.description, status: "missing", tried: spec.urls });
      continue;
    }
    const path = `${spec.id}.pdf`;
    const { error: upErr } = await supa.storage
      .from(BUCKET)
      .upload(path, dl.buf, { upsert: true, contentType: "application/pdf" });
    if (upErr) {
      console.log(`  ✗ upload failed: ${upErr.message}`);
      outcomes.push({ id: spec.id, description: spec.description, status: "missing", tried: spec.urls });
      continue;
    }
    const { data: pub } = supa.storage.from(BUCKET).getPublicUrl(path);
    outcomes.push({
      id: spec.id,
      description: spec.description,
      status: "uploaded",
      source_url: dl.url,
      storage_path: `${BUCKET}/${path}`,
      public_url: pub.publicUrl,
      bytes: dl.buf.byteLength,
    });
    console.log(`  ✓ ${dl.buf.byteLength.toLocaleString()} bytes from ${dl.url}`);
    console.log(`    public: ${pub.publicUrl}`);
  }

  const registry = buildRegistryFile(outcomes);
  const target = resolve(process.cwd(), "lib/cdsco/forms-registry.ts");
  writeFileSync(target, registry);
  console.log(`\nwrote ${target}`);

  const ok = outcomes.filter((o) => o.status === "uploaded").length;
  const missing = outcomes.filter((o) => o.status === "missing").length;
  console.log(`\nsummary: ${ok} uploaded, ${missing} missing`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
