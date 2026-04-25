import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import React from "react";

// ClearPath brand
const TEAL_DEEP = "#0F6E56";
const AMBER = "#BA7517";
const CORAL = "#993C1D";
const BG_WARM = "#F7F6F2";
const TEXT_DARK = "#1A1A1A";
const TEXT_MUTED = "#6B6B6B";
const RULE = "#E2DFD7";

// Built-in @react-pdf fonts only — registering Google Fonts is brittle in Node
// renders. Times for headings (serif), Helvetica for body. Tomorrow's Feature 6a
// can swap in Inter/Playfair if we register custom fonts via Font.register.

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG_WARM,
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: TEXT_DARK,
  },
  coverPage: {
    backgroundColor: BG_WARM,
    padding: 56,
    fontFamily: "Helvetica",
    color: TEXT_DARK,
    justifyContent: "space-between",
  },
  brandMark: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    color: TEAL_DEEP,
    letterSpacing: 1.2,
  },
  brandTagline: {
    fontSize: 9,
    color: TEXT_MUTED,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  coverTitle: {
    fontFamily: "Times-Bold",
    fontSize: 32,
    color: TEAL_DEEP,
    lineHeight: 1.15,
  },
  coverProduct: {
    fontFamily: "Times-Roman",
    fontSize: 22,
    color: TEXT_DARK,
    marginTop: 14,
  },
  coverMetaBlock: {
    borderTopWidth: 1,
    borderTopColor: RULE,
    paddingTop: 18,
  },
  coverMetaRow: { flexDirection: "row", marginBottom: 6 },
  coverMetaLabel: { width: 110, fontSize: 9, color: TEXT_MUTED, letterSpacing: 0.6 },
  coverMetaValue: { fontSize: 10, color: TEXT_DARK },
  disclaimer: {
    marginTop: 18,
    fontSize: 8.5,
    color: TEXT_MUTED,
    lineHeight: 1.5,
  },
  sectionHeader: {
    fontFamily: "Times-Bold",
    fontSize: 20,
    color: TEAL_DEEP,
    marginBottom: 4,
  },
  sectionKicker: {
    fontSize: 9,
    color: AMBER,
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  sectionRule: {
    height: 1,
    backgroundColor: RULE,
    marginBottom: 18,
  },
  h2: {
    fontFamily: "Times-Bold",
    fontSize: 13,
    color: TEXT_DARK,
    marginTop: 14,
    marginBottom: 6,
  },
  body: {
    fontSize: 10.5,
    color: TEXT_DARK,
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 10,
    color: TEXT_MUTED,
    fontStyle: "italic",
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 2,
    borderLeftColor: AMBER,
    padding: 10,
    marginVertical: 8,
  },
  bullet: { flexDirection: "row", marginBottom: 4 },
  bulletDot: { width: 10, fontSize: 10, color: TEAL_DEEP },
  bulletText: { flex: 1, fontSize: 10.5, color: TEXT_DARK },
  checklistRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: TEXT_MUTED,
    marginRight: 10,
    marginTop: 2,
  },
  checklistText: { flex: 1, fontSize: 10, color: TEXT_DARK },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.5,
    color: TEXT_MUTED,
    borderTopWidth: 0.5,
    borderTopColor: RULE,
    paddingTop: 8,
  },
  imdrfTable: {
    borderWidth: 0.5,
    borderColor: RULE,
    marginTop: 10,
  },
  imdrfRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: RULE,
  },
  imdrfRowLast: { flexDirection: "row" },
  imdrfCellHead: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    color: TEXT_MUTED,
    backgroundColor: "#FFFFFF",
    letterSpacing: 0.5,
  },
  imdrfCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    color: TEXT_DARK,
  },
});

export type DraftPackData = {
  product_name: string;
  generated_date: string;            // human-readable, e.g. "25 April 2026"
  assessment_id: string;
  share_token?: string;
  applicant_name?: string;
  applicant_email?: string;
};

const Footer = ({ productName }: { productName: string }) => (
  <View style={styles.footer} fixed>
    <Text>ClearPath · Regulatory Draft Pack · {productName}</Text>
    <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.placeholder}>{children}</Text>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bullet}>
    <Text style={styles.bulletDot}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const ChecklistItem = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.checklistRow} wrap={false}>
    <View style={styles.checkbox} />
    <Text style={styles.checklistText}>{children}</Text>
  </View>
);

