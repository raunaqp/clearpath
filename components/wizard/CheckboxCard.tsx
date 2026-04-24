import type { JSX } from "react";

export default function CheckboxCard({
  label,
  description,
  selected,
  onToggle,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onToggle: () => void;
}): JSX.Element {
  const containerClasses = selected
    ? "bg-[#EAF3EF] border-2 border-[#0F6E56]"
    : "bg-white border border-[#D9D5C8] hover:border-[#6B766F]";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={`w-full min-h-[64px] rounded-xl px-4 py-3 text-left flex items-start gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F6F2] ${containerClasses}`}
    >
      <span
        aria-hidden
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
          selected
            ? "bg-[#0F6E56] border-[#0F6E56]"
            : "bg-white border-[#D9D5C8]"
        }`}
      >
        {selected && (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-3 h-3"
            aria-hidden
          >
            <path
              d="M3 8.5L6.5 12L13 5"
              stroke="white"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
    </button>
  );
}
