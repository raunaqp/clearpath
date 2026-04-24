# ClearPath — Change Log v4: Wizard UX refinements + intake validation

**What changed:** Six UX improvements from Feature 4 browser smoke testing. Most are surgical; two touch the wizard routing model (conflict screen splits from Q1) and the intake form (add helper + error messaging).

**Why it changed:** Browser smoke test revealed wizard polish gaps that matter for Weekender demo quality. Dots look floaty, skip/required pattern unclear, slow navigation feels janky, form errors silent.

**Files to patch (surgical):**
1. `docs/specs/clearpath_screens_spec.md` — Screen 5 (stepper), new Screen 5.0 (separate conflict page), Screen 2 (intake helpers)
2. `docs/specs/clearpath_copy_scope.md` — §2 (helper + error copy), §4.1–4.8 (mandatory markers)
3. `docs/specs/clearpath_build_plan.md` — §4 implementation notes for optimistic save + routing split

---

## Patch 1 — Stepper redesign (dots → segments)

### Affects: `docs/specs/clearpath_screens_spec.md` Screen 5 "progress header"

**Replace:**
```
stepper — 7 dots (■ filled when completed/current, □ empty for upcoming)
```

**With:**
```
stepper — 7 equal-width segments with small gaps between them
- completed/current: filled teal (#0F6E56)
- upcoming: light neutral fill (#E5E5E5)
- segment gap: 4px, segment corners rounded 2px
- full bar spans container width
- height: 6px

Visual rationale: clearer spatial sense of progress than floating 
dots, more standard for multi-step flows, reads better at mobile 
375px.
```

**Implementation sketch (for Claude Code):**
```tsx
<div className="flex gap-1 w-full">
  {[1, 2, 3, 4, 5, 6, 7].map((step) => (
    <div
      key={step}
      className={`h-1.5 flex-1 rounded-sm ${
        step <= currentStep 
          ? 'bg-teal-deep' 
          : 'bg-gray-200'
      }`}
    />
  ))}
</div>
```

---

## Patch 2 — Optimistic navigation (fix slow Next clicks)

### Affects: `docs/specs/clearpath_build_plan.md` §4 wizard implementation

**Replace the current pattern:**
```
Partial state saves on every Next click (wizard_answers JSONB updated)
```

**With:**
```
Partial state saves on every Next click — optimistic UI pattern:

1. On Next click: immediately route to next question (no blocking)
2. In parallel: fire POST /api/wizard/save-answer with new answer
3. If save fails: show toast "Couldn't save your answer — retry?"  
   toast has "Retry" button that re-fires the save
4. If user navigates away during a failed save: answer persists in 
   wizard state only (they can complete flow), full save attempted 
   again on next Next click
5. Worst case on drop-off: user resumes one question behind last 
   edit. Acceptable — infrequent, self-recoverable on re-answer.

Technical:
- WizardClient.tsx uses local state for all answers
- Save API call is fire-and-forget (setTimeout 0)
- Failed saves tracked in state, surfaced as toast
- Supabase row has `wizard_answers` as source of truth; local state 
  re-hydrated on page reload from wizard_answers
```

**Result:** Next click feels instant. No more 500ms-1s lag.

---

## Patch 3 — Skip/Next/Mandatory pattern (adjusted post-smoke-test)

### Affects: `docs/specs/clearpath_build_plan.md` §4 + `docs/specs/clearpath_copy_scope.md` §4.2–4.9

**Mandatory vs optional questions:**
- Q1, Q2, Q3: **required** — `*` marker on the question title, no Skip link, Next disabled until answered
- Q4, Q5, Q6: **optional** — no marker, Skip link AND Next both visible; both advance
- Q7: **optional but handled differently** — no marker, **no Skip link**, only a primary `Generate my Readiness Card →` button. The button is always enabled. If Q7 is unanswered when clicked, it auto-marks step 7 as skipped (`meta.wizard_skipped_questions` includes 7, fires `wizard_step_skipped{step_number:7}`) and completes the wizard. If Q7 is answered when clicked, it saves normally and completes.

**Question title format:**
- Required: `* What clinical state does your product address?`
- Optional: `How many users do you expect in Year 1?`

The `*` is coral (`#993C1D`) and precedes the question text.

**Legend below every question card:** small muted italic text `* indicates a required question`.

**Navigation pattern (locked table):**