const SectionHeader = ({ kicker, title }: { kicker: string; title: string }) => (
  <View>
    <Text style={styles.sectionKicker}>{kicker}</Text>
    <Text style={styles.sectionHeader}>{title}</Text>
    <View style={styles.sectionRule} />
  </View>
);

export const DraftPackDocument = ({ data }: { data: DraftPackData }) => (
  <Document
    title={`ClearPath Draft Pack — ${data.product_name}`}
    author="ClearPath"
    subject="CDSCO Regulatory Draft Pack"
  >
    {/* 1. Cover */}
    <Page size="A4" style={styles.coverPage}>
      <View>
        <Text style={styles.brandMark}>CLEARPATH</Text>
        <Text style={styles.brandTagline}>REGULATORY READINESS · INDIA</Text>
      </View>
      <View>
        <Text style={styles.coverTitle}>Regulatory{"\n"}Draft Pack</Text>
        <Text style={styles.coverProduct}>{data.product_name}</Text>
      </View>
      <View style={styles.coverMetaBlock}>
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>GENERATED</Text>
          <Text style={styles.coverMetaValue}>{data.generated_date}</Text>
        </View>
        {data.applicant_name ? (
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>APPLICANT</Text>
            <Text style={styles.coverMetaValue}>{data.applicant_name}</Text>
          </View>
        ) : null}
        <View style={styles.coverMetaRow}>
          <Text style={styles.coverMetaLabel}>ASSESSMENT ID</Text>
          <Text style={styles.coverMetaValue}>{data.assessment_id}</Text>
        </View>
        <Text style={styles.disclaimer}>
          ClearPath is a regulatory readiness tool, not legal advice. The drafted
          content in this pack must be reviewed and adapted by a qualified
          regulatory professional before being used in any CDSCO submission.
        </Text>
      </View>
    </Page>

    {/* 2. Executive Summary */}
    <Page size="A4" style={styles.page}>
      <SectionHeader kicker="SECTION 01" title="Executive Summary" />
      <Placeholder>Content placeholder — populated by Opus call.</Placeholder>
      <Text style={styles.body}>
        The Executive Summary will cover, in roughly 250–350 words: the product
        in plain language, its intended medical purpose, the proposed CDSCO
        risk class with one-line rationale, the regulatory pathway recommended
        by ClearPath, and the headline gaps the applicant should resolve before
        filing.
      </Text>
      <Text style={styles.h2}>Snapshot</Text>
      <Bullet>Product class (proposed): placeholder</Bullet>
      <Bullet>Pathway: placeholder (e.g. Class C/D import via MD-9)</Bullet>
      <Bullet>Headline gaps: placeholder × 3</Bullet>
      <Footer productName={data.product_name} />
    </Page>

    {/* 3. Intended Use Statement */}
    <Page size="A4" style={styles.page}>
      <SectionHeader kicker="SECTION 02" title="Intended Use Statement" />
      <Placeholder>
        Content placeholder — populated by Opus call. The intended use must
        match exactly across CDSCO Form MD-3 / MD-9, the Device Master File,
        and any clinical evaluation.
      </Placeholder>
      <Text style={styles.h2}>Indication</Text>
      <Text style={styles.body}>Placeholder paragraph describing the medical condition or clinical scenario the product addresses.</Text>
      <Text style={styles.h2}>Intended User</Text>
      <Text style={styles.body}>Placeholder — clinician, technician, lay user, or self-administered.</Text>
      <Text style={styles.h2}>Use Environment</Text>
      <Text style={styles.body}>Placeholder — hospital, home, ambulatory, telehealth, etc.</Text>
      <Text style={styles.h2}>Contraindications &amp; Limitations</Text>
      <Text style={styles.body}>Placeholder — populations excluded, off-label warnings.</Text>
      <Footer productName={data.product_name} />
    </Page>

    {/* 4. Device Description */}
    <Page size="A4" style={styles.page}>
      <SectionHeader kicker="SECTION 03" title="Device Description" />
      <Placeholder>Content placeholder — populated by Opus call.</Placeholder>
      <Text style={styles.h2}>Components &amp; Architecture</Text>
      <Text style={styles.body}>Placeholder — hardware modules, software components, cloud/back-end services.</Text>
      <Text style={styles.h2}>Principle of Operation</Text>
      <Text style={styles.body}>Placeholder — how the device achieves its intended use, step by step.</Text>
      <Text style={styles.h2}>Materials, Standards, Interfaces</Text>
      <Text style={styles.body}>Placeholder — biocompatibility, IEC/ISO standards claimed, data interfaces.</Text>
    </Page>
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Variants &amp; Accessories</Text>
      <Text style={styles.body}>Placeholder — model numbers, SKUs, accessories included in the application.</Text>
      <Text style={styles.h2}>Lifecycle &amp; Disposal</Text>
      <Text style={styles.body}>Placeholder — service life, reprocessing, end-of-life handling.</Text>
      <Footer productName={data.product_name} />
    </Page>

    {/* 5. Risk Classification Justification */}
    <Page size="A4" style={styles.page}>
      <SectionHeader kicker="SECTION 04" title="Risk Classification Justification" />
      <Placeholder>
        Content placeholder — populated by Opus call. Maps the product onto the
        IMDRF SaMD framework, then to CDSCO MDR 2017 risk class A/B/C/D.
      </Placeholder>
      <Text style={styles.h2}>IMDRF SaMD Mapping</Text>
      <View style={styles.imdrfTable}>
        <View style={styles.imdrfRow}>
          <Text style={styles.imdrfCellHead}>SIGNIFICANCE OF INFO</Text>
          <Text style={styles.imdrfCellHead}>HEALTHCARE SITUATION</Text>
          <Text style={styles.imdrfCellHead}>SaMD CATEGORY</Text>
        </View>
        <View style={styles.imdrfRow}>
          <Text style={styles.imdrfCell}>placeholder</Text>
          <Text style={styles.imdrfCell}>placeholder</Text>
          <Text style={styles.imdrfCell}>placeholder (I–IV)</Text>
        </View>
        <View style={styles.imdrfRowLast}>
          <Text style={styles.imdrfCell}>Rationale</Text>
          <Text style={[styles.imdrfCell, { flex: 2 }]}>placeholder</Text>
        </View>
      </View>
      <Text style={styles.h2}>CDSCO Class (proposed)</Text>
      <Text style={styles.body}>Placeholder — Class A / B / C / D with one-paragraph rationale.</Text>
      <Footer productName={data.product_name} />
    </Page>

    {/* 6. Clinical Context */}
    <Page size="A4" style={styles.page}>
      <SectionHeader kicker="SECTION 05" title="Clinical Context" />
      <Placeholder>Content placeholder — populated by Opus call.</Placeholder>
      <Text style={styles.h2}>Clinical Need</Text>
      <Text style={styles.body}>Placeholder — burden of disease in India, current standard of care, gap the product addresses.</Text>
      <Text style={styles.h2}>Predicate or Equivalent Devices</Text>
      <Text style={styles.body}>Placeholder — comparable approved devices, points of similarity and divergence.</Text>
      <Text style={styles.h2}>Clinical Evidence Plan</Text>
      <Text style={styles.body}>Placeholder — literature review, performance studies, ongoing or planned clinical investigations.</Text>
      <Footer productName={data.product_name} />
    </Page>

    {/* 7. Essential Principles checklist */}
    <Page size="A4" style={styles.page}>
      <SectionHeader kicker="SECTION 06" title="Essential Principles Checklist" />
      <Text style={styles.body}>
        Per CDSCO MDR 2017, every device must demonstrate conformity with the
        Essential Principles of Safety and Performance. The applicant ticks each
        principle as Met / Not Applicable / In Progress, and references the
        evidence in the Device Master File.
      </Text>
      <ChecklistItem>EP-1 — General requirements: device performs as intended without compromising clinical condition or safety.</ChecklistItem>
      <ChecklistItem>EP-2 — Risk management: residual risks acceptable when weighed against benefit.</ChecklistItem>
      <ChecklistItem>EP-3 — Performance over device lifetime under normal use conditions.</ChecklistItem>
      <ChecklistItem>EP-4 — Transport &amp; storage do not adversely affect performance.</ChecklistItem>
      <ChecklistItem>EP-5 — Side effects are acceptable when weighed against intended performance.</ChecklistItem>
      <ChecklistItem>EP-6 — Chemical, physical, biological properties are appropriate.</ChecklistItem>
      <ChecklistItem>EP-7 — Infection &amp; microbial contamination controls.</ChecklistItem>
      <ChecklistItem>EP-8 — Devices incorporating materials of biological origin.</ChecklistItem>
      <ChecklistItem>EP-9 — Construction &amp; environmental properties.</ChecklistItem>
      <ChecklistItem>EP-10 — Devices with measuring function.</ChecklistItem>
      <ChecklistItem>EP-11 — Protection against radiation.</ChecklistItem>
      <ChecklistItem>EP-12 — Software, electronic programmable systems, energy sources.</ChecklistItem>
      <ChecklistItem>EP-13 — Active devices and devices connected to them.</ChecklistItem>
      <ChecklistItem>EP-14 — Mechanical &amp; thermal risks.</ChecklistItem>
      <ChecklistItem>EP-15 — Devices delivering medicinal products / energy.</ChecklistItem>
      <ChecklistItem>EP-16 — Information supplied by the manufacturer (labelling, IFU).</ChecklistItem>
      <Footer productName={data.product_name} />
    </Page>

    {/* 8. Algorithm Change Protocol */}
    <Page size="A4" style={styles.page}>
      <SectionHeader kicker="SECTION 07" title="Algorithm Change Protocol" />
      <Placeholder>
        Content placeholder — populated by Opus call. Required for AI/ML SaMD
        per the Oct 2025 CDSCO SaMD draft. Skip if the device contains no
        adaptive or learning-enabled component.
      </Placeholder>
      <Text style={styles.h2}>Pre-Specifications (PCCP)</Text>
      <Text style={styles.body}>Placeholder — what the model is allowed to learn or change post-deployment.</Text>
      <Text style={styles.h2}>Algorithm Change Protocol</Text>
      <Text style={styles.body}>Placeholder — data sources, retraining cadence, validation gates, rollback policy.</Text>
      <Text style={styles.h2}>Real-World Performance Monitoring</Text>
      <Text style={styles.body}>Placeholder — drift detection, complaint signal handling, post-market surveillance loop.</Text>
      <Footer productName={data.product_name} />
    </Page>

    {/* 9. Glossary + References */}
    <Page size="A4" style={styles.page}>
      <SectionHeader kicker="SECTION 08" title="Glossary &amp; References" />
      <Text style={styles.h2}>Glossary</Text>
      <Bullet><Text>CDSCO — Central Drugs Standard Control Organisation, India&apos;s medical device regulator.</Text></Bullet>
      <Bullet><Text>MDR 2017 — Medical Devices Rules, 2017 (with subsequent amendments).</Text></Bullet>
      <Bullet><Text>SaMD — Software as a Medical Device.</Text></Bullet>
      <Bullet><Text>IMDRF — International Medical Device Regulators Forum.</Text></Bullet>
      <Bullet><Text>PCCP — Predetermined Change Control Plan, for adaptive AI/ML systems.</Text></Bullet>
      <Bullet><Text>DPDP — Digital Personal Data Protection Act, 2023.</Text></Bullet>
      <Bullet><Text>ABDM — Ayushman Bharat Digital Mission.</Text></Bullet>
      <Text style={styles.h2}>References</Text>
      <Bullet><Text>CDSCO Medical Devices Rules, 2017 (cdsco.gov.in).</Text></Bullet>
      <Bullet><Text>CDSCO Draft Guidance on SaMD, October 2025.</Text></Bullet>
      <Bullet><Text>IMDRF SaMD: Possible Framework for Risk Categorization (N12).</Text></Bullet>
      <Bullet><Text>ICMR Ethical Guidelines for AI in Healthcare, 2023.</Text></Bullet>
      <Bullet><Text>Digital Personal Data Protection Act, 2023.</Text></Bullet>
      <Footer productName={data.product_name} />
    </Page>
  </Document>
);

export default DraftPackDocument;
