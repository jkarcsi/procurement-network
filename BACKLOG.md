# Procura — Improvement Backlog

A menu of candidate improvements to choose from. This complements the active
backlog in `ROUTINE_PROMPT.md` (which tracks the launch path); the items here
are the broader product wishlist. Same schema as the routine file: pick **one**
item, build a complete vertical slice (schema + action/lib + UI + test),
verify (`build` + `lint` + `test` + `smoke`), and push.

Conventions still apply: Hungarian user-facing copy, English codebase, no "AI"
wording in the UI (hard rule 6), credits/Stripe test mode only, shared business
logic in `src/lib/*` used by both web actions and the `/api/v1` mobile API.

Each row has a stable code (e.g. `M3`) so you can refer to it. Effort is a
rough T-shirt size (S/M/L/XL).

---

## M — Matching & intelligence

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

## B — Buyer experience

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| B1 | RFQ templates & clone | S | Save an RFQ as a template / clone a past one; speeds repeat tenders |
| B2 | Recurring RFQs | M | Schedule periodic re-tender for ongoing services (e.g. quarterly); auto-create a draft + reminder |
| B3 | Weighted comparison matrix | M | Compare offers with buyer-set weights (price/start date/cert/rating); highlight best fit |
| B4 | RFQ Q&A thread | M | Registered suppliers ask clarifying questions; buyer answers; visible to all invitees; recurring Qs feed the category clarify-template (was ROUTINE P16) |
| B5 | RFQ attachments | M | `Attachment` model, local `/uploads` in dev (Blob/S3 in prod), 10 MB cap, PDF/DOCX/XLSX/PNG/JPG; download on the reply page (was ROUTINE P14) |
| B6 | Deadline reminders & auto-close | S | Email/push the buyer before deadline; auto-move SENT→CLOSED past deadline with no decision |
| B7 | Two-stage RFQ (BAFO) | M | Shortlist offers, then request best-and-final from the chosen few |
| B8 | Buyer org & approval workflow | L | Multiple users per buyer company, roles, spend thresholds requiring approval before send/accept |
| B9 | Saved/blocked suppliers | S | Per-buyer favorites and blocklist that bias (or exclude from) the shortlist |
| B10 | PDF export (RFQ + offers) | S | One-click procurement record; useful for offline approval |
| B11 | Calendar view | M | Deadlines, fulfillment dates, recurring-service reminders; optional mutual availability (was a user idea) |
| B12 | Contract draft from accepted offer | M | Generate an editable service-contract draft pre-filled from the RFQ spec + accepted offer |

## S — Supplier experience

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| S1 | Supplier analytics | M | Win rate, response-time percentile vs. peers, invite→offer→win funnel |
| S2 | Offer templates / pricing presets | S | Reusable price lines and boilerplate to answer faster |
| S3 | Availability / pause invites | S | Toggle "nem fogadok új megkeresést"; matching skips paused suppliers |
| S4 | Supplier org (multi-user) | M | Several users share one supplier profile; per-user notifications |
| S5 | Paid placement / boost | M | Suppliers pay to rank higher, clearly marked "kiemelt" so ranking trust holds (was ROUTINE P17) |
| S6 | Offer quota then paywall | M | First X offers free, then registration + package required; keep one-click reply for the free quota (user idea) |
| S7 | Opportunity digest | S | Daily/weekly email+push of new matching open opportunities |
| S8 | Auto-decline rules | S | Decline invites outside chosen categories/regions/price floor automatically |

## T — Trust, quality, compliance

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| T1 | Reviews & ratings | M | Buyer rates the supplier after DECIDED; average shown on profile + feeds matching (≤5 pts) (was ROUTINE P15) |
| T2 | Supplier verification | M | Check VAT number validity (NAV/VIES) + company-registry existence; "ellenőrzött" badge |
| T3 | Certificate verification | M | Upload + (manual or registry) verification of certifications; badge on shortlist |
| T4 | Dispute resolution flow | M | Structured complaint after a deal, with audit trail and admin mediation |
| T5 | Escrow / milestone payments | XL | Deposit held by Procura until fulfilment (Stripe Connect); **needs payment-institution licensing + counsel** (was ROUTINE P19) |
| T6 | KYC/AML for payouts | L | Required once money moves through the platform |
| T7 | Procurement audit export | S | Buyer downloads a tamper-evident record (RFQ, invites, offers, decision, timeline) |
| T8 | E-signature on contracts | M | Integrate an e-sign provider for the accepted-offer contract |

## $ — Monetization

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| $1 | Team / Enterprise tiers | M | Beyond FREE/PRO: seats, SSO, audit, SLA; gate via `src/lib/limits.ts` |
| $2 | Credit auto-recharge | S | Top up automatically when balance drops below a threshold (Stripe) |
| $3 | Success fee option | M | Optional commission on accepted-offer value as an alternative to subscriptions |
| $4 | Lead marketplace | L | Suppliers pay per qualified lead/opportunity (ties into the lead-discovery project) |
| $5 | Annual billing discount | S | Yearly plans; proration; invoices |
| $6 | White-label / association edition | L | Branded instance for a chamber or industry body |