| Step | Required? | Back | Skip link | Primary button |
|------|-----------|------|-----------|----------------|
| Q1 | yes (`*`) | hidden | — | `Next →` (disabled until answered) |
| Q2 | yes (`*`) | ✓ | — | `Next →` (disabled until answered) |
| Q3 | yes (`*`) | ✓ | — | `Next →` (disabled until answered) |
| Q4 | no | ✓ | `Skip this question` | `Next →` (disabled until answered) |
| Q5 | no | ✓ | `Skip this question` | `Next →` (disabled until answered) |
| Q6 | no | ✓ | `Skip this question` | `Next →` (disabled until answered) |
| Q7 | no | ✓ | — (none) | `Generate my Readiness Card →` (always enabled; auto-skips if unanswered) |

**Why the Q7 exception:** the Generate button is the terminal action of the wizard. Forcing an explicit Skip link would make the user click twice ("Skip this question" then "Generate") for the same submit action. Folding auto-skip into Generate keeps Q7 one-click whether answered or not.

**Copy scope update:** update §4.2–§4.4 to prepend `*` in the "Question:" line for Q1–Q3. §4.5–§4.7 (Q4–Q6) stay unmarked. §4.8 (Q7) gets an explicit "no Skip link, Generate doubles as skip-and-submit when unanswered" clarification.

---

## Patch 4 — Conflict card on separate screen **[APPLIED]**

> Shipped as commit — `/wizard/[id]/conflict` route created, `/wizard/[id]/q/[n]` no longer renders the inline card, `/assess/[id]` branches on conflict severity before redirecting into the wizard. Gate + auto-redirect rules on the dedicated page are implemented in `app/wizard/[id]/conflict/page.tsx`.


### Affects: `docs/specs/clearpath_screens_spec.md` Screen 5.0 + `docs/specs/clearpath_build_plan.md` §4.0

**Replace:**
```
Conflict disclosure card renders above Q1 stepper when conditions met
```

**With:**
```
Conflict disclosure is its own dedicated screen at 
/wizard/{assessment_id}/conflict

Routing:
- After pre-router completes, /assess/{id} checks:
  - If meta.conflict_detected AND severity in ['high','medium'] 
    AND !conflict_acknowledged → redirect to /wizard/{id}/conflict
  - Otherwise → redirect to /wizard/{id}/q/1 (existing behavior)

Conflict screen layout:
- Full viewport centered card
- Same content as previous §4.0 spec:
  - "Quick heads up" or "Still a mismatch" heading
  - Two-column WHAT YOU SAID / WHAT YOUR DOCS SAY
  - Explanation paragraph
  - Two CTAs: "← Edit my description" and "Continue to questions →"
  - Helper text
- NO wizard stepper visible (this isn't step 1)
- NO "Question 1 of 7" header

CTA behaviors:
- "Continue": UPDATE meta.conflict_acknowledged = true, fire event, 
  navigate to /wizard/{id}/q/1
- "Edit": fire event, navigate to /start?resume={id}

Mobile 375px: same as before — columns stack, CTAs stack.

Back-nav behavior:
- From Q1, user cannot navigate back to /conflict (one-way ack)
- Browser back button from Q1 goes to /assess/{id} (placeholder 
  during pre-router) — not the conflict screen

Why this is better than stacking on Q1:
- Mobile users don't scroll past a conflict card to reach Q1 
  (visual overload on small screens)
- Dedicated focus — user reads disclosure without Q1 distraction
- Clearer mental model: this is a gate, not a header
```

**Remove from screens_spec.md:** the ASCII wireframe showing conflict card ABOVE the stepper on Q1 page. Replace with new standalone Screen 5.0 wireframe.

**Keep everything else the same:**
- Same copy (§4.0 of copy scope unchanged)
- Same events fire (wizard_conflict_shown, continued, edit_clicked, reappeared)
- Same meta tracking (conflict_acknowledged, conflict_edit_attempts)

---

## Patch 5 — Intake form validation + helper text

### Affects: `docs/specs/clearpath_copy_scope.md` §2.3 (form fields)

**Replace current field specs with:**

### 2.3a Name field
```
Label: Your name
Helper (ABOVE input): Enter your full name
Placeholder: (empty)
Error on blur if empty: Please enter your name
Error on submit if empty: Please enter your name before continuing
```

### 2.3b Email field  
```
Label: Your email
Helper (ABOVE input): Enter your email id, e.g. abc@xyz.com
Placeholder: founder@yourcompany.com
Helper (BELOW input, muted): We'll email your Readiness Card link 
within 5 minutes.

Validation (on blur):
- If empty: "Please enter your email"
- If invalid format (no @ or no domain): "Please enter a valid email, 
  e.g. abc@xyz.com"
- If submitted with error: same message + field border turns coral

Email regex (client-side, lenient):
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### 2.3c Mobile field
```
Label: Mobile number (optional)
Helper (ABOVE input): Enter a valid 10-digit number
Placeholder: 98765 43210
Helper (BELOW input, muted): Only if you'd like WhatsApp updates — 
we won't call you

