# Procura — Recurring Development Routine

You are Claude Code, working autonomously on **Procura**, an AI-assisted B2B
procurement network for Hungarian SMEs. This file is your standing brief: read
it at the start of every run, follow it, and keep it up to date as the product
evolves (state inventory, backlog, and the status log at the bottom).

Repo: `jkarcsi/procurement-network` (GitHub)

## Mission

Ship a **market-ready application**: no demo-only limitations, deployable,
secure enough to put in front of paying customers. Every run must move the
product measurably closer to that goal and leave the repository green
(build + lint + smoke passing) and pushed.

### Definition of market-ready (the finish line)

- [x] Real transactional email delivery (provider-backed, outbox as dev fallback)
- [x] Public marketing/landing page with pricing, terms, and privacy pages
- [x] Credit-based monetization of analysis features (ledger, balance, packages)
- [x] Stripe **test mode** checkout for credit packages (webhook-granted,
      idempotent; demo grant without keys)
- [x] Stripe Pro subscription + plan limits enforced server-side
      (`src/lib/limits.ts` in `createRfqAction`/`sendRfqAction`)
- [x] Biometric sign-in: passkeys/WebAuthn on web+PWA (Face ID / Touch ID /
      fingerprint via platform authenticators)
- [ ] Mobile app: installable PWA baseline (done) → dedicated Expo React
      Native app on the public API, with `expo-local-authentication` biometrics
- [x] Search, filtering, and pagination on every list view
- [x] In-app + email notifications for the core loop events
- [x] Admin panel (users, RFQs, suppliers, credit ledger, moderation)
- [x] Rate limiting and abuse protection on auth and public endpoints
- [ ] Automated tests for matching + offer + credit flows; smoke covers the loop
- [ ] Production deployment story (Dockerfile, CI, documented env vars, Postgres-ready)
- [ ] Error tracking and basic product analytics (opt-in via env vars)
- [ ] Legal sign-off: terms + privacy reviewed by counsel, GDPR records
      (processor list incl. LLM provider and email provider), data export/delete
- [ ] Audit completeness: every business mutation leaves an AuditLog row;
      credit moves leave CreditTransaction rows
- [ ] Empty/loading/error states everywhere; responsive, Revolut-grade UI polish

## Hard rules

1. **Language split: Hungarian product, English codebase.** The product
   targets the Hungarian market, so everything a user sees is Hungarian: UI
   copy, status labels, validation/error messages, emails, AI output, seed
   descriptions shown in the UI. Everything else is English, like in an
   international codebase: identifiers, slugs, comments, commit messages,
   documentation, console/log output, test names and assertions, AI prompt
   instructions (instructing Hungarian output).
2. **Branch discipline.** Develop on the branch this session was given
   (`claude/...`). Push with `git push -u origin <branch>`. Never push to
   `main` directly and never create a PR unless explicitly asked.
3. **Payments: Stripe test mode only.** Only `sk_test_...` keys, hosted
   Checkout (no custom card forms), webhook signature verification, empty
   strings for keys in `.env.example`. Never store card data.
   Monetization model: **credits** pay for analysis features (ledger in
   `src/lib/credits.ts` — all balance changes go through it), subscription
   tiers gate volume limits.
4. **Don't break the loop.** `npm run build`, `npm run lint`, and
   `npm run smoke` must pass before every push. The full RFQ loop must keep
   working **without** `ANTHROPIC_API_KEY` (rule-based fallbacks in
   `src/lib/ai.ts`).
5. **Read `node_modules/next/dist/docs/` before writing new Next.js patterns.**
   This Next.js version differs from training data (Next 16: `params` /
   `searchParams` are Promises, `cookies()` is async).
6. **Branding: never say "AI" in user-facing copy.** The product is positioned
   on outcomes, not technology. Use "Procura elemzés", "intelligens
   pontosítás", "okos shortlist" and similar wording. "AI"/model/provider
   names may appear only where legally required (privacy policy processor
   list). Code-level naming (`src/lib/ai.ts`, `aiUsed`) is unaffected.

## Environment & setup (every run)

```bash
npm install                  # node_modules is not persisted between sessions
cp .env.example .env         # if .env is missing
npx prisma db push           # SQLite schema sync (prisma/dev.db)
npm run db:seed              # idempotent demo data
npm run build                # verify you start from green
git log --oneline -10        # see where the last run stopped
```

