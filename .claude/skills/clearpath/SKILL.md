---
name: clearpath
description: "ClearPath coding conventions. Use when writing code for the ClearPath product — a regulatory readiness engine for Indian digital health. Covers: Claude API prompt patterns, certainty-language post-processing, output schema enforcement, brand system (Teal Trust palette), React component patterns, and engine-module structure. Triggered whenever code is being written in the ClearPath repo or when the user asks about ClearPath engineering decisions."
---

# ClearPath Coding Conventions

Read this before writing any code for ClearPath. These conventions are distilled from the product spec and are non-negotiable.

## 1. Certainty language enforcement

Every output that reaches a user (Tier 0 card, Tier 1 draft, any Claude-generated text) must pass certainty calibration. Never sound more certain than the regulator.

### Post-processor (required)

Implement a `softenCertainty(text: string): string` utility that runs on every rendered output:

```ts
const hardToSoft: Record<string, string> = {
  'Class C SaMD': 'likely Class B/C',
  'CDSCO required': 'approval likely required',
  'MD-12 + MD-9 required': 'SaMD pathway evolving · forms TBD',
  'SDF required': 'may qualify as SDF',
  'predicate exists': 'international comparables exist',
  'you need to': 'you likely need to',
  'must file': 'typically files',
  'is required': 'is likely required',
};
```

Run this as a final pass on any user-visible text.

### Banned phrases in prompts

System prompts must never generate these. Add to every prompt's `<rules>` section:

```
- Never use "definitely", "absolutely", "certainly", "must", "always", "will be"
- Always use "likely", "may", "typically", "based on published guidance"
- Distinguish Readiness from Risk — never conflate
- If unsure about a regulation applying, say "conditional" not "required"
```

## 2. Claude API conventions

### Model selection

| Task | Model | Reasoning |
|------|-------|-----------|
| Engine synthesis (Tier 0) | `claude-opus-4-7` | Highest-stakes reasoning |
| Decomposer | `claude-opus-4-7` | Critical feature — don't economize |
| Draft pack generation (Tier 1) | `claude-opus-4-7` | User paid ₹499; quality matters |
| Scrape reconciler | `claude-sonnet-4-6` | Fast classification |
| Pre-router | `claude-sonnet-4-6` | Simple routing decision |
| Q2 follow-up detector | `claude-sonnet-4-6` | Fast signal detection |

### Prompt file structure

Every prompt file in `prompts/` follows:

```markdown
# Role
[Who Claude is in this context]

# Input
[Exact JSON shape expected]

# Rules
- [Certainty language rules]
- [Schema adherence]
- [Domain-specific constraints]

# Output
[Exact JSON shape to produce, referencing schema in output_schemas.md]

# Examples
[2-3 worked examples using calibration test cases from README]
```

### Temperature guidance

- Classification / routing: `0.2`
- Engine synthesis: `0.3`
- Draft content generation: `0.7`
- Never `1.0` — regulatory content should not be creative

### JSON strictness

Every Claude response must be strict JSON. Wrap calls with:

```ts
async function callClaude<T>(systemPrompt: string, userInput: string, schema: ZodSchema<T>): Promise<T> {
  for (const attempt of [1, 2]) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt + (attempt === 2 ? '\n\nReturn STRICT JSON ONLY. No preamble. No trailing text.' : ''),
      messages: [{ role: 'user', content: userInput }],
    });
    try {
      const raw = (response.content[0] as { text: string }).text;
      const parsed = JSON.parse(raw);
      return schema.parse(parsed);
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }
  throw new Error('unreachable');
}
```

## 3. Schema enforcement

Every engine output is validated with Zod schemas derived from `clearpath_output_schemas.md`. Create `lib/schemas/` with one file per schema:

```
lib/schemas/
├── pre-router.ts
├── decomposer.ts
├── scrape-reconcile.ts
├── readiness-card.ts     ← most important
├── draft-pack.ts
└── index.ts              ← re-exports
```

## 4. Brand system in code

