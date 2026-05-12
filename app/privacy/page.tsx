import { GlobalHeader } from "@/components/layout/GlobalHeader";

export const metadata = {
  title: "Privacy Policy · ClearPath",
};

const LAST_UPDATED = "2026-05-12";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <GlobalHeader />
      <main className="px-4 sm:px-6 lg:px-10 pt-8 pb-24">
        <div className="max-w-[760px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517]">
            Legal
          </p>
          <h1 className="font-serif text-4xl text-[#0E1411] mt-2 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#6B766F] mt-3">
            Last updated: {LAST_UPDATED}
          </p>

          <section className="mt-10 space-y-6 text-[#2A3430] leading-relaxed">
            <Clause title="1. Who we are">
              ClearPath is operated by{" "}
              <em>ClearPath Medtech (India) Private Limited</em> (the
              &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). This
              policy explains what personal information we collect, how we
              use it, and the rights you have over it. It applies to
              everything you do on the Service.
            </Clause>

            <Clause title="2. What we collect">
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  <strong>Account data</strong> — name, email, organisation,
                  authentication credentials managed by our auth provider
                  (Supabase Auth).
                </li>
                <li>
                  <strong>Product data you provide</strong> — your device
                  one-liner, wizard answers, uploaded documents (pitch decks,
                  datasheets, test reports, etc.).
                </li>
                <li>
                  <strong>Generated content</strong> — the AI-generated Draft
                  Pack sections, your inline edits, NEEDS INPUT field
                  responses, and any per-section attachments you upload.
                </li>
                <li>
                  <strong>Payment metadata</strong> — UPI transaction IDs and
                  screenshots you upload to verify payment. We do not store
                  card or bank credentials; payment processors (Cashfree once
                  enabled) handle those directly.
                </li>
                <li>
                  <strong>Usage telemetry</strong> — page views, feature use,
                  errors. We use PostHog (product analytics) and Vercel
                  Analytics for this.
                </li>
              </ul>
            </Clause>

            <Clause title="3. How we use it">
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  to deliver the Service — generate your Draft Pack, send you
                  the result, support your account;
                </li>
                <li>
                  to operate AI generation — your inputs are sent to
                  Anthropic&apos;s Claude API. Anthropic processes the input
                  on a zero-retention basis (no training on customer data per
                  their commercial agreement);
                </li>
                <li>
                  to comply with legal obligations (tax, KYC for high-value
                  transactions);
                </li>
                <li>
                  in anonymised, aggregated form, to improve product quality
                  and Service reliability.
                </li>
              </ul>
            </Clause>

            <Clause title="4. Who we share it with">
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  <strong>Anthropic</strong> — sends Draft Pack inputs to
                  Claude for generation. Subject to Anthropic&apos;s
                  zero-retention commercial terms.
                </li>
                <li>
                  <strong>Supabase</strong> — our database and storage
                  provider (servers in Mumbai, ap-south-1).
                </li>
                <li>
                  <strong>Vercel</strong> — our hosting / serverless
                  function provider.
                </li>
                <li>
                  <strong>Cashfree</strong> — once one-click payment is
                  enabled, payment processing.
                </li>
                <li>
                  <strong>PostHog</strong> — product analytics.
                </li>
                <li>
                  <strong>Government authorities</strong> — only when
                  compelled by a valid legal process under Indian law.
                </li>
              </ul>
              <p className="mt-2">
                <strong>We do not sell your data.</strong> We do not share
                your product data with other manufacturers, regulatory
                consultants, or marketers.
              </p>
            </Clause>

            <Clause title="5. Data location and security">
              Customer data sits in our Supabase project in the
              <em> Mumbai (ap-south-1)</em> region. Backups are encrypted at
              rest. Access to production systems is limited to authorised
              Company personnel. We use HTTPS / TLS for all network traffic.
            </Clause>

            <Clause title="6. Retention">
              We retain account data for as long as your account is active,
              plus 90 days after deletion to handle support and refund
              requests. Aggregate analytics are retained indefinitely in
              anonymised form. You can request earlier deletion (see &ldquo;Your
              rights&rdquo; below).
            </Clause>

            <Clause title="7. Your rights">
              You can:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  access the personal data we hold about you (email
                  privacy@clearpath-medtech.com with the request);
                </li>
                <li>request correction of inaccurate data;</li>
                <li>
                  request deletion of your account and associated data
                  (subject to the 90-day retention window for ongoing
                  obligations);
                </li>
                <li>
                  withdraw consent for analytics tracking via your browser
                  controls.
                </li>
              </ul>
            </Clause>

            <Clause title="8. Regulatory submissions and confidentiality">
              The Draft Pack content you generate is treated as confidential
              business information. Internal access is limited to the
              minimum necessary — typically only the engineering team running
              the platform. We do not review the content of your generated
              packs as a matter of course; we only access individual records
              when you raise a support request or when we are required to by
              law.
            </Clause>

            <Clause title="9. Children">
              The Service is not intended for individuals under 18. We do
              not knowingly collect data from anyone under 18.
            </Clause>

            <Clause title="10. International transfers">
              Most data stays in India (Supabase ap-south-1). Anthropic AI
              processing happens on Anthropic&apos;s infrastructure (US-based
              regions). Vercel hosting may include US infrastructure for
              static assets. All cross-border transfers operate under
              standard contractual protections per applicable Indian data-
              protection law.
            </Clause>

            <Clause title="11. Changes to this policy">
              We may update this policy over time. Material changes will be
              communicated by email to your account address with at least
              14 days&apos; notice.
            </Clause>

            <Clause title="12. Contact">
              For privacy questions, write to{" "}
              <a
                href="mailto:privacy@clearpath-medtech.com"
                className="text-[#0F6E56] underline underline-offset-2 hover:text-[#0a5a47]"
              >
                privacy@clearpath-medtech.com
              </a>
              .
            </Clause>
          </section>

          <p className="mt-12 text-xs text-[#6B766F]">
            See also:{" "}
            <a href="/terms" className="text-[#0F6E56] underline">
              Terms of Use
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
