# Procura — Long-term Vision

> A multi-year strategic concept for the company being built around Procura.
> This is a thinking document, not a commitment: it maps where the product can
> go, the non-obvious opportunities, how Procura could become a large company,
> and — above all — what to do with the **data asset, the users, and the
> processes** that the network accumulates. Pair it with the near-term build
> plan in `IMPLEMENTATION_PLAN.md` and the growth engine in
> `docs/lead-discovery-plan.md`.

Horizon framing throughout: **H1** = 0–18 months, **H2** = 18–48 months,
**H3** = 4–7 years, **H4** = 7+ years.

---

## 1. The thesis in one paragraph

B2B procurement of **local services** for small and medium businesses is large,
recurring, fragmented, offline, and trust-poor. A Hungarian SME that needs
cleaning, HVAC, security, occupational/fire safety, or IT support today asks a
neighbor, googles, calls two numbers, and overpays a vendor it can't easily
compare or replace. Procura turns that into a **one-sentence request → several
comparable offers → a decision with a record**. The wedge is convenience for
the buyer; the prize is **liquidity and proprietary data in a market nobody has
digitized**. Whoever aggregates the demand and structures the supply becomes the
default place B2B local-service commerce happens — and then the trust layer, the
payments rail, and the intelligence provider on top of it.

The same playbook that built large companies in adjacent spaces (Alibaba/IndiaMART
for B2B trade, ServiceTitan/Jobber for service SMBs, Faire for wholesale, Ramp/
Mercury for SME finance) is available here for **CEE B2B local services**, where
there is no entrenched digital incumbent.

---

## 2. The evolution path: tool → marketplace → network → infrastructure

Procura should deliberately climb four rungs. Each rung is a defensible business;
each unlocks the next.

1. **Tool (H1).** A single-player utility: a buyer gets good quotes fast, even
   before there is a dense supplier network (concierge/seeded supply fills gaps).
   Value = time saved + better price. Monetization = subscription + credits.
2. **Marketplace (H1–H2).** Two-sided liquidity: matching, reviews, open tenders,
   the supplier side self-serving. Value = choice + trust. Monetization adds
   take-rate and supplier lead-gen.
3. **Network (H2–H3).** Data network effects: every transaction improves matching,
   pricing intelligence, and reliability scoring, which improves outcomes, which
   attracts more transactions. Value = outcomes others can't match. Monetization
   adds data/intelligence and payments.
4. **Infrastructure (H3–H4).** Others build on Procura: embedded procurement, API,
   fintech rails, a trust/verification layer licensed out. Value = Procura is the
   substrate of B2B local commerce in the region. Monetization = platform fees,
   float, financing, insurance.

The strategic error to avoid: staying a "quote tool" forever. The tool is the
on-ramp; the destination is the network and the rails.

---

## 3. The data asset — the crown jewel

Everything Procura does generates a dataset that is **hard to assemble any other
way** and compounds over time. This is the single most important long-term asset.
Already today the schema captures the raw material; the strategy is to refine it.

### 3.1 What accumulates

- **Demand graph.** Who needs what, where, in what spec, how often, with what
  seasonality and budget signals (RFQs, categories, regions, intake text,
  deadlines, recurrence). → the only real-time map of SME service demand in HU.
- **Supply graph.** Which businesses exist (lead-discovery), their capabilities,
  coverage, certifications, responsiveness, win/loss behavior, and quoting
  patterns. → a living census of the local-service economy.
- **Price intelligence.** Real **transacted** net prices per category × region ×
  spec — not list prices. Nobody has this for HU SME services. → a proprietary
  B2B price index.
- **Quality & reliability graph.** Reviews, response times, dispute outcomes,
  repeat-business signals. → a trust/risk score per supplier.
- **Relationship graph.** Buyer↔supplier interactions, switching, loyalty,
  concentration. → churn/expansion prediction; cross-sell.

### 3.2 How to turn it into products and moats (legally, ethically)

- **Better matching & ranking** (internal moat): the flywheel that makes Procura's
  outcomes structurally better than any newcomer's. Compounds with volume.
