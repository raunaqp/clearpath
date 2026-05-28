#!/usr/bin/env tsx
/**
 * One-off generator for a synthetic pitch deck used to smoke-test the
 * Sprint 2 Story 2.5 Phase 3 Tier B wizard prefill pipeline.
 *
 * Outputs: /tmp/cardiorhythm-pitch-deck.pdf (15 slides, 16:9 layout).
 *
 * Not committed; lives in /tmp deliberately.
 */
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
} from "pdf-lib";
import { writeFileSync } from "node:fs";

const SLIDE_W = 960;
const SLIDE_H = 540;
const MARGIN = 56;

const teal = rgb(0.058, 0.431, 0.337);
const ink = rgb(0.054, 0.078, 0.066);
const muted = rgb(0.42, 0.46, 0.44);
const accent = rgb(0.729, 0.459, 0.09);

type Slide = {
  eyebrow: string;
  title: string;
  bullets?: string[];
  body?: string;
  footer?: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "CardioRhythm Health Pvt Ltd · Bengaluru · 2024",
    title: "CardioRhythm AI — Predicting Cardiac Events Before They Happen",
    body:
      "Series A Pitch Deck — Q2 2026.\n\nA Software-as-a-Medical-Device platform for clinical decision support in cardiology. Headquartered in Bengaluru. Team size: 12.",
    footer: "Confidential · Investors only",
  },
  {
    eyebrow: "01 · Problem & Solution",
    title: "Sudden cardiac death affects 4.5M Indians yearly. 80% are predictable.",
    bullets: [
      "Indian ICUs and step-down wards rely on episodic ECG snapshots, missing the 6-hour pre-event window.",
      "CardioRhythm AI analyses continuous ECG waveforms streamed from bedside monitors and wearables.",
      "Surfaces clinically actionable risk windows 6 hours before an event with 94% sensitivity.",
      "Delivers concise risk briefs into the cardiologist's existing workflow.",
    ],
  },
  {
    eyebrow: "02 · Product Overview",
    title: "CardioRhythm AI (model CRA-100) — a Class C SaMD.",
    bullets: [
      "Software-as-a-Medical-Device (SaMD). Non-sterile, software-only — no physical manufacturing footprint.",
      "Hospital inpatient deployment + remote monitoring for at-home patients. Mixed setting of use.",
      "Patient population: adults 50+ at risk of cardiac events.",
      "User population: cardiologists and ICU staff.",
      "Cloud-deployed inference on AWS Mumbai; on-premise hospital connector for HIS/PACS integration.",
    ],
  },
  {
    eyebrow: "03 · Intended Use",
    title: "Clinical decision support — not autonomous diagnosis.",
    body:
      "CardioRhythm AI is intended to support clinical decision-making by cardiologists and qualified ICU staff. It DOES NOT perform autonomous diagnosis. The platform surfaces predicted risk windows and recommended interventions; the clinician interprets and decides. The cardiologist remains the responsible decision-maker for every recommendation. Not intended for paediatric use or first-line emergency triage.",
  },
  {
    eyebrow: "04 · Architecture & Adaptive Learning",
    title: "Adaptive AI/ML SaMD — trained on 2M+ hours of ECG data.",
    bullets: [
      "Feature extraction: morphology, rhythm variability, ST-segment trend, HRV features.",
      "Ensemble of gradient-boosted models + temporal CNN for sequence-level prediction.",
      "Adaptive — model retrains weekly on newly-labeled events. Drift monitoring built in.",
      "Identifiable patient ECG data processed under DPDP-aligned consent + CERT-In Safe-to-Host controls.",
      "Algorithm Change Protocol (ACP) to be filed alongside MD-7 per Oct 2025 CDSCO SaMD draft.",
    ],
  },
  {
    eyebrow: "05 · Clinical Validation",
    title: "Pilot study at AIIMS Delhi — 200 patients enrolled. Published study pending.",
    bullets: [
      "Sensitivity: 94% on held-out validation cohort. Specificity: 89%.",
      "Median lead-time: 4.2 hours before clinically-significant cardiac event.",
      "Pilot data submitted to IEEE EMBS for peer review.",
      "Multi-centre prospective study planned for 2026 across 10 hospitals.",
    ],
  },
  {
    eyebrow: "06 · Predicate Device & Regulatory Pathway",
    title: "AliveCor KardiaMobile is closest predicate. Targeting CDSCO MD-7.",
    bullets: [
      "Predicate: AliveCor KardiaMobile (FDA 510(k) cleared, K181823) — single-lead ECG arrhythmia detection.",
      "CardioRhythm AI extends predicate materially via 6-hour prediction — hybrid pathway expected.",
      "Targeted CDSCO class: Class C SaMD per IMDRF risk matrix (serious clinical state × drives clinical management).",
      "Filing form: MD-7 (Class C/D manufacturing license, Central Licensing Authority).",
      "DPDP Significant Data Fiduciary registration planned once user scale crosses 10 lakh.",
    ],
  },
  {
    eyebrow: "07 · Quality System",
    title: "ISO 13485 — in progress with BSI India. Stage 1 audit Q3 2026.",
    body:
      "Engaged with BSI India for ISO 13485:2016 certification. Stage 1 audit scheduled for Q3 2026. Internal QMS implementation under way. IEC 62304 software lifecycle classification: Class C (death or serious injury possible). Risk management per ISO 14971. Cybersecurity controls aligned to IT-Act 2000 + DPDP 2023. Two pending Indian patents on the morphology-rhythm fusion feature extractor.",
  },
  {
    eyebrow: "08 · Team & Traction",
    title: "12-person team. 3 active hospital pilots. 200 patients enrolled.",
    bullets: [
      "Dr Arjun Mehta — Cardiologist, AIIMS Delhi. Clinical principal investigator on the pilot study.",
      "Dr Priya Iyer — ML/AI lead. PhD from IISc Bengaluru.",
      "Rohit Kumar — CTO. 14 years at Philips Healthcare on regulated medical devices.",
      "Pilot deployments live: AIIMS Delhi, Apollo Bengaluru, Manipal Hospital.",
      "LOIs from 4 additional tertiary-care hospitals contingent on MD-7 approval.",
    ],
  },
  {
    eyebrow: "09 · The Ask",
    title: "Raising Series A — INR 35Cr — to scale validation + regulatory clearance.",
    bullets: [
      "Use of funds: clinical validation across 10 hospitals, MD-7 filing, ISO 13485 close-out.",
      "18-month milestone: CDSCO MD-7 manufacturing license approved.",
      "30-month milestone: 50,000 monitored patient-hours, 5 commercial customers.",
      "Contact: arjun@cardiorhythm.health · +91 80 4567 8910",
    ],
    footer: "Thank you. Questions welcome.",
  },
];

