/**
 * FAQ entries for the /regulations page. 4-5 questions per regulation,
 * structured around: Why does this apply? · What does compliance look
 * like? · How do I start? · plus a couple of frequent founder questions.
 *
 * Sources (as of May 2026):
 *   - CDSCO MDR: official CDSCO FAQs (cdsco.gov.in/MDfAq24.pdf and
 *     IVD MDR FAQ); MDR 2017 Schedule II; CDSCO Sugam portal docs.
 *   - DPDP: DPDP Act 2023 + DPDP Rules 2025 (G.S.R. 846(E),
 *     13 Nov 2025); MeitY notification PIB statement; published
 *     Indian data-protection commentary.
 *   - ABDM: National Health Authority sandbox docs
 *     (sandbox.abdm.gov.in); NHA approved MVP document v2.0.
 *   - ICMR: ICMR 2023 Ethical Guidelines for Application of AI in
 *     Biomedical Research and Healthcare; ICMR EC registry.
 *   - NABL: NABL India accreditation FAQs; ISO 15189 standard.
 *   - NABH: NABH Digital Health Standards (2022).
 *   - Telemedicine: 2020 Board of Governors / NMC Telemedicine
 *     Practice Guidelines.
 *   - IRDAI: consolidated IRDAI regulations on TPAs, web
 *     aggregators, insurance repositories.
 *
 * Conservative copy: 'likely', 'typically', 'in most cases' rather
 * than absolute claims. The official URL on each regulation card is
 * the authoritative reference.
 */
import type { RegulationKey } from "@/lib/cdsco/regulations-reference";

export type FAQEntry = {
  q: string;
  a: string;
  /** Optional tag for filter UI (why/what/how/scope/cost). Wednesday: tag every entry. */
  tag?: "why" | "what" | "how" | "scope" | "cost";
};