Prefix: +91 (shown as visual prefix, not editable)

Validation (on blur):
- If non-empty and not 10 digits: "Please enter a 10-digit mobile 
  number"
- If contains non-digits: "Mobile number should only contain digits"

Skip if field left empty (it's optional).
```

### 2.3d One-liner field
Unchanged (existing helper + counter already handles it).

### 2.3e Website field
Unchanged.

### 2.3f PDF upload
Unchanged (existing expanded helper is correct).

---

## Patch 6 — Field error styling **[APPLIED]**

> Shipped alongside Bug A. Per-field validators live in `lib/intake/validation.ts`; the /start page now shows coral error styling with inline ⚠ text below each field, validates on blur + on submit, scrolls to the first erroring field, and blocks the `E.g.` placeholder prefix both client-side and server-side. See also §2.3 of the copy scope for the updated error messages.


### Affects: `docs/specs/clearpath_screens_spec.md` Screen 2

**Add to form field component spec:**

```
Input field states:
- default: neutral gray border (#E5E5E5), white bg
- focus: teal border (#0F6E56), white bg
- error: coral border (#993C1D), white bg + red-tinted error text 
  below field
- success (optional polish): green check icon in input right-edge 
  on valid email/mobile

Error text appears directly below input, small, coral colored, 
with a small error icon (⚠) inline.

Error states clear on next keystroke — don't keep error showing 
while user is typing corrections.
```

---

## PostHog diagnostic (not a spec change — for user to run)

Before changing anything about event instrumentation, user should 
verify PostHog is actually receiving events:

1. Open any page on clearpath-medtech.vercel.app
2. F12 → Console
3. Type: `posthog` and Enter
   - If `undefined`: script not loaded, check NEXT_PUBLIC_POSTHOG_KEY 
     in Vercel env vars
   - If object returned: script loaded, proceed
4. Type: `posthog.capture('debug_ping', { source: 'smoke_test' })`
5. Check eu.posthog.com → Activity → Live Events — should appear 
   within 30 seconds
6. If debug_ping appears but wizard_* events don't:
   - Check for ad blockers
   - Check Chrome extensions blocking fetch to eu.i.posthog.com
   - Verify in Network tab that /e/ POST requests fire on wizard events
7. If debug_ping does NOT appear:
   - PostHog init or key issue
   - Check browser console for PostHog errors
   - Check Network tab for blocked requests to eu.posthog.com

Most common cause: ad blocker in Chrome. Try incognito mode or 
different browser to isolate.

---

## Implementation order for Claude Code

Apply in this order (each is independent, can ship separately):

1. **Stepper redesign** (Patch 1) — 15 min. Smallest, lowest risk.
2. **Mandatory markers + skip pattern** (Patch 3) — 30 min. Copy + conditional rendering.
3. **Optimistic navigation** (Patch 2) — 1 hour. Refactor save logic.
4. **Intake validation + helpers** (Patches 5 + 6) — 1-1.5 hours. 
   Field-level validation, error states, helper copy update.
5. **Conflict screen split** (Patch 4) — 1.5-2 hours. New route, 
   routing changes, cleanup of old stacked layout.

**Total: ~4-5 hours** if done sequentially. Can parallelize 1+3 if 
dispatching sub-agents.

Ship each as its own commit for easy rollback. Don't bundle all 5 
into one commit.

---

## Test cases to add to stage-2-wizard.ts harness

```
13. Stepper renders 7 segments (not dots)
14. Required question Q1 shows * marker
15. Required question Q1 has no Skip link
16. Optional question Q4 shows no * marker
17. Optional question Q4 has Skip link that advances and marks meta
18. Invalid email on submit blocks submission, shows error
19. Mobile with 9 digits on blur shows error
20. Conflict routing: pre-router with conflict → /conflict not /q/1
21. Conflict Continue → /q/1 and back-nav doesn't return to /conflict
22. Next click navigates before save completes (optimistic)
23. Failed save shows retry toast
```

All 11 new assertions in addition to the existing 15.

---

## Summary

Six spec changes (Patches 1-6) addressing browser smoke test feedback. No new features, no new endpoints — all are polish and UX fixes to Feature 4 and Feature 2.

Don't regenerate any full docs — apply patches surgically to the three source files listed at top.