- **Market intelligence subscriptions** (H2): "category reports" for suppliers
  (where is demand growing, what are winning prices, what spec wins), and spend
  benchmarks for buyers ("you pay 18% above the median for this in your county").
- **The Procura Index** (H2–H3): a periodic, anonymized, aggregate price/activity
  index for B2B local services — a PR and authority engine (cited by press,
  chambers, the central bank), plus a saleable data product to insurers, banks,
  research, and government.
- **Risk & underwriting data** (H3): supplier reliability scores power the
  fintech layer (escrow, financing, insurance) and can be licensed to banks/
  insurers who currently can't price SME service-firm risk well.
- **Demand forecasting & lead routing** (H3): predict re-tender timing and route
  high-intent demand — the basis of a premium supplier lead marketplace.

### 3.3 Guardrails (non-negotiable)

- **GDPR & the lead-discovery legal gate.** Personal data only on a documented
  lawful basis; data minimization; suppression/opt-out; counsel-reviewed before
  any cold outreach (see `docs/lead-discovery-plan.md`).
- **Competition law.** Price intelligence must be **aggregated and historical**,
  never a channel for coordination/signaling between competitors. Build the data
  products so they inform individual decisions, not collusion.
- **Data stewardship as brand.** Suppliers and buyers must trust that Procura
  won't weaponize their data against them. Transparency + opt-outs are a moat,
  not a cost. Never sell raw, identifiable transaction data.

---

## 4. Users & processes — owning the workflow on both sides

Liquidity is necessary but not sufficient; the durable lock-in is becoming the
**system of record** for procurement (buyers) and for sales/ops (suppliers).

### 4.1 Buyers — from "get a quote" to "manage all my outside spend"

- H1: RFQ wizard, comparison, decisions, audit trail (done).
- H2: procurement **system of record** — saved suppliers, contracts, renewals,
  recurring services, spend dashboard, approvals for multi-user buyer orgs,
  document vault, e-signature.
- H3: **proactive procurement.** Integrate accounting / bank feed / NAV
  e-invoicing → Procura sees what the SME already spends on facility/IT/etc. and
  **automatically proposes a competitive re-tender** when a contract is overpriced
  or expiring. This flips Procura from reactive (buyer initiates) to proactive
  (Procura finds savings), driving continuous value and stickiness — the single
  highest-leverage engagement idea in this document.
- H3–H4: **agentic procurement** — "keep my cleaning competitively tendered every
  12 months" runs itself; buyers approve outcomes, not steps.

### 4.2 Suppliers — give them an operating system, not just leads

The supply side is underserved SMEs with no good software. The flip: ship them a
**free CRM / quoting / scheduling / invoicing** tool so they *live in Procura*,
then procurement naturally flows through it. (This is the ServiceTitan/Jobber
move applied to HU service SMEs.) Effects: deep supply lock-in, richer data,
faster response times, and a second SaaS revenue line independent of marketplace
take-rate. A supplier who runs their day in Procura will never leave for a quote
site.

### 4.3 The process is the moat

Each completed loop (intake → match → offer → decision → review → re-tender)
deepens both the data and the habit. Optimize relentlessly for **repeat sourcing
relationships**, not one-off transactions — that is where GMV, retention, and
data compounding live.

---

## 5. Business model — stacking revenue over time

Marketplaces win by layering revenue as trust and volume grow. Sequence matters:
don't tax transactions before there's liquidity and trust.

| Layer | Mechanism | Horizon | Notes |
|---|---|---|---|
| Subscriptions | Pro / Team / Enterprise tiers | H1 (live) | Predictable; gates volume + collaboration + intelligence |
| Credits | Pay-per-analysis / premium features | H1 (live) | Usage-based upsell; auto-recharge live |
| Referral / virality | Credits for invites | H1 (live) | Lowers CAC |
| Supplier lead-gen | Pay per qualified opportunity / boost | H2 | Suppliers pay for demand; the lead-discovery DB feeds it |
| Take-rate / success fee | % of accepted-offer value | H2 | Introduce gently once trust + escrow exist |
| Verification-as-a-service | Verified-supplier badge, KYC | H2 | Trust product; also licensable |
| Data / intelligence | Reports, benchmarks, the Index, API data | H2–H3 | High-margin; aggregated only |
| Payments & escrow | Hold deposits to fulfilment; float | H3 | Needs payment-institution licensing/counsel |
| Financing | Advance suppliers against accepted offers; buyer BNPL on services | H3 | Underwritten by Procura's reliability data |
| Insurance brokerage | Liability/work insurance bundled at deal time | H3 | Commission; reduces buyer risk friction |
| Platform / API | Embedded procurement, app ecosystem | H3–H4 | "Procura inside" |
| White-label | Branded instances for chambers/franchises/banks | H3 | Channel + revenue |

