import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import React from "react";
import type { ReadinessCard } from "@/lib/schemas/readiness-card";

// Brand tokens — kept aligned with draft-pack-template.
const TEAL_DEEP = "#0F6E56";
const AMBER = "#BA7517";
const CORAL = "#993C1D";
const BG_WARM = "#F7F6F2";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#6B6B6B";
const RULE = "#E2DFD7";

const BAND_TINT: Record<string, string> = {
  red: "#FAECE7",
  amber: "#FAEEDA",
  green: "#EAF3DE",
  green_plus: "#E1F5EE",
  not_applicable: "#F5F5F2",
};

const BAND_ACCENT: Record<string, string> = {
  red: CORAL,
  amber: AMBER,
  green: "#3B6D11",
  green_plus: TEAL_DEEP,
  not_applicable: TEXT_MUTED,
};

const RISK_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  not_applicable: "N/A",
};

const VERDICT_LABEL: Record<string, string> = {
  required: "required",
  required_SDF: "likely required (SDF)",
  required_for_procurement: "for procurement",
  required_sub_feature: "feature only",
  conditional: "conditional",
  optional: "optional",
  core_compliance_achieved: "compliant",
  not_applicable: "n/a",
};

const REG_ORDER: ReadonlyArray<{
  key: keyof ReadinessCard["regulations"];
  label: string;
}> = [
  { key: "cdsco_mdr", label: "CDSCO MDR" },
  { key: "cdsco_pharmacy", label: "CDSCO Pharmacy" },
  { key: "dpdp", label: "DPDP" },
  { key: "icmr", label: "ICMR" },
  { key: "abdm", label: "ABDM" },
  { key: "nabh", label: "NABH" },
  { key: "mci_telemed", label: "MCI Telemed" },
  { key: "irdai", label: "IRDAI" },
  { key: "nabl", label: "NABL" },
];

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG_WARM,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: TEXT_DARK,
  },
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
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  metaTag: {
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  eyebrow: {
    fontSize: 8.5,
    color: AMBER,
    letterSpacing: 1.4,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  productName: {
    fontFamily: "Times-Bold",
    fontSize: 24,
    color: TEXT_DARK,
    lineHeight: 1.15,
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 10.5,
    color: TEXT_MUTED,
    marginBottom: 18,
  },
  topRow: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
    marginBottom: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: RULE,
    backgroundColor: "#FFFFFF",
  },
  scoreBlock: {
    width: 96,
    flexDirection: "column",
    alignItems: "center",
  },
  scoreNumber: {
    fontFamily: "Times-Bold",
    fontSize: 32,
    lineHeight: 1.05,
  },
  scoreOutOf: {
    fontSize: 9,
    color: TEXT_MUTED,
  },
  scoreBand: {
    fontSize: 8.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 4,
  },
  badgesCol: {
    flex: 1,
    flexDirection: "column",
    gap: 6,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
  },
  sectionHeader: {
    fontFamily: "Times-Bold",
    fontSize: 13,
    color: TEAL_DEEP,
    marginTop: 14,
    marginBottom: 6,
  },
  body: {
    fontSize: 10,
    color: TEXT_DARK,
    marginBottom: 6,
  },
  gapRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
  },
  gapPill: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
    width: 56,
    textAlign: "center",
  },
  gapBody: {
    flex: 1,
    fontSize: 10,
  },
  regGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 4,
  },
  regChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 8.5,
  },
  timelineBox: {
    marginTop: 6,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: RULE,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: TEXT_MUTED,
    borderTopWidth: 0.5,
    borderTopColor: RULE,
    paddingTop: 8,
  },
  disclaimer: {
    fontSize: 8,
    color: TEXT_MUTED,
    fontStyle: "italic",
    lineHeight: 1.5,
    marginTop: 10,
  },
});

const SEVERITY_TINT: Record<string, { bg: string; fg: string }> = {
  high: { bg: "#FAECE7", fg: CORAL },
  medium: { bg: "#FAEEDA", fg: AMBER },
  low: { bg: "#EAF3DE", fg: "#3B6D11" },
};

export type ReadinessCardPdfData = {
  card: ReadinessCard;
  assessment_id: string;
  generated_date: string;
  share_url?: string;
};

const Footer = ({ shareUrl }: { shareUrl?: string }) => (
  <View style={styles.footer} fixed>
    <Text>
      Generated by ClearPath · regulatory readiness for Indian healthtech
    </Text>
    <Text>{shareUrl ?? "clearpath-medtech.vercel.app"}</Text>
  </View>
);

