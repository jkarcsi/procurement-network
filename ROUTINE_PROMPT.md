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

- [ ] Real transactional email delivery (provider-backed, outbox as dev fallback)
- [ ] Public marketing/landing page with pricing, terms, and privacy pages
- [ ] Subscription billing (Stripe **test mode only** until launch sign-off)
- [ ] Plan limits enforced server-side (free vs. paid tier)
- [ ] Search, filtering, and pagination on every list view
- [ ] In-app + email notifications for the core loop events
- [ ] Admin panel (users, RFQs, suppliers, moderation)
- [ ] Rate limiting and abuse protection on auth and public endpoints
- [ ] Automated tests for matching + offer flows; smoke test covers the full loop
- [ ] Production deployment story (Dockerfile, CI, documented env vars, Postgres-ready)
- [ ] Error tracking and basic product analytics (opt-in via env vars)
- [ ] Empty/loading/error states everywhere; responsive UI

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
4. **Don't break the loop.** `npm run build`, `npm run lint`, and
   `npm run smoke` must pass before every push. The full RFQ loop must keep
   working **without** `ANTHROPIC_API_KEY` (rule-based fallbacks in
   `src/lib/ai.ts`).
5. **Read `node_modules/next/dist/docs/` before writing new Next.js patterns.**
   This Next.js version differs from training data (Next 16: `params` /
   `searchParams` are Promises, `cookies()` is async).

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
- English codebase with Hungarian user-facing copy (see hard rule 1)

### Backlog (priority order — pick from the top)

| # | Item | Scope hint |
|---|------|-----------|
| P1 | Real email delivery (Resend) | `src/lib/email.ts` provider switch on `RESEND_API_KEY`, outbox stays as dev fallback; invite / offer-received / offer-accepted / welcome templates |
| P2 | Landing + marketing pages | Hero, value props, how-it-works, category cards, `/pricing`, `/terms`, `/privacy` placeholders, footer, CTAs |
| P3 | Stripe subscriptions (test mode) | FREE (3 active RFQs, 5 invites/RFQ) vs PRO; `Company.plan` + Stripe fields; `/pricing` checkout; webhook handler; `src/lib/limits.ts` enforced in actions |
| P4 | Search / filter / pagination | `/dashboard` + `/supplier` + `/supplier/opportunities`, server-side via `searchParams` |
| P5 | Notifications | `Notification` model, nav badge, `/notifications`, notify on offer received / accepted / new matching RFQ |
| P6 | Admin panel | `User.role = "ADMIN"`, `/admin` stats, users/RFQs/suppliers lists, soft-deactivate users |
| P7 | Rate limiting | In-memory limiter in `src/lib/rateLimit.ts`; login, RFQ creation, offer submission |
| P8 | Tests | Unit tests for `matching.ts` scoring (vitest); extend smoke to offer/accept/decline flows |
| P9 | File attachments | `Attachment` model, local `/uploads` in dev, 10 MB cap, PDF/DOCX/XLSX/PNG/JPG; attach on RFQ, download on reply page |
| P10 | Deployment | Multi-stage Dockerfile, GitHub Actions CI (lint+build+smoke), Postgres migration notes, env var docs |
| P11 | Monitoring | Sentry + PostHog, both strictly opt-in via env vars |
| P12 | Supplier directory | `/suppliers` browse/filter, invite-to-RFQ from profile |
| P13 | Reviews | Buyer rates supplier after DECIDED; rating feeds matching score (≤5 pts) |
| P14 | Public API | `/api/v1/*` with hashed API keys, OpenAPI JSON |

### Demo accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Buyer | `demo@vevo.hu` | `demo1234` |
| Supplier (CleanPro Facility Kft.) | `demo@beszallito.hu` | `demo1234` |

## Status log

> Newest entry first. Keep entries short: shipped / verified / next step.

### 2026-06-12 — run 1

- **Shipped:** Replaced the deleted routine prompt with this file. Migrated the
  codebase to English (comments, docs, category slugs, console output, AI
  prompt instructions, smoke test) while keeping all user-facing copy
  Hungarian (UI, emails, AI output, matching reasons), as the product targets
  the Hungarian market.
- **Verified:** `npm run build`, `npm run lint`, `npm run smoke` green.
- **Next step:** P1 — real email delivery via Resend with outbox fallback.
