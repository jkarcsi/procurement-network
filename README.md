# Procura – AI-assisted B2B procurement network (MVP)

A buyer-led procurement network MVP tailored to Hungarian SMEs, based on the
deep research report. It covers the full "repeatable procurement loop":

**one-sentence intake → AI clarifying questions → structured RFQ → AI supplier
shortlist (category + region + response stats) → send-out with one-click reply
link → structured offers → AI comparison → buyer decision → audit trail**

The loop is two-sided: registered suppliers can also discover and apply to
live RFQs matching their profile (category + region) on the **Open
opportunities** page — no invitation needed.

The product targets the Hungarian market: **UI copy, emails, and AI output are
Hungarian**, while the codebase (identifiers, slugs, comments, docs) is English.

## Getting started

```bash
npm install
cp .env.example .env    # prisma commands fail without DATABASE_URL
npx prisma db push      # create the SQLite database
npm run db:seed         # categories, regions, 24 demo suppliers, demo accounts
npm run dev             # http://localhost:3000
```

### Smoke test

```bash
npm run smoke           # needs a seeded DB; with `npm run dev` running it also does HTTP checks
```

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Buyer | `demo@vevo.hu` | `demo1234` |
| Supplier (CleanPro Facility Kft.) | `demo@beszallito.hu` | `demo1234` |

## AI mode vs. fallback mode

Set `ANTHROPIC_API_KEY` in `.env` for the real AI features (intake analysis,
question generation, spec building, offer comparison – Claude with structured
JSON output). **The full loop works without a key too**: keyword-based
category/region detection and per-category template questions take over the
AI's role.

## Email delivery

Set `RESEND_API_KEY` (and optionally `EMAIL_FROM`) in `.env` for real email
delivery via [Resend](https://resend.com). Without a key, emails only land on
the **Outbox** page (`/outbox`) – open the supplier reply links (`/r/<token>`)
from there. The outbox is always written, so with Resend enabled it doubles as
a sent-mail audit log.

Transactional emails: RFQ invite (suppliers), offer received (buyer), offer
accepted (supplier). Reply links work **without registration** (per the
report's "one-click reply, optional registration" principle).

## Main routes

| Route | What's there |
|---|---|
| `/` | Landing + one-sentence intake |
| `/rfq/new` | Two-step RFQ wizard (intake → AI questions → spec) |
| `/dashboard` | Buyer RFQ list |
| `/rfq/[id]` | RFQ details: spec, shortlist, send-out, offer comparison, audit trail |
| `/r/[token]` | Public supplier reply page (token-based, no registration) |
| `/supplier` | Supplier portal: invites, response stats |
| `/supplier/opportunities` | Open opportunities: live RFQs matching the profile, self-apply without invite |
| `/supplier/profile` | Supplier profile: categories, regions, certifications |
| `/outbox` | Demo outgoing emails |

## Architecture

- **Next.js 16** (App Router, server actions, Turbopack) + **React 19** + **Tailwind 4**
- **Prisma 6 + SQLite** – swappable to Postgres in production without schema changes
- **@anthropic-ai/sdk** – model from `ANTHROPIC_MODEL` env var,
  structured output via `output_config.format` JSON schema
- Simple HMAC-signed cookie session (`src/lib/auth.ts`)
- Deterministic supplier matching score (`src/lib/matching.ts`):
  category 50 + region 30 (nationwide 20) + response rate up to 15 + certification 5

## Beachhead categories from the report (seeded)

Cleaning · HVAC / air conditioning · Security guarding · Occupational safety ·
Fire safety · IT support (second wave), with a Budapest + 19 county region
taxonomy.
