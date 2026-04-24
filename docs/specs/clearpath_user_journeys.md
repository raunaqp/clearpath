# ClearPath — User Journeys

Six canonical user journeys. Each drives specific product, UX, and content decisions. Use alongside `clearpath_screens_spec.md`.

---

## Journey 1 — First-time founder (happy path)

**Persona.** Arjun, 28, solo founder building "NeuroScan" — an AI tool that flags early-stage Alzheimer's from MRI scans. Built the MVP, has one hospital pilot. Heard "you need CDSCO approval" from multiple people. Doesn't know where to start.

**Entry point.** Google "CDSCO approval for AI medical device" → lands on clearpath.in or sees a LinkedIn post.

**Steps:**

1. **Land on hero section.** Sees: *"CDSCO changed what counts as a medical device. Your product might be one you didn't know about."* CTA: *"Get your free Readiness Card →"*
2. **Clicks CTA → intake form.** Fields: one-liner (max 200 chars), product URL (optional), name + email.
3. **Engine runs pre-route** (loading screen ~2s): *"Analysing NeuroScan..."*
4. **Product type detected: PRODUCT (single offering).** Skips decomposer.
5. **7-Q wizard starts.** Stepper shows `1 / 7` → `7 / 7`. Each question is short, friendly. Q2 asks info significance; if he picks "inform," Q2 follow-up triggers: *"Your website mentions 'flags' and 'suggests diagnosis' — is that closer to 'drive' than 'inform'?"*
6. **Synthesis (loading screen ~5s):** *"Cross-checking 9 regulations..."*
7. **Readiness Card appears.** Shows: Readiness 4/10, Risk High, MD? Yes, Class C (AI-CDS, scoped), Timeline 9–14 months (baseline) or 7–12 months with ClearPath. Top 3 gaps, verdict copy, 9-reg snapshot strip.
8. **Two CTAs below card:** *"Share this card"* + *"Get your CDSCO-ready draft pack — ₹499"*.
9. **Arjun screenshots the card**, shares with his co-founder, forwards to his advisor.
10. **48 hours later:** email nudge from ClearPath. *"Ready to close the gaps? Draft pack delivered in 10 minutes."*

**Success state.** Arjun knows in 10 minutes that CDSCO applies, has Class C exposure, needs 9–14 months of work. Feels clarity, not dread. Knows where to start.

**Emotional arc.** Anxious → curious → validated → empowered → action-oriented.

**Edge cases.**
- If Arjun types a pitch full of jargon that the engine can't parse, show a fallback prompt: *"Tell us in one sentence — what does NeuroScan do for patients?"*
- If he skips Q4–Q7, engine still runs with safe defaults and flags "answers incomplete" in the card meta.
- If email is invalid, don't block the card — deliver inline, upsell email entry for the shareable URL.

---

## Journey 2 — Platform founder (decomposer + scope picker)

**Persona.** Pritha, 34, CTO of HealthHub — a patient-records + teleconsult + symptom-checker platform used by 50+ clinics. Not sure if "we're in CDSCO scope."

**Entry point.** Referred by Karnataka Medtech Cluster newsletter.

**Steps:**

1. **Land on hero. Clicks CTA.**
2. **Intake form.** Types: *"HealthHub — digital health platform for clinics with records, teleconsult, and AI symptom checker."*
3. **Pre-route detects: PLATFORM** (multiple offerings). Skips wizard first, runs decomposer instead.
4. **Decomposer screen.** Shows:
   - *"HealthHub has multiple features. Each may have different regulatory treatment. Pick which to scope first:"*
   - Feature 1: **Patient records platform** — *likely not a medical device; DPDP + ABDM core compliance*
   - Feature 2: **Teleconsultation** — *MCI Telemedicine guidelines apply; not a medical device*
   - Feature 3: **AI symptom checker** — *likely Class B/C SaMD; CDSCO applies*
   - CTA per feature: *"Scope this feature →"*. Plus: *"Analyse all three (₹1,497 total)"*.
5. **Pritha picks AI symptom checker.** Wizard starts, scoped to that feature.
6. **Q4 asks user scale.** She answers "1–10 lakh users in Year 1."
7. **Synthesis + Card.** Classification: likely Class B/C (AI-CDS). Readiness 5/10. Risk Medium. The card explicitly names *"AI symptom checker feature, scoped from HealthHub platform"*.
8. **Below card:** *"Want to scope your other features? Add to cart →"*.

**Success state.** Pritha understands her platform has one regulated sub-feature. Core platform doesn't need CDSCO. Gets a clean scoped classification she can act on.

**Emotional arc.** Confused ("are we regulated?") → relief ("most of platform isn't") → focused concern ("this one feature is") → clarity on action.

**Edge cases.**
- If founder insists all features are "the same," let them scope at platform level but show a banner: *"Treating as single product. If one feature changes the classification, re-scope."*
- If decomposer finds no distinct features (false platform detection), auto-fall through to wizard with a note: *"Looks like a single product."*

---

## Journey 3 — One-liner vs reality (conflict resolution)

