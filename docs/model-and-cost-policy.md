# Model & Cost Policy

**Last updated:** May 6, 2026 (verified against Anthropic pricing page)
**Reference for:** Sprint 1 Story 1.2 (model rightsizing), Story 1.4 (cost dashboard), all future engine work

This is the **single source of truth** for which Claude model is used where, with exact API parameters, token-optimization tactics, and cost projections. Reference this doc in every engineering decision involving Anthropic API calls.

---

## 1. Model assignments per task

| Task | Model | API ID | Why |
|---|---|---|---|
| Pre-router (classification, conflict detection) | Haiku 4.5 | `claude-haiku-4-5-20251001` | Classification is deterministic, structured. Haiku is ~5× cheaper than Sonnet, ~5× cheaper than Opus, near-frontier intelligence on extraction/classification. |
| Synthesizer (Risk Card narrative) | Sonnet 4.6 | `claude-sonnet-4-6` | Narrative generation needs reasoning depth. Sonnet near-Opus quality on structured prose, 5/3 = 1.67× cheaper than Opus, less likely to hallucinate than Haiku. |
| Draft Pack generation (multi-section narrative) | Sonnet 4.6 | `claude-sonnet-4-6` | Long-form prose; quality matters but not Opus-tier required. **If eval shows quality regression on Draft Pack only, revert this one to Opus 4.7.** |
| Form-fill (Sprint 5+, regulatory paperwork) | Opus 4.7 | `claude-opus-4-7` | High-stakes regulatory text. Wrong field = real-world harm. Quality > cost. Worth the 5/3 = 1.67× premium over Sonnet. |
| Eval scoring (manual + AI assist) | Opus 4.7 | `claude-opus-4-7` | Subjective scoring; want best judgment when assisting human review. Low call volume, cost not material. |

**Defense:** model selection is **per call site**, not per app. Don't default to Sonnet everywhere.

---

## 2. Pricing (verified May 6, 2026)

Per million tokens (1M = ~750K words):

| Model | Input | Output | Cache write (5min) | Cache read |
|---|---|---|---|---|
| Haiku 4.5 | $1.00 | $5.00 | $1.25 | $0.10 |
| Sonnet 4.6 | $3.00 | $15.00 | $3.75 | $0.30 |
| Opus 4.7 | $5.00 | $25.00 | $6.25 | $0.50 |

**Cache read = 90% off standard input.** This is the single biggest cost lever.

**Output cost = 5× input cost** for all current-generation models (consistent ratio, easy budgeting).

**Batch API** (asynchronous, 24h SLA): 50% off both input and output. **Stack with caching: up to 95% off effective.**

---

## 3. Prompt caching strategy

Prompt caching is **the single biggest cost lever** for ClearPath, because we have:
- Long system prompts that repeat (synthesizer + draft pack generator)
- Same product taxonomies, regulation lists, and few-shot examples in every call

### Cache write economics
- Write costs 1.25× standard input rate
- Cache lasts 5 minutes (default) or 1 hour (extended)
- **Pays off after 1 cache hit in 5min mode, 2 hits in 1hr mode**

### Where to add caching

**Pre-router (Haiku 4.5):** Skip caching. Each pre-router call has a unique product description; no cacheable prefix. Cost is already trivial (~$0.005/call). Don't optimize.

**Synthesizer (Sonnet 4.6):** Cache the system prompt + regulation taxonomy + few-shot examples. **Expected savings: 60-70% on synthesizer input cost.**

**Draft Pack generator (Sonnet 4.6):** Cache the system prompt + section templates + style guide. **Expected savings: 70-80% on draft-pack input cost** (largest absolute saving because draft-pack inputs are big).

**Form-fill (Opus 4.7, future):** Cache the form templates + filling instructions per form (MD-3, MD-7, MD-12). **Expected savings: 50-60% on form-fill input cost.**

### Implementation — Anthropic SDK

Use `cache_control: { type: "ephemeral" }` on the cacheable content blocks. The SDK supports it natively in all current versions (TypeScript SDK ≥0.30.0, Python SDK ≥0.40.0).

Verify SDK version in `package.json` during Story 1.2:

```bash
cd ~/my-weekender-project/clearpath
grep "@anthropic-ai/sdk" package.json
# If version is below 0.30.0, upgrade first:
npm install @anthropic-ai/sdk@latest
```

