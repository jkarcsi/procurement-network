# Procura — Implementation Plan

The single, long-term development document for **Procura**, an outcome-focused
B2B procurement network for Hungarian SMEs. It is both the standing brief for
each autonomous run **and** the full product roadmap (every backlog item). Read
it at the start of every run, follow it, and keep it current (state inventory,
roadmap, backlog, and the status log at the bottom).

Repo: `jkarcsi/procurement-network` (GitHub). Companion project:
`lead-discovery` (see §9).

---

## 1. Mission & definition of done

Ship a **market-ready application**: no demo-only limitations, deployable,
secure enough to put in front of paying customers. Every run must move the
product measurably closer to that goal and leave the repository green
(build + lint + test + smoke passing) and pushed.

### Definition of market-ready (the launch finish line)

- [x] Real transactional email delivery (provider-backed, outbox as dev fallback)
- [x] Public marketing/landing page with pricing, terms, and privacy pages
- [x] Credit-based monetization of analysis features (ledger, balance, packages)
- [x] Stripe **test mode** checkout for credit packages (webhook-granted, idempotent)
- [x] Stripe Pro subscription + plan limits enforced server-side (`src/lib/limits.ts`)
- [x] Biometric sign-in: **mobile app only** (Expo `expo-local-authentication`);
      desktop web is email+password by design (web WebAuthn removed)
- [x] Mobile app (Expo) covering the full loop; EAS build config in place
      (remaining: store submission — human/EAS)
- [x] Search, filtering, and pagination on every list view
- [x] In-app + email + push notifications for the core loop events
- [x] Admin panel (users, RFQs, suppliers, credit ledger, supply-gaps, moderation)
- [x] Rate limiting and abuse protection on auth and public endpoints
- [x] Automated tests (vitest) + smoke (discovery + HTTP)
- [x] Production deployment story (Dockerfile, CI, env vars, Postgres-ready)
- [x] Error tracking + opt-in product analytics (no SDK)
- [~] Legal sign-off: GDPR export + account deletion DONE; counsel review of
      terms/privacy + consent banner still open (human)
- [ ] Audit completeness: every business mutation leaves an AuditLog row;
      credit moves leave CreditTransaction rows
- [ ] Empty/loading/error states everywhere; responsive, Revolut-grade UI polish

---

## 2. Hard rules / conventions

1. **Language split: Hungarian product, English codebase.** Everything a user
   sees is Hungarian (UI copy, status labels, validation/errors, emails,
   analysis output, seed descriptions shown in the UI). Everything code-level is
   English (identifiers, slugs, comments, commit messages, docs, console output,
   test names/assertions, AI prompt instructions that instruct Hungarian output).
2. **Branch discipline.** Develop on the branch the session was given
   (`claude/...`). Push with `git push -u origin <branch>`. Never push to `main`
   directly and never open a PR unless explicitly asked.
3. **Payments: Stripe test mode only.** Only `sk_test_...` keys, hosted Checkout
   (no custom card forms), webhook signature verification, empty strings for keys
   in `.env.example`, never store card data. Monetization model: **credits** pay
   for analysis features (ledger in `src/lib/credits.ts` — all balance changes go
   through it); subscription tiers gate volume limits.
4. **Don't break the loop.** `npm run build`, `npm run lint`, `npm run test`,
   `npm run smoke` must pass before every push. The full RFQ loop must keep
   working **without** `ANTHROPIC_API_KEY` (rule-based fallbacks in `src/lib/ai.ts`).
5. **Read `node_modules/next/dist/docs/` before new Next.js patterns.** Next 16:
   `params`/`searchParams` are Promises, `cookies()` is async.
6. **Branding: never say "AI" in user-facing copy.** Position on outcomes, not
   technology: "Procura elemzés", "intelligens pontosítás", "okos shortlist".
   Model/provider names only where legally required (privacy processor list).
   Code-level naming (`src/lib/ai.ts`, `aiUsed`) is unaffected.
7. **Shared business logic in `src/lib/*`**, used by both the web server actions
   and the `/api/v1` mobile API, so behavior (audit, emails, notifications,
   analytics) is identical across surfaces.

---

## 3. Environment & setup (every run)

```bash
npm install                  # node_modules is not persisted between sessions
cp .env.example .env         # if .env is missing
npx prisma db push           # SQLite schema sync (prisma/dev.db); add --accept-data-loss after schema changes, then re-seed
npm run db:seed              # idempotent demo data
npm run build                # verify you start from green
git log --oneline -10        # see where the last run stopped
```

