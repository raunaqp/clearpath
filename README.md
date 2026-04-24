# ClearPath — Context for Claude Code

> Regulatory readiness engine + submission concierge for Indian digital health.
> Tagline: Clarity → Draft → Submission.

This folder contains every artefact needed to build ClearPath's MVP. Start here, then navigate to the specific doc you need.

---

## What you're building

A three-tier product for Indian healthtech founders navigating regulatory approval:

1. **Tier 0 — Free Readiness Card** (5 min, on-screen). One-page decision card: Risk / Readiness / Class / Top 3 gaps / Time-to-approval.
2. **Tier 1 — Regulatory Draft Pack** (₹499, delivered in ~10 min). Structured application draft mapped to CDSCO forms. Not filled PDFs — content ready to paste or hand to a consultant.
3. **Tier 2 — Submission Concierge** (₹25K, 2–3 weeks expert-reviewed). Document refinement + classification validation + QMS guidance + 1 iteration.

**What this is NOT:** a form generator. A generic LLM wrapper. A consultant directory.

**What it IS:** an engine that understands Indian digital-health regulation across 9 bodies (CDSCO MDR, CDSCO Pharmacy, DPDP, ICMR, ABDM, NABH, MCI Telemed, IRDAI, NABL), calibrated on 15+ real products, with honest certainty language.

---

## Document map

Read in this order:

| Step | Doc | Purpose |
|------|-----|---------|
| 1 | `clearpath_engine_spec_v3.md` | **Authoritative engine spec.** Start here. |
| 2 | `clearpath_regulations.md` | Deep reference on the 9 regulations |
| 3 | `clearpath_output_schemas.md` | All JSON schemas (pre-router, decomposer, Tier 0/1/3) |
| 4 | `clearpath_decomposer_spec.md` | Sub-feature router prompt + logic |
| 5 | `clearpath_timeline_model.md` | Time-to-approval estimation anchored to CDSCO SLAs |
| 6 | `clearpath_build_scope.md` | **Phase 1/2/3 build scope + architecture diagram** |
| 7 | `clearpath_landing_copy.md` | Landing page content + design rationale |
| 8 | `ClearPath_Deck.pptx` | Stakeholder deck (16 slides) |
| 9 | `ClearPath_Risk_Matrix.xlsx` | Calibration data for 15 startups |

---

## Engineering philosophy

Six non-negotiables that should drive every decision:

1. **Honesty over confidence.** Never sound more certain than the regulator. The certainty language rules in `engine_spec_v3.md` §5 are enforced at output time — a post-processor should catch and soften any "required / must / will."

2. **Scrape is ground truth.** When the one-liner and the website disagree, surface the conflict. Don't silently pick. Founders self-describe in investor-deck language that masks regulatory exposure.

3. **Sub-feature scoping is a first-class flow.** 29% of real Indian healthtech products have a hidden SaMD feature inside a non-medical-device platform. The decomposer is the most valuable module — invest in getting it right.

4. **Readiness ≠ Risk.** They are separate metrics. Surface both. Never conflate them into a single score.

5. **9 regulations, every time.** Every output includes a verdict on all 9 — even if 7 are `not_applicable`. This is the compound intelligence moat.

6. **Ship Tier 0 + 1 first. Tier 3 as waitlist.** Don't over-promise delivery on expert review at Weekender. The ₹25K tier opens once the expert panel is set up.

---

## Priority order for Phase 1 (by Apr 27)

1. Landing page with intake form
2. Pre-router → wizard → card (single flow for `product` type)
3. Decomposer + scope picker (for `platform` type)
4. Scrape reconciler + conflict UI
5. Tier 0 Readiness Card rendering (must match spec exactly)
6. Share URL + OG image generation
7. Razorpay Payment Link integration
8. Tier 1 Draft Pack generator + PDF + email delivery
9. Tier 3 waitlist form

Everything else is post-Weekender.

---

## Calibration reference

Use these as test cases. Each has a known correct classification from our calibration work:

