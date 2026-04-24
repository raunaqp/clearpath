# ClearPath — Change Log v3: Intake PDF helper + inferred certifications

**What changed:** Three related decisions about how much to ask users vs. infer from their uploads:

1. **Intake form gets an expanded PDF helper** — founders see specific guidance on what to include in their uploads, including certifications and prior regulatory work
2. **Certifications are inferred from PDFs**, not asked via wizard checkbox. Absence automatically becomes a gap on the Readiness Card.
3. **Physical facility question skipped for MVP** — only ~20% of founders have hardware. Software-only users see no extra friction. Hardware users get a verdict hint from the synthesizer. Phase 2 adds a conditional Q8.

**Why:** Every question added to the wizard = friction. Every gap inferred from uploads = accuracy without cost. The helper text solves the "what should I upload?" problem upfront, which produces better PDFs, which means better classification.

**Files to patch (surgical):**
1. `clearpath_copy_scope.md` — §2.2 (intake form helper text)
2. `clearpath_build_plan.md` — §3c (Sonnet prompt) and §5b (synthesizer prompt)
3. `clearpath_output_schemas.md` — extend assessment meta for detected certifications
4. `clearpath_user_journeys.md` — add note about certifications flow (optional)

---

## Patch 1 — `clearpath_copy_scope.md` §2.2 (intake form PDF field)

### Find the existing PDF upload field copy:

```markdown
**PDF upload (optional):**
```
Label: Upload product documents (optional)
Dropzone empty state: Drop PDFs here, or click to browse
Dropzone hover state: Drop to upload
File count: {n} of 5 files
Helper: Pitch decks · product briefs · technical specs · prior filings
Subhelper: Up to 5 files, 10MB each. PDF only.
...
```

### Replace with:

```markdown
**PDF upload (optional, recommended):**

Label: Upload product documents (optional, recommended)
Dropzone empty state: Drop PDFs here, or click to browse
Dropzone hover state: Drop to upload
File count: {n} of 3 files
Helper (primary): Pitch decks · product briefs · technical specs · prior filings
Subhelper (muted): Up to 3 files, 5MB each, 10 pages each. PDF only.

Expanded helper (shown below subhelper, small font, muted, with lightbulb icon):

💡 What to include for best results:
  · What your product does (intended use)
  · How it works technically (AI model, data flow, integrations)
  · Who uses it (clinicians, patients, admins)
  · Any prior regulatory work (filings, tests, clinical studies)
  · Certifications or partners (ISO 13485, IEC 62304, NABL labs, hospitals)

No need for polished decks — internal docs work great.

Error (too many): We can only process up to 3 files
Error (too big): Each file must be under 5MB
Error (too many pages): Each PDF must be 10 pages or fewer
Error (wrong type): We can only read PDF files
Progress: Uploading {filename}... {pct}%
Success: ✓ {filename} uploaded ({pages} pages)
```

**Note:** File count cap updated from 5 to 3 (already agreed). Size cap 
updated from 10MB to 5MB (already agreed). Page cap now explicit at 10 
(was implicit). These are all the correct MVP caps — the patch aligns 
copy with the locked build plan constraints.

---

## Patch 2 — `clearpath_build_plan.md` §3c (Sonnet pre-router prompt)

### Extend the pre-router system prompt to extract certifications

Find the pre-router Sonnet call spec and add to the cached system prompt section:

```markdown
### Added to PRE_ROUTER_SYSTEM_PROMPT

Along with product classification, extract any certifications, partnerships, 
or regulatory signals mentioned in uploaded documents or URL content.

Add to the output JSON schema:

```json
{
  ...existing fields,
  "detected_signals": {
    "certifications": [
      { 
        "name": "ISO 13485 | IEC 62304 | ISO 14971 | NABL | ...", 
        "source": "pdf | url | one_liner", 
        "confidence": "high | medium | low",
        "evidence_quote": "string — exact phrase that triggered detection"
      }
    ],
    "partnerships": [
      {
        "type": "clinical_site | testing_lab | manufacturer | tech_partner",
        "name": "string",
        "source": "pdf | url",
        "confidence": "high | medium | low"
      }
    ],
    "prior_regulatory_work": [
      {
        "type": "cdsco_filing | clinical_trial | cdsco_test_license | fda_submission",
        "reference": "string — e.g. MD-12 number, CTRI number",
        "source": "pdf | url",
        "confidence": "high | medium | low"
      }
    ],
    "has_physical_facility": "yes | no | unclear",
    "facility_details": "string | null — brief description if detected"
  }
}
```

