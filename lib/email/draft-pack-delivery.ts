// Draft Pack delivery email — Resend-ready template.
// Pure render-from-data: no Resend client wired yet (Feature 6a will).
//
// Usage:
//   const { subject, text, html } = renderDraftPackEmail({
//     name: "Asha",
//     product_name: "AcmeScan AI",
//     share_token: "abc123",
//   });

const TEAL_DEEP = "#0F6E56";
const AMBER = "#BA7517";
const BG_WARM = "#F7F6F2";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#6B6B6B";
const RULE = "#E2DFD7";

export type DraftPackEmailData = {
  name: string;
  product_name: string;
  share_token: string;
  /** Defaults to https://clearpath-medtech.vercel.app — override for local/staging. */
  base_url?: string;
  /** Optional Tier-3 Concierge price if the user wants to advertise it inline. */
  concierge_price_inr?: number;
  /** Optional flag: forms ZIP attached vs missing in v1. */
  forms_zip_available?: boolean;
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

export function renderDraftPackEmail(data: DraftPackEmailData): RenderedEmail {
  const baseUrl = data.base_url ?? "https://clearpath-medtech.vercel.app";
  const cardUrl = `${baseUrl}/c/${data.share_token}`;
  const conciergeNote =
    data.concierge_price_inr != null
      ? `Submission Concierge (₹${data.concierge_price_inr.toLocaleString("en-IN")} for 12 months)`
      : "Submission Concierge";

  const formsLine = data.forms_zip_available
    ? `- CDSCO_Forms.zip — blank forms (MD-5, MD-9, MD-12, MD-14, MD-20)`
    : `- CDSCO blank forms — link inside the guide (zip attachment coming in v2)`;

  const subject = `Your CDSCO Draft Pack for ${data.product_name} is ready`;

  const text = [
    `Hi ${data.name},`,
    ``,
    `Your Regulatory Draft Pack for ${data.product_name} is attached.`,
    ``,
    `Inside:`,
    `- ${data.product_name}_DraftPack.pdf — drafted content for each CDSCO submission section`,
    formsLine,
    `- SubmissionGuide.pdf — which form goes where`,
    ``,
    `What to do next:`,
    `1. Review the draft for accuracy — especially Clinical Context.`,
    `2. Paste drafted content into the relevant CDSCO form sections.`,
    `3. Consider ${conciergeNote} for expert review before filing.`,
    ``,
    `Your Readiness Card: ${cardUrl}`,
    ``,
    `Questions? Just reply to this email.`,
    ``,
    `— ClearPath team`,
    ``,
    `---`,
    `Disclaimer: ClearPath is a regulatory readiness tool, not legal advice.`,
    `Always consult a regulatory expert before submission.`,
  ].join("\n");

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
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${TEAL_DEEP};margin:0 0 12px 0;line-height:1.25;">
                  Your Draft Pack for ${escape(data.product_name)} is ready
                </h1>
                <p style="font-size:15px;line-height:1.55;margin:0 0 16px 0;">Hi ${escape(data.name)},</p>
                <p style="font-size:15px;line-height:1.55;margin:0 0 16px 0;">
                  Your Regulatory Draft Pack for <strong>${escape(data.product_name)}</strong> is attached.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <div style="border-left:3px solid ${AMBER};padding:12px 14px;background:${BG_WARM};font-size:14px;line-height:1.6;">
                  <strong style="display:block;margin-bottom:6px;">Inside</strong>
                  • ${escape(data.product_name)}_DraftPack.pdf — drafted content for each CDSCO submission section<br />
                  • ${data.forms_zip_available ? `CDSCO_Forms.zip — blank forms (MD-5, MD-9, MD-12, MD-14, MD-20)` : `CDSCO blank forms — link inside the guide (zip attachment coming in v2)`}<br />
                  • SubmissionGuide.pdf — which form goes where
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:${TEXT_DARK};margin:0 0 10px 0;">What to do next</h2>
                <ol style="font-size:15px;line-height:1.6;padding-left:20px;margin:0 0 16px 0;">
                  <li>Review the draft for accuracy — especially Clinical Context.</li>
                  <li>Paste drafted content into the relevant CDSCO form sections.</li>
                  <li>Consider ${escape(conciergeNote)} for expert review before filing.</li>
                </ol>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 24px 32px;">
                <a href="${escape(cardUrl)}" style="display:inline-block;background:${TEAL_DEEP};color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:6px;">Open your Readiness Card</a>
                <div style="font-size:12px;color:${TEXT_MUTED};margin-top:8px;word-break:break-all;">${escape(cardUrl)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;font-size:14px;line-height:1.55;">
                Questions? Just reply to this email.<br /><br />
                — ClearPath team
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px 32px;border-top:1px solid ${RULE};font-size:11px;line-height:1.5;color:${TEXT_MUTED};">
                ClearPath is a regulatory readiness tool, not legal advice. Always consult a regulatory expert before submission.
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