| Test case | Expected MD? | Expected Class | Expected Risk | Notes |
|-----------|--------------|----------------|---------------|-------|
| Eka Care platform | No | N/A | Low | Pure PHR/ABDM |
| EkaScribe sub-feature | Feature | B/C scoped | High | Hidden SaMD inside Eka Care |
| Vyuhaa/CerviAI | Yes | C (IVD-SaMD) | High | One-liner said "data platform," scrape reveals cancer screening |
| Neodocs | Yes | C (IVD) | High | Hardware + app |
| Niramai | Yes | C | High | Already CDSCO approved |
| Forus Health | Hardware | D | Medium | Large-scale deploy |
| Driefcase | No | N/A | Low | Records locker |
| Khushi Baby | Hybrid | B scoped | Medium | NCD screening workflow |
| Intelehealth | Feature | C AI-CDS | Medium | Telemed + AI-CDS scoped |
| Bajaj Finserv Health | No | N/A | Low | Aggregator + IRDAI |
| ABDM | Meta | — | — | Rejected by pre-router |
| Tata 1mg | Features | B scoped | Medium | Pharmacy, not MDR |
| HealthifyMe | No | N/A | Low | Wellness carve-out |
| Ultrahuman | Hardware | scoped | Low | Wellness; CGM is Abbott's license |
| Biopeak | Yes | C novel | High | Export-heavy, no predicate |
| Rainmatter | Meta | — | — | Rejected by pre-router |

Full data in `ClearPath_Risk_Matrix.xlsx`.

---

## Brand system

**Palette:**
- Primary: Deep teal `#0F6E56`
- Primary light: `#E1F5EE`
- Amber accent: `#BA7517`
- Amber light: `#FAEEDA`
- Coral (for high-risk): `#993C1D`
- Coral light: `#FAECE7`
- Green dark (low-risk): `#3B6D11`
- Green light: `#EAF3DE`
- Gray 900: `#1A1A1A` (body text)
- Gray 500: `#5F5E5A` (muted)
- White: `#FFFFFF`

**Typography:**
- Headings: Georgia / Playfair Display (serif, for gravitas)
- Body: Inter / Calibri (sans, for readability)

**Tone of voice:**
- Direct, founder-to-founder
- Never "cutting-edge" or "innovative"
- Softer than the regulator ("likely," "may apply," "typically")
- Evidence-based ("based on CDSCO published SLAs")
- Empathetic to the founder's position, honest about the complexity

**Component style:**
- Rounded corners on cards
- Color-coded severity bands (high/med/low)
- Badges for MD? / Class / Timeline / Risk
- Monochromatic icons (no stock illustrations)

---

## What Claude Code should ask if stuck

1. **Tier 0 card format uncertainty** → read `engine_spec_v3.md` §6
2. **Which regulation to check** → read `regulations.md`
3. **Decomposer logic** → read `decomposer_spec.md`
4. **Output JSON shape** → read `output_schemas.md`
5. **What to build this week** → read `build_scope.md` Phase 1 section
6. **Landing page copy** → read `landing_copy.md`
7. **Timeline numbers** → read `timeline_model.md`

---

## Prompt engineering notes

Every Claude API call follows these conventions:
- System prompt has 3 sections: role + input format + output format
- Examples: 2–3 calibrated test cases (pull from the calibration list)
- Output: strict JSON, no preamble, matches `output_schemas.md` exactly
- Temperature: 0.3 for classification, 0.7 for draft content generation
- Model: `claude-opus-4-7` for engine synthesis (best reasoning), `claude-sonnet-4-6` for scrape/decomposer (fast + cheap)
- Retry on JSON parse failure with "output strict JSON only" reminder

---

## Success criteria for Phase 1

Shippable MVP by Apr 27 means:
- A founder can go from landing → free card in 5 minutes
- A founder can pay ₹499 and receive a draft pack PDF in under 15 minutes
- All 9 regulations evaluated in every output
- Three archetype test cases all produce the expected classification: **CerviAI (pure device), EkaScribe (hidden sub-feature), HealthifyMe (clean N/A)**
- Tier 3 waitlist accepts submissions without payment
- Honest certainty language in every output

---

## Contacts

- Founder: [your name here]
- Design partner: Dhritiman Mallick, Vyuhaa Med Data (CerviAI)
- Distribution partner: Bhaskar, Karnataka Medtech Cluster

Build in this order. Ask when stuck. Ship.

---

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
./deploy.sh     # deploy to Vercel + alias to clearpath-medtech.vercel.app
```

Create `.env.local` with: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`. See [`docs/CLAUDE_CODE_HANDOFF.md`](./docs/CLAUDE_CODE_HANDOFF.md) for the full list.

Specs in [`docs/specs/`](./docs/specs/) · change logs in [`docs/change-logs/`](./docs/change-logs/) · pptx / xlsx / images in [`docs/reference/`](./docs/reference/).