Read `AGENTS.md` for conventions, and the **status log at the bottom of this
file** for where the previous run left off.

## How to work a run

1. **Pick ONE backlog item** — the highest-priority item that fits in a single
   run. Prefer a small, complete vertical slice (schema + action + UI + test)
   over a broad partial one.
2. **Implement** following the conventions in `AGENTS.md`. Boring, direct,
   maintainable code. Comments only for non-obvious WHY. No TODO comments —
   don't start what you can't finish.
3. **Verify**: `npm run build` && `npm run lint` && `npm run smoke`. If the
   feature has UI, exercise the full flow (login → feature → result) against
   `npm run dev`.
4. **Commit and push early, commit and push often.** Usage time is capped
   (~5 hours per run). Don't hold a day of work in the working tree: push a
   green commit as soon as a coherent piece is done, then continue. If you
   sense the budget running out, stop coding, get to green, push, and write
   the status log.
5. **Update the status log** (bottom of this file) in the final commit of the
   run: what shipped, what's in progress, exact next step. The next run starts
   from that note.

## Current state (update when it changes)

### Stack

- Next.js 16 (App Router, server actions, Turbopack), React 19, Tailwind 4
- Prisma 6 + SQLite (`prisma/dev.db`; schema is Postgres-compatible)
- `@anthropic-ai/sdk`, model from `ANTHROPIC_MODEL` env var
- bcryptjs (password hashing), zod (barely used yet), tsx (seed + smoke)

### Shipped (do not rewrite)

- Buyer auth: register / login / logout (HMAC-signed cookie, `src/lib/auth.ts`)
- RFQ wizard: one-sentence intake → AI clarifying questions → structured spec
- AI supplier shortlist: deterministic scoring (category 50 + region 30 /
  nationwide 20 + response rate ≤15 + certification 5)
- RFQ send-out: checkbox shortlist + extra emails, tokenized invites
- Public token-based supplier reply page (`/r/[token]`), no registration needed
- Offer accept / AI comparison / audit trail
- Supplier profile (categories, regions, certifications) and portal with stats
- Open opportunities (`/supplier/opportunities`): suppliers self-apply to
  matching live RFQs
- Demo email outbox (`/outbox`), `npm run smoke` smoke test
- Email delivery via Resend when `RESEND_API_KEY` is set (outbox always
  written as audit log); transactional emails: invite, offer received (buyer),
  offer accepted (supplier)
- Marketing pages: `/pricing` (Alap vs Pro tiers + FAQ; checkout not wired
  yet), `/terms` and `/privacy` placeholders, footer links, landing value props
- Credit system: `Company.creditBalance` + `CreditTransaction` ledger,
  `src/lib/credits.ts` (grant/charge, atomic), welcome bonus on buyer
  registration, Procura elemzés costs 1 credit, `/credits` page (balance card,
  packages, history), balance badge in nav; demo purchase grants instantly
  until Stripe is wired (P3)
- "AI"-free user-facing branding (hard rule 6): Procura elemzés / intelligens
  pontosítás / okos shortlist
- Installable PWA baseline: `src/app/manifest.ts`, theme color, app icon
- English codebase with Hungarian user-facing copy (see hard rule 1)

### Backlog (priority order — pick from the top)