Read `AGENTS.md` for conventions and the **status log (§11)** for where the
previous run left off.

### Stack

- Next.js 16 (App Router, server actions, Turbopack), React 19, Tailwind 4
- Prisma 6 + SQLite (`prisma/dev.db`; schema is Postgres-compatible)
- `@anthropic-ai/sdk`, model from `ANTHROPIC_MODEL` env var
- bcryptjs, zod (light use), tsx (seed + smoke), vitest (unit tests)

---

## 4. How to work a run

1. **Pick ONE item** — from the Execution roadmap (§6) top-down, or a Backlog
   (§7) item by priority. Prefer a small, complete vertical slice (schema +
   action/lib + UI + test) over a broad partial one.
2. **Implement** per `AGENTS.md`. Boring, direct, maintainable. Comments only
   for non-obvious WHY. No TODO comments — don't start what you can't finish.
3. **Verify**: build && lint && test && smoke; for UI, exercise the full flow
   against `npm run dev` (HTTP check).
4. **Commit and push early and often.** Usage time is capped (~5 hours). Push a
   green commit as soon as a coherent piece is done. If the budget is running
   out, get to green, push, and update the status log.
5. **Update the roadmap status and the status log (§11)** in the final commit:
   what shipped, what's in progress, exact next step.

---

## 5. Shipped (do not rewrite)

- Buyer/supplier auth: register / login / logout (HMAC-signed cookie, `src/lib/auth.ts`)
- RFQ wizard: one-sentence intake → clarifying questions → structured spec
- Deterministic supplier shortlist (category 50 + region 30 / nationwide 20 +
  response rate ≤15 + certification 5 + rating ≤5)
- RFQ send-out (`src/lib/rfqs.ts sendRfq`): shortlist + extra emails, tokenized invites
- Public token-based supplier reply page (`/r/[token]`), no registration needed
- Offer submit/accept (`src/lib/offers.ts`), Procura elemzés (credit-gated), audit trail
- Supplier profile + portal; open opportunities (`joinOpenRfq`) self-apply
- Reviews & ratings (`src/lib/reviews.ts`), fed into matching
- Email via Resend (outbox always written); transactional: invite, offer
  received, offer accepted, welcome
- In-app notifications + Expo push (`src/lib/notifications.ts`, `push.ts`)
- Marketing: `/pricing`, `/terms`, `/privacy`, landing social proof, public
  `/tenders` board, programmatic SEO `/szolgaltatas/[c]/[r]` + `sitemap.ts`
- Growth: claim-profile, referral program (`src/lib/referral.ts`), embeddable
  widget (`/embed/[token]`, `src/lib/embed.ts`)
- Credits + Stripe test-mode checkout + Pro subscription + FREE limits
- Admin panel incl. supply-gap alerts (`/admin/supply-gaps`)
- Rate limiting, analytics (PostHog capture), error tracking (`onRequestError`)
- Public API v1 (`/api/v1/*`, hashed API keys, OpenAPI) + mobile token auth
- Mobile app (`mobile/`, Expo) — full loop, biometrics, push
- GDPR export + account deletion; Docker + CI; vitest + smoke
- Lead-discovery scaffold (`lead-discovery/`, separate project — §9)

### Demo accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Buyer | `demo@vevo.hu` | `demo1234` |
| Supplier (CleanPro Facility Kft.) | `demo@beszallito.hu` | `demo1234` |
| Admin | `admin@procura.hu` | `admin1234` |

---

## 6. Execution roadmap (ordered)

Sequenced from the backlog (§7). **Do the Growth track first, then Revenue,**
then the broader backlog by priority. Update Status as each ships.

### 6.1 Growth track

| Order | Code | Item | Status |
|---|---|---|---|
| 1 | G1 | Lead-discovery & cold-outreach engine (separate project, legal-gated) | IN PROGRESS — scaffold in `lead-discovery/`; blocked from its own repo this session |
| 2 | G2 | "Claim your business profile" | ✅ DONE (run 20) |
| 3 | G3 | Referral program | ✅ DONE (run 20) |
| 4 | O2 | Supply-gap alerts (admin) | ✅ DONE (run 20) |
| 5 | G4 | Public / open-tender marketplace | ✅ DONE (run 20) |
| 6 | G7 | Social proof on landing | ✅ DONE (run 20) |
| 7 | G5 | Programmatic SEO pages | ✅ DONE (run 20) |
| 8 | G6 | Embeddable "ajánlatot kérek" widget | ✅ DONE (run 20) |
| 9 | G8 | Partnerships / verified supplier import | DEFERRED — business-dev; codeable part belongs with G1 |