function drawWrappedText(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    maxWidth: number;
    font: PDFFont;
    size: number;
    lineHeight: number;
    color: ReturnType<typeof rgb>;
  }
): number {
  const { x, font, size, lineHeight, color, maxWidth } = options;
  let { y } = options;
  const paragraphs = text.split(/\n+/);
  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let line = "";
    for (const w of words) {
      const candidate = line.length === 0 ? w : `${line} ${w}`;
      const width = font.widthOfTextAtSize(candidate, size);
      if (width > maxWidth) {
        page.drawText(line, { x, y, size, font, color });
        y -= lineHeight;
        line = w;
      } else {
        line = candidate;
      }
    }
    if (line) {
      page.drawText(line, { x, y, size, font, color });
      y -= lineHeight;
    }
    y -= lineHeight * 0.4;
  }
  return y;
}

async function main() {
  const doc = await PDFDocument.create();
  const fontReg = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  SLIDES.forEach((slide, idx) => {
    const page = doc.addPage([SLIDE_W, SLIDE_H]);

    // Top eyebrow band
    page.drawRectangle({
      x: 0,
      y: SLIDE_H - 12,
      width: SLIDE_W,
      height: 12,
      color: teal,
    });

    // Eyebrow
    page.drawText(slide.eyebrow.toUpperCase(), {
      x: MARGIN,
      y: SLIDE_H - 50,
      size: 10,
      font: fontBold,
      color: accent,
    });

    // Title
    let cursorY = SLIDE_H - 90;
    cursorY = drawWrappedText(page, slide.title, {
      x: MARGIN,
      y: cursorY,
      maxWidth: SLIDE_W - MARGIN * 2,
      font: fontBold,
      size: 26,
      lineHeight: 32,
      color: ink,
    });

    cursorY -= 18;

    // Body
    if (slide.body) {
      cursorY = drawWrappedText(page, slide.body, {
        x: MARGIN,
        y: cursorY,
        maxWidth: SLIDE_W - MARGIN * 2,
        font: fontReg,
        size: 14,
        lineHeight: 20,
        color: ink,
      });
      cursorY -= 8;
    }

    // Bullets
    if (slide.bullets && slide.bullets.length > 0) {
      for (const bullet of slide.bullets) {
        page.drawText("•", {
          x: MARGIN,
          y: cursorY,
          size: 14,
          font: fontBold,
          color: teal,
        });
        cursorY = drawWrappedText(page, bullet, {
          x: MARGIN + 18,
          y: cursorY,
          maxWidth: SLIDE_W - MARGIN * 2 - 18,
          font: fontReg,
          size: 13,
          lineHeight: 18,
          color: ink,
        });
        cursorY -= 4;
      }
    }

    // Footer line
    page.drawLine({
      start: { x: MARGIN, y: 40 },
      end: { x: SLIDE_W - MARGIN, y: 40 },
      thickness: 0.5,
      color: muted,
    });

    // Slide number + optional footer
    page.drawText(`${idx + 1} / ${SLIDES.length}`, {
      x: SLIDE_W - MARGIN - 50,
      y: 22,
      size: 9,
      font: fontReg,
      color: muted,
    });
    if (slide.footer) {
      page.drawText(slide.footer, {
        x: MARGIN,
        y: 22,
        size: 9,
        font: fontItalic,
        color: muted,
      });
    } else {
      page.drawText("CardioRhythm Health Pvt Ltd · Confidential", {
        x: MARGIN,
        y: 22,
        size: 9,
        font: fontItalic,
        color: muted,
      });
    }
  });

  const bytes = await doc.save();
  const outPath = "/tmp/cardiorhythm-pitch-deck.pdf";
  writeFileSync(outPath, bytes);
  const kb = Math.round(bytes.length / 1024);
  console.log(`Wrote ${outPath} (${kb} KB, ${SLIDES.length} slides)`);
}

main().catch((err) => {
  console.error("gen-deck crashed:", err);
  process.exit(1);
});
