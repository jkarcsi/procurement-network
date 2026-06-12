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
- [ ] Stripe **test mode** checkout for credit packages and Pro subscription
- [ ] Plan limits enforced server-side (free vs. paid tier)
- [ ] Biometric sign-in: passkeys/WebAuthn on web+PWA (Face ID / Touch ID /
      fingerprint via platform authenticators)
- [ ] Mobile app: installable PWA baseline (done) → dedicated Expo React
      Native app on the public API, with `expo-local-authentication` biometrics
- [ ] Search, filtering, and pagination on every list view
- [ ] In-app + email notifications for the core loop events
- [ ] Admin panel (users, RFQs, suppliers, moderation)
- [ ] Rate limiting and abuse protection on auth and public endpoints
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
| P3 | Stripe checkout (test mode) | Credit package purchase via hosted Checkout (replaces the demo grant in `purchaseCreditsAction`) + Pro subscription; `Company.plan` + Stripe fields; webhook handler; `src/lib/limits.ts` enforcing FREE limits (3 active RFQs, 5 invites/RFQ) in `createRfqAction`/`sendRfqAction` |
| P4 | Biometric sign-in (passkeys) | WebAuthn via `@simplewebauthn/server` + browser: register passkey from account settings, sign in with Face ID / Touch ID / fingerprint; password stays as fallback; works in PWA |
| P5 | Search / filter / pagination | `/dashboard` + `/supplier` + `/supplier/opportunities`, server-side via `searchParams` |
| P6 | Notifications | `Notification` model, nav badge, `/notifications`, notify on offer received / accepted / new matching RFQ; welcome emails on registration |
| P7 | Admin panel | `User.role = "ADMIN"`, `/admin` stats, users/RFQs/suppliers lists, credit ledger view, soft-deactivate users |
| P8 | Rate limiting | In-memory limiter in `src/lib/rateLimit.ts`; login, RFQ creation, offer submission |
| P9 | Tests | Unit tests for `matching.ts` scoring and `credits.ts` (vitest); extend smoke to offer/accept/decline + credit charge flows |
| P10 | Public API v1 | `/api/v1/*` with hashed API keys, OpenAPI JSON — foundation for the mobile app |
| P11 | Mobile app (Expo) | React Native app in `mobile/` on the public API: sign-in (passkey/biometric via `expo-local-authentication`), RFQ list/detail, offer review, push notifications; Revolut-grade navigation and polish |
| P12 | Deployment | Multi-stage Dockerfile, GitHub Actions CI (lint+build+smoke), Postgres migration notes, env var docs |
| P13 | Monitoring | Sentry + PostHog, both strictly opt-in via env vars |
| P14 | File attachments | `Attachment` model, local `/uploads` in dev, 10 MB cap, PDF/DOCX/XLSX/PNG/JPG |
| P15 | Supplier directory + reviews | `/suppliers` browse/filter, invite-to-RFQ; buyer rates supplier after DECIDED, rating feeds matching (≤5 pts) |
| P16 | Legal & data rights | Counsel-reviewed terms/privacy, GDPR data export + account deletion flows, cookie/consent banner if analytics added |

### Demo accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Buyer | `demo@vevo.hu` | `demo1234` |
| Supplier (CleanPro Facility Kft.) | `demo@beszallito.hu` | `demo1234` |

## Status log

> Newest entry first. Keep entries short: shipped / verified / next step.

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