export const REGULATION_FAQ: Record<RegulationKey, FAQEntry[]> = {
  cdsco_mdr: [
    {
      q: "Why does CDSCO MDR 2017 apply to my product?",
      a: "Since April 2020, all medical devices in India are regulated as drugs under the Drugs & Cosmetics Act 1940 read with the Medical Devices Rules 2017. Any device, software, or accessory intended for diagnosis, prevention, monitoring, treatment, or alleviation of disease falls within scope. Class A non-sterile / non-measuring devices are exempt from licensing but still need self-certification; everything else needs a CDSCO licence before commercial supply.",
    },
    {
      q: "What's the difference between Class A/B and Class C/D applications?",
      a: "Class A (low risk) and Class B (low–moderate risk) go through the State Licensing Authority via Form MD-5 (manufacture) or MD-15 (import). Class C (moderate–high) and Class D (high) go through the CDSCO Central Licensing Authority via Form MD-7 (manufacture) or MD-15 (import). Most software-as-medical-device (SaMD) products in active clinical use fall in Class B or C; AI-driven diagnostic / screening tools typically Class C.",
    },
    {
      q: "How long does the licensing process take?",
      a: "For Class C/D manufacturing licences, CDSCO is required to inspect within 60 days of application, but end-to-end timelines run 6–9 months in practice — and that's exclusive of any time you take to respond to queries. Import licences (Form MD-15) have a 9-month statutory timeline. Manufacturing and import licences, once granted, are valid in perpetuity subject to a retention fee paid every 5 years.",
    },
    {
      q: "Do I need a clinical investigation (Form MD-12) before I launch?",
      a: "Class A/B devices with substantial published safety and performance data may not require a fresh investigation. Class C/D devices typically do — particularly novel or AI/ML SaMD products without an Indian predicate. The MD-12 test licence is filed before the investigation begins and is the standard precursor to your manufacturing licence application. The October 2025 CDSCO SaMD draft additionally references MD-22 — supplementary clinical investigation approval — for adaptive AI/ML systems.",
    },
    {
      q: "Is ISO 13485 mandatory for the manufacturing licence?",
      a: "Per the CDSCO 2025 FAQ addendum, ISO 13485:2016 is recognised but is not strictly mandatory for the licence itself. What is mandatory is conformance with Schedule V of MDR 2017 (the QMS schedule), which is broadly aligned with ISO 13485. In practice, almost every applicant chooses ISO 13485 certification because it is the simplest way to demonstrate Schedule V conformance to a Medical Device Officer during inspection.",
    },
  ],

  cdsco_pharmacy: [
    {
      q: "Why would CDSCO Pharmacy / Drugs apply to a digital product?",
      a: "If your product includes drug–device combinations (smart inhalers paired with regulated drug formulations, drug-eluting devices, digital therapeutics tied to a regulated drug) or drug delivery components, the drugs side of CDSCO applies in addition to the medical-device pathway. Pure software products — even those that recommend medication — typically don't trigger this; they sit under MDR 2017.",
    },
    {
      q: "What about prescription guidance software?",
      a: "Software that suggests medications based on clinical inputs (dose calculators, drug-interaction alerts, prescribing decision support) is generally treated as a medical device under MDR 2017, not as a pharmacy product. The risk class depends on whether the software 'drives clinical management' (typically Class C) or 'informs clinical management' (typically Class B) per the IMDRF SaMD framework.",
    },
    {
      q: "How do I file drug-related approvals?",
      a: "Drug applications go through the CDSCO Sugam portal at cdsco.gov.in. The pathway differs by category — new drug applications, fixed-dose combinations, biosimilars, and clinical trial approvals each have specific routes governed by the New Drugs and Clinical Trials Rules, 2019. For drug-device combinations, you'll typically need parallel filings on both the drugs side and the medical-devices side.",
    },
    {
      q: "What if my product just connects to a drug — like a smart pill bottle?",
      a: "Connected accessories that don't deliver drugs and don't make clinical claims are usually outside the drugs scope. A reminder app or adherence tracker is not a drug. But if your product gates access to a drug, dispenses or doses a drug, or makes claims about therapeutic outcomes, expect to be treated as a drug-device combination — and the burden of proof shifts onto you to demonstrate it is purely an accessory.",
    },
  ],

  dpdp: [
    {
      q: "Why does DPDP Act 2023 apply to my product?",
      a: "DPDP applies to any business that processes the personal data of individuals in India. Health products almost always qualify because they handle identifiers (name, contact), health data, and often device-collected biometric data. The Act also applies extra-territorially: foreign entities offering services to data principals in India are in scope. The DPDP Rules 2025, notified on 13 November 2025 by MeitY, set the operational detail.",
    },
    {
      q: "What's the compliance deadline?",
      a: "The Rules notification kicked off a phased implementation. Most substantive obligations — consent flows, breach reporting, data principal rights, security safeguards, SDF-specific duties — must be in place by 13 May 2027 (18 months from notification). The Data Protection Board itself was set up immediately. There is no formal grace period after the May 2027 deadline.",
    },
    {
      q: "What is a Significant Data Fiduciary, and might I become one?",
      a: "Significant Data Fiduciaries (SDFs) are entities the Central Government separately notifies based on data volume, sensitivity (children's data, health data), and risk to data subjects. SDFs must appoint a Data Protection Officer based in India, run an annual Data Protection Impact Assessment, undergo independent data audits, and may face data-localisation restrictions for specified categories. As of early 2026 the official SDF list has not been published, but any health-data company processing at scale should plan to be on it.",
    },
    {
      q: "How does DPDP differ from HIPAA or GDPR?",
      a: "DPDP follows GDPR's general structure (consent-based, data principal rights, fiduciary obligations, regulator with penalty powers) but is lighter on prescriptive specifics. Unlike HIPAA, it isn't health-specific — it covers all personal data. Penalties are capped at Rs 250 crore per breach (Rs 150 crore specifically for SDF obligation breaches), which is large in absolute terms but doesn't scale to global revenue the way GDPR's 4% cap does.",
    },
    {
      q: "Can I store Indian health data outside India?",
      a: "Generally yes. DPDP takes a permissive approach to cross-border transfers — data may go to any country except those the Central Government places on a 'negative list.' As of early 2026, no countries have been notified. For SDFs, however, the Government can mandate localisation of specific categories of personal data (and the metadata about its flow), based on recommendations from a designated committee. Build for portability so you can flip a switch if your category is later restricted.",
    },
  ],

  icmr: [
    {
      q: "Why does ICMR matter to my product?",
      a: "Any clinical investigation involving human participants — whether for primary research, device validation, or AI model performance — requires prior approval from a registered Institutional Ethics Committee (IEC). This is independent of CDSCO regulatory approvals; you typically need both. ICMR sets the substantive ethical framework Indian IECs apply, and IECs themselves are registered with the Department of Health Research.",
    },
    {
      q: "What do the ICMR AI in Healthcare Guidelines (2023) require?",
      a: "These guidelines cover any AI/ML system used in biomedical research or clinical care — clinical decision support, diagnostic imaging AI, predictive risk scoring, AI triage. They emphasise transparency about model limitations, bias auditing across population subgroups, explainability, and continued clinician oversight. Currently advisory rather than binding, but expect them to inform CDSCO's evolving SaMD pathway and ABDM data-access decisions, so designing toward them is prudent.",
    },
    {
      q: "How do I get IEC approval?",
      a: "Identify a registered IEC empanelled with the Department of Health Research (their registry is searchable online), then submit your protocol, investigator's brochure, informed consent forms, and risk assessment. For multi-site studies you need approval from the IEC at each site, plus prospective registration on the Clinical Trials Registry – India (CTRI) before enrolment. Timelines vary widely — 4–12 weeks per IEC depending on meeting cadence and queries.",
    },
    {
      q: "What does informed consent mean for AI/ML products?",
      a: "Beyond standard consent for data collection, the ICMR 2023 guidelines call for participants to understand: that an AI/ML system is being used in their care or research, the limitations of the model, what happens when the model is wrong, and whether their data may be used to improve future model versions. This language is normally written into the patient information sheet your IEC reviews.",
    },
    {
      q: "Do I need an IEC even if my AI just runs on retrospective anonymised data?",
      a: "Often yes. Most Indian IECs require review for retrospective studies on identifiable or pseudonymised clinical data. Truly de-identified, fully anonymised public datasets sometimes qualify for waiver of consent, but the IEC still typically reviews the protocol to confirm. Don't assume retrospective = no IEC; assume IEC, then the IEC will tell you the exemption category that applies.",
    },
  ],

  abdm: [
    {
      q: "Why might ABDM matter to my product?",
      a: "ABDM is voluntary at the Government level, so integration is not strictly required for market entry. But it is becoming a procurement criterion — government-empanelled hospitals, Ayushman Bharat scheme providers, and many private chains increasingly expect ABDM-ready software. If your product is a PHR app, EHR/HIS, lab system, or telemedicine platform, ABDM compatibility is increasingly a default expectation in tender responses.",
    },
    {
      q: "What's the difference between HIP, HIU, HRP, and HFR?",
      a: "Health Information Provider (HIP): you generate clinical data others may consume — labs, hospitals, imaging centres. Health Information User (HIU): you consume data others have generated — PHR apps, telemedicine, secondary care, insurance. Health Repository Provider (HRP): a software vendor whose platform enables many facilities to act as HIPs/HIUs — e.g. an HMS or LIMS provider. Health Facility Registry (HFR): the national registry where facilities themselves register. Many products fit multiple roles.",
    },
    {
      q: "How do I get production credentials?",
      a: "The path is: (1) self-onboard at sandbox.abdm.gov.in, (2) pick your role — HIP, HIU, HRP — and integrate against the sandbox APIs (OAuth, FHIR, consent manager), (3) get your application certified — functional testing report plus Web Application Security Assessment by a CERT-In empanelled agency, (4) demo the workflows to an NHA panel via the sandbox exit form, then receive production keys. End-to-end: typically 2–4 months for a competent backend team. For implementation help: pm.adoption@nha.gov.in.",
    },
    {
      q: "What's ABHA and do my users need it?",
      a: "ABHA (Ayushman Bharat Health Account) is a free 14-digit unique health identity, plus an optional username-style ABHA address (name@abdm). Patients use it to consent-share records across HIPs and HIUs. Whether your users need it depends on what your product does — a telemedicine product publishing prescriptions to ABDM needs the patient's ABHA; a wellness app may not. ABHA creation is patient-facing and self-service.",
    },
    {
      q: "How does ABDM relate to DPDP?",
      a: "ABDM operates under the Health Data Management Policy, which itself sits within DPDP's broader framework once that act is fully in force. Practically: ABDM's consent manager is one of the few production-grade consent infrastructures in India, and being ABDM-compliant gives you a head start on DPDP consent flows. They are not substitutes — DPDP applies to all your personal data; ABDM applies to the specific data you exchange across the network.",
    },
  ],

  nabh: [
    {
      q: "Why might NABH apply to my product?",
      a: "NABH (the National Accreditation Board for Hospitals & Healthcare Providers, set up by QCI in 2005) accredits hospitals and labs, not software. NABH becomes relevant for your product when an accredited facility procures it: the hospital needs your software to support, not undermine, its accreditation. Their Digital Health Standards (2022) cover patient data security, interoperability, audit trails, and role-based access — features overlapping with DPDP and ABDM.",
    },
    {
      q: "Do I need NABH 'certification' as a software vendor?",
      a: "There is no formal NABH certification for software vendors today. What exists in practice is 'NABH-compatible' or 'NABH-aligned' positioning — demonstrating that your features support a hospital's accreditation. Most procurement asks for a self-attested compatibility checklist mapping your features against the relevant NABH chapters; some hospitals require a vendor questionnaire as part of due diligence.",
    },
    {
      q: "How is NABH different from JCI or ISO 9001?",
      a: "NABH is the Indian national accreditation board for hospitals. JCI (Joint Commission International) is the global benchmark — relevant for private tertiary hospitals serving international patients but uncommon in mid-tier hospitals. ISO 9001 is a generic quality management standard with no healthcare specificity. For India-only operations, NABH is the most relevant; for multinational hospital chains targeting medical tourism, JCI matters too.",
    },
    {
      q: "What if my customers aren't NABH-accredited?",
      a: "Then NABH probably isn't on your immediate critical path. Focus on DPDP and (if you process clinical data) CDSCO MDR. NABH becomes important when you start selling into the larger accredited hospitals or government schemes that prefer NABH-empanelled providers. It's typically a 'next-stage' compliance, not a launch-blocker.",
    },
  ],

  mci_telemed: [
    {
      q: "Why do the Telemedicine Practice Guidelines apply?",
      a: "The 2020 Telemedicine Practice Guidelines (originally issued by the Medical Council of India, now governed by the National Medical Commission) apply whenever a registered medical practitioner provides clinical care via telemedicine — video, audio, or text consult. If your product enables doctor-to-patient consultations, you operate within this framework. Doctor-to-doctor case discussions are typically out of scope. Asynchronous AI triage that doesn't involve a real doctor's clinical decision usually doesn't trigger the guidelines.",
    },
    {
      q: "What can a doctor prescribe during a tele-consult?",
      a: "Subject to the doctor having valid Indian medical registration, the guidelines define three drug lists. List O (over-the-counter): freely prescribable. List A (for first-time consults): prescribable if the doctor confirms patient identity. List B (refills for chronic conditions previously managed by the same doctor): prescribable. Schedule X drugs and certain narcotic / psychotropic substances generally require an in-person consult. Maintaining medical records is mandatory regardless of the channel.",
    },
    {
      q: "How does the platform itself need to be set up?",
      a: "Platforms enabling telemedicine don't have a separate central registration today — but you must ensure every practising doctor on your platform has valid registration with their state medical council. Confirm this at onboarding and on a periodic basis. Some states publish telemedicine-specific advisories; track those for your priority geographies. Patient consent for the consult and clear disclosure of fees are mandatory.",
    },
    {
      q: "What about AI symptom-checkers or pre-consult triage?",
      a: "If the AI provides general health information without a doctor making a clinical decision, the telemedicine guidelines typically don't apply — though DPDP and consumer-protection laws still do. The moment your flow connects the patient to a registered medical practitioner who provides advice, the guidelines kick in: that consultation must follow the same standards as an in-person visit, including consent, identity verification, and record-keeping.",
    },
  ],

  irdai: [
    {
      q: "Why would IRDAI apply to my health product?",
      a: "IRDAI regulates insurance products and intermediaries. Your product becomes IRDAI-relevant when it processes insurance claims (claims management software, TPA platforms), aggregates insurance products (web aggregators), or stores insurance-linked health data (insurance repositories). A pure clinical product — diagnostics, EHR, telemedicine — doesn't trigger IRDAI unless it integrates claims processing.",
    },
    {
      q: "What is a TPA, and how is it different from a web aggregator?",
      a: "Third Party Administrators (TPAs) handle claims processing and cashless authorisation on behalf of insurers, under an IRDAI licence governed by the IRDAI (TPA – Health Services) Regulations 2016 (and subsequent amendments). Web aggregators compare and sell policies online under the IRDAI (Insurance Web Aggregators) Regulations 2017. If your product does either at commercial scale, you typically need the matching IRDAI registration before launch.",
    },
    {
      q: "How are insurance repositories regulated?",
      a: "Insurance Repository licences are issued separately by IRDAI and only a small number of entities currently hold them. If your product stores insurance policy documents in a centralised way for consumers ('e-insurance accounts'), you're operating in IR territory and likely need either a partnership with an existing IR or your own licence — the latter is operationally heavy.",
    },
    {
      q: "What about NHCX — National Health Claims Exchange — under ABDM?",
      a: "NHCX is ABDM's national health-claims exchange that lets payers (insurers, TPAs) and providers (hospitals, labs) interoperate using a common protocol. It sits in the ABDM ecosystem, not under IRDAI directly, but it interacts with IRDAI-licensed entities. If your product participates in NHCX as a payer-side or provider-side integrator, you'll touch both ABDM technical standards and IRDAI registration requirements depending on what role you play.",
    },
  ],

  nabl: [
    {
      q: "Why would I need NABL accreditation?",
      a: "NABL accreditation applies to testing and calibration laboratories — clinical labs, diagnostic centres, calibration facilities for medical devices. If your product runs diagnostic tests on real patient samples in your own lab (whether as part of validation studies or as a service offering), you'll likely need NABL accreditation for that lab. Software-only products that interpret results from already-NABL-accredited labs don't need accreditation themselves.",
    },
    {
      q: "What's the relationship between NABL and ISO 15189?",
      a: "Closely related. NABL accreditation for medical laboratories is granted against ISO 15189, the international standard for quality and competence in medical labs. NABL is the Indian accreditation body that audits compliance with ISO 15189 (and a few related standards like ISO 17025 for calibration labs). 'NABL-accredited' implies ISO 15189-compliant; the accreditation credential issued in India is the NABL one.",
    },
    {
      q: "How long does NABL accreditation take?",
      a: "End-to-end timelines run 6–12 months for new applicants: documentation prep (1–3 months), application submission (~1 month), document review (1–2 months), on-site assessment (1 day to 1 week), corrective actions (1–3 months), accreditation grant (~1 month). Renewal runs on a 2-year cycle and is faster — typically 2–4 months. Build NABL into your launch plan early if it sits on your critical path.",
    },
    {
      q: "Do I need NABL just for ground-truth labelling?",
      a: "If you're generating ground-truth labels for an AI training or validation dataset, the labs you partner with should ideally be NABL-accredited (ISO 15189) — particularly for studies that may end up in your CDSCO clinical evaluation report. CDSCO reviewers favour data from accredited labs. You don't need NABL yourself, but your partner labs should be accredited where the standard exists for the test in question.",
    },
  ],
};
