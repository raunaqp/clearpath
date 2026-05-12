/**
 * Sprint 2 Story 2.5 Phase 6 — PDF v2 generator.
 *
 * Approach: spin up Chrome via puppeteer-core + @sparticuz/chromium,
 * navigate to the same /draft/[id]?print=1 route the browser uses (so
 * HTML and PDF share a single rendering source of truth), capture as
 * PDF, return the Buffer.
 *
 * Auth: Chrome inside this Vercel function presents an internal token
 * in headers; the /draft/[id] page bypasses normal user-auth when that
 * token matches process.env.INTERNAL_PRINT_TOKEN. The caller of this
 * function MUST have already verified the user is authorized; this
 * generator does not re-check.
 */
import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export type RenderPdfArgs = {
  assessmentId: string;
  /** Public base URL, e.g. "https://clearpath.vercel.app". No trailing slash. */
  baseUrl: string;
};

export type RenderPdfResult = {
  pdf: Uint8Array;
  durationMs: number;
};

const PRINT_TIMEOUT_MS = 60_000;

/** Resolve a Chrome executable path. Three paths:
 *
 *  1. LOCAL_CHROME_PATH — for local dev (point at your system Chrome,
 *     keeps cold starts under a second).
 *  2. CHROMIUM_PACK_URL — remote Brotli-packed chromium archive, the
 *     approach @sparticuz/chromium's README recommends for Vercel. The
 *     binary lives in `node_modules/@sparticuz/chromium/bin/` but
 *     Vercel's output tracing on Next 16/Turbopack does NOT reliably
 *     include it even with outputFileTracingIncludes. Passing a remote
 *     URL bypasses bundling entirely; @sparticuz downloads + extracts
 *     to /tmp on first call, caches for the lifetime of the function
 *     instance.
 *  3. Fallback to bundled bin/ (will fail on Vercel until tracing is
 *     fixed; works locally because node_modules is present).
 */
async function resolveExecutablePath(): Promise<string> {
  const local = process.env.LOCAL_CHROME_PATH;
  if (local && local.trim().length > 0) {
    console.log("[draft-pack-pdf-v2] using LOCAL_CHROME_PATH");
    return local;
  }

  const packUrl = process.env.CHROMIUM_PACK_URL;
  if (packUrl && packUrl.trim().length > 0) {
    console.log(
      "[draft-pack-pdf-v2] using CHROMIUM_PACK_URL:",
      packUrl.slice(0, 80) + (packUrl.length > 80 ? "…" : "")
    );
    return chromium.executablePath(packUrl);
  }

  // Last resort — only works if @sparticuz/chromium's bin/ was traced
  // into the function bundle. Vercel runtime says
  // "/var/task/node_modules/@sparticuz/chromium/bin does not exist"
  // when this path is hit there. If you see that error, the
  // CHROMIUM_PACK_URL env var is not present in the function runtime.
  console.warn(
    "[draft-pack-pdf-v2] no CHROMIUM_PACK_URL — falling back to bundled bin/ which doesn't exist on Vercel"
  );
  return chromium.executablePath();
}

export async function renderDraftPackPdfV2(
  args: RenderPdfArgs
): Promise<RenderPdfResult> {
  const internalToken = process.env.INTERNAL_PRINT_TOKEN;
  if (!internalToken) {
    throw new Error(
      "INTERNAL_PRINT_TOKEN env var is not set; refusing to render PDF without the auth bypass token."
    );
  }

  const url = `${args.baseUrl}/draft/${encodeURIComponent(args.assessmentId)}?print=1`;
  const startedAt = Date.now();
  let browser: Browser | null = null;
  try {
    const executablePath = await resolveExecutablePath();
    // On Vercel (Linux serverless) we want @sparticuz/chromium's tuned
    // args. Locally on macOS those args break the launch (--single-process
    // + various Lambda-specific flags). Use them only when no local Chrome
    // override is set.
    const useSparticuzArgs = !process.env.LOCAL_CHROME_PATH;
    browser = await puppeteer.launch({
      args: useSparticuzArgs ? chromium.args : [],
      // A4 at 96 DPI ≈ 794×1123 px. Match viewport so Chrome doesn't
      // shrink-to-fit during PDF render, which would suppress explicit
      // page-break-before rules.
      defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 1 },
      executablePath,
      headless: true,
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(PRINT_TIMEOUT_MS);
    page.setDefaultTimeout(PRINT_TIMEOUT_MS);
    // x-vercel-protection-bypass — when Vercel Deployment Protection
    // is on (preview deploys), this header lets the function's own
    // self-call past the SSO gate. Production deploys aren't protected
    // so the header is harmless if missing.
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    const reqHeaders: Record<string, string> = {
      "x-internal-print-token": internalToken,
    };
    if (bypassSecret && bypassSecret.trim().length > 0) {
      reqHeaders["x-vercel-protection-bypass"] = bypassSecret;
      reqHeaders["x-vercel-set-bypass-cookie"] = "true";
    }
    await page.setExtraHTTPHeaders(reqHeaders);
    // 'load' rather than 'networkidle0' — the dev HMR WebSocket keeps
    // network activity alive forever, and our printable page has no
    // post-load XHR/streaming. Use 'load' for predictable settle time.
    await page.goto(url, {
      waitUntil: "load",
      timeout: PRINT_TIMEOUT_MS,
    });
    // Belt-and-suspenders: emulate print media in case the route forgot
    // to apply the .draft-section--print class.
    await page.emulateMediaType("print");
    // Tiny settle window for any post-load fonts/CSS to apply.
    await new Promise((r) => setTimeout(r, 250));
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
      displayHeaderFooter: true,
      headerTemplate:
        '<div style="font-size:8px;color:#6B766F;font-family:Inter,system-ui,sans-serif;width:100%;padding:0 16mm;display:flex;justify-content:space-between;"><span>ClearPath · Draft Pack v2</span><span class="date"></span></div>',
      footerTemplate:
        '<div style="font-size:8px;color:#6B766F;font-family:Inter,system-ui,sans-serif;width:100%;padding:0 16mm;display:flex;justify-content:space-between;"><span>INTERNAL DRAFT — pending consultant review</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    });
    return { pdf, durationMs: Date.now() - startedAt };
  } finally {
    if (browser) await browser.close();
  }
}

/** Determine the public base URL for the current Vercel deployment.
 *  Preview and development deployments self-reference (VERCEL_URL) so
 *  the PDF generator captures the SAME code + data that the customer
 *  is looking at on this preview, not a different version on prod.
 *  Production prefers the stable alias so signed PDFs remain
 *  reproducible across deployments.
 */
export function resolveBaseUrl(): string {
  const env = process.env.VERCEL_ENV; // 'production' | 'preview' | 'development' | undefined

  if (env && env !== "production") {
    const vercel = process.env.VERCEL_URL;
    if (vercel && vercel.trim().length > 0) {
      return `https://${vercel.replace(/\/+$/, "")}`;
    }
  }

  // Production (or unknown env outside Vercel): prefer the durable alias
  // so a PDF rendered today and opened weeks later still resolves.
  const override = process.env.NEXT_PUBLIC_SITE_URL;
  if (override && override.trim().length > 0) {
    return override.replace(/\/+$/, "");
  }

  const vercel = process.env.VERCEL_URL;
  if (vercel && vercel.trim().length > 0) {
    return `https://${vercel.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}