| # | Item | Scope hint |
|---|------|-----------|
| P3 | Stripe Pro subscription + limits | Credits checkout DONE. Remaining: `Company.plan` + Stripe subscription fields, subscribe from `/pricing`, `customer.subscription.*` webhook events, `src/lib/limits.ts` enforcing FREE limits (3 active RFQs, 5 invites/RFQ) in `createRfqAction`/`sendRfqAction`; verify checkout end-to-end with `stripe listen` and test keys |
| P9 | Tests | Unit tests for `matching.ts` scoring and `credits.ts` (vitest); extend smoke to offer/accept/decline + credit charge flows |
| P10 | Public API v1 | `/api/v1/*` with hashed API keys, OpenAPI JSON — foundation for the mobile app |
| P11 | Mobile app (Expo) | React Native app in `mobile/` on the public API: sign-in (passkey/biometric via `expo-local-authentication`), RFQ list/detail, offer review, push notifications; Revolut-grade navigation and polish |
| P12 | Deployment | Multi-stage Dockerfile, GitHub Actions CI (lint+build+smoke), Postgres migration notes, env var docs |
| P13 | Monitoring | Sentry + PostHog, both strictly opt-in via env vars |
| P14 | File attachments | `Attachment` model, local `/uploads` in dev, 10 MB cap, PDF/DOCX/XLSX/PNG/JPG |
| P15 | Supplier directory + reviews | `/suppliers` browse/filter, invite-to-RFQ; buyer rates supplier after DECIDED, rating feeds matching (≤5 pts) |
| P16 | RFQ Q&A thread | Registered suppliers ask clarifying questions on an invite; buyer answers on the RFQ page; thread visible to all invitees; recurring questions feed back into the category's clarify-question template (taxonomy + Category table) |
| P17 | Supplier monetization | Offer quota: first X offers per supplier free, then registration + paid package required (keep one-click reply for the free quota); paid boost products (e.g. priority placement in the shortlist, marked as sponsored to keep ranking trust) |
| P18 | Calendar | Deadlines + fulfillment dates view for both sides, reminders for recurring services (e.g. quarterly maintenance), optional mutual availability/booking slots |
| P19 | Escrow payments | Deposit/advance paid through Procura and held until fulfilment, then released/refunded (Stripe Connect separate-charges-and-transfers; NOTE: payment-institution licensing/legal review required before launch) |
| P20 | Legal & data rights | Counsel-reviewed terms/privacy, GDPR data export + account deletion flows, cookie/consent banner if analytics added |

### Demo accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Buyer | `demo@vevo.hu` | `demo1234` |
| Supplier (CleanPro Facility Kft.) | `demo@beszallito.hu` | `demo1234` |
| Admin | `admin@procura.hu` | `admin1234` |

## Status log

> Newest entry first. Keep entries short: shipped / verified / next step.

### 2026-06-12 — run 9

- **Shipped (P8):** Rate limiting — `src/lib/rateLimit.ts` (in-memory
  sliding window, per-instance; swap for Redis/KV when scaling out,
  crude global cap against unbounded growth). Applied: login 5/5min per
  IP+email, registration 5/hour per IP, offer submission 5/hour per
  token, clarify (model-backed step) 20/hour per user. Hungarian
  rate-limit error shown via existing error banners.
- **Verified:** build, lint, smoke green; limiter unit-checked (blocks
  6th call, key isolation, window expiry).
- **Next step:** P9 — tests (vitest units for matching/credits/limits,
  extend smoke to offer/accept/decline + credit charge), then P10 public
  API.

### 2026-06-12 — run 8

- **Shipped (P7):** Admin panel — `User.role` gains "ADMIN" and
  `User.active` (soft-deactivate). `requireAdmin()` in `src/lib/admin.ts`,
  called by every `/admin` page (layout only renders tabs). Pages:
  `/admin` (stats incl. credits bought/used, RFQs by status),
  `/admin/users` (suspend/reactivate with audit log; admin can't suspend
  self), `/admin/rfqs` (status filter), `/admin/suppliers`,
  `/admin/credits` (ledger). Seeded admin: admin@procura.hu / admin1234.
  Deactivated users are rejected by `getSessionUser` (live cookies die
  immediately), password login, and passkey login.
- **Verified:** build, lint, smoke (9/9) green; HTTP checks: anon and
  buyer blocked from /admin, all five pages 200 as admin, deactivated
  user's live session rejected.
- **Next step:** P8 — rate limiting (`src/lib/rateLimit.ts`; login, RFQ
  creation, offer submission), then P9 tests.

### 2026-06-12 — run 7

- **Shipped (P6):** Notifications — `Notification` model + indexed unread
  query, `src/lib/notifications.ts` (failures never break business flows),
  events wired: offer received (buyer), offer accepted (supplier company
  users), RFQ invite (registered supplier users). Bell + unread badge in
  nav, `/notifications` page (50 latest, unread highlighted, links,
  mark-all-read action). Welcome email on registration (role-specific next
  step + passkey tip).
