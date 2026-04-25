"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminOrder = {
  id: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  amount_inr: number;
  payment_screenshot_url: string | null;
  transaction_id: string | null;
  email_sent_to: string | null;
  assessment_id: string;
  draft_pack_pdf_url: string | null;
  verified_at: string | null;
  delivered_at: string | null;
};

const STUCK_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes
const STUCK_REFRESH_MS = 30 * 1000;

function isStuckGenerating(order: AdminOrder, now: number | null): boolean {
  if (now === null) return false;
  if (order.status !== "generating") return false;
  const ts = order.updated_at ?? order.verified_at ?? order.created_at;
  if (!ts) return false;
  const age = now - new Date(ts).getTime();
  return age >= STUCK_THRESHOLD_MS;
}

function buildCliCommand(orderId: string): string {
  return `npm run generate-draft-pack -- --order-id ${orderId}`;
}

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
  pending_verification: { bg: "#FAEEDA", fg: "#BA7517" },
  verified: { bg: "#E1F5EE", fg: "#0F6E56" },
  generating: { bg: "#E1F5EE", fg: "#0F6E56" },
  delivered: { bg: "#EAF3DE", fg: "#3B6D11" },
  failed: { bg: "#FAECE7", fg: "#993C1D" },
};

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function OrdersTable({
  orders,
  tokenMap,
}: {
  orders: AdminOrder[];
  tokenMap: Record<string, string | null>;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [timeoutOrderId, setTimeoutOrderId] = useState<string | null>(null);
  const [cliCommand, setCliCommand] = useState<string | null>(null);
  // Computed only on the client to avoid SSR/hydration time mismatch.
  // Refreshes periodically so a row that just crossed the 3-min threshold
  // flips to its stuck state without a full page reload.
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    const initial = window.setTimeout(() => setNowMs(Date.now()), 0);
    const interval = window.setInterval(
      () => setNowMs(Date.now()),
      STUCK_REFRESH_MS
    );
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  function clearBanners() {
    setError(null);
    setSuccessNote(null);
    setTimeoutOrderId(null);
  }

  async function handleVerify(orderId: string) {
    setBusyId(orderId);
    clearBanners();
    try {
      const res = await fetch("/api/admin/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Verification failed.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleGenerate(orderId: string) {
    setBusyId(orderId);
    setGeneratingId(orderId);
    clearBanners();
    try {
      const res = await fetch("/api/admin/generate-draft-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      // Vercel function-timeout edge cases surface as 504 here. Treat them
      // as a distinct, recoverable state — not a generic error.
      if (res.status === 504) {
        setTimeoutOrderId(orderId);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        step?: string;
        page_count?: number;
        email_sent?: boolean;
        email_recipient?: string;
      };
      if (!res.ok || !body.ok) {
        const stepNote = body.step ? ` (step: ${body.step})` : "";
        throw new Error(`${body.error ?? "Generation failed."}${stepNote}`);
      }
      const emailLine = body.email_sent
        ? `Emailed to ${body.email_recipient ?? "founder"}.`
        : "Email skipped — send manually.";
      setSuccessNote(
        `Draft Pack delivered (${body.page_count ?? "?"} pages). ${emailLine}`
      );
      router.refresh();
    } catch (e) {
      // TypeError from fetch usually means the connection was killed —
      // most likely Vercel's 60s ceiling on Hobby. Same recovery UX.
      if (e instanceof TypeError) {
        setTimeoutOrderId(orderId);
      } else {
        setError(e instanceof Error ? e.message : "Generation failed.");
      }
    } finally {
      setBusyId(null);
      setGeneratingId(null);
    }
  }

  async function handleResetStuck(orderId: string) {
    setBusyId(orderId);
    clearBanners();
    try {
      const res = await fetch("/api/admin/reset-stuck-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Reset failed.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed.");
    } finally {
      setBusyId(null);
    }
  }

  function showCliCommand(orderId: string) {
    setCliCommand(buildCliCommand(orderId));
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-[#D9D5C8] p-8 text-center text-sm text-[#6B766F]">
        No orders match this filter.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="rounded-lg bg-[#FAECE7] border border-[#993C1D]/30 px-3 py-2 text-sm text-[#993C1D] mb-4">
          {error}
        </div>
      )}
      {successNote && (
        <div className="rounded-lg bg-[#EAF3DE] border border-[#3B6D11]/30 px-3 py-2 text-sm text-[#3B6D11] mb-4">
          {successNote}
        </div>
      )}
      {generatingId && (
        <div className="rounded-lg bg-[#E1F5EE] border border-[#0F6E56]/30 px-3 py-2 text-sm text-[#0F6E56] mb-4 flex items-center gap-2">
          <span
            aria-hidden
            className="w-3 h-3 rounded-full border-2 border-[#0F6E56]/30 border-t-[#0F6E56] animate-spin"
          />
          Generating Draft Pack — this takes 30–60 seconds. Don&apos;t navigate
          away.
        </div>
      )}
      {timeoutOrderId && (
        <div className="rounded-lg bg-[#FAEEDA] border border-[#BA7517]/40 px-3 py-3 text-sm text-[#0E1411] mb-4">
          <p className="font-medium text-[#BA7517] mb-1">
            Generation took longer than 60 seconds.
          </p>
          <p className="text-[#6B766F] mb-3">
            This sometimes happens (Vercel Hobby plan caps functions at 60s).
            The order is stuck in <code className="font-mono">generating</code>;
            wait ~3 minutes for the in-flight request to settle, then
            recover the row. Or jump straight to the CLI:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => showCliCommand(timeoutOrderId)}
              className="inline-flex items-center justify-center rounded-full border border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white text-xs font-medium px-3 py-1.5 transition-colors"
            >
              Run via terminal →
            </button>
            <button
              type="button"
              onClick={() => setTimeoutOrderId(null)}
              className="inline-flex items-center justify-center rounded-full text-[#6B766F] hover:text-[#0E1411] text-xs font-medium px-3 py-1.5 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-white border border-[#D9D5C8]">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F6F2]">
            <tr>
              <Th>Created</Th>
              <Th>Assessment</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Amount</Th>
              <Th>Proof</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const stuck = isStuckGenerating(order, nowMs);
              const tint = stuck
                ? { bg: "#FAEEDA", fg: "#BA7517" }
                : STATUS_TINT[order.status] ?? STATUS_TINT.pending_verification;
              const shareToken = tokenMap[order.assessment_id];
              const cardHref = shareToken
                ? `/c/${shareToken}`
                : `/assess/${order.assessment_id}`;
              const isBusy = busyId === order.id;
              const rowClass = stuck
                ? "border-t border-[#BA7517]/30 bg-[#FAEEDA]/40 align-top"
                : "border-t border-[#D9D5C8] align-top";
              return (
                <tr key={order.id} className={rowClass}>
                  <Td className="whitespace-nowrap text-xs text-[#6B766F]">
                    {formatTimestamp(order.created_at)}
                  </Td>
                  <Td>
                    <a
                      href={cardHref}
                      className="text-[#0F6E56] hover:underline underline-offset-2 font-mono text-xs"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {order.assessment_id.slice(0, 8)}…
                    </a>
                  </Td>
                  <Td className="text-xs text-[#0E1411] break-all">
                    {order.email_sent_to ?? "—"}
                  </Td>
                  <Td>
                    <span
                      className="inline-flex items-center rounded-full text-[11px] font-medium px-2 py-0.5"
                      style={{ backgroundColor: tint.bg, color: tint.fg }}
                    >
                      {stuck ? "generating (stuck — likely timeout)" : order.status}
                    </span>
                  </Td>
                  <Td className="text-xs text-[#0E1411] whitespace-nowrap">
                    ₹{order.amount_inr}
                  </Td>
                  <Td>
                    {order.payment_screenshot_url ? (
                      <a
                        href={order.payment_screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0F6E56] hover:underline text-xs"
                      >
                        screenshot ↗
                      </a>
                    ) : order.transaction_id ? (
                      <span className="font-mono text-xs text-[#0E1411]">
                        {order.transaction_id}
                      </span>
                    ) : (
                      <span className="text-xs text-[#6B766F]">—</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-2 items-start">
                      {stuck ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleResetStuck(order.id)}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 transition-colors"
                          >
                            {isBusy ? "Resetting…" : "Reset & retry via button"}
                          </button>
                          <button
                            type="button"
                            onClick={() => showCliCommand(order.id)}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center rounded-full border border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white disabled:opacity-60 text-xs font-medium px-3 py-1.5 transition-colors"
                          >
                            Run CLI to recover
                          </button>
                        </>
                      ) : (
                        <>
                          {order.status === "pending_verification" && (
                            <button
                              type="button"
                              onClick={() => handleVerify(order.id)}
                              disabled={isBusy}
                              className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 transition-colors"
                            >
                              {isBusy ? "Verifying…" : "Mark verified"}
                            </button>
                          )}
                          {order.status === "verified" && (
                            <button
                              type="button"
                              onClick={() => handleGenerate(order.id)}
                              disabled={isBusy}
                              className="inline-flex items-center justify-center rounded-full bg-[#BA7517] hover:bg-[#9a6113] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 transition-colors"
                            >
                              {isBusy ? "Triggering…" : "Generate Draft Pack"}
                            </button>
                          )}
                          {order.status === "delivered" && order.draft_pack_pdf_url && (
                            <a
                              href={order.draft_pack_pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-full border border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white text-xs font-medium px-3 py-1.5 transition-colors"
                            >
                              PDF ↗
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {cliCommand && (
        <CliCommandDialog
          command={cliCommand}
          onClose={() => setCliCommand(null)}
        />
      )}
    </div>
  );
}

function CliCommandDialog({
  command,
  onClose,
}: {
  command: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard may be blocked
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-xl bg-white border border-[#D9D5C8] p-6">
        <h2 className="font-serif text-xl text-[#0E1411] mb-2">
          Recover via CLI
        </h2>
        <p className="text-sm text-[#6B766F] mb-4">
          Run this from a terminal that has{" "}
          <code className="font-mono text-[#0E1411]">RESEND_API_KEY</code> in
          its <code className="font-mono text-[#0E1411]">.env.local</code>:
        </p>
        <pre className="rounded-lg bg-[#F7F6F2] border border-[#D9D5C8] p-3 text-xs text-[#0E1411] overflow-x-auto whitespace-pre-wrap break-all">
          {command}
        </pre>
        <p className="text-xs text-[#6B766F] mt-3">
          The CLI runs the same code path as the server-side button — same
          Opus call, same PDF render, same Storage upload, same email. Once
          it finishes, the order&apos;s status flips to{" "}
          <code className="font-mono">delivered</code> and the next page
          refresh will show the PDF link.
        </p>
        <div className="flex gap-2 mt-4 justify-end">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center justify-center rounded-full border border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white text-sm font-medium px-4 py-1.5 transition-colors"
          >
            {copied ? "Copied ✓" : "Copy command"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] text-white text-sm font-medium px-4 py-1.5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-[#6B766F] font-medium">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-3 ${className ?? ""}`}>{children}</td>;
}

