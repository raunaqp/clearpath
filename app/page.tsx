import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ReportPreviewSection from "@/components/landing/ReportPreviewSection";
import MoatsSection from "@/components/landing/MoatsSection";
import FounderSection from "@/components/landing/FounderSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="bg-[#F7F6F2] min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <ReportPreviewSection />
      <MoatsSection />
      <FounderSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
