# Tier 1 smart examples — seed snippets for review

**Purpose:** drives Section 6 (Smart Examples) of the ₹499
Regulatory Readiness Report. Each entry is a curated good-vs-bad
wording pair the founder can copy as a model for their own
intended use, claim, and risk-justification language.

**Boundary (do not violate):** these are SNIPPETS, not forms. The
report never reconstructs an MD-7 / IFU / DMF — that's Tier 2
(Submission Workspace). If you find yourself wanting to add a
full-form example here, escalate to the Tier 2 product instead.

**Review status:** every entry is `estimate`. Founder or the CDSCO
consultant signs off on each pair (good wording + bad wording +
why-safer framing) before launch. Snippets matter — getting these
wrong looks like generic-ChatGPT output and undermines the moat.

**Mechanics:**
- The generator filters by `{cdsco_class, ai_ml_flag}` and selects
  3 examples (one per category, ordered by weight).
- The Opus call tailors each `why_this_is_safer_seed` to the
  specific product — the snippet pairs themselves are static.
- Source of truth: `lib/engine/tier1-smart-examples-library.ts`.

---

## Library

### Intended Use category

| Key | Topic | Applies to | Weight | Status |
|---|---|---|---|---|
| `intended_use_ai_cds_scoped` | Scoped vs. autonomous Intended Use | AI/ML · Class B/C/D | 10 | estimate |
| `intended_use_non_ai_assistive` | Concrete user + setting + function | Any · Class A/B/C/D | 8 | estimate |

### Claim Wording category

| Key | Topic | Applies to | Weight | Status |
|---|---|---|---|---|
| `claim_wording_performance` | Performance claim with study basis | AI/ML · Class B/C/D | 9 | estimate |
| `claim_wording_indication` | Indication scope vs. label creep | Any · Class B/C/D | 8 | estimate |

### Risk Justification category

| Key | Topic | Applies to | Weight | Status |
|---|---|---|---|---|
| `risk_justification_false_negative` | False-negative risk justification | AI/ML · Class B/C/D | 9 | estimate |
| `risk_justification_residual` | Residual risk acceptance | Any · Class B/C/D | 7 | estimate |

---

## Worked example — Alzheimer's MRI screening (Class C · AI-CDS)

The generator's selection (3 examples, one per category, ordered by weight):

1. **Scoped vs. autonomous Intended Use** (AI-CDS, Class C, weight 10)
2. **Performance claim with study basis** (AI-CDS, Class C, weight 9)
3. **False-negative risk justification** (AI-CDS, Class C, weight 9)

This gives the Alzheimer's-MRI founder one strong example per
section of the spec's reviewer concerns.

---

## Snippet content (full text, for review)

### `intended_use_ai_cds_scoped`

**Good:**
> The device assists radiologists by flagging brain-MRI studies
> with imaging features suggestive of early-stage Alzheimer's,
> presented as an advisory output for clinician review. It does
> not perform autonomous diagnosis; the radiologist remains the
> responsible decision-maker.

**Bad:**
> The device automatically diagnoses Alzheimer's disease from
> brain-MRI scans and generates a final diagnostic report.

**Why safer (seed):** the first phrasing explicitly scopes the
device as advisory and names the clinician as the responsible
decision-maker — both expectations under the Oct 2025 CDSCO SaMD
draft. The second phrasing claims autonomous diagnosis, typically
pushing the device into a stricter class and inviting reviewer
questions on how clinician oversight is enforced.

### `claim_wording_performance`

**Good:**
> In a retrospective evaluation on a held-out test set of [N]
> cases at [centre], the device demonstrated [sensitivity]%
> sensitivity and [specificity]% specificity at the operating
> point [threshold]. Performance on prospective Indian-population
> data is pending.

**Bad:**
> The device achieves expert-level accuracy in detecting
> Alzheimer's from brain MRI scans.

**Why safer (seed):** the first phrasing names the study type,
sample, centre, operating point, and what is still pending. The
second uses an unverifiable comparator ('expert-level') and an
unbounded claim ('detecting Alzheimer's'). Reviewers typically
ask for the study report behind any performance claim before
clearing the submission.

### `risk_justification_false_negative`

**Good:**
> Hazard: missed early-stage Alzheimer's signal. Hazardous
> situation: clinician deprioritises further work-up based on a
> negative device output. Harm: delayed treatment of a missed
> case. Mitigation: device output framed as advisory only;
> clinical workflow requires independent radiologist read;
> operating point set to favour sensitivity (typically published
> sensitivity ≥ X%); residual risk monitored under PMS.

**Bad:**
> The device is highly accurate and reliable, so false negatives
> are unlikely.

**Why safer (seed):** the first phrasing follows ISO 14971's
hazard → situation → harm chain, names the mitigation steps, and
acknowledges residual risk under PMS. The second handwaves the
risk and provides no auditable trail — reviewers will likely
treat it as a non-answer and ask for the underlying analysis.

---

## Per-row review notes

- **`intended_use_ai_cds_scoped`** — references the Oct 2025
  CDSCO SaMD draft. Verify the framing against the latest version
  before launch.
- **`claim_wording_performance`** — bracketed `[N] / [centre] /
  [threshold]` are deliberate placeholders to keep the snippet
  generic. Renderer leaves them as-is so founders see the shape
  they must populate.
- **`risk_justification_false_negative`** — Alzheimer's-specific
  framing. For non-Alzheimer's products the LLM tailoring step
  rewords the hazard/situation/harm to fit.

---

## How to flip an entry to `reviewed`

1. Open `lib/engine/tier1-smart-examples-library.ts`.
2. Find the entry by `key`.
3. Adjust `good_snippet`, `bad_snippet`, `why_this_is_safer_seed`,
   `applies_to`, or `weight` if needed.
4. Change `review_status: "estimate"` → `review_status: "reviewed"`.
5. Update the corresponding row + snippet in this table.