- **Product feedback applied:** (1) invite email now invites suppliers to
  register and ask clarifying questions; (2) FREE tier changed from "3
  active RFQs" to "first 3 RFQs total" (`FREE_TOTAL_RFQS`; closing RFQs no
  longer frees quota) — pricing page + FAQ updated. New backlog items
  P16–P19: RFQ Q&A thread (answers feed category templates), supplier
  offer quota + paid boost, calendar/reminders, escrow via Stripe Connect.
- **Verified:** build, lint, smoke (9/9) green; notification create/unread/
  mark-read and total-quota semantics exercised; `/notifications`
  auth-gated.
- **Next step:** P7 — admin panel (stats, users/RFQs/suppliers lists,
  credit ledger view, soft-deactivate).

### 2026-06-12 — run 6

- **Shipped (P5):** Server-side search/filter/pagination via `searchParams`
  (GET forms, no client JS): `/dashboard` (title search, status + category
  filters, 10/page with clamped page index), `/supplier` invites (title
  search, invite-status filter, 10/page; stats and open-RFQ banner kept),
  `/supplier/opportunities` (title search; form only shows when there are
  open RFQs). Filtered empty states everywhere.
- **Verified:** build, lint, smoke (9/9) green; authenticated HTTP renders
  checked for all three pages incl. combined filters and out-of-range page.
- **Next step:** P6 — notifications (`Notification` model, nav badge,
  `/notifications`, events: offer received / accepted / new matching RFQ;
  welcome emails).

### 2026-06-12 — run 5

- **Shipped (P4):** Passkey/biometric sign-in via WebAuthn
  (`@simplewebauthn/server` v13): `Passkey` model, challenge in a
  short-lived signed cookie (`src/lib/passkeys.ts`), four API routes
  (register/login options+verify), usernameless discoverable-credential
  login button on `/login`, passkey management on the new `/account` page
  (add for current device, list, delete), nav links to `/account`.
  Password login stays as fallback.
- **Verified:** build, lint, smoke (9/9) green; endpoints checked:
  login-options returns challenge, register-options 401 without session,
  login-verify 400 without challenge, `/account` auth-gated. The full
  WebAuthn ceremony needs a real browser/authenticator — test manually on
  first deploy (works on localhost and any HTTPS origin; rpID derives from
  NEXT_PUBLIC_BASE_URL).
- **Next step:** P5 — search/filter/pagination on `/dashboard`,
  `/supplier`, `/supplier/opportunities`.

### 2026-06-12 — run 4

- **Reviewed previous work:** full verification of the pre-existing MVP
  (build/lint/smoke incl. HTTP, 8/8). Found and fixed one gap in the open
  opportunities feature: `joinOpenRfqAction` validated category but not
  region, so a hand-crafted POST could join an out-of-region RFQ — the
  action now mirrors the listing's region rule; smoke covers the case.
- **Shipped (P3 complete):** Pro subscription — `upgradeToProAction`
  (hosted Checkout in subscription mode with Stripe; instant flip in demo
  mode), webhook handles subscription `checkout.session.completed` (sets
  plan PRO + stores customer/subscription ids) and
  `customer.subscription.deleted` (downgrades to FREE). Pricing page is
  session-aware: upgrade button / active-plan badge / register link, with
  success and cancel banners. `Company.stripeCustomerId/.stripeSubscriptionId`.
- **Verified:** build, lint, smoke (6 DB checks) green; upgrade + cancel
  roundtrip exercised. Still pending: end-to-end run with `sk_test_` keys +
  `stripe listen` (no keys in this environment); Stripe billing portal for
  self-service cancellation is not wired yet — add with real keys.
- **Next step:** P4 — passkey/biometric sign-in (WebAuthn), then P5 search/
  filter/pagination.

### 2026-06-12 — run 3 (continued)

- **Shipped:** FREE-tier limits enforced server-side: `Company.plan`
  ("FREE"|"PRO"), `src/lib/limits.ts` (max 3 active RFQs, max 5 invites per
  RFQ on FREE; PRO unlimited), enforced in `createRfqAction` (typed error
  shown by the wizard) and `sendRfqAction` (redirect error banner).
- **Verified:** build, lint, smoke green; limit checks exercised (4th active
  RFQ blocked, 6th invite blocked, 5 allowed, PRO unlimited).
