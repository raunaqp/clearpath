// Sprint 3 Phase 1.6 — Tier 1 Regulatory Readiness Report delivery email.
// Resend-ready template, parallel to draft-pack-delivery.ts.
//
// Positioning: this email accompanies the ₹499 Regulatory Readiness Report
// PDF. Tone matches the report itself — decision-support, founder-friendly,
// not consultant-grade submission content. Names the upgrade path to the
// Submission Workspace without manipulating the customer.

const TEAL_DEEP = "#0F6E56";
const AMBER = "#BA7517";
const BG_WARM = "#F7F6F2";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#6B6B6B";
const RULE = "#E2DFD7";

export type ReadinessReportEmailData = {
  name: string;
  product_name: string;
  share_token: string;
  /** Signed Storage URL — must be set; the email surfaces a Download button. */
  pdf_url: string;
  /** Assessment ID — links to /upgrade/[id] for the Workspace upsell. */
  assessment_id: string;
  /** Defaults to production host; override for local/staging. */
  base_url?: string;
  /** When true, prepends the Resend disclosure banner used during launch. */
  include_resend_banner?: boolean;
};

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const RESEND_BANNER_TEXT =
  "This email is sent via Resend (onboarding@resend.dev) on behalf of ClearPath. We're moving to a clearpath.in address shortly. Reply directly to raunaq.pradhan@gmail.com if anything is unclear.";

export function renderReadinessReportEmail(
  data: ReadinessReportEmailData
): RenderedEmail {
  const baseUrl = data.base_url ?? "https://clearpath-medtech.vercel.app";
  const cardUrl = `${baseUrl}/c/${data.share_token}`;
  const workspaceUrl = `${baseUrl}/upgrade/${data.assessment_id}`;

  const subject = `Your Regulatory Readiness Report for ${data.product_name} is ready`;
  const banner = data.include_resend_banner ? RESEND_BANNER_TEXT : null;

  const text = [
    banner ? banner + "\n" : null,
    `Hi ${data.name},`,
    ``,
    `Your Regulatory Readiness Report for ${data.product_name} is ready.`,
    `Download: ${data.pdf_url}`,
    `(Link valid for 90 days — save the PDF locally too.)`,
    ``,
    `What's inside`,
    `- Regulatory Scorecard — your likely class, pathway, timeline, cost band, readiness score.`,
    `- Likely Regulatory Pathway — why this class applies, which forms, the step sequence.`,
    `- Readiness Gap Analysis — prioritised gaps, why each matters, suggested next steps, effort estimates.`,
    `- Timeline + Cost Estimator — phased roadmap with realistic Indian-startup ranges.`,
    `- Reviewer Insights — what CDSCO reviewers will likely look for in your submission.`,
    `- Smart Examples — annotated good-vs-bad wording snippets to avoid common mistakes.`,
    ``,
    `What this report is — and isn't`,
    `It explains what's required, why it matters, where the gaps are, and what to do next.`,
    `It does not generate MD-7 drafts, DMFs, QMS docs, or submission-ready artifacts —`,
    `those live in the Submission Workspace (₹2,499) when you're ready to execute.`,
    ``,
    `Open the Submission Workspace: ${workspaceUrl}`,
    `Your Readiness Card:         ${cardUrl}`,
    ``,
    `Questions? Reply to this email or write to raunaq.pradhan@gmail.com.`,
    ``,
    `— ClearPath team`,
    ``,
    `---`,
    `Disclaimer: ClearPath is a regulatory readiness tool, not legal advice.`,
    `Always consult a qualified regulatory professional before any CDSCO submission.`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const bannerHtml = banner
    ? `<tr>
              <td style="padding:16px 32px 0 32px;">
                <div style="border-left:3px solid ${AMBER};padding:10px 14px;background:#FFF7E6;font-size:12px;color:${TEXT_DARK};line-height:1.5;">
                  ${escape(banner)}
                </div>
              </td>
            </tr>`
    : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escape(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BG_WARM};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${TEXT_DARK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_WARM};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid ${RULE};border-radius:8px;max-width:560px;width:100%;">
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:${TEAL_DEEP};letter-spacing:1.5px;">CLEARPATH</div>
                <div style="font-size:11px;color:${TEXT_MUTED};letter-spacing:0.6px;margin-top:2px;">REGULATORY READINESS · INDIA</div>
              </td>
            </tr>
            ${bannerHtml}
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${TEAL_DEEP};margin:0 0 12px 0;line-height:1.25;">
                  Your Regulatory Readiness Report for ${escape(data.product_name)} is ready
                </h1>
                <p style="font-size:15px;line-height:1.55;margin:0 0 16px 0;">Hi ${escape(data.name)},</p>
                <p style="font-size:15px;line-height:1.55;margin:0 0 16px 0;">
                  Your founder-facing Regulatory Readiness Report for <strong>${escape(data.product_name)}</strong> is ready to download.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0 32px;">
                <a href="${escape(data.pdf_url)}" style="display:inline-block;background:${TEAL_DEEP};color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:6px;">Download the Report →</a>
                <div style="font-size:11px;color:${TEXT_MUTED};margin-top:6px;">Link valid for 90 days. Bookmark or save the PDF locally.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 0 32px;">
                <div style="border-left:3px solid ${AMBER};padding:12px 14px;background:${BG_WARM};font-size:14px;line-height:1.6;">
                  <strong style="display:block;margin-bottom:6px;">What's inside</strong>
                  • Regulatory Scorecard — likely class, pathway, timeline, cost band, readiness score.<br />
                  • Likely Regulatory Pathway — why this class applies, forms, step sequence.<br />
                  • Readiness Gap Analysis — prioritised gaps, why each matters, effort estimates.<br />
                  • Timeline + Cost Estimator — phased roadmap, realistic Indian-startup ranges.<br />
                  • Reviewer Insights — what CDSCO reviewers typically look for.<br />
                  • Smart Examples — annotated good-vs-bad wording snippets.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 0 32px;">
                <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:${TEXT_DARK};margin:0 0 10px 0;">What this report is — and isn't</h2>
                <p style="font-size:14px;line-height:1.6;margin:0;">
                  It explains what's required, why it matters, where the gaps are, and what to do next. It does not generate MD-7 drafts, DMFs, QMS docs, or submission-ready artifacts — those live in the Submission Workspace (₹2,499) when you're ready to execute.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 8px 32px;">
                <a href="${escape(workspaceUrl)}" style="display:inline-block;background:transparent;color:${TEAL_DEEP};text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border:1px solid ${TEAL_DEEP};border-radius:6px;margin-right:8px;">Open Submission Workspace</a>
                <a href="${escape(cardUrl)}" style="display:inline-block;background:transparent;color:${TEXT_MUTED};text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border:1px solid ${RULE};border-radius:6px;">View Readiness Card</a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px 32px;font-size:14px;line-height:1.55;">
                Questions? Reply to this email or write to raunaq.pradhan@gmail.com.<br /><br />
                — ClearPath team
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px 32px;border-top:1px solid ${RULE};font-size:11px;line-height:1.5;color:${TEXT_MUTED};">
                ClearPath is a regulatory readiness tool, not legal advice. Always consult a qualified regulatory professional before any CDSCO submission.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
