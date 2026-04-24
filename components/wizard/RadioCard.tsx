import type { JSX } from "react";

export default function RadioCard({
  label,
  description,
  selected,
  onSelect,
  keyboardHint,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  keyboardHint?: string;
}): JSX.Element {
  const containerClasses = selected
    ? "bg-[#EAF3EF] border-2 border-[#0F6E56]"
    : "bg-white border border-[#D9D5C8] hover:border-[#6B766F]";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`w-full min-h-[64px] rounded-xl px-4 py-3 text-left flex items-start gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F6F2] ${containerClasses}`}
    >
      <span
        aria-hidden
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? "border-[#0F6E56]" : "border-[#D9D5C8]"
        }`}
      >
        {selected && (
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E56]" />
        )}
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-medium text-[#0E1411] leading-snug">
          {label}
        </span>
        {description && (
          <span className="block text-sm text-[#6B766F] mt-1 leading-relaxed">
            {description}
          </span>
        )}
      </span>

      {keyboardHint && (
        <span
          aria-hidden
          className="shrink-0 text-[11px] font-mono text-[#6B766F] bg-[#F7F6F2] border border-[#D9D5C8] rounded px-1.5 py-0.5 self-start mt-0.5"
        >
          {keyboardHint}
        </span>
      )}
    </button>
  );
}
