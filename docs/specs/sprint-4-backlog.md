# Sprint 4 backlog

Items recorded during Sprint 3 (Apr 25 – May 31 2026) and earlier
sprints that landed past the Sprint-3 freeze line. Working canon —
prioritise / cut at Sprint-4 kickoff.

Prior items numbered **4.1–4.14** live in `docs/sprint-3-plan.md`
under "## Sprint 4 backlog (recorded, not committed)". They are
considered carried forward; do not duplicate here.

## From Day-6 prod walk + auth incident (2026-05-31)

### UI / UX (from prod walk findings)

- Dashboard "Upgrade to Submission Workspace" CTA missing on
  delivered ₹499 cards (visible on `/upgrade/[id]` page only)
- Dashboard initial-load performance: multi-second delay before
  assessments appear; investigate query patterns
- Regenerate button persists after PDF delivered; should show only
  "download" with regenerate gated behind confirmation
- Submission Workspace progress denominator stale (shows "X of 12"
  for hardware pack which has 18 sections)
- Submission Workspace post-generation redirect: cosmetic improvement
  to match accurate denominator
- `/upgrade/[id]` generation-hang UX hardening (defensive against
  malformed order state; not prod-reachable but belt-and-suspenders)

### Architecture / engineering

- Code-duplication architectural guardrail: lint rule or code-review
  checklist for helpers used by ≥2 call sites
- Schedule-citation hallucination guard: extend verified-citations
  pattern to ISO/IS standard numbering, ICMR guideline references,
  NABL accreditation IDs
- Internal script production-invariant compliance: refactor
  `generate-draft-pack-v2-live.ts` to use `/api/cashfree/create-order`
  + mark-as-paid path instead of direct INSERT
- §1 Opus consolidator persona-awareness
- Hardware overlays for §10, §2, §5, §7, §9 (working acceptably under
  SaMD prompts but not as sharp as the overlaid sections)
- §13 add-on local strict triggers: align with `calibratedTrigger`
  pattern from `section-gating.ts`

### Operational / security

- Production deploy verification CI gate: post-deploy smoke that hits
  prod URLs and asserts auth + page behavior (the "merged ≠ working
  in prod" debt as a real check)
- Row-Level Security (RLS) at Supabase layer: defense in depth for
  the API auth pattern; significant multi-day work but would have
  prevented the Day-6 incident
- `/api/card/[token]/pdf` — verify share-link token entropy ≥128 bits
  (token IS the auth on this public route)
- `/api/cashfree/create-order` ownership-gap deepening: verify the
  AUTH+OWN apply is sufficient for the confused-deputy scenario
- 44-minute hung `/api/upgrade/status` response observed during dev:
  investigate root cause (likely polling orphaned order state); low
  priority

## Already-acknowledged Sprint-4 items still standing

- 2b CI researcher persona pack
- Cashfree production-key switchover
- Tier 2 v2 PDF tofu-box arrow bug (CSS `@font-face` in
  `/draft/[id]?print=1`)
- §8.13 Biological safety overlay
- Class A non-sterile/non-measuring portal-registration path
- Seed-table CDSCO-consultant sign-off
- IVD pack
- Production-readiness polish (real email, refund-on-failure,
  observability/alerting, SLA on 4–6 min generation)