The two outsized unlocks are **payments/fintech** (where marketplaces become
financial-infrastructure-scale via float, lending, and insurance) and **data/
intelligence** (near-zero marginal cost, defensible). Both are downstream of
liquidity and trust — so H1–H2 must earn the right to them.

---

## 6. Expansion vectors — growing the addressable market

- **Categories.** Facility + compliance (beachhead) → all local B2B services →
  trades/construction subcontracting → goods & supplies (consumables, equipment)
  → professional services (legal, accounting, marketing) → logistics. Each new
  category reuses the same loop and taxonomy machinery.
- **Buyer segments.** SME → mid-market (procurement teams, approvals, multi-site)
  → enterprise (managed sourcing, integrations) → micro/sole-trader → eventually
  **public sector / EU-funded procurement** (huge, but heavily regulated — a
  separate, compliance-grade product; tailwind from transparency mandates).
- **Geography.** Hungary → V4/CEE (Poland, Czechia, Slovakia, Romania) — same
  fragmentation, EU regulatory alignment, no incumbent — → broader EU. The
  taxonomy, matching, and lead-discovery are localizable; the data moat is
  per-market but the playbook travels.
- **Verticalization.** Deep, opinionated procurement suites for specific verticals
  (e.g., multi-site retail facility management, real-estate/property management,
  HoReCa, manufacturing MRO) where workflow depth wins.
- **Adjacencies.** Supplier CRM/ops SaaS (§4.2), buyer spend management, contract
  lifecycle, e-signature, invoicing/e-invoice, compliance management, B2B
  staffing/labor (facility services are labor-heavy), group/co-op buying.
- **Private individuals (consumers) — on both sides of the market.** The same
  local services (cleaning, handyman, HVAC, IT, gardening, moving, repairs,
  safety) are also **bought by households**, not only businesses — and
  **supplied by individuals** (sole traders, gig/odd-job providers, skilled
  moonlighters), not only registered firms. Procura can serve private people on
  the **demand side** (a homeowner gets several comparable quotes exactly the way
  an SME does) *and* on the **provider/fulfilment side** (a skilled individual
  receives relevant jobs, replies with one click, claims a profile, and builds a
  rating). This roughly **doubles both sides of the network** while reusing the
  *same loop, taxonomy, matching, and trust machinery*: consumer demand is cheap
  and high-intent (strong SEO and word-of-mouth tailwind), and individual
  providers **densify thin supply** in categories and regions where firms are
  scarce. The consumer lane needs its own guardrails, though — full B2C
  consumer-protection law, distance-selling/withdrawal rules, stronger identity
  and quality verification for individual providers, and clearer dispute and
  insurance cover (a household is a weaker party than an SME buyer). Sequencing:
  keep **B2B as the beachhead** (higher value, recurrence, willingness to pay),
  then open the consumer lane once liquidity and trust exist — turning Procura
  from a B2B network into the general place **local services get sourced**.

Sequencing principle: go **deep before wide** — own HU facility/compliance
end-to-end (including payments + trust) before spreading thin across categories
or countries. Depth creates the data and trust that make expansion cheap.

---

## 7. Non-obvious opportunities (the "didn't think of these yet" list)

1. **Proactive re-tendering via financial integrations.** Read accounting / bank /
   NAV e-invoice data, detect recurring outside spend, and auto-trigger savings
   re-tenders. Converts Procura from a tool you remember to a service that pays
   for itself continuously. (See §4.1.)
