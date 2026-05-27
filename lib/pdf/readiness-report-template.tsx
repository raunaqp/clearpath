/**
 * Phase 1.6 — ₹499 Regulatory Readiness Report PDF template.
 *
 * react-pdf renderer. 4–6 pages, premium SaaS-onboarding feel
 * (Stripe Atlas / ClearTax / Mercury).
 *
 * Brand tokens are aligned with the existing readiness-card and
 * draft-pack templates (Teal Trust palette). Custom fonts are not
 * registered here — we use react-pdf's built-in PDF-safe families
 * (Helvetica / Times-Bold) to match the rest of the PDF surface.
 *
 * Boundary: this renderer produces decision-support output. The
 * snippets shown in Section 6 are SNIPPETS only — never complete
 * forms. Anything that would belong in a DMF / QMS / RMF / full
 * IFU lives in Tier 2 (Submission Workspace).
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import React from "react";

// Disable react-pdf's default hyphenation so narrow table cells like
// "No EC-approved clinical investigation plan" wrap at word boundaries
// instead of breaking mid-word ("investiga-tion"). The callback returns
// the word as a single-element array — i.e. "treat as atomic, don't
// hyphenate." Module-load side effect; safe because the same callback
// applies to all PDFs rendered in the process.
Font.registerHyphenationCallback((word) => [word]);
import type {
  ReadinessReport,
  GapRow,
  TimelineCost,
  ReviewerInsight,
  SmartExample,
} from "@/lib/schemas/readiness-report";
import { softenCertainty } from "@/lib/engine/soften-certainty";

// ─────────────────────────────────────────────────────────────
// Brand tokens
// ─────────────────────────────────────────────────────────────

const TEAL_DEEP = "#0F6E56";
const TEAL_LIGHT = "#E1F5EE";
const AMBER = "#BA7517";
const AMBER_LIGHT = "#FAEEDA";
const CORAL = "#993C1D";
const CORAL_LIGHT = "#FAECE7";
const GREEN_DARK = "#3B6D11";
const GREEN_LIGHT = "#EAF3DE";

const BG_WARM = "#F7F6F2";
const SURFACE = "#FFFFFF";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#6B6B6B";
const TEXT_FAINT = "#9A9A95";
const RULE = "#E2DFD7";
const RULE_STRONG = "#C9C5B6";

const PRIORITY_PALETTE: Record<
  GapRow["priority"],
  { fill: string; border: string; text: string }
> = {
  P1: { fill: CORAL_LIGHT, border: CORAL, text: CORAL },
  P2: { fill: AMBER_LIGHT, border: AMBER, text: AMBER },
  P3: { fill: TEAL_LIGHT, border: TEAL_DEEP, text: TEAL_DEEP },
};

const BAND_TINT: Record<string, string> = {
  red: CORAL_LIGHT,
  amber: AMBER_LIGHT,
  green: GREEN_LIGHT,
  green_plus: TEAL_LIGHT,
  not_applicable: "#F5F5F2",
};
const BAND_ACCENT: Record<string, string> = {
  red: CORAL,
  amber: AMBER,
  green: GREEN_DARK,
  green_plus: TEAL_DEEP,
  not_applicable: TEXT_MUTED,
};

const RISK_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  not_applicable: "N/A",
};

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence — flagged for clarification",
};

const CONFIDENCE_BARS: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const COMPLEXITY_LABEL: Record<string, string> = {
  low: "Low complexity",
  moderate: "Moderate complexity",
  high: "High complexity",
};

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG_WARM,
    paddingTop: 44,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: TEXT_DARK,
  },

  // header / footer
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brandMark: {
    fontFamily: "Times-Bold",
    fontSize: 14,
    color: TEAL_DEEP,
    letterSpacing: 1.2,
  },
  brandTagline: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginTop: 2,
  },
  metaTag: {
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: TEXT_FAINT,
    letterSpacing: 0.2,
  },

  // section heads
  sectionEyebrow: {
    fontSize: 8.5,
    color: TEAL_DEEP,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  sectionDeck: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginBottom: 10,
  },

  // hero title (page 1)
  heroTitle: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 16,
  },

  // scorecard grid (page 1)
  scorecardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  scoreCell: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  scoreCellFull: {
    width: "100%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  scoreCard: {
    backgroundColor: SURFACE,
    borderColor: RULE,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  scoreLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: "Times-Bold",
    fontSize: 14,
    color: TEXT_DARK,
  },
  scoreValueSmall: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: TEXT_DARK,
  },
  scoreSub: {
    fontSize: 9,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  // chip
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginHorizontal: -2,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginHorizontal: 2,
    marginBottom: 4,
    fontSize: 8.5,
  },

  // confidence bar
  confidenceBars: {
    flexDirection: "row",
    marginTop: 6,
  },
  confidenceBarSeg: {
    height: 4,
    width: 22,
    marginRight: 4,
    borderRadius: 2,
    backgroundColor: RULE,
  },
  confidenceBarOn: {
    backgroundColor: TEAL_DEEP,
  },

  // readiness dots (0–10)
  readinessRow: {
    flexDirection: "row",
    marginTop: 6,
    alignItems: "center",
  },
  readinessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 3,
    backgroundColor: RULE,
  },
  readinessDotOn: { backgroundColor: TEAL_DEEP },
  readinessScoreText: {
    fontFamily: "Times-Bold",
    fontSize: 10,
    color: TEXT_DARK,
    marginLeft: 6,
  },

  // callout box (large)
  callout: {
    backgroundColor: TEAL_LIGHT,
    borderLeftColor: TEAL_DEEP,
    borderLeftWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 4,
  },
  calloutLabel: {
    fontSize: 8,
    color: TEAL_DEEP,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  calloutBody: {
    fontSize: 10,
    color: TEXT_DARK,
    lineHeight: 1.5,
  },

  // pathway step list
  stepRow: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "flex-start",
  },
  stepNumberCol: {
    width: 22,
    marginRight: 6,
    alignItems: "flex-end",
  },
  stepNumber: {
    fontFamily: "Times-Bold",
    fontSize: 13,
    color: TEAL_DEEP,
    lineHeight: 1.2,
  },
  stepBody: {
    flex: 1,
    minWidth: 0,
  },
  stepName: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: TEXT_DARK,
    lineHeight: 1.25,
  },
  stepWhat: {
    fontSize: 9.5,
    color: TEXT_MUTED,
    marginTop: 2,
    lineHeight: 1.35,
  },
  stepDuration: {
    fontSize: 8.5,
    color: AMBER,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    lineHeight: 1.2,
  },

  // pathway forms strip
  formsStrip: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 12,
  },
  formsLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginRight: 6,
  },
  formPill: {
    backgroundColor: TEAL_LIGHT,
    color: TEAL_DEEP,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
    fontSize: 9.5,
    fontFamily: "Times-Bold",
  },

  // gap table
  gapTable: {
    marginTop: 8,
    borderColor: RULE,
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  gapHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#EFEDE2",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  gapHeaderCell: {
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  gapRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderTopColor: RULE,
    borderTopWidth: 1,
    backgroundColor: SURFACE,
  },
  // Column widths re-balanced to give 'Why it matters' the most room
  // (longest LLM paragraph), trim the priority chip column, and keep
  // EFFORT·COST compact since it's always short (e.g. "6–9 months · Rs 3–5L").
  gapCellPriority: { width: 32, justifyContent: "flex-start", paddingRight: 4 },
  gapCellGap: { flex: 1.3, paddingRight: 6, minWidth: 0 },
  gapCellWhy: { flex: 2.0, paddingRight: 6, minWidth: 0 },
  gapCellNext: { flex: 1.5, paddingRight: 6, minWidth: 0 },
  // 100 is enough for the longest expected effort string
  // ("9–14 months · Rs 8–18L") to stay on one line at 9pt.
  gapCellEffort: { width: 100, minWidth: 0 },
  gapText: { fontSize: 9, color: TEXT_DARK, lineHeight: 1.32 },
  gapTextMuted: { fontSize: 9, color: TEXT_MUTED, lineHeight: 1.32 },

  priorityChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "Times-Bold",
    fontSize: 8.5,
    textAlign: "center",
    borderWidth: 1,
    width: 32,
  },

  // phases
  phaseCard: {
    backgroundColor: SURFACE,
    borderColor: RULE,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  phaseName: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: TEXT_DARK,
  },
  phaseDurationCost: {
    flexDirection: "row",
    alignItems: "center",
  },
  phaseDuration: {
    fontSize: 8.5,
    color: AMBER,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginRight: 8,
  },
  phaseCost: {
    fontSize: 9,
    color: TEAL_DEEP,
    fontFamily: "Times-Bold",
  },
  phaseWhat: {
    fontSize: 9.5,
    color: TEXT_MUTED,
    marginTop: 4,
  },

  // reviewer insights
  insightCard: {
    backgroundColor: SURFACE,
    borderColor: RULE,
    borderWidth: 1,
    borderLeftColor: TEAL_DEEP,
    borderLeftWidth: 3,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  insightTitle: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: TEXT_DARK,
    marginBottom: 3,
  },
  insightBody: {
    fontSize: 9.5,
    color: TEXT_DARK,
    lineHeight: 1.5,
  },

  // smart examples
  exampleBlock: {
    marginBottom: 5,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  exampleCategory: {
    fontSize: 8,
    color: TEAL_DEEP,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginRight: 8,
  },
  exampleTopic: {
    fontFamily: "Times-Bold",
    fontSize: 11.5,
    color: TEXT_DARK,
  },
  examplePairRow: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  examplePane: {
    width: "50%",
    paddingHorizontal: 4,
  },
  examplePaneInner: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 5,
    borderWidth: 1,
  },
  goodPane: { backgroundColor: GREEN_LIGHT, borderColor: GREEN_DARK },
  badPane: { backgroundColor: CORAL_LIGHT, borderColor: CORAL },
  paneLabel: {
    fontSize: 8,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  goodLabel: { color: GREEN_DARK },
  badLabel: { color: CORAL },
  paneBody: {
    fontSize: 9,
    color: TEXT_DARK,
    lineHeight: 1.25,
  },
  exampleAnnotation: {
    backgroundColor: TEAL_LIGHT,
    borderLeftColor: TEAL_DEEP,
    borderLeftWidth: 3,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 3,
    borderRadius: 4,
  },
  exampleAnnotationLabel: {
    fontSize: 8,
    color: TEAL_DEEP,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  exampleAnnotationBody: {
    fontSize: 9.5,
    color: TEXT_DARK,
    lineHeight: 1.35,
  },

  // generic helpers
  divider: {
    borderTopColor: RULE,
    borderTopWidth: 1,
    marginVertical: 12,
  },
  bottleneck: {
    fontSize: 9.5,
    color: TEXT_DARK,
    marginBottom: 4,
  },
});

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const s = (t: string | null | undefined) => (t ? softenCertainty(t) : "");

function PageFrame({
  children,
  assessmentId,
}: {
  children: React.ReactNode;
  assessmentId: string;
}) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.brandRow}>
        <View>
          <Text style={styles.brandMark}>CLEARPATH</Text>
          <Text style={styles.brandTagline}>
            Regulatory Readiness Report · Tier 1
          </Text>
        </View>
        <View>
          <Text style={styles.metaTag}>
            Assessment {assessmentId.slice(0, 8)}
          </Text>
        </View>
      </View>
      {children}
      <View style={styles.footer} fixed>
        <Text>
          Decision-support, not submission-ready content. Tier 2
          (Submission Workspace) generates submission artifacts.
        </Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}

function Chip({
  label,
  fill,
  border,
  text,
}: {
  label: string;
  fill: string;
  border: string;
  text: string;
}) {
  return (
    <Text
      style={{
        ...styles.chip,
        backgroundColor: fill,
        borderColor: border,
        borderWidth: 1,
        color: text,
      }}
    >
      {label}
    </Text>
  );
}

// ─────────────────────────────────────────────────────────────
// Page 1 — Scorecard
// ─────────────────────────────────────────────────────────────

function ScorecardPage({
  report,
}: {
  report: ReadinessReport;
}) {
  const sc = report.scorecard;
  const confidenceFill = CONFIDENCE_BARS[sc.confidence] ?? 1;
  const score = sc.readiness_score;
  return (
    <PageFrame assessmentId={report.meta.source_assessment_id}>
      <Text style={styles.sectionEyebrow}>Regulatory Scorecard</Text>
      <Text style={styles.heroTitle}>{s(report.meta.product_name)}</Text>
      <Text style={styles.heroSubtitle}>
        {s(sc.classification_label)} · {s(sc.pathway_label)}
      </Text>

      <View style={styles.scorecardGrid}>
        <View style={styles.scoreCell}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Likely classification</Text>
            <Text style={styles.scoreValue}>{s(sc.classification_label)}</Text>
            <Text style={styles.scoreSub}>
              {COMPLEXITY_LABEL[sc.complexity] ?? "complexity TBD"}
            </Text>
          </View>
        </View>
        <View style={styles.scoreCell}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Confidence</Text>
            <Text style={styles.scoreValueSmall}>
              {CONFIDENCE_LABEL[sc.confidence] ?? sc.confidence}
            </Text>
            <View style={styles.confidenceBars}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    ...styles.confidenceBarSeg,
                    ...(i <= confidenceFill ? styles.confidenceBarOn : {}),
                  }}
                />
              ))}
            </View>
          </View>
        </View>
        <View style={styles.scoreCell}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Likely pathway</Text>
            <Text style={styles.scoreValueSmall}>{s(sc.pathway_label)}</Text>
            <Text style={styles.scoreSub}>
              {sc.clinical_investigation_likely
                ? "Clinical investigation likely required."
                : "Manufacturing licence path."}
            </Text>
          </View>
        </View>
        <View style={styles.scoreCell}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Timeline + cost band</Text>
            <Text style={styles.scoreValue}>{s(sc.timeline_display)}</Text>
            <Text style={styles.scoreSub}>
              Likely compliance spend: {sc.cost_range_inr_display}
            </Text>
          </View>
        </View>
        <View style={styles.scoreCell}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Readiness</Text>
            <View style={styles.readinessRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <View
                  key={i}
                  style={{
                    ...styles.readinessDot,
                    ...(score !== null && i <= score
                      ? styles.readinessDotOn
                      : {}),
                  }}
                />
              ))}
              <Text style={styles.readinessScoreText}>
                {score === null ? "N/A" : `${score} / 10`}
              </Text>
            </View>
            <Text style={styles.scoreSub}>
              Band:{" "}
              {sc.readiness_band === "green_plus"
                ? "Green+ (strong)"
                : sc.readiness_band === "green"
                  ? "Green (on track)"
                  : sc.readiness_band === "amber"
                    ? "Amber (gaps to close)"
                    : sc.readiness_band === "red"
                      ? "Red (significant work ahead)"
                      : "Not applicable"}
            </Text>
          </View>
        </View>
        <View style={styles.scoreCell}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Risk level</Text>
            <Text
              style={{
                ...styles.scoreValue,
                color: BAND_ACCENT[
                  sc.risk_level === "high"
                    ? "red"
                    : sc.risk_level === "medium"
                      ? "amber"
                      : sc.risk_level === "low"
                        ? "green"
                        : "not_applicable"
                ],
              }}
            >
              {RISK_LABEL[sc.risk_level] ?? "TBD"}
            </Text>
            <Text style={styles.scoreSub}>
              Risk = potential clinical/regulatory exposure today.
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={styles.scoreLabel}>What triggered this classification</Text>
        <View style={styles.chipRow}>
          {sc.triggers.map((t, i) => (
            <Chip
              key={i}
              label={s(t)}
              fill={AMBER_LIGHT}
              border={AMBER}
              text={AMBER}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.scoreLabel}>Top gaps to close</Text>
        <View style={styles.chipRow}>
          {sc.top_gap_titles.map((g, i) => (
            <Chip
              key={i}
              label={s(g)}
              fill={CORAL_LIGHT}
              border={CORAL}
              text={CORAL}
            />
          ))}
        </View>
      </View>

      <View style={styles.callout}>
        <Text style={styles.calloutLabel}>Recommended next action</Text>
        <Text style={styles.calloutBody}>{s(sc.recommended_next_action)}</Text>
      </View>
    </PageFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Page 2 — Pathway
// ─────────────────────────────────────────────────────────────

/** Match a step name to the relevant inline note, so the note
 *  appears under the step it's explaining instead of as an
 *  orphan callout on a near-empty page. The matching is by
 *  substring on the step name — stable enough because the step
 *  names are generated deterministically by the generator
 *  (buildStepSequence). If the matcher ever drifts, the note
 *  falls back to being unrendered, which is safe (the content
 *  also lives in the pathway-paragraph context). */
