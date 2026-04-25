import AnalysingLoader from "@/components/AnalysingLoader";
import { GlobalHeader } from "@/components/layout/GlobalHeader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader />
      <AnalysingLoader />
    </div>
  );
}