2. **Supplier operating system as the supply-side moat.** Free CRM/quoting/
   scheduling for service SMEs; procurement flows through their daily software.
   (See §4.2.)
3. **The Procura Index.** A proprietary B2B local-services price/activity index —
   authority, PR, and a data product. Few assets build brand and revenue at once.
4. **Group/co-op procurement.** Let many small buyers pool demand (e.g., 30 small
   offices in one district) for volume pricing — value suppliers can't ignore and
   buyers can't get alone. A wedge into otherwise-uneconomic micro-segments.
5. **Recurring-services subscription marketplace.** "Subscribe & re-tender" for
   ongoing services (quarterly maintenance, monthly cleaning) → predictable GMV,
   the calendar as the spine, and natural re-tender events.
6. **Embedded procurement ("Procura inside").** The quote widget evolves into a
   full embeddable marketplace inside accountants' portals, banks' SME apps,
   chamber sites, and ERP marketplaces — distribution without owning the front door.
7. **The accountant/bookkeeper channel.** Every HU SME has one; they are trusted
   advisors and a ready-made distribution and data-integration channel. A partner
   program for accountants could be the cheapest high-trust acquisition path.
8. **Risk-data partnerships with banks/insurers.** Supplier reliability scores are
   exactly what lenders/insurers lack for service SMEs — a licensable data product
   and a co-marketing channel.
9. **ESG/compliance tailwind.** Compliance-heavy categories (safety, energy,
   waste) align with rising ESG-reporting and regulatory mandates; Procura can
   become the place SMEs both *buy* compliance services and *prove* compliance.
10. **Demand as the cheap side.** Aggregated buyer demand is high-intent and
    relatively cheap to acquire (SEO, widget, accountants); suppliers will pay to
    reach it. Treat demand aggregation as the strategic flywheel input.
