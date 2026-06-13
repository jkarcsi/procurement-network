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
- [x] Biometric sign-in: **mobile app only** (Expo `expo-local-authentication`
      Face ID / Touch ID / fingerprint, gating a stored session token). Desktop
      web is email+password by design — product decision, web WebAuthn removed.
- [x] Mobile app: installable PWA baseline + Expo React Native app in `mobile/`
      covering the full loop (biometric lock; buyer: RFQ list/detail, create,
      shortlist+send, accept offers, credits/purchase; supplier: invites +
      submit offers, open opportunities + self-apply, profile editing; both:
      notifications, push w/ tap-to-navigate, account). EAS build config in
      place. Remaining for launch: actual store submission (human/EAS).
- [x] Search, filtering, and pagination on every list view
- [x] In-app + email notifications for the core loop events
- [x] Admin panel (users, RFQs, suppliers, credit ledger, moderation)
- [x] Rate limiting and abuse protection on auth and public endpoints
- [x] Automated tests (vitest: rate limit, credits incl. idempotency, plan limits, matching); smoke covers discovery + HTTP
- [x] Production deployment story (Dockerfile, CI, documented env vars, Postgres-ready)
- [x] Error tracking and basic product analytics (PostHog capture API + `onRequestError` instrumentation with optional ERROR_WEBHOOK_URL forwarding; both opt-in, no SDK)
- [~] Legal sign-off: GDPR data export + account deletion DONE; terms +
      privacy counsel review and consent banner still open
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

> Broader product wishlist (many more ideas, same schema): **`BACKLOG.md`**.
> Growth via cold outreach to non-registered businesses is a separate project:
> **`docs/lead-discovery-plan.md`** (legal-gated).

| # | Item | Scope hint |
|---|------|-----------|
| P3 | Stripe Pro subscription + limits | Credits checkout DONE. Remaining: `Company.plan` + Stripe subscription fields, subscribe from `/pricing`, `customer.subscription.*` webhook events, `src/lib/limits.ts` enforcing FREE limits (3 active RFQs, 5 invites/RFQ) in `createRfqAction`/`sendRfqAction`; verify checkout end-to-end with `stripe listen` and test keys |
| P11 | Mobile app (Expo) | Core loop DONE (biometric lock; buyer RFQ list/detail/create/accept + credits; supplier invites + submit offer; notifications). Remaining: push notifications, EAS/store build, Revolut-grade polish |
| P14 | File attachments | `Attachment` model, local `/uploads` in dev, 10 MB cap, PDF/DOCX/XLSX/PNG/JPG |
| P15 | Supplier directory + reviews | `/suppliers` browse/filter, invite-to-RFQ; buyer rates supplier after DECIDED, rating feeds matching (≤5 pts) |
| P16 | RFQ Q&A thread | Registered suppliers ask clarifying questions on an invite; buyer answers on the RFQ page; thread visible to all invitees; recurring questions feed back into the category's clarify-question template (taxonomy + Category table) |
| P17 | Supplier monetization | Offer quota: first X offers per supplier free, then registration + paid package required (keep one-click reply for the free quota); paid boost products (e.g. priority placement in the shortlist, marked as sponsored to keep ranking trust) |
| P18 | Calendar | Deadlines + fulfillment dates view for both sides, reminders for recurring services (e.g. quarterly maintenance), optional mutual availability/booking slots |
| P19 | Escrow payments | Deposit/advance paid through Procura and held until fulfilment, then released/refunded (Stripe Connect separate-charges-and-transfers; NOTE: payment-institution licensing/legal review required before launch) |
| P20 | Legal sign-off | Counsel-reviewed terms/privacy, consent banner if client-side analytics is added; data export + deletion are DONE |

### Demo accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Buyer | `demo@vevo.hu` | `demo1234` |
| Supplier (CleanPro Facility Kft.) | `demo@beszallito.hu` | `demo1234` |
| Admin | `admin@procura.hu` | `admin1234` |

## Status log

> Newest entry first. Keep entries short: shipped / verified / next step.

### 2026-06-13 — run 18

- **Shipped (P11 — finished the mobile app):** (1) supplier profile editing —
  `src/lib/suppliers.ts` (taxonomy-validated get/update), `GET/PUT
  /api/v1/profile`, mobile **Account tab** (both roles: user/company/plan +
  sign out; suppliers: editable description/certifications/nationwide +
  multi-select category/region chips); (2) push **tap-to-navigate** — a
  notification-response listener routes buyer `/rfq/<id>` links to the RFQ
  detail, others to the notifications tab (handles cold start too); (3)
  **EAS build config** (`mobile/eas.json` + README build steps). Marked the
  mobile checklist item done.
- **Verified:** web build, lint, tests (9/9), smoke (9/9); live profile
  get/update with unknown-id filtering and buyer-403. Expo app still needs
  Expo tooling to run; store submission is the only remaining (human) step.
- **Next step:** product polish / counsel review of terms+privacy (human),
  or pick a new backlog item (reviews P15, file attachments P14).

### 2026-06-13 — run 17

