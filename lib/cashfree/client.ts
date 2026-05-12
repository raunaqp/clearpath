/**
 * Sprint 2 Story 2.8 — server-side Cashfree PG client.
 *
 * Sandbox base: https://sandbox.cashfree.com/pg
 * Production base: https://api.cashfree.com/pg
 *
 * Env contract:
 *   CASHFREE_APP_ID         client id (x-client-id header)
 *   CASHFREE_SECRET_KEY     client secret (x-client-secret header)
 *   CASHFREE_ENVIRONMENT    "TEST" (default) | "PROD"
 *   CASHFREE_API_VERSION    optional override; default "2025-01-01"
 *
 * No keys checked in. The factory returns null when keys aren't
 * configured so callers can fall back to the legacy UPI-QR flow
 * without surfacing a 500 to the customer.
 */
import { createHmac } from "crypto";

const SANDBOX_BASE = "https://sandbox.cashfree.com/pg";
const PROD_BASE = "https://api.cashfree.com/pg";
const DEFAULT_API_VERSION = "2025-01-01";

export type CashfreeEnv = "TEST" | "PROD";

export type CashfreeConfig = {
  appId: string;
  secretKey: string;
  environment: CashfreeEnv;
  apiVersion: string;
  baseUrl: string;
};

export type CreateOrderInput = {
  /** Our internal id sent as Cashfree's order_id. Echoed back on
   *  webhooks for reconciliation. Keep <= 50 chars per Cashfree. */
  orderId: string;
  amountInr: number;
  customer: {
    id: string;
    email: string;
    phone?: string;
  };
  returnUrl: string;
  notifyUrl?: string;
};

export type CashfreeOrderResponse = {
  cf_order_id?: number | string;
  order_id?: string;
  payment_session_id?: string;
  order_status?: string;
  order_currency?: string;
  order_amount?: number;
};

export function getCashfreeConfig(): CashfreeConfig | null {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) return null;
  const env = (process.env.CASHFREE_ENVIRONMENT ?? "TEST") as CashfreeEnv;
  const baseUrl = env === "PROD" ? PROD_BASE : SANDBOX_BASE;
  return {
    appId,
    secretKey,
    environment: env,
    apiVersion: process.env.CASHFREE_API_VERSION ?? DEFAULT_API_VERSION,
    baseUrl,
  };
}

export function isCashfreeConfigured(): boolean {
  return getCashfreeConfig() !== null;
}

/** Public hosted-checkout URL for a given payment_session_id. */
export function checkoutUrlFor(
  cfg: CashfreeConfig,
  paymentSessionId: string
): string {
  const host =
    cfg.environment === "PROD"
      ? "https://payments.cashfree.com"
      : "https://payments-test.cashfree.com";
  return `${host}/pg/orders/${encodeURIComponent(paymentSessionId)}`;
}

export async function createOrder(
  cfg: CashfreeConfig,
  input: CreateOrderInput
): Promise<{ ok: true; data: CashfreeOrderResponse } | { ok: false; error: string; status: number }> {
  const body = {
    order_id: input.orderId,
    order_amount: input.amountInr,
    order_currency: "INR",
    customer_details: {
      customer_id: input.customer.id,
      customer_email: input.customer.email,
      // Cashfree requires a phone. Fall back to a placeholder if not
      // captured; sandbox accepts +91 placeholders without verification.
      customer_phone: input.customer.phone ?? "+919999999999",
    },
    order_meta: {
      return_url: input.returnUrl,
      ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
    },
  };

  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl}/orders`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-client-id": cfg.appId,
        "x-client-secret": cfg.secretKey,
        "x-api-version": cfg.apiVersion,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    return {
      ok: false,
      error: `fetch_failed: ${err instanceof Error ? err.message : String(err)}`,
      status: 502,
    };
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const message =
      (json as { message?: string; code?: string })?.message ??
      `cashfree_http_${res.status}`;
    return { ok: false, error: message, status: res.status };
  }

  return { ok: true, data: (json as CashfreeOrderResponse) ?? {} };
}

/**
 * Verify Cashfree's webhook signature.
 *
 * Header `x-webhook-signature` is base64(HMAC-SHA256(
 *   `x-webhook-timestamp` + raw-body,
 *   secret_key
 * )).
 *
 * Returns true on match.
 */
export function verifyWebhookSignature(args: {
  rawBody: string;
  timestamp: string;
  signature: string;
  secretKey: string;
}): boolean {
  if (!args.signature || !args.timestamp) return false;
  const expected = createHmac("sha256", args.secretKey)
    .update(args.timestamp + args.rawBody)
    .digest("base64");
  return safeEqualBase64(expected, args.signature);
}

function safeEqualBase64(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