function noteForStep(
  stepName: string,
  testLicenceNote: string | null,
  acpNote: string | null
): { label: string; body: string; accent: "teal" | "amber" } | null {
  const name = stepName.toLowerCase();
  if (testLicenceNote && name.includes("test licence")) {
    return { label: "Test licence note", body: testLicenceNote, accent: "teal" };
  }
  if (acpNote && (name.includes("acp") || name.includes("pccp"))) {
    return { label: "ACP note", body: acpNote, accent: "amber" };
  }
  return null;
}

function PathwayPage({ report }: { report: ReadinessReport }) {
  const p = report.pathway;
  return (
    <PageFrame assessmentId={report.meta.source_assessment_id}>
      <Text style={styles.sectionEyebrow}>Section 2</Text>
      <Text style={styles.sectionTitle}>Your Likely Regulatory Pathway</Text>
      <Text style={styles.sectionDeck}>
        Why this likely class applies to your product — and the form
        sequence reviewers typically expect.
      </Text>

      <Text style={{ ...styles.calloutBody, marginBottom: 8, lineHeight: 1.45 }}>
        {s(p.why_this_class_applies)}
      </Text>

      <View style={styles.formsStrip}>
        <Text style={styles.formsLabel}>Authority</Text>
        <Text
          style={{
            ...styles.formPill,
            backgroundColor: AMBER_LIGHT,
            color: AMBER,
          }}
        >
          {s(p.authority)}
        </Text>
        <Text style={{ ...styles.formsLabel, marginLeft: 6 }}>Forms</Text>
        {p.forms.map((f, i) => (
          <Text key={i} style={styles.formPill}>
            {s(f)}
          </Text>
        ))}
      </View>

      <Text style={styles.scoreLabel}>Likely step sequence</Text>
      <View style={{ marginTop: 6 }}>
        {p.step_sequence.map((step, i) => {
          const note = noteForStep(step.step, p.test_licence_note, p.acp_note);
          return (
            <View key={i} style={styles.stepRow} wrap={false}>
              <View style={styles.stepNumberCol}>
                <Text style={styles.stepNumber}>{`0${i + 1}`.slice(-2)}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepName}>{s(step.step)}</Text>
                <Text style={styles.stepWhat}>{s(step.what_happens)}</Text>
                <Text style={styles.stepDuration}>{s(step.duration)}</Text>
                {note ? (
                  <View
                    style={{
                      backgroundColor:
                        note.accent === "amber" ? AMBER_LIGHT : TEAL_LIGHT,
                      borderLeftColor:
                        note.accent === "amber" ? AMBER : TEAL_DEEP,
                      borderLeftWidth: 2,
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      marginTop: 3,
                      borderRadius: 3,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.calloutLabel,
                        color: note.accent === "amber" ? AMBER : TEAL_DEEP,
                        fontSize: 7.5,
                        marginBottom: 2,
                      }}
                    >
                      {note.label}
                    </Text>
                    <Text style={{ ...styles.calloutBody, fontSize: 9 }}>
                      {s(note.body)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </PageFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Page 3 — Readiness Gap Analysis
// ─────────────────────────────────────────────────────────────

function GapAnalysisPage({ report }: { report: ReadinessReport }) {
  return (
    <PageFrame assessmentId={report.meta.source_assessment_id}>
      <Text style={styles.sectionEyebrow}>Section 3</Text>
      <Text style={styles.sectionTitle}>Readiness Gap Analysis</Text>
      <Text style={styles.sectionDeck}>
        The gaps a reviewer is likely to flag, ordered by priority.
        Effort and cost bands are typical Indian medtech ranges —
        your numbers may be lower with in-house resources or higher
        with a Big-Four-style consultant.
      </Text>

      <View style={styles.gapTable}>
        <View style={styles.gapHeaderRow}>
          <View style={styles.gapCellPriority}>
            <Text style={styles.gapHeaderCell}>Pri</Text>
          </View>
          <View style={styles.gapCellGap}>
            <Text style={styles.gapHeaderCell}>Gap</Text>
          </View>
          <View style={styles.gapCellWhy}>
            <Text style={styles.gapHeaderCell}>Why it matters</Text>
          </View>
          <View style={styles.gapCellNext}>
            <Text style={styles.gapHeaderCell}>Suggested next step</Text>
          </View>
          <View style={styles.gapCellEffort}>
            <Text style={styles.gapHeaderCell}>Effort · cost</Text>
          </View>
        </View>
        {report.gap_analysis.rows.map((row, i) => {
          const palette = PRIORITY_PALETTE[row.priority];
          return (
            <View key={i} style={styles.gapRow} wrap={false}>
              <View style={styles.gapCellPriority}>
                <Text
                  style={{
                    ...styles.priorityChip,
                    backgroundColor: palette.fill,
                    borderColor: palette.border,
                    color: palette.text,
                  }}
                >
                  {row.priority}
                </Text>
              </View>
              <View style={styles.gapCellGap}>
                <Text style={styles.gapText}>{s(row.gap)}</Text>
              </View>
              <View style={styles.gapCellWhy}>
                <Text style={styles.gapTextMuted}>{s(row.why_it_matters)}</Text>
              </View>
              <View style={styles.gapCellNext}>
                <Text style={styles.gapTextMuted}>
                  {s(row.suggested_next_step)}
                </Text>
              </View>
              <View style={styles.gapCellEffort}>
                <Text style={styles.gapText}>{s(row.estimated_effort)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </PageFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Page 4 — Timeline + Cost
// ─────────────────────────────────────────────────────────────

function TimelineCostPage({
  report,
}: {
  report: ReadinessReport;
}) {
  const tc: TimelineCost = report.timeline_cost;
  return (
    <PageFrame assessmentId={report.meta.source_assessment_id}>
      <Text style={styles.sectionEyebrow}>Section 4</Text>
      <Text style={styles.sectionTitle}>Timeline + Cost Estimator</Text>
      <Text style={styles.sectionDeck}>
        Phased roadmap with Indian-context cost bands. Total range
        and anchor reflect the readiness card's headline estimate.
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={styles.formsLabel}>Total</Text>
        <Text
          style={{
            ...styles.formPill,
            backgroundColor: TEAL_LIGHT,
            color: TEAL_DEEP,
          }}
        >
          {s(tc.total_range_display)}
        </Text>
        <Text style={{ ...styles.gapTextMuted, marginLeft: 4 }}>
          {s(tc.total_anchor)}
        </Text>
      </View>

      {tc.phases.map((ph, i) => (
        <View key={i} style={styles.phaseCard} wrap={false}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseName}>{s(ph.name)}</Text>
            <View style={styles.phaseDurationCost}>
              <Text style={styles.phaseDuration}>{s(ph.duration)}</Text>
              <Text style={styles.phaseCost}>{s(ph.cost_range_inr)}</Text>
            </View>
          </View>
          <Text style={styles.phaseWhat}>{s(ph.what_happens)}</Text>
        </View>
      ))}

      {tc.bottlenecks.length > 0 ? (
        <View
          style={{
            ...styles.callout,
            backgroundColor: CORAL_LIGHT,
            borderLeftColor: CORAL,
          }}
        >
          <Text style={{ ...styles.calloutLabel, color: CORAL }}>
            Likely bottlenecks
          </Text>
          {tc.bottlenecks.map((b, i) => (
            <Text key={i} style={styles.bottleneck}>
              • {s(b)}
            </Text>
          ))}
        </View>
      ) : null}
    </PageFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Page 5 — Reviewer Insights
// ─────────────────────────────────────────────────────────────

function ReviewerInsightsPage({
  report,
}: {
  report: ReadinessReport;
}) {
  return (
    <PageFrame assessmentId={report.meta.source_assessment_id}>
      <Text style={styles.sectionEyebrow}>Section 5</Text>
      <Text style={styles.sectionTitle}>Reviewer Insights</Text>
      <Text style={styles.sectionDeck}>
        What CDSCO reviewers will likely look for in a submission of
        this shape. Generic regulatory checklists rarely capture
        reviewer psychology — this is yours.
      </Text>

      {report.reviewer_insights.map((insight: ReviewerInsight, i) => (
        <View key={i} style={styles.insightCard} wrap={false}>
          <Text style={styles.insightTitle}>{s(insight.priority)}</Text>
          <Text style={styles.insightBody}>
            {s(insight.what_reviewers_look_for)}
          </Text>
        </View>
      ))}
    </PageFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Page 6 — Smart Examples
// ─────────────────────────────────────────────────────────────

function SmartExamplesPage({
  report,
}: {
  report: ReadinessReport;
}) {
  return (
    <PageFrame assessmentId={report.meta.source_assessment_id}>
      <Text style={styles.sectionEyebrow}>Section 6</Text>
      <Text style={styles.sectionTitle}>Smart Examples</Text>
      <Text style={styles.sectionDeck}>
        Annotated good-vs-bad wording. These are snippets, not full
        forms — copy them as models for your own Intended Use,
        claim, and risk-justification language.
      </Text>

      {report.smart_examples.map((ex: SmartExample, i) => (
        <View key={i} style={styles.exampleBlock} wrap={false}>
          <View style={styles.exampleHeader}>
            <Text style={styles.exampleCategory}>
              {ex.category === "intended_use"
                ? "Intended Use"
                : ex.category === "claim_wording"
                  ? "Claim wording"
                  : "Risk justification"}
            </Text>
            <Text style={styles.exampleTopic}>{s(ex.topic)}</Text>
          </View>
          <View style={styles.examplePairRow}>
            <View style={styles.examplePane}>
              <View
                style={{ ...styles.examplePaneInner, ...styles.goodPane }}
              >
                <Text style={{ ...styles.paneLabel, ...styles.goodLabel }}>
                  Good
                </Text>
                <Text style={styles.paneBody}>{ex.good_snippet}</Text>
              </View>
            </View>
            <View style={styles.examplePane}>
              <View style={{ ...styles.examplePaneInner, ...styles.badPane }}>
                <Text style={{ ...styles.paneLabel, ...styles.badLabel }}>
                  Bad
                </Text>
                <Text style={styles.paneBody}>{ex.bad_snippet}</Text>
              </View>
            </View>
          </View>
          <View style={styles.exampleAnnotation}>
            <Text style={styles.exampleAnnotationLabel}>Why this is safer</Text>
            <Text style={styles.exampleAnnotationBody}>
              {s(ex.why_this_is_safer)}
            </Text>
          </View>
        </View>
      ))}
    </PageFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Document
// ─────────────────────────────────────────────────────────────

export function ReadinessReportDocument({
  report,
}: {
  report: ReadinessReport;
}) {
  return (
    <Document>
      <ScorecardPage report={report} />
      <PathwayPage report={report} />
      <GapAnalysisPage report={report} />
      <TimelineCostPage report={report} />
      <ReviewerInsightsPage report={report} />
      <SmartExamplesPage report={report} />
    </Document>
  );
}
