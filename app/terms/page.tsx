import { GlobalHeader } from "@/components/layout/GlobalHeader";

export const metadata = {
  title: "Terms of Use · ClearPath",
};

const LAST_UPDATED = "2026-05-12";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <GlobalHeader />
      <main className="px-4 sm:px-6 lg:px-10 pt-8 pb-24">
        <div className="max-w-[760px] mx-auto">
          <div className="mb-6 rounded-lg bg-[#FAEEDA] border border-[#BA7517]/40 px-4 py-3">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#BA7517] mb-1">
              Draft · pending legal review
            </p>
            <p className="text-sm text-[#633806] leading-relaxed">
              These terms are provisional and have not yet been reviewed by
              counsel. We&apos;ll publish the final version in our next
              release. For questions in the meantime contact{" "}
              <a
                href="mailto:raunaq.pradhan@gmail.com"
                className="underline underline-offset-2"
              >
                raunaq.pradhan@gmail.com
              </a>
              .
            </p>
          </div>

          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517]">
            Legal
          </p>
          <h1 className="font-serif text-4xl text-[#0E1411] mt-2 leading-tight">
            Terms of Use
          </h1>
          <p className="text-sm text-[#6B766F] mt-3">
            Last updated: {LAST_UPDATED}
          </p>

          <section className="mt-10 space-y-6 text-[#2A3430] leading-relaxed">
            <Clause title="1. About these terms">
              These Terms of Use govern your access to and use of ClearPath
              (the &ldquo;Service&rdquo;), operated by{" "}
              <em>ClearPath Medtech (India) Private Limited</em> (the
              &ldquo;Company&rdquo;). By creating an account or using the
              Service, you agree to these Terms.
            </Clause>

            <Clause title="2. What ClearPath does">
              ClearPath is a software tool that helps Indian medical-device
              manufacturers prepare draft CDSCO submission content using AI
              generation and structured questionnaires. The output is a{" "}
              <em>Draft Pack</em> — narrative content for each section of an
              MD-7 / MD-3 application. ClearPath is not a substitute for a
              qualified regulatory consultant or for legal counsel.{" "}
              <strong>
                No content produced by the Service is a regulatory filing, a
                regulatory opinion, or legal advice.
              </strong>{" "}
              You are responsible for reviewing all output before any external
              use.
            </Clause>

            <Clause title="3. Accounts and eligibility">
              You must be at least 18 years old and authorised to act on
              behalf of the medical-device manufacturer whose product you
              describe in the Service. You are responsible for keeping your
              account credentials confidential and for all activity under your
              account.
            </Clause>

            <Clause title="4. Acceptable use">
              You agree not to:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  upload information you do not have the right to share
                  (third-party trade secrets, PII of other parties, etc.);
                </li>
                <li>
                  reverse-engineer, scrape, or otherwise extract the AI models
                  or prompt templates;
                </li>
                <li>
                  use the Service to prepare submissions for products you do
                  not represent;
                </li>
                <li>
                  attempt to bypass authentication, rate limits, or payment
                  flows;
                </li>
                <li>
                  use the Service in any way that violates Indian medical-
                  device regulations or applicable export-control laws.
                </li>
              </ul>
            </Clause>

            <Clause title="5. Payments and refunds">
              Tier 1 (Regulatory Readiness Report) is charged at ₹499 per
              assessment. Tier 2 (Submission Workspace) is charged at ₹2,499
              per assessment. Both are paid via UPI / card payments through
              Cashfree. Tier 3 (Human Concierge) is a separate service with
              its own pricing. We may revise pricing at any time; changes
              apply only to new orders. Refunds are at the Company&apos;s
              discretion:{" "}
              <strong>
                refund requests are honoured if made within 24 hours of
                payment and before delivery of the Report or Workspace
              </strong>
              . Once delivered, the Report or Workspace is non-refundable
              because the AI generation cost has already been incurred.
            </Clause>

            <Clause title="6. Intellectual property">
              You retain ownership of any content you upload (uploaded
              documents, wizard answers, customer-authored edits). The
              Company retains all rights to the Service software, the
              underlying AI prompt templates, the rendered Draft Pack
              templates, and aggregated analytics. You grant the Company a
              non-exclusive licence to process your inputs to deliver the
              Service and (in anonymised, aggregated form) to improve it.
            </Clause>

            <Clause title="7. Regulatory disclaimer">
              ClearPath helps you draft content. It does not file your
              application, does not represent you before CDSCO, and is not a
              notified body, certification body, or authorised regulatory
              representative. Filing decisions, factual accuracy of inputs,
              and compliance with the Medical Devices Rules 2017 (and any
              successor or supplementary regulations) are your sole
              responsibility.
            </Clause>

            <Clause title="8. Limitation of liability">
              To the maximum extent permitted by law, the Company&apos;s
              aggregate liability for any claim arising out of or related to
              the Service is limited to the fees you have paid in the twelve
              months preceding the event giving rise to the claim. The
              Company is not liable for indirect, incidental, or
              consequential damages, including but not limited to regulatory
              delay, lost business opportunity, or reputational harm.
            </Clause>

            <Clause title="9. Termination">
              You may stop using the Service at any time. The Company may
              suspend or terminate your account for breach of these Terms,
              fraudulent activity, or sustained abusive behaviour. On
              termination, you lose access to the Service; the Company will
              retain your data per the Privacy Policy.
            </Clause>

            <Clause title="10. Changes to these terms">
              We may update these Terms from time to time. Material changes
              will be communicated by email to the address associated with
              your account, with at least 14 days&apos; notice. Continued use
              after the effective date constitutes acceptance.
            </Clause>

            <Clause title="11. Governing law and jurisdiction">
              These Terms are governed by the laws of India. Any dispute
              arising out of or in connection with these Terms is subject to
              the exclusive jurisdiction of the courts at{" "}
              <em>Bengaluru, Karnataka</em>.
            </Clause>

            <Clause title="12. Contact">
              For questions about these Terms, write to{" "}
              <a
                href="mailto:raunaq.pradhan@gmail.com"
                className="text-[#0F6E56] underline underline-offset-2 hover:text-[#0a5a47]"
              >
                raunaq.pradhan@gmail.com
              </a>
              .
            </Clause>
          </section>

          <p className="mt-12 text-xs text-[#6B766F]">
            See also:{" "}
            <a href="/privacy" className="text-[#0F6E56] underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

function Clause({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl text-[#0E1411] mb-2">{title}</h2>
      <div className="text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}
