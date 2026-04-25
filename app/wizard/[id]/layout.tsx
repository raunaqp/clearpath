import type { ReactNode } from "react";
import WizardToastRoot from "@/components/wizard/WizardToastRoot";
import { GlobalHeader } from "@/components/layout/GlobalHeader";

/**
 * Layout boundary for /wizard/[id]/* routes. Hosts:
 * - the global sticky header (shared with /q/[n] and /conflict)
 * - the toast provider, mounted at this level so optimistic-save
 *   failures from Q1 can still surface a toast on Q2
 */
export default function WizardLayout({ children }: { children: ReactNode }) {
  return (
    <WizardToastRoot>
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
        <GlobalHeader />
        {children}
      </div>
    </WizardToastRoot>
  );
}