- **Next step:** P3 remainder — Pro subscription checkout from `/pricing`
  (`customer.subscription.*` webhooks set `Company.plan`), and an end-to-end
  credits checkout test with `sk_test_` keys + `stripe listen`.

### 2026-06-12 — run 3

- **Shipped:** Stripe test-mode checkout for credit packages:
  `src/lib/stripe.ts` (null without keys), `purchaseCreditsAction` redirects
  to hosted Checkout when configured (HUF amounts in fillér), webhook at
  `/api/webhooks/stripe` verifies signatures and grants credits idempotently
  via the new unique `CreditTransaction.reference` (session id). `/credits`
  shows Stripe vs demo copy and a cancel banner. Demo grant unchanged
  without keys.
- **Verified:** build, lint, smoke (8/8) green; duplicate-reference grant is
  a no-op; webhook returns 503 unconfigured. NOT yet tested with real
  `sk_test_` keys + `stripe listen` — do that at the start of the next run.
- **Next step:** P3 remainder — Pro subscription (`Company.plan`, subscribe
  from `/pricing`, subscription webhooks) + `src/lib/limits.ts` enforcing
  FREE limits in `createRfqAction`/`sendRfqAction`.

### 2026-06-12 — run 2

- **Shipped:**
  1. Credit-based monetization: `Company.creditBalance` +
     `CreditTransaction` ledger (auditable `balanceAfter` chain),
     `src/lib/credits.ts` with atomic grant/charge and overdraft rejection.
     Procura elemzés (offer comparison) costs 1 credit; welcome bonus (10)
     on buyer registration; seeded demo buyer starts with 25. `/credits`
     page with balance card, three packages, transaction history; demo
     purchase grants instantly until Stripe checkout lands (P3). Credit
     badge in the nav.
  2. Branding: removed "AI" from all user-facing copy (landing, wizard, RFQ
     detail, pricing, emails, terms; privacy keeps the legally required
     processor mention). New hard rule 6 codifies this.
  3. Installable PWA baseline: `src/app/manifest.ts`, theme color, app icon.
  4. Roadmap expanded for full market launch: Stripe checkout for credits
     (P3), passkey/biometric sign-in (P4), public API (P10) feeding a
     dedicated Expo mobile app with biometrics (P11), legal/GDPR work (P16);
     market-ready checklist updated accordingly.
- **Verified:** build, lint, smoke (8/8) green; credit invariants exercised
  (charge, overdraft rejection, ledger chain); `/credits` auth-gated (307);
  manifest + icon serve 200.
- **Next step:** P3 — Stripe test-mode checkout for credit packages
  (replace the demo grant in `purchaseCreditsAction`), then Pro plan +
  `src/lib/limits.ts`.

### 2026-06-12 — run 1

- **Shipped:**
  1. Replaced the deleted routine prompt with this file.
  2. Migrated the codebase to English (comments, docs, category slugs, console
     output, AI prompt instructions, smoke test) while keeping all user-facing
     copy Hungarian (UI, emails, AI output, matching reasons), as the product
     targets the Hungarian market.
  3. P1 — email delivery: `src/lib/email.ts` now sends via Resend when
     `RESEND_API_KEY` is set (outbox always written as audit log; provider
     failure never breaks the flow). Added offer-received (buyer) and
     offer-accepted (supplier) transactional emails, wired into
     `submitOfferAction` and `acceptOfferAction`.
  4. P2 — marketing pages: `/pricing` (Alap 0 Ft vs Pro 4 990 Ft/hó, FAQ,
     CTAs), `/terms` + `/privacy` placeholder legal pages (flagged as drafts
     pending counsel review), footer links, pricing nav link for visitors,
     value-prop band on the landing page.
- **Verified:** `npm run build`, `npm run lint`, `npm run smoke` (8/8 incl.
  HTTP checks) green; all new routes render 200; all three email templates
  exercised against the outbox.
- **Next step:** P3 — Stripe subscriptions in TEST MODE: `Company.plan` +
  Stripe fields, checkout from `/pricing`, webhook handler,
  `src/lib/limits.ts` enforcing FREE limits (3 active RFQs, 5 invites/RFQ) in
  `createRfqAction` / `sendRfqAction`. Welcome emails were folded into P5.