### 6.2 Revenue track

| Order | Code | Item | Status |
|---|---|---|---|
| 1 | T1 | Reviews & ratings (feeds matching) | ✅ DONE (run 21) |
| 2 | $2 | Credit auto-recharge | ✅ DONE (run 21) — threshold/package settings on `/credits`; `maybeAutoRecharge` after each charge (demo grant; Stripe off-session when a saved card exists) |
| 3 | B4 | RFQ Q&A thread (answers feed category templates) | TODO ← **next** |
| 4 | B5 | RFQ attachments | TODO |
| 5 | S5 | Paid placement / boost (marked "kiemelt") | TODO |
| 6 | S6 | Supplier offer quota then paywall | TODO |
| 7 | $1 | Team / Enterprise tier | TODO |
| 8 | $5 | Annual billing discount | TODO |
| 9 | $3 | Success-fee option | TODO |

### 6.3 Then, by theme

After Growth + Revenue: production hardening (O4 Postgres → O3 job queue → O10
E2E → O6 observability), then matching intelligence (M-series), trust (T2/T3),
and the rest of §7 by priority.

---

## 7. Full backlog

The complete product wishlist. Each row has a stable code (e.g. `M3`); effort is
a rough T-shirt size (S/M/L/XL). **✅ marks shipped items** (see §6 for the run).
Pick one, build a complete vertical slice, verify, push.

### M — Matching & intelligence

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| M1 | Semantic matching (embeddings) | L | Replace/augment keyword category+region detection and supplier ranking with vector similarity; precompute supplier/category embeddings; rule-based fallback stays |
| M2 | Learning-to-rank shortlist | L | Fold historical win rate, avg price competitiveness, recency into the score; keep deterministic + explainable ("miért ajánljuk") |
| M3 | Spec quality meter | M | Before send-out, score how complete the RFQ is and nudge the buyer to fill gaps; per-category required-field hints |
| M4 | Budget/price-range estimator | M | Show typical net price bands per category × region from past accepted offers (anonymized, min-N threshold) |
| M5 | Duplicate-RFQ detection | S | Warn a buyer when a near-identical active RFQ already exists |
| M6 | Multi-category RFQ | M | One RFQ spanning e.g. cleaning + security; shortlist per category; offers grouped |
| M7 | Offer anomaly flags | S | Mark suspiciously low/high offers vs. the field; protect buyers from dumping/typos |
| M8 | Negotiation assistant | M | Suggest a counter-offer / best-and-final request based on the spread (credit-gated, "Procura elemzés" branding) |
| M9 | Supplier capacity signals | M | Suppliers expose availability/lead-time; matching deprioritizes overloaded/paused suppliers |
| M10 | Category auto-expansion | M | Detect intake that fits no seeded category and propose a new one to admins (taxonomy growth loop) |

### B — Buyer experience

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| B1 | RFQ templates & clone | S | Save an RFQ as a template / clone a past one; speeds repeat tenders |
| B2 | Recurring RFQs | M | Schedule periodic re-tender for ongoing services (e.g. quarterly); auto-create a draft + reminder |
| B3 | Weighted comparison matrix | M | Compare offers with buyer-set weights (price/start date/cert/rating); highlight best fit |
| B4 | RFQ Q&A thread | M | Registered suppliers ask clarifying questions; buyer answers; visible to all invitees; recurring Qs feed the category clarify-template |
| B5 | RFQ attachments | M | `Attachment` model, local `/uploads` in dev (Blob/S3 in prod), 10 MB cap, PDF/DOCX/XLSX/PNG/JPG; download on the reply page |
| B6 | Deadline reminders & auto-close | S | Email/push the buyer before deadline; auto-move SENT→CLOSED past deadline with no decision |
| B7 | Two-stage RFQ (BAFO) | M | Shortlist offers, then request best-and-final from the chosen few |
| B8 | Buyer org & approval workflow | L | Multiple users per buyer company, roles, spend thresholds requiring approval before send/accept |
| B9 | Saved/blocked suppliers | S | Per-buyer favorites and blocklist that bias (or exclude from) the shortlist |
| B10 | PDF export (RFQ + offers) | S | One-click procurement record; useful for offline approval |
| B11 | Calendar view | M | Deadlines, fulfillment dates, recurring-service reminders; optional mutual availability |
| B12 | Contract draft from accepted offer | M | Generate an editable service-contract draft pre-filled from the RFQ spec + accepted offer |