11. **Public/aggregate transparency products.** Anonymized market maps ("supply
    gaps by county") have civic and policy value — government/EU-fund relationships
    and grants, plus PR.
12. **Trust layer as a standalone product.** Verification + escrow + dispute
    resolution, licensed to other B2B platforms that lack it.

---

## 8. Moats & defensibility

- **Data network effects.** Matching/pricing/risk improve with volume; a newcomer
  starts cold. Strongest moat — invest in compounding it.
- **Two-sided liquidity + reputation lock-in.** Suppliers' ratings/history and
  buyers' records live here; leaving means losing them.
- **Workflow lock-in.** System of record (buyers) + operating system (suppliers).
- **The lead/supply graph.** A categorized census of HU businesses is expensive to
  rebuild and legally non-trivial — a durable asset (see lead-discovery).
- **Trust & brand.** In a trust-poor market, being the trusted default is a moat
  competitors can't copy with features.
- **Payments/financial entanglement (H3+).** Once money and financing flow through
  Procura, switching cost rises sharply.

Anti-moat to manage: **disintermediation** (buyer and supplier meet once, then
transact off-platform). Counter with: payments/escrow that are *better on*
platform, ongoing value (re-tendering, ratings, financing, insurance, tooling),
and recurring-service structures — not by trapping people.

---

## 9. Go-to-market & the liquidity flywheel

Cold-start is the hardest problem; solve it demand-first.

- **Aggregate demand cheaply:** programmatic SEO (category × region, live),
  embeddable widget, referral, accountant/chamber partnerships, and concierge
  sourcing to guarantee buyers get offers even in thin categories.
- **Seed & convert supply:** lead-discovery cold outreach (legal-gated) + "claim
  your profile" + free supplier tools. Demand pulls supply in.
- **Prove outcomes:** social proof, the Index, case studies, savings reports.
- **Compound:** every loop improves matching and trust → better outcomes → word of
  mouth + retention → more loops.

North-star metric candidate: **quarterly active sourcing relationships** (buyers
who ran ≥1 competitive process *and* a returning supplier base), with GMV and
match-rate as the health pair. Optimize for repeat, not raw signups.

---

## 10. Risks & failure modes (and how to survive them)

- **Liquidity cold-start.** Mitigate with demand-first GTM + concierge supply.
- **Disintermediation.** Mitigate with on-platform payments, ongoing value,
  recurring structures (§8).
- **Trust incidents / quality failures.** A single bad supplier can poison a
  category; invest early in verification, reviews, dispute resolution, insurance.
- **Regulatory.** GDPR (data/outreach), payments licensing (escrow/financing),
  competition law (price data), e-invoicing/tax. Treat counsel as a core function,
  not an afterthought — especially before lead-discovery outreach and payments.
- **Take-rate resistance.** HU SMEs are price-sensitive; introduce transaction
  fees only after clear, trusted value (escrow, financing, savings). Subscriptions
  + data + lead-gen carry early revenue.
- **Fraud/abuse.** Fake suppliers, review gaming, lead farming; needs verification,
  rate limiting (live), anomaly detection, and human review.
- **Thin-margin services / low digitization.** Some categories resist software;
  pick beachheads with recurrence and comparability first.
- **Big-tech / incumbent entry.** Unlikely to localize HU SME services deeply;
  speed to the data/trust moat is the defense.

---

## 11. Multi-year roadmap (horizons)

**H1 (0–18 mo) — Win HU facility/compliance procurement.**
Liquidity in the 6 beachhead categories; subscriptions + credits + referral
(live); reviews/verification basics; mobile app (live); lead-discovery (legal +
collection); proactive supplier acquisition; first paid supplier lead-gen.
Goal: the default place HU SMEs source these services; clean unit economics on
subscriptions; a growing proprietary dataset.

**H2 (18–48 mo) — Marketplace + trust + first data products + payments groundwork.**
Take-rate (gentle), escrow MVP (with licensing/counsel), verification-as-a-service,
supplier tools v1, buyer system-of-record, category expansion (2–3 adjacent),
intelligence subscriptions + the first Procura Index, CEE pilot (one country),
and an opt-in **consumer lane** (households as buyers, individuals as providers)
once trust + escrow exist — reusing the same loop with B2C-specific guardrails.
Goal: real GMV, transaction trust, a second (data) and third (lead-gen) revenue
line, and a beachhead beyond HU.

**H3 (4–7 yr) — Network + fintech + platform.**
Payments at scale (float), supplier financing + buyer BNPL, insurance brokerage,
proactive re-tendering via financial integrations, agentic procurement, mature
data products + API/embedded ecosystem, mid-market + selective public sector,
regional (CEE) leadership.
Goal: Procura is the B2B local-services network of record for the region, with
fintech and data as major revenue.

**H4 (7+ yr) — Infrastructure.**
The trust + payments + intelligence substrate of B2B local commerce in CEE;
others build on the API; category-defining scale; optionality on broader EU and
on becoming the SME procurement + finance platform.

---

## 12. What to do *now* with what already exists

Concrete, grounded in the current codebase — the seeds of the above are already
planted:

- **Treat data as a product from day one.** Instrument and warehouse every
  RFQ/offer/decision/review cleanly (the schema already captures them); start the
  anonymized price/activity aggregates early — the Index needs history, so begin
  accumulating it now.
- **Finish the lead-discovery legal gate**, then run collection (Tier-1 open data)
  to build the supply census — the input to lead-gen, "claim profile" (live), and
  supply-gap targeting (admin view live).
- **Double down on recurrence.** Push recurring-service RFQs and re-tender events;
  they create predictable GMV and the strongest data/retention compounding.
- **Build the accountant/chamber channel** as the cheapest high-trust acquisition
  path; the embeddable widget (live) and white-label are the technical enablers.
- **Sequence revenue patiently:** keep subscriptions + credits + lead-gen as the
  near-term engine; earn the right to take-rate and payments by first delivering
  trust (reviews live, verification next) and liquidity.
- **Protect the relationship.** Every feature should make staying on Procura more
  valuable than going around it (payments, financing, tooling, re-tendering) —
  never rely on lock-in by friction.

---

*This document should be revisited quarterly. The market, the data, and the
opportunities will teach more than any plan written up front — but the direction
is durable: aggregate the demand, structure the supply, earn the trust, own the
data, and become the rail.*
