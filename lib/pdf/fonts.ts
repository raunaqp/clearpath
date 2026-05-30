/**
 * Shared font registration for every react-pdf template.
 *
 * Why: PDF built-in fonts (Helvetica, Times-Bold, Times-Roman) use
 * WinAnsi encoding, which has no glyphs for ₹ (U+20B9), → (U+2192),
 * ↳ (U+21B3), or most ranges above U+00FF. react-pdf then silently
 * truncates to the low byte — ₹ shows as ¹, ↳ shows as ³, etc. This
 * was masked in Tier 1 production output because the generator emitted
 * "Rs" and "->" instead of ₹ and →. Surfacing inference markers (which
 * use ↳) made the issue visible; the underlying bug class also drives
 * the Tier 2 tofu-box reports.
 *
 * Fix: register IBM Plex Sans + IBM Plex Serif (OFL, full Unicode
 * coverage including the Indian Rupee Sign and the arrow ranges).
 * Importing this module is the only thing needed to switch a template
 * over — Font.register runs once at module load.
 *
 * Family-name constants must replace every prior "Helvetica" /
 * "Helvetica-Bold" / "Times-Bold" / "Times-Roman" usage in PDF
 * stylesheets so the substitution is total.
 */
import path from "node:path";
import { Font } from "@react-pdf/renderer";

export const PDF_FONT_SANS = "ClearPathSans";
export const PDF_FONT_SERIF = "ClearPathSerif";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");

let registered = false;
function registerOnce(): void {
  if (registered) return;
  Font.register({
    family: PDF_FONT_SANS,
    fonts: [
      { src: path.join(FONT_DIR, "IBMPlexSans-Regular.ttf") },
      {
        src: path.join(FONT_DIR, "IBMPlexSans-Bold.ttf"),
        fontWeight: "bold",
      },
    ],
  });
  Font.register({
    family: PDF_FONT_SERIF,
    fonts: [
      { src: path.join(FONT_DIR, "IBMPlexSerif-Regular.ttf") },
      {
        src: path.join(FONT_DIR, "IBMPlexSerif-Bold.ttf"),
        fontWeight: "bold",
      },
    ],
  });
  registered = true;
}
registerOnce();
