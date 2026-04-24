import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F7F6F2",
        "bg-card": "#FDFCF8",
        "bg-sink": "#EFECE3",
        ink: "#0E1411",
        "ink-2": "#2A3430",
        muted: "#6B766F",
        line: "#D9D5C8",
        "line-soft": "#E8E4D6",
        teal: {
          deep: "#0F6E56",
          light: "#E1F5EE",
          DEFAULT: "#0F6E56",
        },
        amber: {
          brand: "#BA7517",
          light: "#FAEEDA",
          deep: "#633806",
        },
        coral: {
          brand: "#993C1D",
          light: "#FAECE7",
        },
        mint: "#E8F5F0",
        cream: "#F5F0E8",
      },
      fontFamily: {
        serif: ["Source Serif 4", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "0.75rem",
        pill: "9999px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        "display-lg": ["clamp(44px, 6.2vw, 84px)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(32px, 3.6vw, 52px)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
      },
      maxWidth: {
        content: "1240px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
