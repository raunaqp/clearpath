# National Health Priorities (SERB / ANRF Annexure-III)

Source: SERB Annexure-III (https://serb.gov.in/assets/pdf/TRL_and_health_priority.pdf)

These are the national health priorities used by MAHA MedTech Mission for
prioritisation. **Per the MAHA MedTech FAQ Q19**: "for direct financial
support to private sector companies, MSMEs, and startups, the Mission will
prioritise technologies that impact communicable diseases, and woman and
child health and nutrition."

This list is used by ClearPath when:
1. Generating grant-readiness output (Tier 2 enhancement, future)
2. Suggesting MAHA MedTech eligibility on the readiness card
3. Matching a founder's product against priority disease areas

## Categories

### A. Communicable Diseases
1. Tuberculosis
2. Vector-borne disease
3. AMR (antimicrobial resistance)
4. Neglected tropical diseases
5. Epidemic and pandemic readiness

### B. Non-communicable Diseases
6. Cancer
7. Mental health
8. Ambulatory care

### C. Woman & Child Health and Nutrition
9. Anemia
10. Childhood malnutrition
11. Neonatal care (including neonatal respiratory distress, neonatal support technologies, broader neonatal care continuum)
12. Maternal health (antenatal, intrapartum, postpartum)
13. Women's health and reproductive health

### D. Acute Ambulatory Care
### E. Oral Health
### F. Primary Health Care
### G. AI in healthcare
### H. Cell and Gene Therapy (Rare genetic diseases)

## Priority tiers for funding

Per FAQ Q19:

- **Tier 1 — Highest priority** (private-sector funding emphasis):
  - All of Category A (communicable diseases)
  - All of Category C (woman & child health)
- **Tier 2** — Eligible but not prioritised for private-sector funding:
  - Categories B, D, E, F, G, H

## Code reference

When the grants module ships:
- `lib/engine/grants/health-priority-matcher.ts` will match a product's
  indication against this list
- A "MAHA MedTech alignment" badge can surface when alignment is detected
