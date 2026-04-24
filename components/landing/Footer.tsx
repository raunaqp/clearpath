import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#EFECE3] border-t border-[#D9D5C8] py-10">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8">
        {/* Row 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <p className="font-serif text-[16px] text-[#0E1411]">
            ClearPath — Clarity · Draft · Submission
          </p>
          <nav className="flex gap-5 text-[13px] text-[#6B766F]">
            <Link href="/privacy" className="hover:text-[#0E1411] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#0E1411] transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-[#0E1411] transition-colors">
              About
            </Link>
            <a
              href="mailto:founder@clearpath.in"
              className="hover:text-[#0E1411] transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Row 2: Disclaimer */}
        <p className="text-[12px] text-[#6B766F] leading-relaxed max-w-3xl mb-6">
          ClearPath is a regulatory readiness tool, not legal or regulatory
          advice. Outputs are estimates based on published CDSCO, ABDM, NABH,
          ICMR, and DPDP rules. Final classification and licensing decisions
          rest with the relevant regulator. Always consult a qualified
          regulatory expert before submission.
        </p>

        {/* Row 3: Copyright */}
        <p className="text-[11px] text-[#6B766F] text-center">
          © 2026 ClearPath. Made in India.
        </p>
      </div>
    </footer>
  );
}