**Persona.** Sameer, 42, founder of "CardioMetrics" — filed MD-12 for his ECG-AI device 6 months ago, now iterating. Describes his product conservatively ("healthcare analytics platform") on LinkedIn and his pitch deck.

**Entry point.** A friend forwards the ClearPath landing page.

**Steps:**

1. **Intake.** Types: *"CardioMetrics — healthcare analytics platform for hospitals."*
2. **Engine scrapes cardiometrics.in.** Website hero says: *"AI-powered arrhythmia detection. FDA-cleared. Now in 40 hospitals across India."*
3. **Conflict detected.** Reconciler sees: one-liner = "analytics platform" (suggests not a medical device), scrape = "AI arrhythmia detection" (clearly a SaMD).
4. **Modal appears:**
   - *"Your description and your website classify very differently."*
   - Left: *"'healthcare analytics platform' — typically not a medical device"*
   - Right: *"'AI arrhythmia detection' — likely Class C SaMD"*
   - *"Which should we scope?"*
   - Buttons: *"Scope the SaMD"* / *"Scope the platform"* / *"Both"*
5. **Sameer picks "Scope the SaMD."** Wizard continues.
6. **Card shows Class C.** Verdict calls out explicitly: *"Your public description says 'analytics platform' but the regulatory classification is SaMD. Investors and customers may not realise the scope — worth aligning messaging."*

**Success state.** Sameer gets a classification grounded in reality, plus a subtle nudge about messaging alignment he hadn't considered.

**Emotional arc.** Casual ("let me try this") → caught off guard ("oh, they caught the mismatch") → impressed ("they understand the subtlety") → trust built.

**Edge cases.**
- Sameer insists "it's just analytics" and his website is overselling. Engine honors his choice but adds to the card meta: *"User-declared scope: platform. Website says SaMD. Treat with discretion."*
- Scrape fails (site down, paywall, JavaScript-heavy). Skip conflict detection, run on one-liner alone. Flag in card: *"Couldn't verify against website. Re-run if details change."*

---

## Journey 4 — Upgrade to Tier 1 (₹499 Regulatory Draft Pack)

**Persona.** Arjun (from Journey 1), 3 days later. Re-opens the screenshot of his Readiness Card, clicks the `clearpath.in/c/abc123` link.

**Steps:**

1. **Lands on his saved Readiness Card page.** Still shows Readiness 4/10, top 3 gaps, etc.
2. **Scrolls down.** Sees the Tier 2 pitch section:
   - *"Your draft pack will include:"*
   - Intended Use Statement (drafted per CDSCO MDR format)
   - Risk Classification Justification + IMDRF mapping
   - Clinical Context narrative
   - Device Description with technical summary
   - Essential Principles checklist
   - CDSCO form mapping (MD-12, MD-9 sections drafted)
   - Algorithm Change Protocol draft (per 2025 SaMD guidance)
   - Pathway + 9-step timeline
3. **Single CTA: *"Pay ₹499 · Get draft pack in 10 minutes →"***
4. **Razorpay Payment Link opens** in modal or redirect. UPI, card, net banking.
5. **Payment succeeds.** Loading state: *"Generating your Regulatory Draft Pack... (typically 8–10 minutes)"*.
6. **Email arrives with PDF.** Subject: *"Your CDSCO Draft Pack for NeuroScan — ready to submit"*.
7. **Arjun opens PDF.** 18-page document with sections named above, content drafted specifically for his product. Copy tone: professional, regulator-friendly, soft certainty language throughout.
8. **At the end of PDF:** *"Next steps: hand this to a consultant for ₹50K–₹2L review, or use ClearPath's Submission Concierge (₹50K · 2–3 weeks · expert-reviewed)."*

**Success state.** Arjun has a submission-ready draft he can paste into CDSCO forms or hand to a consultant. Knows exactly what applies and what's next.

**Emotional arc.** Curious → impressed by specificity → confident → ready to act.

**Edge cases.**
- Payment fails: graceful error, retry button, explicit support contact.
- PDF generation takes >15 min: send holding email *"We're still working on your pack. Watch your inbox in the next hour."* Refund if it takes >24 hours.
- Arjun wants to regenerate with different answers: one free re-generation in first 7 days, then ₹199 per re-gen.

---

## Journey 5 — Tier 3 concierge (₹50K, expert review)

**Persona.** Pritha (from Journey 2), 2 months later. Has filed MD-12 based on ClearPath's Draft Pack. CDSCO sent a deficiency letter. Doesn't know how to respond.

**Entry point.** Email nudge from ClearPath: *"CDSCO deficiency? We can help."*

**Steps:**

1. **Clicks through to clearpath.in/concierge.**
2. **Landing explainer:** *"Get an expert regulatory reviewer on your case. 2-3 weeks. ₹50K."*
3. **Process shown:**
   - Day 1: Upload your submission + deficiency letter
   - Day 2-3: Expert assignment + initial read
   - Day 4-7: Expert review + classification validation
   - Day 8-14: Document refinement + response draft
   - Day 15-21: 1 iteration based on your feedback
4. **Deliverables listed:**
   - Refined documents
   - Classification re-validation
   - QMS checklist (ISO 13485 alignment)
   - Clinical validation plan review
   - 1 iteration within 2 weeks of delivery