### S — Supplier experience

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| S1 | Supplier analytics | M | Win rate, response-time percentile vs. peers, invite→offer→win funnel |
| S2 | Offer templates / pricing presets | S | Reusable price lines and boilerplate to answer faster |
| S3 | Availability / pause invites | S | Toggle "nem fogadok új megkeresést"; matching skips paused suppliers |
| S4 | Supplier org (multi-user) | M | Several users share one supplier profile; per-user notifications |
| S5 | Paid placement / boost | M | Suppliers pay to rank higher, clearly marked "kiemelt" so ranking trust holds |
| S6 | Offer quota then paywall | M | First X offers free, then registration + package required; keep one-click reply for the free quota |
| S7 | Opportunity digest | S | Daily/weekly email+push of new matching open opportunities |
| S8 | Auto-decline rules | S | Decline invites outside chosen categories/regions/price floor automatically |

### T — Trust, quality, compliance

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| ✅ T1 | Reviews & ratings | M | Buyer rates the supplier after DECIDED; average shown + feeds matching (≤5 pts) — DONE (run 21) |
| T2 | Supplier verification | M | Check VAT number validity (NAV/VIES) + company-registry existence; "ellenőrzött" badge |
| T3 | Certificate verification | M | Upload + (manual or registry) verification of certifications; badge on shortlist |
| T4 | Dispute resolution flow | M | Structured complaint after a deal, with audit trail and admin mediation |
| T5 | Escrow / milestone payments | XL | Deposit held by Procura until fulfilment (Stripe Connect); **needs payment-institution licensing + counsel** |
| T6 | KYC/AML for payouts | L | Required once money moves through the platform |
| T7 | Procurement audit export | S | Buyer downloads a tamper-evident record (RFQ, invites, offers, decision, timeline) |
| T8 | E-signature on contracts | M | Integrate an e-sign provider for the accepted-offer contract |

### $ — Monetization

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| $1 | Team / Enterprise tiers | M | Beyond FREE/PRO: seats, SSO, audit, SLA; gate via `src/lib/limits.ts` |
| $2 | Credit auto-recharge | S | Top up automatically when balance drops below a threshold (Stripe) |
| $3 | Success fee option | M | Optional commission on accepted-offer value as an alternative to subscriptions |
| $4 | Lead marketplace | L | Suppliers pay per qualified lead/opportunity (ties into the lead-discovery project) |
| $5 | Annual billing discount | S | Yearly plans; proration; invoices |
| $6 | White-label / association edition | L | Branded instance for a chamber or industry body |

### G — Growth & virality

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| G1 | Lead-discovery & cold outreach engine | XL | Reach non-registered businesses with relevant RFQs → they register to respond. **Separate project — see `docs/lead-discovery-plan.md` + `lead-discovery/`** |
| ✅ G2 | "Claim your business profile" | M | Cold lead receives an RFQ → claims + prefills its profile, converts to supplier — DONE (run 20) |
| ✅ G3 | Referral program | M | Invite a buyer/supplier, both get credits; tracked, fraud-capped — DONE (run 20) |
| ✅ G4 | Public/open tender marketplace | M | Opt-in RFQs on a public board; inbound supplier signups — DONE (run 20) |
| ✅ G5 | Programmatic SEO pages | M | "{kategória} {megye}" landing pages + sitemap — DONE (run 20) |
| ✅ G6 | Embeddable "ajánlatot kérek" widget | M | Buyers embed a quote box that creates a Procura RFQ — DONE (run 20) |
| ✅ G7 | Case studies / social proof | S | Real outcome stats on the landing — DONE (run 20) |
| G8 | Partnerships (chambers/associations) | M | Co-marketing + verified supplier import with MKIK or sector bodies |