- **Shipped (P11 — supplier open opportunities):** suppliers can now browse
  matching live RFQs and self-apply from the app, completing the supplier
  acquisition loop on mobile. Extracted `joinOpenRfq` into `src/lib/rfqs.ts`
  (category+region guard, dedupe, SELF invite, audit) as the single source of
  truth; refactored `joinOpenRfqAction` to call it. New API:
  `GET /api/v1/opportunities`, `POST /api/v1/opportunities/[id]/join`. Mobile:
  new "Lehetőségek" tab (supplier) → list + Jelentkezem; after joining, the
  invite appears under Megkeresések for offer submission. OpenAPI updated.
- **Verified:** web build, lint, tests (9/9), smoke (9/9); live: list matches,
  join creates SELF invite + drops from list, re-join idempotent 200, buyer
  403. With this, the whole web RFQ loop now also runs from the mobile app.
- **Next step:** mobile supplier profile editing, push tap-to-navigate, or
  EAS/store build; final UI-polish + counsel review of terms/privacy (human).

### 2026-06-13 — run 16

- **Shipped (P11 — mobile RFQ send-out):** closed the biggest buyer-loop gap
  — a mobile-created RFQ (status READY) can now be sent to suppliers.
  Extracted `sendRfq` into `src/lib/rfqs.ts` (invites, emails, RFQ_INVITE
  notifications, audit, analytics, FREE invite-limit) as the single source of
  truth; refactored `sendRfqAction` to call it. New API:
  `GET /api/v1/rfqs/[id]/shortlist`, `POST /api/v1/rfqs/[id]/send`. Mobile
  RFQ detail now shows the ranked shortlist with checkboxes + a Kiküldés
  button for READY RFQs (offers/accept view for SENT/DECIDED). OpenAPI updated.
- **Verified:** web build, lint, tests (9/9), smoke (9/9); live: shortlist
  ranked (top 98p), send creates invites + sets SENT, re-send 400, empty
  selection 400, supplier 403.
- **Next step:** mobile open-opportunities (supplier self-apply) or supplier
  profile editing; then push tap-to-navigate + EAS build. Counsel review of
  terms/privacy stays human.

### 2026-06-13 — run 15

- **Docs:** README gained a Mobile app section (how to start the Expo app,
  point it at the API, what it covers) and dropped a stale web-WebAuthn env
  note.
- **Shipped (P11 — push notifications):** `PushToken` model; `src/lib/push.ts`
  sends via Expo's public push endpoint (no SDK/key, 3s timeout, swallowed
  errors); `notifyUser`/`notifyCompanyUsers` now mirror every in-app
  notification to push. `POST`/`DELETE /api/v1/push` register/unregister a
  device token. Mobile: `expo-notifications` integration (`src/push.ts`),
  registers on sign-in and unregisters on sign-out via the AuthContext.
- **Verified:** web build, lint, tests (9/9), smoke (9/9); live push
  register/unregister (store+link, 400 missing token, 401 no auth); notify
  with a token present completes in ~100ms and still creates the in-app row.
  The Expo app itself needs Expo tooling (and push needs a dev/EAS build).
- **Next step:** mobile push tap-to-navigate + EAS/store build, or the final
  UI-polish + audit-completeness pass; counsel review of terms/privacy stays
  human.

### 2026-06-13 — run 14

- **Shipped (P11 — full mobile loop):** built out the remaining mobile
  screens and their API. New `/api/v1` endpoints: `notifications` (GET+POST
  mark-read), `credits` + `credits/purchase` (Stripe URL or demo grant),
  `offers/[id]/accept`, `taxonomy`, `invites` (GET), `invites/[id]/offer`.
  Extracted `acceptOffer` and `submitOffer` into `src/lib/offers.ts` as the
  single source of truth and refactored the web actions to use them (added a
  guard against accepting an already-decided RFQ). Mobile: role-aware bottom
  tabs; buyer = RFQ list/detail/create + accept + Kreditek; supplier =
  invites list/detail + submit offer; both = notifications. OpenAPI updated.
- **Verified:** web build, lint, tests (9/9), smoke (9/9) green after every
  slice; each endpoint live-tested over HTTP (auth, success, and the 400/403
  guard paths — double-accept, double-submit, role checks).
- **Note:** the Expo app needs Expo tooling to run (not buildable in this
  sandbox); verify on device with `cd mobile && npm start`.
- **Next step:** mobile push notifications (Expo push tokens) + EAS/store
  build, or the final UI-polish + audit-completeness pass; counsel review of
  terms/privacy stays human.

### 2026-06-13 — run 13

- **Product change (user):** biometric sign-in is mobile-only. Removed the
  web WebAuthn passkey feature entirely (login button, account management,
  `/api/passkeys/*`, `src/lib/passkeys.ts`, `Passkey` model,
  `@simplewebauthn/*` deps). Desktop is email+password; `/account` points
  to the mobile app for biometrics.
