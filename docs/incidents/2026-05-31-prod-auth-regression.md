# 2026-05-31 — API auth-gate gap (PII + write leaks)

**Status:** **CLOSED** (2026-05-31 ~07:00 IST) — prod verified 401 on all four confirmed-leak endpoints. Phase 3 (smoke + CI gate) carried to Sprint 4.

## Timeline

- **2026-05-30 EOD** — Founder reports incognito users seeing real data on `/dashboard` and `/upgrade/<id>` post-merge of `feat/sprint-3-phase-c-2c` → `main` on prod (`clearpath-medtech.vercel.app`).
- **2026-05-31 ~00:30 IST** — Discovered. Founder + on-call walk through the report.
- **2026-05-31 ~01:00 IST** — Diagnosed. Page routes (`/dashboard`, `/upgrade/[id]`, `/draft/[id]`) confirmed clean (307 → `/login` in incognito). Root cause located in API layer: `/api/upgrade/status` returns full order data without auth check. "Sprint 3 regression" premise verified incorrect — file history at `4c8db26` (Sprint 2-era creation) is identical on auth surface to `d6a5e2b` and HEAD. The leak has existed since file creation; Sprint 3 merge to main is when the URL became broadly hit-able.
- **2026-05-31 ~05:40 IST** — Broader probe identifies ≥4 confirmed read leaks (`/api/upgrade/status`, `/api/assessment/[id]`, `/api/storage/signed-url`, candidate `/api/upgrade/submit-payment-proof`) plus 11 more endpoints using `getServiceClient()` without `getUser()`. Some are intentionally public/system (Cashfree webhook, share-link reader, admin endpoints presumably env-gated).
- **2026-05-31 morning** — Full-fix path adopted. Phase 1 audit, Phase 2 helper + per-route fix, Phase 3 smoke test + CI gate.
- **2026-05-31 ~07:00 IST** — Patched + verified on prod. Four commits land on `main` (`7b76b88` helper, `b3ca259` 17-endpoint apply + `/start` rehydration, `3ff5b2f` PUBLIC/SYSTEM markers, `6df9073` webhook 503). Curl-from-incognito against prod returns 401 on all four confirmed-leak endpoints.

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

## Phase 2 outcome (2026-05-31 PM)

Helper landed at `7b76b88 feat(auth): shared helper for API route authentication + ownership`. Per-route apply landed across 17 endpoints. Final classification, post-deviation:

| Route | Class | Notes |
|---|---|---|
| 17 routes in `wizard/* upgrade/* draft/[id]/* cashfree/create-order assessment/[id]` | AUTH+OWN | `requireAuthOwnedAssessment(assessment_id)` |
| `storage/signed-url` | **AUTH ONLY** | Reclassified from AUTH+OWN. No `assessment_id` exists at upload time (intake creates the row *after* uploads land). Paired with `/start` `sessionStorage` rehydration so a mid-upload 401 → `/login?return_to=/start` round-trip restores the form. |
| `auth/resend-verification` | AUTH ONLY | Already gated; marker added. |
| `intake`, `cashfree/return`, `card/[token]/pdf`, `concierge/submit` | PUBLIC | Marker added. `card/[token]/pdf` is token-gated (see Sprint-4 entropy follow-up below). |
| `admin/costs`, `admin/generate-draft-pack`, `admin/reset-stuck-order`, `admin/verify-order` | SYSTEM | Vercel-edge Basic Auth (`www-authenticate: Basic realm="ClearPath Admin"`). |
| `cashfree/webhook` | SYSTEM | HMAC-SHA256 signature on raw body. Missing-config behavior tightened: 200-silent-ignore → **503 + log** so Cashfree retries until ops repairs env. |

Wire shape on auth failure (helper):
- `401 {"error":"unauthorized"}` — no session.
- `404 {"error":"not_found"}` for both "row missing" and "ownership mismatch" per OWASP A01:2021. Server-side log line distinguishes via `reason=missing_row | reason=ownership_mismatch` and includes `user.email`, `assessment.email`, `assessment_id`.

## Sprint-4 follow-ups

- Consider RLS at the DB layer as defense in depth. Today every leak shares a single cause (service-role client). RLS would make the API correctness independent of the helper being called.
- Document the "PUBLIC" and "SYSTEM" tags as durable architectural markers — every new API route must declare its type explicitly.
- Periodic curl-from-incognito smoke against prod URLs as part of CI on every main merge.
- Verify `assessments.share_token` column has ≥128 bits of entropy. `card/[token]/pdf` relies on the token as the auth boundary (anyone with URL can re-render); short / guessable tokens would break the public-share contract.
- Bind `storage/signed-url` uploads to an opaque pre-intake session token issued from `/start` mount, so the AUTH-ONLY gate gains soft ownership without changing the no-assessment-id-yet contract.

## Closeout (2026-05-31 ~07:00 IST)

**Resolution timeline:** discovered 00:30 IST → diagnosed ~01:00 IST → patched + verified ~07:00 IST (six and a half hours, end-to-end).

**Exposure window:** since commit `4c8db26` (Sprint 2 era). Pre-existing architectural omission, **not** a Sprint 3 regression. The Sprint 3 → main merge widened distribution of the URLs but did not introduce the gap.

**Affected data:** order PII (email), signed PDF and screenshot URLs (some still valid for ~2 months at time of discovery), intake PII (name, email, mobile, one-liner, uploaded-doc references), and wizard mutations (`save`, `complete`, `ack-conflict`, `check-q2-followup`). Realised exposure bounded by who knew assessment UUIDs; UUIDs are not enumerable but were referenced in client-side `/upgrade/[id]` StatusPanel fetches.

**Resolution:** shared helper extracted to `lib/auth/require-owned-assessment.ts` and applied to 17 AUTH+OWN endpoints; 4 PUBLIC routes marked with explicit `// PUBLIC:` comments; 4 SYSTEM routes (`admin/*`) marked with explicit `// SYSTEM:` comments; Cashfree webhook missing-config behavior tightened from 200-silent-ignore to 503 + log so Cashfree retries until ops repairs env.

**Status:** CLOSED — prod verified 401 on all four confirmed-leak endpoints (`/api/upgrade/status`, `/api/assessment/[id]`, `/api/storage/signed-url`, `/api/upgrade/submit-payment-proof`).
