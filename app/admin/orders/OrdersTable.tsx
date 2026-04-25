"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type AdminOrder = {
  id: string;
  status: string;
  created_at: string | null;
  amount_inr: number;
  payment_screenshot_url: string | null;
  transaction_id: string | null;
  email_sent_to: string | null;
  assessment_id: string;
  draft_pack_pdf_url: string | null;
  verified_at: string | null;
  delivered_at: string | null;
};

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
  const [error, setError] = useState<string | null>(null);
  const [cliCommand, setCliCommand] = useState<string | null>(null);

  async function handleVerify(orderId: string) {
    setBusyId(orderId);
    setError(null);
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
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-draft-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Trigger failed.");
      setCliCommand(body.cli_command as string);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Trigger failed.");
    } finally {
      setBusyId(null);
    }
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
              const tint = STATUS_TINT[order.status] ?? STATUS_TINT.pending_verification;
              const shareToken = tokenMap[order.assessment_id];
              const cardHref = shareToken
                ? `/c/${shareToken}`
                : `/assess/${order.assessment_id}`;
              const isBusy = busyId === order.id;
              return (
                <tr
                  key={order.id}
                  className="border-t border-[#D9D5C8] align-top"
                >
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
                      {order.status}
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
          Generation triggered
        </h2>
        <p className="text-sm text-[#6B766F] mb-4">
          Order is now <code className="font-mono text-[#0E1411]">generating</code>.
          Run this command from your terminal to actually produce + email
          the Draft Pack:
        </p>
        <pre className="rounded-lg bg-[#F7F6F2] border border-[#D9D5C8] p-3 text-xs text-[#0E1411] overflow-x-auto whitespace-pre-wrap break-all">
          {command}
        </pre>
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