### Code template for synthesizer

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT_TEXT,        // long, stable
      cache_control: { type: 'ephemeral' }
    },
    {
      type: 'text',
      text: REGULATION_TAXONOMY_TEXT,  // long, stable
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [
    {
      role: 'user',
      content: USER_INPUT  // varies per request, NOT cached
    }
  ]
});

// usage object includes cache_creation_input_tokens, cache_read_input_tokens
console.log({
  input: message.usage.input_tokens,
  cache_write: message.usage.cache_creation_input_tokens,
  cache_read: message.usage.cache_read_input_tokens,
  output: message.usage.output_tokens
});
```

**Important:** Cacheable content goes in **system** blocks, not in user messages. Cache breakpoints attach to specific content blocks. Order matters: cached blocks come first, dynamic content last.

---

## 4. Per-call API parameters (defense against runaway cost)

### Pre-router (Haiku 4.5)

```typescript
{
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 1024,            // Hard cap; classification needs <500
  temperature: 0,              // Deterministic for classification
  system: PRE_ROUTER_SYSTEM,
  messages: [...]
}
```

**Cost per call:** ~$0.001-0.005 (median ~$0.003). Volume: ~1 per assessment.

### Synthesizer (Sonnet 4.6)

```typescript
{
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,            // Risk Card narrative; cap at 4K to avoid runaway
  temperature: 0.3,            // Slight creativity for narrative
  system: [/* with cache_control */],
  messages: [...]
}
```

**Cost per call without caching:** ~$0.025-0.060 (median ~$0.035). With caching: ~$0.010-0.018. Volume: 1 per assessment.

### Draft Pack generator (Sonnet 4.6)

```typescript
{
  model: 'claude-sonnet-4-6',
  max_tokens: 16384,           // Long sections; cap at 16K (Sonnet supports 128K but we don't need it)
  temperature: 0.3,
  system: [/* with cache_control */],
  messages: [...]
}
```

**Cost per call without caching:** ~$0.30-0.60 (median ~$0.40). With caching: ~$0.10-0.18. Volume: 1 per Tier 1+ purchase.

### Form-fill (Opus 4.7, future)

```typescript
{
  model: 'claude-opus-4-7',
  max_tokens: 4096,            // Per form
  temperature: 0,              // Deterministic for regulatory paperwork
  system: [/* with cache_control */],
  messages: [...]
}
```

**Cost per call without caching:** ~$0.40-0.80 per form. With caching: ~$0.18-0.32. Volume: 3-5 forms per Tier 2 purchase.

---

## 5. Cost projection per assessment tier

### Tier 0 (free Risk Card)

| Component | Cost (no caching) | Cost (with caching) |
|---|---|---|
| Pre-router | $0.003 | $0.003 |
| Synthesizer | $0.035 | $0.014 |
| **Total free tier** | **$0.038** | **$0.017** |

**Per 1000 free assessments:**
- No caching: ~$38
- With caching: ~$17
- **Savings from caching alone: 55% on free tier cost**

### Tier 1 (₹4,999 Draft Pack)

| Component | Cost (no caching) | Cost (with caching) |
|---|---|---|
| Tier 0 (run again or cached) | $0.038 | $0.017 |
| Draft Pack generation | $0.40 | $0.14 |
| **Total Tier 1** | **$0.44** | **$0.16** |

**Margin at ₹4,999 (~$60):**
- No caching: 99% gross margin
- With caching: 99.7% gross margin
- (Margin is fine either way; caching pays off in volume)

### Tier 2 (₹50K-1L Concierge)

| Component | Cost (no caching) | Cost (with caching) |
|---|---|---|
| Tier 1 included | $0.44 | $0.16 |
| Form-fill (3-5 forms × Opus) | $1.80 | $0.85 |
| Concierge labor (real cost) | ₹15K-30K | ₹15K-30K |
| **Total Tier 2 AI cost** | **$2.24** | **$1.01** |

**At ₹50K-1L (~$600-1200):** AI cost is ~0.2% of revenue. Concierge labor is the cost driver, not AI.

---

## 6. Cost dashboard implementation (Story 1.4)

Add columns to `assessments` table:

```sql
-- Migration: 2026-05-06-add-cost-tracking.sql
ALTER TABLE assessments
  ADD COLUMN synthesizer_cost_usd numeric(10, 6),
  ADD COLUMN synthesizer_input_tokens int,
  ADD COLUMN synthesizer_output_tokens int,
  ADD COLUMN synthesizer_cache_read_tokens int,
  ADD COLUMN synthesizer_cache_write_tokens int,
  ADD COLUMN draft_pack_cost_usd numeric(10, 6),
  ADD COLUMN draft_pack_input_tokens int,
  ADD COLUMN draft_pack_output_tokens int,
  ADD COLUMN draft_pack_cache_read_tokens int,
  ADD COLUMN draft_pack_cache_write_tokens int,
  ADD COLUMN total_cost_usd numeric(10, 6) GENERATED ALWAYS AS (
    COALESCE(cost_usd, 0) +
    COALESCE(synthesizer_cost_usd, 0) +
    COALESCE(draft_pack_cost_usd, 0)
  ) STORED;
