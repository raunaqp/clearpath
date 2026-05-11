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

/** Resolve a Chrome executable path. In production (Vercel function) we
 *  use @sparticuz/chromium. In local dev we prefer LOCAL_CHROME_PATH
 *  (set to your local Chrome / Chromium) so devs don't have to wait for
 *  the chromium download on every cold start. */
async function resolveExecutablePath(): Promise<string> {
  const local = process.env.LOCAL_CHROME_PATH;
  if (local && local.trim().length > 0) return local;
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
    await page.setExtraHTTPHeaders({
      "x-internal-print-token": internalToken,
    });
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
 *  Order of precedence:
 *    1. NEXT_PUBLIC_SITE_URL  (override for custom domains)
 *    2. VERCEL_URL            (auto-set by Vercel, no protocol)
 *    3. http://localhost:3000 (local dev fallback)
 */
export function resolveBaseUrl(): string {
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