## G — Growth & virality

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| G1 | Lead-discovery & cold outreach engine | XL | Reach non-registered businesses with relevant RFQs → they register to respond. **Separate project — see `docs/lead-discovery-plan.md`** |
| G2 | "Claim your business profile" | M | A cold lead that receives an RFQ can claim + verify its pre-filled profile and convert to a supplier in one flow |
| G3 | Referral program | M | Invite a buyer/supplier, both get credits on activation; tracked, fraud-capped |
| G4 | Public/open tender marketplace | M | Opt-in RFQs visible to all matching suppliers (not just invitees); inbound supplier signups |
| G5 | Programmatic SEO pages | M | "{kategória} {megye}" landing pages with demand stats + CTA; sitemap; structured data |
| G6 | Embeddable "ajánlatot kérek" widget | M | Buyers embed a quote-request box on their own site that creates a Procura RFQ |
| G7 | Case studies / social proof | S | Real outcomes ("48 órán belül 5 ajánlat") on landing + supplier pages |
| G8 | Partnerships (chambers/associations) | M | Co-marketing + verified supplier import with MKIK or sector bodies |

## X — Integrations & API

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| X1 | Outbound webhooks | M | Let integrators subscribe to events (offer.received, rfq.decided); signed payloads |
| X2 | Accounting/invoicing | M | Számlázz.hu / Billingo / NAV Online Számla for the accepted deal |
| X3 | SSO login | M | Google / Microsoft sign-in (web + mobile) alongside email+password |
| X4 | Calendar sync | S | Push deadlines/fulfillment to Google/Outlook calendars |
| X5 | Slack/Teams notifications | S | Org-level channel alerts for new offers/decisions |
| X6 | Zapier / Make connector | M | No-code automations off the public API |
| X7 | API: pagination + filtering + SDK | S | Cursor pagination, more filters, a tiny TS client package |

## N — Notifications & engagement

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| N1 | Notification preferences | S | Per-type, per-channel (in-app/email/push) opt-in/out; quiet hours |
| N2 | Email digests | S | Batched daily/weekly summaries instead of per-event emails |
| N3 | SMS for urgent events | M | Optional SMS (provider) for deadline/accepted; cost-capped |
| N4 | Web push (PWA) | M | Browser push for the installed PWA, mirroring mobile push |

## O — Analytics, ops & reliability

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| O1 | Admin analytics dashboards | M | Funnel, cohorts, category demand heatmap, supply/demand gaps |
| O2 | Supply-gap alerts | S | Flag categories/regions with demand but few suppliers (targets lead-discovery) |
| O3 | Background job queue | M | Move inline email/push/AI calls to a queue (BullMQ/Redis); retries; avoids request latency |
| O4 | Postgres migration | M | Switch `DATABASE_URL` to managed Postgres; pooling; migration scripts (schema already compatible) |
| O5 | Shared-store rate limiting | S | Replace in-memory limiter with Redis/KV for multi-instance correctness |
| O6 | Observability | M | Structured logs, request tracing, dashboards/alerts (the analytics + onRequestError hooks exist) |
| O7 | Feature flags + A/B testing | M | Gate rollouts; experiment on copy/flows |
| O8 | Backups & DR runbook | S | Automated DB backups, restore drills, documented RTO/RPO |
| O9 | Load & performance testing | S | k6/Artillery scenarios for the core loop; budget thresholds in CI |
| O10 | E2E test suite | M | Playwright across the full buyer↔supplier loop, in CI |

## D — Data, i18n, taxonomy

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| D1 | Taxonomy expansion | M | Beyond facility/compliance (e.g. marketing, logistics, construction trades); seed + clarify questions |
| D2 | English UI option | M | i18n layer so international buyers can use the product; Hungarian stays default |
| D3 | County→settlement granularity | S | Finer region matching (city-level) for dense areas like Budapest districts |
| D4 | Multi-currency | M | For cross-border suppliers; display + offer currency |

## A — Accessibility & UX polish

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| A1 | Accessibility audit (WCAG 2.2 AA) | M | Keyboard nav, ARIA, contrast, focus states across all pages |
| A2 | Dark mode | S | Theme tokens + toggle (web + mobile) |
| A3 | Onboarding tours | S | First-run guidance for buyers and suppliers |
| A4 | Performance pass | S | Image optimization, code-splitting, font loading, Lighthouse budget |
| A5 | Richer empty/loading states | S | Skeletons + helpful empty states everywhere |

## MOB — Mobile (beyond the current full loop)

| # | Item | Effort | Scope hint |
|---|------|--------|-----------|
| MOB1 | Offline cache | M | Cache lists/detail for read access offline; queue actions |
| MOB2 | Deep links / universal links | S | Open `procura://rfq/<id>` and HTTPS app links straight to a screen |
| MOB3 | Tablet / large-screen layout | S | Master-detail layout on wide screens |
| MOB4 | Biometric re-auth for sensitive actions | S | Re-prompt biometrics before accept/purchase |
| MOB5 | Localized push categories & badges | S | Per-type channels, unread app-icon badge |
| MOB6 | In-app review prompts | S | Ask for an app-store rating after a successful deal |

---

## Suggested near-term picks (opinion)

If optimizing for **revenue + retention**: T1 (reviews) → B4 (Q&A thread) →
B5 (attachments) → $2 (auto-recharge).

If optimizing for **growth/supply**: G1 (lead discovery) → G2 (claim profile)
→ G3 (referrals) → O2 (supply-gap alerts).

If optimizing for **production hardening**: O4 (Postgres) → O3 (job queue) →
O10 (E2E) → O6 (observability).
