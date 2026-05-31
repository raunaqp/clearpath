# 2026-05-31 — API auth-gate gap (PII + write leaks)

**Status:** Phase 1 (audit) in progress.

## Timeline

- **2026-05-30 EOD** — Founder reports incognito users seeing real data on `/dashboard` and `/upgrade/<id>` post-merge of `feat/sprint-3-phase-c-2c` → `main` on prod (`clearpath-medtech.vercel.app`).
- **2026-05-31 ~05:40** — Diagnostic round 1. Page routes (`/dashboard`, `/upgrade/[id]`, `/draft/[id]`) confirmed clean (307 → `/login` in incognito). Root cause located in API layer: `/api/upgrade/status` returns full order data without auth check. Founder's "Sprint 3 regression" premise verified incorrect — file history at `4c8db26` (Sprint 2-era creation) is identical on auth surface to `d6a5e2b` and HEAD. The leak has existed since file creation; Sprint 3 merge to main is when the URL became broadly hit-able.
- **2026-05-31 ~06:00** — Broader probe identifies ≥4 confirmed read leaks (`/api/upgrade/status`, `/api/assessment/[id]`, `/api/storage/signed-url`, candidate `/api/upgrade/submit-payment-proof`) plus 11 more endpoints using `getServiceClient()` without `getUser()`. Some are intentionally public/system (Cashfree webhook, share-link reader, admin endpoints presumably env-gated).
- **2026-05-31 morning** — Full-fix path adopted. Phase 1 audit, Phase 2 helper + per-route fix, Phase 3 smoke test + CI gate.

## Exposure window

The unauthenticated `getServiceClient()` pattern dates to commit `4c8db26 feat(payment-ui): /upgrade/[id] payment flow with QR + proof upload` — Sprint 2 era. The leak surface has been wide-open the entire time. Realised exposure is bounded by who knew assessment UUIDs; UUIDs are not enumerable but are referenced in:
- Share-link tokens (different surface)
- StatusPanel client-side fetch (visible in network panel to any visitor of `/upgrade/[id]`)
- Email recipients of delivered reports (no UUID exposure unless reply chain)

## What was exposed (confirmed via curl from incognito)

- **`/api/upgrade/status?assessment_id=<uuid>`** — order PII (email), payment screenshot signed URL, draft pack PDF signed URL (some still valid for ~2 months), transaction_id, status, delivery times, tier_choice. Confirmed against assessment `a4bd6e06`.
- **`/api/assessment/<uuid>`** — name, email, **mobile phone number**, one-liner, uploaded_docs reference. Confirmed against `a4bd6e06` returning `Raunaq Pradhan` / `raunaq.pradhan@gmail.com` / `+91…`.
- **`/api/storage/signed-url`** POST — mints write-only Supabase storage signed URL into `assessment-docs/intake/`. Attacker can pollute the bucket; cannot read out arbitrary content.
- **`/api/upgrade/submit-payment-proof`** POST — input-validation rejected the empty probe (400). With a valid body the endpoint likely accepts unauthenticated payment-proof uploads. Not destructively probed against prod.
- **Suspected wizard mutations** (`/api/wizard/save`, `/complete`, `/ack-conflict`, `/check-q2-followup`) — accept `assessment_id` in body, no auth check. Source-read suggests writes succeed unauthenticated; not destructively probed against prod.

## Resolution plan

Three phases with founder-eyeball gates between each:

1. **Phase 1 — Audit.** Classify all 25 `getServiceClient` endpoints into AUTHENTICATED+OWNERSHIP / AUTHENTICATED ONLY / PUBLIC / SYSTEM. Pause for founder review.
2. **Phase 2 — Helper + fix.** Build `lib/auth/require-owned-assessment.ts` with `requireAuth()` and `requireAuthOwnedAssessment()`. Apply per classification. Pause for founder diff review.
3. **Phase 3 — Tests + verify.** Build `scripts/smoke-api-auth.ts` that hits each endpoint unauthenticated and asserts expected behaviour. Wire into CI. Verify local → preview → prod.

## Sprint-4 follow-ups

- Consider RLS at the DB layer as defense in depth. Today every leak shares a single cause (service-role client). RLS would make the API correctness independent of the helper being called.
- Document the "PUBLIC" and "SYSTEM" tags as durable architectural markers — every new API route must declare its type explicitly.
- Periodic curl-from-incognito smoke against prod URLs as part of CI on every main merge.
