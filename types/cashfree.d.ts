// Ambient types for @cashfreepayments/cashfree-js. The package
// ships untyped (main: dist/script.js, no .d.ts). We hand-type the
// minimal API we actually use: load() + cashfree.checkout().
declare module "@cashfreepayments/cashfree-js" {
  export type CashfreeMode = "sandbox" | "production";

  export type CheckoutOptions = {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_top" | "_parent" | "_modal";
    returnUrl?: string;
  };

  export type CashfreeInstance = {
    checkout: (options: CheckoutOptions) => Promise<unknown>;
  };

  export function load(opts: {
    mode: CashfreeMode;
  }): Promise<CashfreeInstance>;
}
