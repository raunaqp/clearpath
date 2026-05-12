# Sprint 3 Phase 1 — founder checklist

Phase 1 ships Stories 3.1 / 3.2 / 3.4 / 3.5 in code. Stories 3.7
(Cashfree production switchover) and Story 3.10 (dashboard rework)
are separate.

## Pre-deploy steps

### 1. Apply migration 016 (tier_choice column)

Paste `supabase/migration-016-tier-choice.sql` into Supabase
Dashboard → SQL Editor → Run. Then validate locally:

```
npx tsx --env-file=.env.local scripts/validate-migration-016.ts
```

Expected: 5/5 checks pass. (Includes a back-fill assertion that
turns existing rows' null `tier_choice` into `'draft_pack'`.)

### 2. Configure Cashfree dashboard for both tiers

**Sandbox first.** No new webhook URLs needed — the existing
`/api/cashfree/webhook` handles both tiers (amount is set per
order at creation time, not per SKU). Cashfree's sandbox
account already accepts arbitrary amounts.

### 3. Story 3.7 — production switchover (when ready)

In Vercel → Project → Settings → Environment Variables:

- Flip `CASHFREE_ENVIRONMENT` from `TEST` to `PROD`
- Replace `CASHFREE_APP_ID` + `CASHFREE_SECRET_KEY` with production
  credentials from Cashfree → Dashboard → Developers → API Keys

Then in Cashfree → Webhooks → Production:

- URL: `https://clearpath-medtech.vercel.app/api/cashfree/webhook`
- Events: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`,
  `PAYMENT_USER_DROPPED_WEBHOOK`
- Authentication: signature key auto-matches the secret you just set

**Cashfree KYC must be complete first.** Production keys require:

- PAN
- Bank account
- GST (or declaration of < ₹20 L revenue)
- Phone verification of the merchant

If KYC isn't done, sandbox stays useful — you can run end-to-end
tests with test cards (4111-1111-1111-1111 / any future expiry /
any CVV) and the auto-trigger / generator / delivery all behave
identically to production.

## Smoke checklist for the new flow

Once migration 016 is applied:

1. **Tier picker** — `/upgrade/<assessment_id>` (with no existing
   order) shows two cards side-by-side: Draft Pack ₹499 (amber accent)
   and Draft Editor ₹2,499 (teal accent, "Recommended" pill).

2. **Tier selection** — clicking either card navigates to
   `?tier=<choice>`. Page re-renders with a "You picked …" banner
   on top and a "Change tier" link.

3. **Tier-aware email gate** — for `draft_pack`, the email-verify
   banner appears above the pay block if the user is unverified.
   For `draft_editor`, the gate does NOT fire — you can pay
   immediately even without email confirmation.

4. **Cashfree pay button label** — shows "Pay ₹499" or "Pay ₹2,499"
   based on tier. Body sent to `/api/cashfree/create-order` includes
   `tier_choice`.

5. **Auto-trigger** — pay via Cashfree sandbox (use test card
   4111-1111-1111-1111). Cashfree webhook fires. Status transitions
   `created → generating` in one write (no `paid` intermediate);
   v2 orchestrator runs in the background via `after()`. Watch
   Vercel function logs for `[v2-auto-trigger]` entries.

6. **Robustness check (3.5)** — after orchestrator finishes,
   `tier2_orders` is flipped to `delivered` ONLY IF
   `draft_pack_sections` rowcount equals 12. If not (silent
   persist failure), status stays at `generating` with a
   `notes='auto-gen incomplete: N/12 sections persisted'` stamp.
   Recovery via `scripts/generate-draft-pack-v2-live.ts <assessment_id>`.

7. **Tier-aware delivery (3.4)** — on `/upgrade/[id]` after
   delivery:
   - Draft Pack: "Emailed to {email}." Open-in-browser link +
     Download-PDF link.
   - Draft Editor: "Your Draft Editor is ready." Open-Draft-Editor
     link (primary action).

## Sprint 3 stories landed in Phase 1

- 3.1 Two-tier pricing (Cashfree SKUs)
- 3.2 Auto-trigger v2 on Cashfree paid webhook
- 3.4 Tier-aware delivered state in StatusPanel
- 3.5 Generator robustness (rowcount == 12 gate)

## Sprint 3 stories still to come (Phase 2+)

- 3.7 Cashfree production switchover (docs above; founder action)
- 3.10 Dashboard UX rework (Phase 4)
- 3.NEW Expert portal v1 + messaging (Phase 3)
- 3.NEW2 MD-22/23 clinical investigation path (Phase 2)
- 3.NEW3 MD-12 manufacturing license path (Phase 2)
- P1 stretch: 3.5 already done · 3.NEW4 demo datasets
