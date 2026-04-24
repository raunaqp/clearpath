import type { ReactNode } from "react";
import WizardToastRoot from "@/components/wizard/WizardToastRoot";

/**
 * Layout boundary for /wizard/[id]/* routes. Mounts the toast
 * provider at the layout level so it survives step-to-step
 * navigation (optimistic save failures on Q1 can surface the toast
 * even after the user is already on Q2).
 */
export default function WizardLayout({ children }: { children: ReactNode }) {
  return <WizardToastRoot>{children}</WizardToastRoot>;
}
