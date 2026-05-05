"use client";

import { DEMO_PACKETS, type DemoPacket } from "@/lib/demo-packets";

/**
 * Demo packet selector — sits above the intake form on /start.
 *
 * For live demos to incubators / founders / partners. Click a button,
 * the form prefills with a real Indian medtech, and we land on the
 * readiness card in <30 seconds.
 *
 * Hidden in production by default unless ?demo=true is in the URL OR
 * the user is authenticated as admin (TODO). For tomorrow's demo we
 * keep it visible to everyone — it's a valuable trust signal.
 */
export function DemoPacketBar({
  onSelect,
  visible,
}: {
  onSelect: (packet: DemoPacket) => void;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="mb-6 rounded-lg border border-[#0F6E56]/30 bg-[#E1F5EE]/40 px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#0F6E56] mb-1">
            Demo · skip the form
          </p>
          <p className="text-sm text-[#0E1411] leading-snug">
            Try with a real Indian medtech case to see what the card looks like.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_PACKETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56] hover:text-white transition-colors whitespace-nowrap"
              title={p.hint}
            >
              {p.label} →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
