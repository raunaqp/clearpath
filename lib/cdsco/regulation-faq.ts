/**
 * FAQ entries for the /regulations page. Three questions per regulation,
 * sourced from the founder questions ClearPath sees most often combined
 * with the published guidance from each authority.
 *
 * Citations point to the official authority URLs from
 * lib/cdsco/regulations-reference.ts. Wednesday's task: validate each
 * answer against a 2nd reference (consultant published guidance, MoH
 * circular, etc) and add an inline source link per Q where ambiguity
 * exists. For tonight, copy is conservative — uses 'likely', 'typically',
 * 'in most cases' so we're not claiming binary certainty.
 *
 * No verbatim quotation from any single source.
 */
import type { RegulationKey } from "@/lib/cdsco/regulations-reference";

export type FAQEntry = {
  q: string;
  a: string;
};

export const REGULATION_FAQ: Record<RegulationKey, FAQEntry[]> = {
  cdsco_mdr: [
    {
      q: "How do I know if my product is a 'medical device' under the MDR 2017?",
      a: "MDR 2017 covers any device, software or accessory intended for use in diagnosis, prevention, monitoring, treatment or alleviation of disease, injury or disability. If your product makes a clinical claim, supports a clinical decision, or measures a physiological parameter — it likely qualifies as a medical device. Wellness, fitness and lifestyle apps without clinical intent typically fall outside the scope, though the line is blurry for AI-driven 'health insights' tools.",
    },
    {
      q: "What's the difference between Class A/B and Class C/D applications?",
      a: "Class A (low risk, e.g. tongue depressors) and Class B (low-moderate risk, e.g. thermometers) go through the State Licensing Authority via Form MD-3 / MD-5. Class C (moderate-high risk) and Class D (high risk) go through the CDSCO Central Licensing Authority via Form MD-7. Most software-as-medical-device (SaMD) products in active clinical use fall in Class B or C; AI-driven diagnostic/screening tools often Class C.",
    },
    {
      q: "Do I need a clinical investigation (MD-12) before launching?",
      a: "Class A/B devices with substantial published clinical evidence may not require a fresh investigation. Class C/D devices typically do, especially novel or AI/ML products without an Indian predicate. The MD-12 test license is filed before the investigation and is usually a precursor to your manufacturing license. The 2025 SaMD draft also references MD-22 — supplementary clinical investigation approval — for adaptive AI/ML systems.",
    },
  ],
  cdsco_pharmacy: [
    {
      q: "When does CDSCO Pharmacy / Drugs apply to my digital product?",
      a: "If your product includes drug-device combinations (smart inhalers with paired drug formulations, drug-eluting devices, digital therapeutics that involve a regulated drug), or drug delivery components, the drugs side of CDSCO applies in addition to the medical-device pathway. Pure software products — even those that recommend medication — typically don't trigger this; they sit under MDR 2017.",
    },
    {
      q: "Does prescription guidance software fall under Pharmacy regulation?",
      a: "Software that suggests medications based on clinical inputs (dose calculators, drug-drug interaction alerts, prescribing decision support) is generally treated as a medical device under MDR 2017, not as a pharmacy product. The risk class depends on whether the software 'drives clinical management' (typically Class C) or 'informs clinical management' (typically Class B) per the IMDRF SaMD framework.",
    },
    {
      q: "Where do I submit drug-related approvals?",
      a: "Drug applications go through the CDSCO portal at cdsco.gov.in. The pathway differs by category — new drug applications, fixed-dose combinations, and biosimilars each have specific routes. For drug-device combinations, you'll typically need parallel filings with the Medical Devices side as well.",
    },
  ],
  dpdp: [
    {
      q: "When does DPDP Act 2023 apply to my product?",
      a: "DPDP applies to any business processing personal data of individuals in India. Health products almost always qualify because they handle identifiers (name, contact), health data, and often device-collected biometric data. Even if your servers are abroad, DPDP applies if you offer services to people in India. The Act came into force progressively after late 2023; rules and DPB notifications continue to roll out.",
    },
    {
      q: "What is a 'Significant Data Fiduciary' and do I need to appoint a DPO?",
      a: "Significant Data Fiduciaries (SDFs) are entities the Central Government notifies based on data volume, sensitivity (children's data, health data are sensitive), and risk to data subjects. SDFs must appoint a Data Protection Officer based in India, conduct periodic data protection impact assessments, and undergo independent data audits. Small startups handling routine health data may not be initially classified as SDFs but should plan as if they will be.",
    },
    {
      q: "How is DPDP different from HIPAA or GDPR?",
      a: "DPDP follows GDPR's structure (consent-based, data principal rights, data fiduciary obligations, regulator with penalty powers) but is lighter on prescriptive specifics. Unlike HIPAA, it's not health-specific — it applies to all personal data. Cross-border transfer rules are TBD via notified country lists. Penalties go up to ₹250 crore per breach. Tooling-wise: a GDPR-compliant product is a strong head start.",
    },
  ],
  icmr: [
    {
      q: "When do I need ICMR Ethics Committee (IEC) approval?",
      a: "Any clinical investigation involving human participants — whether for primary research, device validation, or AI model performance — requires prior approval from a registered Institutional Ethics Committee. This is independent of CDSCO regulatory approvals; you typically need both. IECs are registered with the Department of Health Research; check their registry to confirm a committee is empaneled before submitting.",
    },
    {
      q: "Do the ICMR AI in Healthcare Guidelines (2023) apply to my product?",
      a: "These guidelines cover any AI/ML system used in biomedical research or healthcare delivery — clinical decision support, diagnostic imaging AI, predictive risk scoring, AI-driven triage. They emphasize transparency, explainability, bias auditing, and clinician oversight. While currently advisory rather than binding, expect them to inform CDSCO's AI/ML SaMD pathway and ABDM data access decisions, so designing toward them is prudent.",
    },
    {
      q: "What does 'informed consent' mean for AI/ML products in clinical use?",
      a: "Beyond standard consent for data collection, the ICMR guidelines call for participants to understand: that AI/ML is being used, the limitations of the model, what happens when the model is wrong, and how their data may be used to improve future models. For prospective clinical investigations, this language is usually written into the patient information sheet your IEC reviews.",
    },
  ],
  abdm: [
    {
      q: "Do I need to integrate with ABDM to launch my product?",
      a: "Not for market entry — ABDM integration is voluntary today. But integration unlocks features patients increasingly expect: ABHA (Health ID) linking, federated health records, e-prescription via UHI. If your product is a Personal Health Record (PHR) app, lab/diagnostic system, or hospital information system, ABDM compatibility is becoming a procurement criterion for government-empaneled providers and many private hospitals.",
    },
    {
      q: "What's the difference between HIP and HIU registration?",
      a: "Health Information Provider (HIP): you generate clinical data others may consume (labs, hospitals, imaging centres). Health Information User (HIU): you consume data others have generated, typically for clinical decision-making (PHR apps, telemedicine platforms, secondary care providers). Many products are both. Each has its own compliance and consent flow obligations under the Health Data Management Policy.",
    },
    {
      q: "How do I get production credentials beyond the sandbox?",
      a: "Sandbox onboarding is self-service at sandbox.abdm.gov.in. Production credentials require demonstrating compliance with the Health Data Management Policy and successful completion of certification tests. Reach out to pm.adoption@nha.gov.in once your sandbox integration passes the conformance suite. Timeline from sandbox-pass to production: typically 4–8 weeks depending on category and current NHA queue depth.",
    },
  ],
  nabh: [
    {
      q: "Does NABH Digital Health Standards apply to my product?",
      a: "NABH accreditation applies to healthcare facilities (hospitals, labs) — not directly to your software. Your product becomes relevant when an NABH-accredited facility procures it: they need to confirm your product supports their accreditation requirements. The Digital Health Standards (2022) cover patient data security, interoperability, audit trails, role-based access — features that align closely with DPDP and ABDM requirements.",
    },
    {
      q: "Do I need NABH 'certification' as a software vendor?",
      a: "There's no formal NABH certification for software vendors at present. What exists is 'NABH-compatible' or 'NABH-aligned' positioning, which means demonstrating that your features support a hospital's accreditation. Some hospitals will ask for a self-attested NABH compatibility checklist as part of procurement diligence.",
    },
    {
      q: "How is NABH different from JCI or ISO 9001 in healthcare?",
      a: "NABH is the Indian national accreditation board for hospitals, set up by the Quality Council of India in 2005. JCI (Joint Commission International) is the global benchmark, mostly relevant for private tertiary hospitals serving international patients. ISO 9001 is a generic quality management standard. For India-only operations, NABH is the most relevant. For multinational hospital chains, JCI matters too.",
    },
  ],
  mci_telemed: [
    {
      q: "When do the Telemedicine Practice Guidelines apply?",
      a: "The 2020 NMC (formerly MCI) Telemedicine Practice Guidelines apply whenever a registered medical practitioner provides clinical care via telemedicine — video, audio, or text consult. If your product enables doctor-to-patient consultations, you're operating within this framework. Doctor-to-doctor case discussions are typically out of scope. Asynchronous AI triage that doesn't involve a real doctor making a clinical decision generally doesn't trigger these guidelines.",
    },
    {
      q: "Can a doctor prescribe medication during a telemedicine consult?",
      a: "Yes, with conditions. The doctor must have valid Indian medical registration. They can prescribe most medications (List O — over-the-counter, List A — for first-time consults if patient confirms identity, List B — refills for chronic conditions previously managed by the same doctor). Schedule X drugs and certain narcotic/psychotropic substances generally require an in-person consult. Maintaining medical records is mandatory.",
    },
    {
      q: "Where do I (the platform) need to register?",
      a: "Platforms enabling telemedicine don't have a separate central registration — but you do need to ensure every practising doctor on your platform has valid registration with their state medical council. Some states maintain telemedicine-specific advisories. State medical councils may require platform-level disclosure as the telemedicine market matures.",
    },
  ],
  irdai: [
    {
      q: "When does IRDAI apply to my health product?",
      a: "IRDAI regulates insurance products and intermediaries. Your product becomes relevant when it processes insurance claims (claims management software, TPA platforms), aggregates insurance products (web aggregators), or stores insurance-linked health data (insurance repositories). A pure clinical product — diagnostics, EHR, telemedicine — doesn't trigger IRDAI unless it integrates claims processing.",
    },
    {
      q: "What's a TPA and how is it different from a web-aggregator?",
      a: "Third Party Administrators (TPAs) handle claims processing and cashless authorization on behalf of insurers, with a license from IRDAI. Web aggregators compare and sell policies online; they hold a different IRDAI license. If your product does either, you need the appropriate IRDAI registration before launching commercially.",
    },
    {
      q: "Are insurance repositories regulated separately?",
      a: "Yes. Insurance Repository licenses are issued by IRDAI and only a small number of entities currently hold them. If your product stores insurance policy documents in a centralized way for consumers (e-insurance accounts), you're operating in IR territory and likely need either a partnership with an IR or your own license.",
    },
  ],
  nabl: [
    {
      q: "When do I need NABL accreditation?",
      a: "NABL accreditation applies to testing and calibration laboratories — clinical labs, diagnostic centres, calibration facilities for medical devices. If your product runs diagnostic tests on real patient samples in your own lab (e.g. as part of a validation study or as a service offering), you'll likely need NABL. Software-only products that interpret results from already-NABL-accredited labs don't need accreditation themselves.",
    },
    {
      q: "How long does NABL accreditation typically take?",
      a: "End-to-end timelines run 6–12 months for new applicants: documentation prep (1–3 months), application submission (1 month), document review (1–2 months), on-site assessment (1 day to 1 week), corrective actions (1–3 months), accreditation grant (1 month). Renewal is on a 2-year cycle and faster, typically 2–4 months. Build this into your launch plan if NABL is on your critical path.",
    },
    {
      q: "Is ISO 15189 the same as NABL?",
      a: "Closely related. NABL accreditation for medical labs is granted against ISO 15189 (the international standard for medical laboratories). NABL is the Indian accreditation body that audits compliance with ISO 15189. So 'NABL-accredited' implies 'ISO 15189-compliant,' but the formal accreditation in India is the NABL credential.",
    },
  ],
};