### X — Integrations & API

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| X1 | Outbound webhooks | M | Let integrators subscribe to events (offer.received, rfq.decided); signed payloads |
| X2 | Accounting/invoicing | M | Számlázz.hu / Billingo / NAV Online Számla for the accepted deal |
| X3 | SSO login | M | Google / Microsoft sign-in (web + mobile) alongside email+password |
| X4 | Calendar sync | S | Push deadlines/fulfillment to Google/Outlook calendars |
| X5 | Slack/Teams notifications | S | Org-level channel alerts for new offers/decisions |
| X6 | Zapier / Make connector | M | No-code automations off the public API |
| X7 | API: pagination + filtering + SDK | S | Cursor pagination, more filters, a tiny TS client package |

### N — Notifications & engagement

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| N1 | Notification preferences | S | Per-type, per-channel (in-app/email/push) opt-in/out; quiet hours |
| N2 | Email digests | S | Batched daily/weekly summaries instead of per-event emails |
| N3 | SMS for urgent events | M | Optional SMS (provider) for deadline/accepted; cost-capped |
| N4 | Web push (PWA) | M | Browser push for the installed PWA, mirroring mobile push |

### O — Analytics, ops & reliability

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| O1 | Admin analytics dashboards | M | Funnel, cohorts, category demand heatmap, supply/demand gaps |
| ✅ O2 | Supply-gap alerts | S | Flag categories/regions with demand but few suppliers — DONE (run 20) |
| O3 | Background job queue | M | Move inline email/push/AI calls to a queue (BullMQ/Redis); retries; avoids request latency |
| O4 | Postgres migration | M | Switch `DATABASE_URL` to managed Postgres; pooling; migration scripts (schema already compatible) |
| O5 | Shared-store rate limiting | S | Replace in-memory limiter with Redis/KV for multi-instance correctness |
| O6 | Observability | M | Structured logs, request tracing, dashboards/alerts (analytics + onRequestError hooks exist) |
| O7 | Feature flags + A/B testing | M | Gate rollouts; experiment on copy/flows |
| O8 | Backups & DR runbook | S | Automated DB backups, restore drills, documented RTO/RPO |
| O9 | Load & performance testing | S | k6/Artillery scenarios for the core loop; budget thresholds in CI |
| O10 | E2E test suite | M | Playwright across the full buyer↔supplier loop, in CI |

### D — Data, i18n, taxonomy

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| D1 | Taxonomy expansion | M | Beyond facility/compliance (e.g. marketing, logistics, construction trades); seed + clarify questions |
| D2 | English UI option | M | i18n layer so international buyers can use the product; Hungarian stays default |
| D3 | County→settlement granularity | S | Finer region matching (city-level) for dense areas like Budapest districts |
| D4 | Multi-currency | M | For cross-border suppliers; display + offer currency |

### A — Accessibility & UX polish

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| A1 | Accessibility audit (WCAG 2.2 AA) | M | Keyboard nav, ARIA, contrast, focus states across all pages |
| A2 | Dark mode | S | Theme tokens + toggle (web + mobile) |
| A3 | Onboarding tours | S | First-run guidance for buyers and suppliers |
| A4 | Performance pass | S | Image optimization, code-splitting, font loading, Lighthouse budget |
| A5 | Richer empty/loading states | S | Skeletons + helpful empty states everywhere |

### MOB — Mobile (beyond the current full loop)

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| MOB1 | Offline cache | M | Cache lists/detail for read access offline; queue actions |
| MOB2 | Deep links / universal links | S | Open `procura://rfq/<id>` and HTTPS app links straight to a screen |
| MOB3 | Tablet / large-screen layout | S | Master-detail layout on wide screens |
| MOB4 | Biometric re-auth for sensitive actions | S | Re-prompt biometrics before accept/purchase |
| MOB5 | Localized push categories & badges | S | Per-type channels, unread app-icon badge |
| MOB6 | In-app review prompts | S | Ask for an app-store rating after a successful deal |

### Suggested near-term picks (opinion)

- **Revenue + retention:** T1 (done) → B4 (Q&A) → B5 (attachments) → $2 (auto-recharge)
- **Growth/supply:** G1 (lead discovery) → G2–G7 (done) → O2 (done)
- **Production hardening:** O4 (Postgres) → O3 (job queue) → O10 (E2E) → O6 (observability)

---

## 8. Launched foundations (P1–P20 history)

The original market-readiness path (now shipped), kept for reference:

- **P1** email delivery · **P2** marketing pages · **P3** Stripe credits +
  Pro subscription + FREE limits · **P4** (superseded) web passkeys → removed,
  biometrics are mobile-only · **P5** search/filter/pagination · **P6**
  notifications + welcome email · **P7** admin panel · **P8** rate limiting ·
  **P9** vitest tests · **P10** public API v1 · **P11** mobile app (full loop) ·
  **P12** Docker + CI · **P13** analytics + error tracking · **P14** attachments
  (→ backlog B5) · **P15** reviews (→ T1, done) · **P16** Q&A thread (→ B4) ·
  **P17** supplier monetization (→ S5/S6) · **P18** calendar (→ B11) · **P19**
  escrow (→ T5) · **P20** GDPR data rights (done) + counsel sign-off (human).

---

## 9. Related project: lead-discovery (G1)

A separate, legal-gated service that builds a categorized database of Hungarian
businesses so RFQs reach not-yet-registered suppliers (the growth loop behind
G2 "claim profile"). Strategy: `docs/lead-discovery-plan.md`. Current code:
`lead-discovery/` (scaffold: schema, taxonomy, normalize lib, legal gate). It is
intended to live in its own repo (`github.com/jkarcsi/lead-discovery`); it sits
under `lead-discovery/` here only because that repo was not reachable from the
build session, and is excluded from the Procura web toolchain. Extract with
`git subtree split --prefix=lead-discovery`.

**No collection or outreach ships before Hungarian data-protection counsel signs
off (LIA/DPIA, privacy notice, suppression/opt-out).**

---

## 10. Status log

> Newest entry first. Keep entries short: shipped / verified / next step.

### 2026-06-15 — run 21

- **Doc:** transformed the routine prompt into this consolidated
  **IMPLEMENTATION_PLAN.md** — the full backlog folded in (every theme), the
  ordered Growth/Revenue tracks, and the launched-foundations history, as one
  long-term development document. Removed `ROUTINE_PROMPT.md` and `BACKLOG.md`
  (content lives here now); updated `AGENTS.md`.
- **Shipped (Revenue T1):** reviews & ratings — `Review` model +
  `ratingSum/ratingCount`, `src/lib/reviews.ts submitReview` (DECIDED only,
  registered winner only, one per RFQ), matching adds ≤5 avgRating points + a
  "kiváló értékelés" reason, RFQ-detail review form/display, ★ on the shortlist.
- **Verified:** build, lint, tests (9/9), smoke green; live review updates the
  rating sum/count, double/invalid blocked, matching reflects avgRating.
- **Next step:** Revenue track in order — **$2 credit auto-recharge**, then B4
  Q&A thread, B5 attachments, S5/S6.

### 2026-06-15 — run 20 (Growth track)

- **Added** the ordered Growth/Revenue tracks to the plan from the backlog.
- **Shipped (Growth):** G2 claim-profile, G3 referral program, O2 admin
  supply-gap alerts, G4 public open-tender board (`/tenders`), G7 landing
  social-proof, G5 programmatic SEO (`/szolgaltatas/[c]/[r]` + sitemap), G6
  embeddable quote widget (`/embed/[token]`). G1 (lead-discovery) remains an
  in-progress separate project; G8 deferred.
- **Verified:** each slice build + lint + tests (9/9) + smoke green, live HTTP
  checks; committed/pushed one per slice.
- **Next step:** Revenue track, starting with T1 reviews & ratings.

### 2026-06-13 — run 18

- **Shipped (P11 — finished the mobile app):** supplier profile editing
  (`src/lib/suppliers.ts`, `GET/PUT /api/v1/profile`, mobile Account tab), push
  tap-to-navigate, EAS build config.
- **Verified:** web build, lint, tests (9/9), smoke (9/9). Store submission is
  the only remaining (human) step.
- **Next step:** new backlog item; counsel review of terms/privacy (human).

### 2026-06-13 — run 17

- **Shipped (P11):** supplier open opportunities on mobile; extracted
  `joinOpenRfq` into `src/lib/rfqs.ts`; `GET /api/v1/opportunities`,
  `POST /api/v1/opportunities/[id]/join`. Full RFQ loop runs from mobile.
- **Verified:** build, lint, tests (9/9), smoke (9/9); live guards checked.

### 2026-06-13 — run 16

- **Shipped (P11):** mobile RFQ send-out; extracted `sendRfq` into
  `src/lib/rfqs.ts`; `GET /api/v1/rfqs/[id]/shortlist`, `POST .../send`.
- **Verified:** build, lint, tests (9/9), smoke (9/9); guards checked.