5. **CTA: *"Request concierge — ₹50K →"***
6. **Intake form:**
   - Product name, CDSCO application number
   - Upload current submission (PDF)
   - Upload deficiency letter
   - Target submission/response date
   - Brief context (200 words)
7. **Payment: ₹50K via Razorpay.**
8. **Confirmation screen:** *"Thanks. An expert will reach out within 48 hours. Track progress in your dashboard."*
9. **Within 48h:** email from named expert: *"Hi Pritha, I'll be working on your case. Review kickoff call scheduled for [date]. Here's what I'll need from you:"*
10. **Review cycle:** 2–3 weeks as described. Final deliverable delivered via secure portal.

**Success state.** Pritha has an expert-reviewed response to CDSCO deficiency, filed with confidence, lower probability of second deficiency letter.

**Emotional arc.** Stuck → seeking help → skeptical of another consultant → reassured by transparency → committed → delivered.

**Edge cases.**
- No expert available for 48 hours: auto-escalate, offer free upgrade to priority queue.
- Customer's case turns out to need 4+ weeks (complex clinical validation): expert flags early, offer Tier 3b upgrade for additional ₹50K instead of over-delivering at loss.
- Customer wants more than 1 iteration: clearly scoped as "+₹15K per additional iteration" upfront.

---

## Journey 6 — Polite rejection (regulator / investor / non-product)

**Persona.** Ramesh, 55, works at National Health Authority, exploring the ClearPath tool for research.

**Entry point.** Clicked link shared by a colleague.

**Steps:**

1. **Intake form.** Types: *"ABDM — National digital health infrastructure for India."*
2. **Pre-route detects: REGULATOR** (keywords: "national", "infrastructure").
3. **Polite decline screen appears:**
   - *"ClearPath assesses products. ABDM is the regulatory infrastructure we assess *against*."*
   - *"If you're evaluating an application that integrates with ABDM, try entering that product instead."*
   - *"Or — if you're here to see how ClearPath approaches ABDM compliance, see our [integration guide]."*
4. **Two CTAs:** *"Try a different product"* / *"Read our ABDM integration approach"*.

**Success state.** Ramesh isn't made to feel stupid; gets redirected productively; learns something about ClearPath.

**Emotional arc.** Neutral → mildly surprised → impressed by the polite handling → likely returns with a real product later.

**Edge cases.**
- Investor input ("Rainmatter — healthcare-focused venture capital"): same polite decline, different copy. *"We scope products, not funds. Have a portfolio company in mind?"*
- Accelerator ("IIT Delhi incubator"): similar. *"We scope products, not incubators. Who's your portfolio company?"*
- Edge: user types something genuinely ambiguous ("health platform for developers"). Treat as product; let decomposer handle.

---

## Cross-cutting UX principles

**1. Never leave the founder confused about what just happened.**
Every loading state names the step. Every result explains why. Errors have recovery paths.

**2. Honest certainty above all.**
No "100% sure" / "definitely" / "must" language anywhere in the UI. "Likely," "typically," "may apply." Post-processor enforces.

**3. Show your work.**
Every classification shows the logic that led to it. The 9-regulation snapshot is always visible on the card. Founders feel the engine reasoning, not a black box.

**4. Progress feels free, concierge feels valuable.**
Tier 0 and Tier 1 should feel slightly abundant — more than they paid for. Tier 3 should feel deliberate, personal, and weighty. Different emotional registers.

**5. Shareable by default.**
Every Readiness Card gets a permanent URL (`clearpath.in/c/{slug}`) with proper OG tags. Founders share to advisors, co-founders, investors — that's the growth loop.

**6. Mobile-first for intake, desktop for deliverables.**
Founders type the one-liner on their phone between meetings. They read the draft pack on their laptop at home. Card must work beautifully on both.

**7. Edit latitude, not edit access.**
Founders can re-run with different answers once. But once the card is generated, it's locked in the database. Preserves integrity of the assessment record.

---

## Error and edge-state cheatsheet

| Situation | Handling |
|---|---|
| Scrape fails (site 404 / timeout) | Skip reconciler. Flag on card: *"Couldn't read website. Classification based on one-liner alone."* |
| Scrape returns JavaScript-rendered SPA with no text | Same as above. Try Firecrawl paid tier if available. |
| Pre-router unsure (product vs platform) | Default to product, let user pick "actually this is a platform" mid-flow. |
| Decomposer returns 0 features | Fall through to wizard as single product. |
| Decomposer returns 10+ features | Show top 5 by likely-medical-device-ness, with "+N more" collapse. |
| Q2 follow-up triggered but user insists on same answer | Honor user choice. Flag in meta. |
| User aborts mid-wizard | Save partial state. Next visit: *"Resume where you left off?"* |
| Draft pack generation fails | Auto-retry 2x. Then email: *"We hit a snag. No charge. Try again tomorrow or contact support."* |
| User pays twice (network retry) | Auto-detect via order ID. Refund duplicate within 24h. |
| Concierge expert doesn't respond in 48h | Auto-escalate to backup expert. |