**Confidence rules:**
- `high`: explicit mention with specific detail (e.g. "ISO 13485 certified, cert 
  number ABC123" or "Tested at NABL-accredited SRL Diagnostics")
- `medium`: mention without detail (e.g. "ISO 13485 compliant" or "works with 
  NABL labs")
- `low`: ambiguous or forward-looking (e.g. "planning to get ISO 13485" or 
  "could partner with NABL labs")

Only `high` and `medium` confidence certs are treated as present. 
`low` confidence is treated as a gap (same as absent).

Store in `assessments.meta.detected_signals`.
```

---

## Patch 3 — `clearpath_build_plan.md` §5b (synthesizer prompt)

### Use detected_signals to compute gaps more accurately

Find the synthesizer Opus call spec and add to the uncached user message:

```markdown
### Added to synthesizer user message payload

```ts
messages: [
  {
    role: 'user',
    content: `
      Product: ${oneLiner}
      Product type: ${productType}
      URL content: ${urlContent || 'N/A'}
      PDF summaries: ${JSON.stringify(pdfSummaries)}
      Wizard answers: ${JSON.stringify(wizardAnswers)}
      Detected signals: ${JSON.stringify(detected_signals)}    ← NEW
      
      Generate full Tier 0 Readiness Card per output schema.
      
      When computing Top 3 gaps:
      - If classification is Class B/C/D and no high/medium confidence 
        ISO 13485 detected → include as HIGH gap
      - If classification is Class B/C/D and no high/medium confidence 
        IEC 62304 detected AND product has software → include as HIGH gap
      - If IVD classification and no NABL lab partnership detected → 
        include as HIGH gap
      - If product_type is hardware_software and no facility detected → 
        add to verdict: "Since your product has a hardware component, 
        state FDA approval may also apply depending on your manufacturing 
        setup."
    `
  }
]
```

This replaces the need for wizard questions on certifications or 
facility status. Classification stays at 7 questions.
```

---

## Patch 4 — `clearpath_output_schemas.md` (meta schema)

### Extend assessment meta schema

```markdown
## Assessment meta fields — extended (v3)

```typescript
interface AssessmentMeta {
  // ... existing fields preserved including conflict fields from v2 ...
  
  // Detected signals from pre-router (added v3)
  detected_signals?: {
    certifications?: Array<{
      name: string;
      source: 'pdf' | 'url' | 'one_liner';
      confidence: 'high' | 'medium' | 'low';
      evidence_quote: string;
    }>;
    partnerships?: Array<{
      type: 'clinical_site' | 'testing_lab' | 'manufacturer' | 'tech_partner';
      name: string;
      source: 'pdf' | 'url';
      confidence: 'high' | 'medium' | 'low';
    }>;
    prior_regulatory_work?: Array<{
      type: 'cdsco_filing' | 'clinical_trial' | 'cdsco_test_license' | 'fda_submission';
      reference: string;
      source: 'pdf' | 'url';
      confidence: 'high' | 'medium' | 'low';
    }>;
    has_physical_facility?: 'yes' | 'no' | 'unclear';
    facility_details?: string | null;
  };
  
  // ... existing fields preserved ...
}
```
```

---

## Patch 5 — `clearpath_copy_scope.md` §5.5 (readiness card gaps copy)

### Update gap templates to use detected signals

Find the gap templates section and add:

```markdown
## 5.5a Gap templates driven by detected signals

When inferring gaps based on missing certifications / partnerships / facility:

**Missing ISO 13485 (Class B/C/D products):**
```
[HIGH] ISO 13485 Quality Management System not evidenced in provided materials
```

**Missing IEC 62304 (software products, Class B/C/D):**
```
[HIGH] IEC 62304 software lifecycle process not evidenced
```

**Missing NABL partnership (IVD products):**
```
[HIGH] Partner NABL-accredited lab for IVD validation not evidenced
```

**Missing clinical validation (Class C/D products):**
```
[HIGH] Clinical validation study not evidenced in provided materials
```

**Missing CDSCO test license (filed products mentioned elsewhere):**
```
[MED] CDSCO MD-12 test license status unclear from materials
```

**Facility note in verdict (hardware products):**
```
Since your product has a hardware component, state FDA approval may 
also apply depending on your manufacturing setup. Stage 2 Draft Pack 
will cover state + central routing.
```

Always phrase gaps as "not evidenced in provided materials" — protects 
against false negatives where the founder has the cert but didn't upload 
evidence. Language invites them to upload better docs or proceed to Tier 2 
where they can add context.
```

---

## Patch 6 — Deferred to Phase 2

Add to deferred items list in build plan:

```markdown
### Phase 2 additions (added v3)

- Physical facility question — conditional Q8 when `product_type === 
  'hardware_software'`. Three options: own-facility, contract-manufacturer, 
  overseas.
- Pre-router confidence check — when PDFs are weak signal, prompt user to 
  upload more before proceeding to wizard.
- Tier 2 "Anything else to know?" textarea — lets founders add context 
  they forgot to upload (certifications in progress, clinical trials 
  underway, etc.)
```

---

## Implementation notes for Claude Code

### The decision chain for certification gaps

```
PDF upload? 
  Yes → Pre-router extracts detected_signals.certifications
    High confidence found? → Credit given in synthesizer
    Medium confidence found? → Credit given with note
    Low or none found? → Gap surfaced in Top 3
  No → All certifications = not evidenced, gap surfaced

Wizard asks? → NO (this is the key decision)
```

### Why "not evidenced" phrasing matters

Instead of "You don't have ISO 13485" (accusatory, possibly wrong):
"ISO 13485 QMS not evidenced in provided materials" (factual, invites 
upload or Tier 2 context)

This is important because:
- Founders often have certs but didn't upload evidence
- Saying "you don't have X" in a shareable card could be embarrassing 
  if they do have it
- "Not evidenced in provided materials" is accurate regardless

### Priority of signal extraction

Pre-router Sonnet should be instructed to look for (in order):
1. Explicit certification mentions with numbers or identifiers
2. Partnership mentions with named organizations
3. Prior regulatory filings with reference numbers
4. Facility mentions (addresses, equipment, manufacturing language)
5. Clinical work (trial IDs, institution names)

The more specific the evidence, the higher the confidence.

---

## Summary for Claude Code

1. Read `clearpath_copy_scope.md` → apply Patch 1 (intake PDF helper) and Patch 5 (gap templates)
2. Read `clearpath_build_plan.md` → apply Patch 2 (pre-router detected signals) and Patch 3 (synthesizer uses signals) and Patch 6 (Phase 2 deferrals)
3. Read `clearpath_output_schemas.md` → apply Patch 4 (meta schema extension)

**No changes to Feature 4 wizard (still 7 questions). No new screens. 
No new API calls. Just better signal extraction from existing PDF/URL 
content flowing into richer card output.**

Don't regenerate any full files. All 6 patches are additive or replacements 
within existing sections.