```

### Cost calculation utility

Place at `lib/engine/cost-calculator.ts`:

```typescript
type ModelKey = 'haiku-4-5' | 'sonnet-4-6' | 'opus-4-7';

const PRICING_USD_PER_MTOK: Record<ModelKey, {
  input: number;
  output: number;
  cache_write: number;
  cache_read: number;
}> = {
  'haiku-4-5':  { input: 1.00, output:  5.00, cache_write: 1.25, cache_read: 0.10 },
  'sonnet-4-6': { input: 3.00, output: 15.00, cache_write: 3.75, cache_read: 0.30 },
  'opus-4-7':   { input: 5.00, output: 25.00, cache_write: 6.25, cache_read: 0.50 },
};

export function calculateCallCost({
  model,
  input_tokens,
  output_tokens,
  cache_creation_input_tokens = 0,
  cache_read_input_tokens = 0,
}: {
  model: ModelKey;
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}): number {
  const p = PRICING_USD_PER_MTOK[model];
  const cost = (
    (input_tokens * p.input) +
    (output_tokens * p.output) +
    (cache_creation_input_tokens * p.cache_write) +
    (cache_read_input_tokens * p.cache_read)
  ) / 1_000_000;
  return cost;
}
```

### Admin dashboard view

`/admin/costs` should show:

1. **Today's spend** (sum of `total_cost_usd` where `created_at >= today`)
2. **30-day trend** (line chart, daily aggregate)
3. **Per-model breakdown** (Haiku vs Sonnet vs Opus spend split)
4. **Cache effectiveness** (cache_read_tokens / total_input_tokens — target: >40%)
5. **Per-assessment table** (last 50, sortable by cost)
6. **Cost per Tier** (avg cost per Tier 0, Tier 1, Tier 2)

---

## 7. Token optimization tactics (beyond model + cache)

### Use structured outputs

Force JSON-mode-equivalent by using XML tags + Pydantic-style schemas in the system prompt. Reduces output tokens by ~30% vs. free-form prose.

```typescript
const SYSTEM_PROMPT = `
You output STRICT JSON only. Schema:
{
  "cdsco_class": "A" | "B" | "C" | "D",
  "regulations": Array<{ name: string, applies: boolean, rationale: string }>,
  ...
}
Output ONLY the JSON object. No prose, no markdown fences.
`;
```

### Cap max_tokens

Always set `max_tokens` to the realistic ceiling. Default of 4096 is fine for most calls. For Risk Card narrative, 2048 is enough; for Draft Pack sections, 4096 per section is enough. **Setting max_tokens does NOT increase cost; only output token count costs money.**

### Trim system prompts

Audit all system prompts in Story 1.2:
- Remove "you are a helpful AI assistant" preambles (zero value)
- Remove duplicate instructions (e.g., "be concise" said three times)
- Move examples that aren't always relevant out of the system prompt into per-call user content
- Target: synthesizer system prompt under 4K tokens; draft-pack system prompt under 8K tokens

### Don't include the full regulation list every call

Currently the synthesizer probably includes the full 9-regulation taxonomy in every call. Cache it.

If we expand to DPDP-only product later, send the DPDP-specific subset, not the full medtech taxonomy.

### Avoid unnecessary multi-shot examples

Current synthesizer probably uses 4-6 calibration examples in the system prompt. After eval at 90% (Story 1.3), reduce to 2-3 highest-information examples. Saves ~3K tokens × every call. **Cache them anyway, but smaller cache is still cheaper.**

### Streaming for Draft Pack

Draft Pack generation is long. Use streaming so:
1. User sees progress (better UX)
2. If generation fails midway, we capture partial output for debug
3. Same cost (streaming doesn't change pricing)

```typescript
const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 16384,
  system: [...],
  messages: [...]
});

