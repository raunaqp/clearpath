import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ReportPreviewSection from "@/components/landing/ReportPreviewSection";
import PricingSection from "@/components/landing/PricingSection";
import MoatsSection from "@/components/landing/MoatsSection";
import FounderSection from "@/components/landing/FounderSection";
import FAQSection from "@/components/landing/FAQSection";
import GlobalVisionSection from "@/components/landing/GlobalVisionSection";
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
      <PricingSection />
      <MoatsSection />
      <FounderSection />
      <FAQSection />
      <GlobalVisionSection />
      <CTASection />
      <Footer />
    </main>
  );
}