export const ReadinessCardDocument = ({
  data,
}: {
  data: ReadinessCardPdfData;
}) => {
  const { card } = data;
  const productName = card.meta.product_name || card.meta.company_name;
  const bandAccent = BAND_ACCENT[card.readiness.band] ?? TEAL_DEEP;
  const bandTint = BAND_TINT[card.readiness.band] ?? "#FFFFFF";
  const riskTint =
    SEVERITY_TINT[card.risk.level === "not_applicable" ? "low" : card.risk.level] ??
    SEVERITY_TINT.low;

  return (
    <Document
      title={`ClearPath Readiness Card — ${productName}`}
      author="ClearPath"
      subject="Regulatory Readiness Card"
    >
      {/* Page 1: cover + summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandMark}>CLEARPATH</Text>
            <Text style={styles.brandTagline}>
              Regulatory Readiness · India
            </Text>
          </View>
          <View>
            <Text style={[styles.metaTag, { textAlign: "right" }]}>
              {data.generated_date}
            </Text>
            <Text style={[styles.metaTag, { textAlign: "right" }]}>
              ID {data.assessment_id.slice(0, 8)}
            </Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>Regulatory Risk Profile</Text>
        <Text style={styles.productName}>{productName}</Text>
        <Text style={styles.deviceType}>{card.classification.device_type}</Text>

        <View style={styles.topRow}>
          <View style={styles.scoreBlock}>
            {card.readiness.score !== null ? (
              <>
                <Text style={[styles.scoreNumber, { color: bandAccent }]}>
                  {card.readiness.score}
                  <Text style={{ fontSize: 14, color: TEXT_MUTED }}>/10</Text>
                </Text>
                <Text style={[styles.scoreBand, { color: bandAccent }]}>
                  {card.readiness.band.replace("_", " ")}
                </Text>
              </>
            ) : (
              <Text style={[styles.scoreBand, { color: TEXT_MUTED }]}>N/A</Text>
            )}
          </View>
          <View style={styles.badgesCol}>
            <View style={styles.badgeRow}>
              <Text
                style={[
                  styles.badge,
                  { backgroundColor: riskTint.bg, color: riskTint.fg },
                ]}
              >
                Risk · {RISK_LABEL[card.risk.level] ?? card.risk.level}
              </Text>
              {card.classification.cdsco_class && (
                <Text
                  style={[
                    styles.badge,
                    { backgroundColor: bandTint, color: bandAccent },
                  ]}
                >
                  Class {card.classification.cdsco_class}
                  {card.classification.class_qualifier
                    ? ` · ${card.classification.class_qualifier}`
                    : ""}
                </Text>
              )}
              <Text
                style={[
                  styles.badge,
                  { backgroundColor: BG_WARM, color: TEXT_MUTED },
                ]}
              >
                Timeline · {card.timeline.display}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Verdict</Text>
        <Text style={styles.body}>{card.verdict}</Text>

        <Text style={styles.sectionHeader}>Why this is regulated</Text>
        <Text style={styles.body}>{card.why_regulated}</Text>

        <Footer shareUrl={data.share_url} />
      </Page>

      {/* Page 2: gaps + regulations + timeline */}
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandMark}>CLEARPATH</Text>
            <Text style={styles.brandTagline}>{productName}</Text>
          </View>
          <Text style={styles.metaTag}>Page 2</Text>
        </View>

        <Text style={styles.sectionHeader}>Top gaps</Text>
        {card.top_gaps.length === 0 ? (
          <Text style={styles.body}>No critical gaps identified.</Text>
        ) : (
          card.top_gaps.slice(0, 3).map((gap, i) => {
            const tint = SEVERITY_TINT[gap.severity] ?? SEVERITY_TINT.low;
            return (
              <View key={i} style={styles.gapRow} wrap={false}>
                <Text
                  style={[
                    styles.gapPill,
                    { backgroundColor: tint.bg, color: tint.fg },
                  ]}
                >
                  {gap.severity}
                </Text>
                <View style={styles.gapBody}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
                    {gap.gap_title}
                  </Text>
                  <Text style={{ fontSize: 9.5, color: TEXT_MUTED, marginTop: 2 }}>
                    {gap.fix_action}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <Text style={styles.sectionHeader}>Regulation snapshot</Text>
        <View style={styles.regGrid}>
          {REG_ORDER.map(({ key, label }) => {
            const entry = card.regulations[key];
            if (entry.verdict === "not_applicable") return null;
            const isRequiredFamily = entry.verdict.startsWith("required");
            const tintBg = isRequiredFamily ? "#0F6E56" : "transparent";
            const tintFg = isRequiredFamily ? "#FFFFFF" : TEAL_DEEP;
            return (
              <Text
                key={key}
                style={[
                  styles.regChip,
                  {
                    backgroundColor: tintBg,
                    color: tintFg,
                    borderWidth: isRequiredFamily ? 0 : 0.5,
                    borderColor: TEAL_DEEP,
                  },
                ]}
              >
                {label} · {VERDICT_LABEL[entry.verdict] ?? entry.verdict}
              </Text>
            );
          })}
        </View>

        <Text style={styles.sectionHeader}>Timeline</Text>
        <View style={styles.timelineBox}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>
            {card.timeline.display}
          </Text>
          <Text
            style={{ fontSize: 9.5, color: TEXT_MUTED, marginTop: 4, lineHeight: 1.5 }}
          >
            {card.timeline.anchor}
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          ClearPath is a regulatory readiness tool, not legal advice. The
          classifications and verdicts in this card reflect publicly-available
          regulatory guidance as of {data.generated_date}; they should be
          reviewed by a qualified regulatory professional before any CDSCO
          submission.
        </Text>

        <Footer shareUrl={data.share_url} />
      </Page>
    </Document>
  );
};

export default ReadinessCardDocument;