### 2026-06-13 — run 15

- **Shipped (P11):** push notifications — `PushToken`, `src/lib/push.ts` (Expo
  endpoint, no SDK), notify helpers mirror to push, `POST/DELETE /api/v1/push`,
  mobile `expo-notifications` integration. README mobile section.
- **Verified:** build, lint, tests (9/9), smoke (9/9).

### 2026-06-13 — run 14

- **Shipped (P11):** full mobile loop screens + APIs (notifications, credits,
  offers/accept, taxonomy, invites). Extracted `acceptOffer`/`submitOffer` into
  `src/lib/offers.ts`; web actions refactored. OpenAPI updated.
- **Verified:** build, lint, tests (9/9), smoke (9/9) green; guard paths live-tested.

### 2026-06-13 — run 13

- **Product change:** biometric sign-in is mobile-only; removed web WebAuthn.
- **Shipped (P11 foundation+app):** mobile token auth (`/api/v1/auth/login`,
  `/me`, `authenticateBearer`); Expo skeleton (biometric lock, login, RFQ
  list/detail). Excluded from web toolchain.
- **Verified:** build, lint, tests (9/9), smoke (9/9); mobile API live-tested.

### 2026-06-12 — run 12

- **Shipped:** server error tracking (`onRequestError` + `ERROR_WEBHOOK_URL`,
  `global-error.tsx`); GDPR export (`/api/account/export`) + account deletion.
- **Verified:** build, lint, tests (9/9), smoke (9/9); export/deletion live-tested.

### 2026-06-12 — run 11

- **Reviewed run 10:** fixed API 429-vs-401 and deadline-validation (400).
- **Shipped (P13 analytics):** `src/lib/analytics.ts` PostHog capture (no SDK),
  funnel events wired.
- **Verified:** build, lint, tests (9/9), smoke green.

### 2026-06-12 — run 10

- **Shipped (P10):** public API v1 (`ApiKey`, bearer auth + rate limit; rfqs
  list/create/detail; OpenAPI; key management on `/account`).
- **Shipped (P12):** Dockerfile, `.dockerignore`, GitHub Actions CI, deploy docs.
- **Verified:** build, lint, smoke (9/9), tests (9/9); API end-to-end checked.

### 2026-06-12 — run 9 (+continued)

- **Shipped (P8):** rate limiting (`src/lib/rateLimit.ts`). **(P9):** vitest
  suite (`tests/core.test.ts`, 9 tests).
- **Verified:** test 9/9, build, lint, smoke green.

### 2026-06-12 — run 8

- **Shipped (P7):** admin panel (`User.role`/`active`, `requireAdmin`, pages:
  overview/users/rfqs/suppliers/credits). Seeded admin.
- **Verified:** build, lint, smoke (9/9); admin gating live-checked.

### 2026-06-12 — run 7

- **Shipped (P6):** notifications (`Notification`, bell+badge, `/notifications`,
  welcome email). FREE tier → "first 3 RFQs total".
- **Verified:** build, lint, smoke (9/9).

### 2026-06-12 — run 6

- **Shipped (P5):** server-side search/filter/pagination on dashboard, supplier
  invites, opportunities.
- **Verified:** build, lint, smoke (9/9); authenticated renders checked.

### 2026-06-12 — run 5

- **Shipped (P4):** WebAuthn passkeys (later removed in run 13 — biometrics moved
  to mobile).

### 2026-06-12 — run 4

- **Reviewed MVP; fixed** open-opportunities region bypass. **Shipped (P3):** Pro
  subscription (Stripe subscription checkout + webhooks; demo fallback).

### 2026-06-12 — run 3 (+continued)

- **Shipped:** Stripe test-mode credit checkout (idempotent via
  `CreditTransaction.reference`); FREE-tier limits (`src/lib/limits.ts`).
- **Verified:** build, lint, smoke (8/8).

### 2026-06-12 — run 2

- **Shipped:** credit-based monetization (`CreditTransaction` ledger,
  `src/lib/credits.ts`); "AI"-free branding (hard rule 6); PWA baseline; roadmap
  expansion.
- **Verified:** build, lint, smoke (8/8); credit invariants checked.

### 2026-06-12 — run 1

- **Shipped:** replaced the deleted routine prompt; English codebase / Hungarian
  UI migration; P1 email delivery (Resend + outbox); P2 marketing pages.
- **Verified:** build, lint, smoke (8/8).