### Tailwind config extension

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      teal: { deep: '#0F6E56', light: '#E1F5EE' },
      amber: { brand: '#BA7517', light: '#FAEEDA' },
      coral: { deep: '#993C1D', light: '#FAECE7' },
      green: { dark: '#3B6D11', light: '#EAF3DE' },
    },
    fontFamily: {
      serif: ['Georgia', 'Playfair Display', 'serif'],
      sans: ['Inter', 'Calibri', 'system-ui', 'sans-serif'],
    },
  }
}
```

### Component naming

- `<ReadinessCard />` — Tier 0 output component (one file, matches spec exactly)
- `<VerdictMatrix />` — for not-a-medical-device cases
- `<ClassBadge class="B/C" qualifier="AI-CDS" />` — Class chip with qualifier
- `<RiskBadge level="high" />` — Risk chip
- `<MdStatusBadge status="feature" />` — MD? chip
- `<TimelineBadge months="9-14" />` — Timeline chip
- `<RegulationPill regulation="cdsco_mdr" verdict="required" />` — Reg snapshot pill

## 5. Engine module structure

Each engine stage is a separate file with a single exported function:

```
lib/engine/
├── pre-router.ts        — preRoute(input) → ProductType
├── scrape.ts            — scrape(url) → ScrapedContent
├── reconciler.ts        — reconcile(oneliner, scraped) → Conflict | null
├── decomposer.ts        — decompose(oneliner, scraped) → Features
├── wizard.ts            — resolveWizard(answers) → WizardOutput
├── synthesiser.ts       — synthesise(everything) → ReadinessCard
├── draft-pack.ts        — generateDraftPack(readiness) → DraftPack
└── index.ts             — orchestrator
```

Orchestrator pseudocode:

```ts
export async function runEngine(input: Input): Promise<ReadinessCard> {
  const routing = await preRoute(input);
  if (routing.next_action === 'reject') return rejectCard(routing);
  
  const scraped = await scrape(input.url);
  const conflict = await reconcile(input.one_liner, scraped);
  if (conflict) return requireUserChoice(conflict);
  
  let scopedFeature: string | null = null;
  if (routing.product_type === 'platform') {
    const features = await decompose(input.one_liner, scraped);
    if (!features.single_feature) return requireScopePick(features);
    scopedFeature = features.features[0].name;
  }
  
  const wizardOut = resolveWizard(input.answers);
  return synthesise({ input, routing, scraped, scopedFeature, wizardOut });
}
```

## 6. Calibration tests

Every engine module ships with test cases using the 16 calibration products. Minimum coverage:

- **Pure medical device** — CerviAI must return Class C, medical_device_status = is_medical_device
- **Hidden sub-feature** — Eka Care must trigger decomposer; EkaScribe sub-feature must return Class B/C scoped
- **Clean N/A** — HealthifyMe must return medical_device_status = wellness_carve_out, readiness.score = null
- **Rejected meta** — ABDM + Rainmatter must reject at pre-router
- **Export-only** — Biopeak must detect export path and scope to manufacturing license
- **One-liner conflict** — Vyuhaa ("data platform" vs "cancer screening") must surface conflict

```ts
// tests/calibration.test.ts
describe('calibration', () => {
  for (const testCase of CALIBRATION_SET) {
    it(`classifies ${testCase.name} correctly`, async () => {
      const result = await runEngine(testCase.input);
      expect(result.classification.medical_device_status).toBe(testCase.expected.md_status);
      expect(result.classification.cdsco_class).toBe(testCase.expected.cdsco_class);
      expect(result.risk.level).toBe(testCase.expected.risk);
    });
  }
});
```

## 7. Error handling

User-facing errors are friendly. Internal errors are logged in detail.

```ts
try {
  return await runEngine(input);
} catch (e) {
  logger.error('engine failure', { input, error: e });
  if (e instanceof SchemaValidationError) {
    return { error: 'engine_output_invalid', user_message: 'We hit a hiccup generating your card. Try again or use the feedback link below.' };
  }
  if (e instanceof ScrapingError) {
    return { error: 'scrape_failed', user_message: 'We couldn\'t read your website. Make sure the URL is accessible, or proceed without scraping.', suggested_action: 'skip_step' };
  }
  return { error: 'unknown', user_message: 'Something unexpected happened. We\'ve logged it.' };
}
```

## 8. What not to do

- Don't invent CDSCO form numbers or timelines. Pull from `clearpath_regulations.md`.
- Don't hard-code the readiness score formula in multiple places. One source of truth in `lib/engine/readiness.ts`.
- Don't skip the decomposer for platforms. 29% of value comes from sub-feature scoping.
- Don't bundle the 9-reg logic into a single giant prompt. Each regulation's verdict is a scoped evaluation — use smaller prompts or one prompt with per-regulation structure.
- Don't auto-fill CDSCO government PDFs. Tier 1 generates *content mapped to CDSCO structure*, not filled forms. The distinction matters legally.
- Don't add analytics that log sensitive data (health descriptions, emails) without DPDP compliance notice.

## 9. Commit conventions

- `feat(engine): add decomposer for platform type`
- `fix(tier0): soften certainty language in risk section`
- `test(calibration): add EkaScribe sub-feature case`
- `docs(regulations): update CDSCO SaMD 2025 pathway`

## 10. Review checklist before shipping a feature

- [ ] Output validated with Zod schema
- [ ] Certainty language post-processor applied
- [ ] Calibration tests pass
- [ ] No hardcoded "required" / "must" / "definitely"
- [ ] 9 regulations all evaluated (even if not_applicable)
- [ ] Readiness and Risk surfaced separately
- [ ] Brand colors from config, not inline
- [ ] Mobile responsive (Tailwind breakpoints)
- [ ] Error states user-friendly