for await (const event of stream) {
  // Update UI progress
  // Save partial output to Supabase as it streams
}
```

---

## 8. Migration checklist (Story 1.2)

In order:

- [ ] **Verify SDK version** (`@anthropic-ai/sdk` ≥0.30.0)
- [ ] **Audit all model strings** in codebase (`grep -rn "claude-" --include="*.ts"`)
- [ ] **Update pre-router** to `claude-haiku-4-5-20251001`, `temperature: 0`, `max_tokens: 1024`
- [ ] **Run 10 calibration cases** through Haiku pre-router; compare cdsco_class verdicts to Opus baseline
- [ ] **Lock if ≥90% match**, else investigate prompt
- [ ] **Update synthesizer** to `claude-sonnet-4-6`, add prompt caching to system blocks
- [ ] **Run 5 calibration cases** through Sonnet synthesizer; manual quality review
- [ ] **Lock if quality acceptable**, else revert and document
- [ ] **Update draft-pack generator** to `claude-sonnet-4-6` with caching
- [ ] **Run 3 demo packets** through Sonnet draft-pack generator; manual PDF review
- [ ] **Lock if quality acceptable**, else revert to Opus for draft-pack only
- [ ] **Verify cost drop** in `/admin/costs` after Story 1.4 ships (free tier should be ~$0.017 with caching, ~$0.038 without)
- [ ] **Commit migration** with detailed commit message documenting before/after costs

---

## 9. Anti-patterns (don't do these)

❌ **Don't use Opus 4.7 as a default.** It's the flagship for high-stakes work, not a "safe" choice. Sonnet handles 80% of production workloads at 1.67× lower cost.

❌ **Don't forget to set `max_tokens`.** Without a cap, a malformed response can run to model maximum (128K for Sonnet/Opus output) and cost $1.50+ per call.

❌ **Don't put dynamic content in cached system blocks.** Cache invalidates if any character of cached content changes. Keep dynamic content (user input, request-specific context) in user messages, not system.

❌ **Don't enable extended thinking by default.** Extended thinking tokens are billed as output (5× input rate). Only enable for tasks that genuinely benefit (form-fill, complex reasoning).

❌ **Don't migrate to Opus 4.7 from Opus 4.6 blindly.** New tokenizer can use up to 35% more tokens for the same input. Per-token rate is identical; effective cost can be higher. **For ClearPath we're going to Sonnet anyway, so this doesn't apply, but document for future Opus work.**

❌ **Don't use Batch API for user-facing requests.** 24-hour SLA. OK for nightly evals, eval-runner runs, prompt-tuning experiments. **Sprint 1 Story 1.3 (35-case eval) should use Batch API for 50% savings on the iteration cycles.**

❌ **Don't forget to log cache hits.** If `cache_read_input_tokens` is always 0, caching isn't working. Verify in Story 1.4 cost dashboard.

---

## 10. Future considerations

- **Mythos Preview** (1M context, free preview as of May 2026) — useful for full-codebase evals or long-document RAG. Not needed for ClearPath right now.
- **US-only inference** (1.1× pricing) — only if compliance demands it. ClearPath is India-served; not needed.
- **AWS Bedrock / Vertex AI** — if compliance or procurement makes Anthropic API direct hard. Pricing similar but with regional variation. Not needed Sprint 1-6.
- **Adaptive thinking** (Opus 4.6 / Sonnet 4.6) — automatic reasoning depth adjustment. Off by default. Enable for form-fill in Sprint 5+ if quality benefits warrant the output token premium.

---

## Verification log

| Date | Verified by | Source |
|---|---|---|
| 2026-05-06 | Sprint 1 prep | https://docs.claude.com/en/docs/about-claude/pricing + https://www.anthropic.com/claude/opus + benchlm.ai pricing roundup |
