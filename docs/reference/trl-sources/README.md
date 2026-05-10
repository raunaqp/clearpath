# TRL Source Documents

Reference data for the TRL (Technology Readiness Level) framework used in
ClearPath. The framework is anchored to SERB / ANRF / MAHA MedTech Mission —
the same vocabulary BIRAC, DST and IKP use when evaluating medtech funding.

## Why this exists

The TRL framework is not knowledge Claude has reliably; it is a specific
Indian government framework (medical-device-anchored, CDSCO-form-anchored)
that differs from NASA/EU TRL. We commit the source documents so:

1. Future Claude sessions can read them directly without re-fetching
2. The framework definitions in `lib/engine/trl.ts` stay traceable to
   the authoritative source (no hallucination)
3. If the framework updates, we know which file to re-pull

## What lives here

| File | Source | What it contains |
|------|--------|------------------|
| `serb_trl_health_priority.pdf` | https://serb.gov.in/assets/pdf/TRL_and_health_priority.pdf | Annexure-II — TRLs for medical devices and IVDs (the canonical 9-level framework, both investigational and predicate tracks). Anchored to MD-12, MD-13, MD-22/24, MD-23/25, MD-26/28, MD-27/29 forms. |
| `maha_medtech_faqs.html` | https://anrfonline.in/ANRF/maha_medTech?HomePage=New | MAHA MedTech Mission FAQs — Q35 in particular maps each TRL stage to required CDSCO submission evidence. Funding range: ₹5–25 cr (up to ₹50 cr exceptional). TRL 3–8 eligible. TRL 9 (commercialised) NOT eligible. |
| `national_health_priorities.md` | SERB Annexure-III | List of national health priorities (TB, AMR, cancer, mental health, maternal health, etc.) used by MAHA MedTech for prioritisation |

## How to fetch

These files were not committed in the initial spec because the build
environment's network was restricted. Run:

```bash
cd docs/reference/trl-sources
curl -L -o serb_trl_health_priority.pdf "https://serb.gov.in/assets/pdf/TRL_and_health_priority.pdf"
curl -L -o maha_medtech_faqs.html "https://anrfonline.in/ANRF/maha_medTech?HomePage=New"
```

Then commit. The file `lib/engine/trl.ts` has full citations to each section
of these documents — the code is the canonical encoding of the framework, the
PDFs are the source of truth.

## When to update

- SERB/ANRF revises Annexure-II (re-fetch + diff against `lib/engine/trl.ts`)
- MAHA MedTech opens a new call (re-fetch FAQs; check eligibility ranges
  haven't shifted)
- New national health priority added (update `national_health_priorities.md`)

## Related code

- `lib/engine/trl.ts` — TypeScript encoding of the framework
- `lib/engine/synthesizer-system-prompt.ts` — TRL rubric inside the Opus prompt
- `components/card/TRLBlock.tsx` — visual rendering
- `docs/specs/clearpath_trl_spec.md` — full spec