- **Shipped (P11 foundation):** Mobile token auth API — `auth.ts` exposes
  `signSessionToken`/`userFromToken`; `POST /api/v1/auth/login`
  (email+password → token, rate-limited), `GET /api/v1/me`;
  `apiAuth.authenticateBearer` accepts API keys (integrations, 60/min) or
  session tokens (mobile, 120/min); RFQ endpoints now serve both, mobile
  creates attributed via `createdById`. OpenAPI updated.
- **Shipped (P11 app):** Expo React Native skeleton in `mobile/` —
  `expo-local-authentication` biometric gate over a `expo-secure-store`
  token, login / lock / RFQ list / RFQ detail screens, typed `/api/v1`
  client. Excluded from web tsconfig/eslint/docker so the web stays green.
- **Verified:** build, lint, tests (9/9), smoke (9/9); live mobile API:
  login 401/200, `/me` 200+401, RFQ list/create via session token
  (createdById set). Mobile app itself needs Expo tooling to run — not
  buildable in this sandbox; verify with `cd mobile && npm start`.
- **Next step:** mobile offer/notification/credit screens + push, or the
  final UI-polish + audit-completeness pass; counsel review stays human.

### 2026-06-12 — run 12

- **Shipped (P13 part 2):** Server error tracking without an SDK —
  `src/instrumentation.ts` `onRequestError` logs every captured server
  error in structured form and optionally forwards JSON to
  `ERROR_WEBHOOK_URL`; `global-error.tsx` gives a friendly Hungarian
  last-resort screen.
- **Shipped (P20 data rights):** GDPR export — `/api/account/export`
  downloads everything stored about the user/company as JSON (passkey/
  API-key metadata only, no secrets). Account deletion on `/account`:
  email-confirmation gate, deletes passkeys + notifications, anonymizes
  the user (email/name/password hash, active=false → live sessions die),
  audit log entry, goodbye banner. Business records retained anonymized
  per terms.
- **Verified:** build, lint, tests (9/9), smoke (9/9); live: export 200
  with attachment header + 401 unauthenticated, anonymized user's
  session rejected (307).
- **Next step:** P11 Expo mobile app skeleton (v1 API is ready), or the
  final UI-polish pass; counsel review of terms/privacy stays a human
  task before launch.

### 2026-06-12 — run 11

- **Reviewed run 10 (API + deployment):** found and fixed two API bugs —
  rate-limit hits returned 401 instead of 429 (authenticateApiKey now
  returns a discriminated result), and unvalidated `deadline` caused a
  500 (now 400). Verified live: 61st request/min → 429, bad date → 400.
  Docker daemon is unavailable in this sandbox; Dockerfile passed static
  review (prisma CLI present in runner, dynamic pages don't touch DB at
  build) but the image build stays queued for first real deploy.
- **Shipped (P13 analytics half):** `src/lib/analytics.ts` — opt-in
  PostHog capture via plain fetch (no SDK), silent failure; funnel
  events wired: user_registered, rfq_created, rfq_sent, offer_submitted,
  offer_accepted, credits_purchased, pro_upgraded. Env:
  POSTHOG_API_KEY/POSTHOG_HOST.
- **Verified:** build, lint, tests (9/9), smoke green.
- **Next step:** P11 Expo mobile app skeleton or P13 Sentry error
  tracking; then legal/data-rights track (P20) and UI polish.

### 2026-06-12 — run 10

- **Shipped (P10):** Public API v1 — `ApiKey` model (SHA-256 hash only,
  plaintext shown once), Bearer auth + 60/min per-key rate limit in
  `src/lib/apiAuth.ts`; endpoints: GET/POST `/api/v1/rfqs` (status
  filter; create honors plan limits), GET `/api/v1/rfqs/[id]` (invites +
  offers), `/api/v1/openapi.json`; key management on `/account`.
- **Shipped (P12):** Deployment — multi-stage Dockerfile (non-root,
  SQLite on /data volume, schema sync on boot, Postgres-ready),
  `.dockerignore`, GitHub Actions CI (lint+build+test+smoke on PR/main),
  README deployment + env var docs. NOTE: docker build not run in this
  sandbox — verify the image on first real deploy.
- **Verified:** build, lint, smoke (9/9), tests (9/9); API end-to-end:
  401 wrong key, 201 create (READY), list/detail/openapi 200.
- **Next step:** P11 Expo mobile app (on the v1 API) or P13 monitoring
  (Sentry/PostHog, opt-in) — pick by available budget; P13 is the
  smaller slice.

### 2026-06-12 — run 9 (continued)

- **Shipped (P9):** `npm run test` — vitest suite (`tests/core.test.ts`,
  9 tests) covering: rate limiter (block/isolation/expiry), credits
  (atomic charge, overdraft rejection, reference idempotency), plan
  limits (total-quota semantics incl. closed RFQs, PRO uncapped),
  matching (score bounds/ordering, unknown category). Runs against the
  seeded dev DB like smoke; [TEST] rows cleaned up.
- **Verified:** test 9/9, build, lint, smoke green.
- **Next step:** P10 — public API v1 (hashed API keys, OpenAPI JSON),
  the foundation for the Expo mobile app (P11).

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
