# Procura — Monetization Document

**Document status:** first developed English version  
**Language:** English  
**Related materials:** Procura one-pager; Target Group and Problem Validation Document; User Roles and Use Case Document; MVP Scope Document; Data Model / Domain Model; GitHub repository; Implementation Plan  
**Project:** Procura — AI-assisted B2B RFQ and supplier network  
**First market:** Hungary  
**Initial focus:** General, non-strategic procurement needs of Hungarian SMEs with 10–100 employees  
**Recommended use:** business model, pricing validation, payment logic, pricing page, backlog, investor / partner conversations

---

## 1. Purpose of This Document

This document defines Procura’s monetization strategy from the first paid validation phase to later marketplace and network-based revenue models.

The goal is not to introduce every possible revenue model immediately. The goal is to prove that Procura can also work commercially by identifying:

1. which side is willing to pay first;
2. what value users are willing to pay for;
3. which pricing model is easiest to accept;
4. how to charge money without damaging the marketplace cold start;
5. how to gradually turn the already implemented credit / Pro / Stripe test mode foundations into a commercially live model.

Procura’s first monetization principle:

> In the first version, the buyer side pays for a faster, more structured and more comparable procurement process; the supplier side should preferably remain free at the beginning so that supplier supply and response willingness can grow faster.

---

## 2. Strategic Starting Point

Procura should not be sold as a generic “AI tool”, but as a lightweight B2B procurement workspace.

The payment logic is not based on the idea that the user pays for artificial intelligence. The user pays because the system:

- saves time;
- creates better RFQs;
- involves more relevant suppliers;
- produces more comparable offers;
- provides a decision trail and searchable procurement history;
- may later reduce the risk of poor supplier decisions.

Therefore, monetization should be communicated around outcomes:

- “faster RFQ creation”;
- “more comparable offers”;
- “less manual emailing”;
- “better basis for decisions”;
- “searchable procurement history”.

Primary communication to avoid:

- “AI platform”;
- “procurement ERP”;
- “enterprise procurement suite”;
- “automatic decision-making system”.

---

## 3. Currently Implemented Monetization Foundations Based on the Repository

Based on the current state of the repository, Procura’s monetization is no longer only a plan. It is already partially implemented.

### 3.1 Company-Level Monetization Fields

In the current data model, the `Company` entity already contains the main fields required for monetization:

- `plan` — currently `FREE` or `PRO`;
- `stripeCustomerId`;
- `stripeSubscriptionId`;
- `stripePaymentMethodId`;
- `autoRechargeEnabled`;
- `autoRechargeThreshold`;
- `autoRechargePackageId`;
- `creditBalance`;
- `creditLedger` relation;
- `referralCode`;
- `embedToken`;
- `apiKeys`.

This means monetization is defined at company level, not at individual user level. This is the right direction because Procura is a B2B product.

### 3.2 FREE / PRO Plan Logic

In the current system, the FREE package is limited, while the PRO package unlocks the main volume limits.

Current FREE limits:

- 3 RFQs in total;
- maximum 5 invited suppliers per RFQ.

Current PRO logic:

- unlimited RFQs;
- unlimited invited suppliers;
- server-side limit enforcement;
- Stripe Pro subscription support.

This is a good first implementation foundation because it is easy to explain:

> You can try it for free, and if the process works, you can use it regularly in the Pro package.

### 3.3 Credit-Based Analysis Model

The system already contains credit-based premium logic. The current credit model:

- welcome bonus: 10 credits;
- Procura analysis / comparison cost: 1 credit;
- credit packages:
  - Starter package: 10 credits / HUF 2,990;
  - Business package: 50 credits / HUF 9,990;
  - Enterprise package: 200 credits / HUF 29,990.

This model is useful for making higher-cost or more premium analysis features separately paid without blocking the basic RFQ process too early.

### 3.4 Auto-Recharge

The auto-recharge logic is already planned / partially implemented to automatically top up the credit balance when the company balance falls below a configured threshold.

This may become important later for more active buyer companies where Procura analysis becomes a regular usage element.

### 3.5 Stripe Test Mode

The current payment direction of the system is:

- Stripe test mode;
- hosted Checkout;
- webhook-based credit grant;
- idempotent transaction handling;
- no card data stored in the system.

This is correct from an MVP / validation perspective. Before live payments, the following are needed:

- legal review;
- finalization of Terms and Privacy Policy;
- clarification of the invoicing solution;
- Stripe live mode setup;
- tax and VAT handling review.

### 3.6 Current Pricing Page State

The current pricing communication uses two packages:

| Package | Price | Current message |
|---|---:|---|
| Basic | HUF 0 | first 3 RFQs free, max. 5 invited suppliers / RFQ |
| Pro | HUF 4,990 + VAT / month | unlimited RFQs, unlimited supplier invitations, audit trail, support |

The supplier side is currently communicated as free. This is a good decision for early marketplace building because it reduces friction on the supplier side.

---

## 4. Monetization Principle for the First Market Validation

The goal of the first paid validation phase is not to maximize revenue, but to prove that Procura can charge for real business value.

### 4.1 First Monetization Hypothesis

The first paying customer will probably not pay because they want to buy a “procurement platform”. They will pay because:

- they do not have time to write separately to 5–10 suppliers;
- they do not want to compare offers manually in Excel;
- they want to receive more relevant offers;
- they want to understand whether the price is realistic;
- they later want to search who they contacted and why they made a decision.

### 4.2 Likely Order of Willingness to Pay

Initial hypothesis:

1. **Buyer-side subscription** — easiest to communicate.
2. **Credit-based premium analysis** — already implemented, useful additional revenue.
3. **Managed / concierge sourcing pilot** — higher price, with manual work.
4. **Supplier premium** — only after enough buyer-side demand exists.
5. **Qualified lead fee** — later, once lead quality is proven.
6. **Success fee** — longer term, with legal and business complexity.
7. **Escrow / payment flow** — not MVP, much later, with legal risks.

### 4.3 First Market Rule

> The supplier side should not be burdened with a payment wall too early, because that could reduce response willingness and weaken buyer-side value.

Therefore, in the first validation phase, buyer-side payment and credit-based analysis should be the main monetization focus.

---

## 5. Buyer-Side Monetization

### 5.1 Why Would the Buyer Pay?

Buyer-side value can be divided into four main areas.

#### Time Savings

If an RFQ process is reduced from 2–6 hours to 20–40 minutes, that alone can justify a monthly fee.

#### Better RFQ

Clarification questions and structured RFQs can help suppliers submit better, more complete and more comparable offers.

#### More Relevant Suppliers

The shortlist and, later, lead discovery / supplier matching can provide more alternatives than previous recommendation-based or Google-based search.

#### Documented Decision

For the buyer, it is valuable to be able to search later:

- what they requested;
- who they invited;
- who responded;
- what offers arrived;
- who won;
- what decision trail remained.

### 5.2 Current Buyer Pricing Model

The currently implemented model:

| Package | Price | Main limit / benefit |
|---|---:|---|
| Basic | HUF 0 | first 3 RFQs, max. 5 suppliers / RFQ |
| Pro | HUF 4,990 + VAT / month | unlimited RFQs and invitations |

This is a very low entry price, which may be good for validation, but in the long term it is probably too low if Procura provides real procurement value and customer support.

### 5.3 Recommended Pricing Validation Steps

For the first paid validation, it is worth thinking in three pricing bands.

#### A/B Test 1 — Low-Friction SaaS Price

| Package | Price | Goal |
|---|---:|---|
| Free | HUF 0 | trial |
| Pro | HUF 4,990–9,990 + VAT / month | first paying buyer validation |

Advantages:

- easy decision;
- fast conversion;
- low resistance.

Disadvantages:

- can easily underprice the product;
- may be too low compared to support costs;
- difficult to raise significantly later.

#### A/B Test 2 — More Realistic SME SaaS Price

| Package | Price | Goal |
|---|---:|---|
| Free | HUF 0 | first 1–3 RFQs |
| Starter | HUF 9,900–19,900 + VAT / month | smaller active SME |
| Pro | HUF 29,900–49,900 + VAT / month | regularly procuring SME |

Advantages:

- better aligned with B2B value;
- better covers support and development;
- stronger validation signal.

Disadvantages:

- slower conversion;
- requires clearer value communication.

#### A/B Test 3 — Managed Pilot / Concierge Model

| Package | Price | Goal |
|---|---:|---|
| Pilot | HUF 49,000–99,000 / RFQ or monthly fee | manually supported RFQ process |
| Managed | HUF 100,000–300,000 / month | active companies with manual sourcing |

Advantages:

- faster revenue;
- deeper learning;
- better buyer interviews and feedback.

Disadvantages:

- a lot of manual work;
- not pure SaaS;
- harder to scale.

### 5.4 Recommended Initial Decision

While keeping the current implementation, it is worth communicating the following in the short term:

| Package | Recommendation |
|---|---|
| Basic | keep at HUF 0 for first trial |
| Pro | may stay at HUF 4,990 + VAT / month as a validation price, but only as an early / beta price |
| Later Pro | HUF 9,900–19,900 + VAT / month |
| Business / Team | HUF 29,900–49,900 + VAT / month |
| Managed pilot | above HUF 100,000, with manual support |

Important: the HUF 4,990 price should not be treated as the final strategic price. It is better to handle it as an “early access” or “introductory price”.

---

## 6. Credit-Based Monetization

### 6.1 What Is the Credit Model Useful For?

The credit model is useful when certain features are more expensive or more premium, but the basic workflow should not be placed behind a paywall too early.

Such features may include:

- Procura analysis;
- offer-comparison summary;
- risk highlighting;
- analysis of offer strengths and weaknesses;
- later price benchmark;
- extended supplier shortlist analysis;
- negotiation assistant;
- contract draft preparation.

### 6.2 Current Credit Packages

| Package | Credits | Price | Unit price |
|---|---:|---:|---:|
| Starter package | 10 | HUF 2,990 | HUF 299 / credit |
| Business package | 50 | HUF 9,990 | approx. HUF 200 / credit |
| Enterprise package | 200 | HUF 29,990 | approx. HUF 150 / credit |

The volume-based discount is a good direction because it pushes more active companies toward larger packages.

### 6.3 Recommended Credit Usage

In the first version, not every valuable feature should require credits. The basic RFQ loop must remain easy to try.

Recommended credit-based features:

| Feature | Recommended credits |
|---|---:|
| Procura offer-comparison analysis | 1 credit |
| detailed risk and difference analysis | 1–2 credits |
| price benchmark later | 2–5 credits |
| contract draft later | 3–5 credits |
| negotiation assistant later | 2–3 credits |

Not recommended to make credit-based in the MVP:

- RFQ creation;
- clarification questions;
- basic shortlist;
- supplier invitation within plan limits;
- offer submission;
- basic comparison table.

### 6.4 Risks of the Credit Model

Using the credit model too early or in an overly complex way can reduce conversion.

Risks:

- the user does not understand why credits are consumed;
- the buyer is afraid to use analysis;
- the credit logic feels like microtransactions;
- subscription + credits together feel too complex.

How to manage this:

- include 10 welcome credits;
- credit consumption should always be predictable;
- clearly display: “This analysis uses 1 credit”;
- credits should be linked to premium analysis, not core functions;
- later, the Pro package may include a monthly credit allowance.

---

## 7. Supplier-Side Monetization

### 7.1 Initial Decision: Supplier Side Is Free

In the first phase, the supplier side should remain free.

Reasons:

- due to marketplace cold start, as many responding suppliers as possible are needed;
- the supplier does not yet know whether Procura will bring real business;
- a paywall may reduce response rate;
- buyer-side value depends on how many suppliers respond;
- low friction is especially important for invited suppliers.

### 7.2 When Can Procura Charge the Supplier Side?

Supplier monetization is worth introducing only after it has been proven that:

- real RFQs arrive regularly;
- suppliers respond and can win business;
- there is a measurable invite → offer → win funnel;
- in some categories, competition or oversupply develops;
- suppliers can see that the platform pays for itself.

### 7.3 Later Supplier Packages

| Package | Price hypothesis | Content |
|---|---:|---|
| Supplier Free | HUF 0 | profile, response to invited RFQs |
| Supplier Plus | HUF 9,900–19,900 + VAT / month | more categories/regions, better profile, notifications |
| Supplier Premium | HUF 29,900–49,900 + VAT / month | highlighted presence, more open opportunities, statistics |
| Verified Supplier | one-time or monthly fee | verified status, documents, qualifications |
| Paid Placement | variable | “featured” placement, clearly marked |

### 7.4 Supplier Monetization Rules

Trust is critical on the supplier side. Therefore:

- paid placement must always be clearly marked;
- ranking must not become a fully pay-to-win mechanism;
- the buyer must understand why a supplier is recommended;
- relevance, region, category and response performance should remain more important than paid status;
- suppliers should not pay for RFQs that are irrelevant to them.

---

## 8. Qualified Lead and Lead Marketplace Model

### 8.1 When Can It Work?

The qualified lead model can work if Procura can prove that the supplier receives not a generic advertising placement, but a concrete, category-matched, decision-ready opportunity.

A lead can be considered qualified if:

- a real buyer is behind it;
- a concrete RFQ exists;
- category and region match;
- the buyer is actually waiting for offers;
- the RFQ is detailed enough for an offer to be submitted;
- the supplier is not excluded by the conditions.

### 8.2 Possible Lead Fee Ranges

| Category type | Lead fee hypothesis |
|---|---:|
| low-value / simple service | HUF 1,000–3,000 / qualified lead |
| mid-value B2B service | HUF 3,000–10,000 / qualified lead |
| higher-value project / subcontracting work | HUF 10,000–30,000 / qualified lead |

### 8.3 Risks

- supplier-side resistance if they do not win business;
- disputes about lead quality;
- need for refund logic;
- spam perception;
- legal and data protection risk in cold lead discovery.

### 8.4 Recommendation

Lead fee should not be the first monetization model. First, Procura needs:

- RFQ volume;
- supplier response data;
- win rate;
- category-specific ROI estimate;
- clear refund / invalid lead rules.

---

## 9. Success Fee Model

### 9.1 Description

In the success fee model, Procura charges only when the buyer accepts an offer or a deal is created.

Possible forms:

- fixed successful-deal fee;
- percentage commission;
- buyer-side success fee;
- supplier-side success fee;
- hybrid model.

### 9.2 Advantages

- low entry resistance;
- fee is tied to value;
- may seem fair to both supplier and buyer;
- can generate significant revenue for larger deals.

### 9.3 Disadvantages

- difficult to verify whether the deal actually happened;
- parties may bypass the platform;
- legal and invoicing complexity;
- dispute handling;
- may push the product toward escrow / payment flow.

### 9.4 Recommendation

Success fee should not be a mandatory MVP-level model. It is worth testing later:

- in higher-value categories;
- in managed pilots;
- as an optional fee;
- only when decision and audit trail are strong enough.

---

## 10. Managed / Concierge Monetization

### 10.1 What Is It?

In the managed / concierge model, Procura provides not only software, but also partially manual support throughout the RFQ process.

Examples:

- RFQ formulation;
- supplier search;
- supplier invitation;
- follow-up;
- offer standardization;
- comparison report preparation.

### 10.2 Why Can It Be Useful at Launch?

- it can generate revenue faster;
- it provides deeper market learning;
- it bridges the supply-gap problem;
- it helps product development based on real processes;
- it allows a higher price than pure SaaS.

### 10.3 Recommended Pilot Packages

| Package | Price hypothesis | Content |
|---|---:|---|
| Single RFQ pilot | HUF 49,000–99,000 / RFQ | support for one RFQ process |
| Monthly sourcing pilot | HUF 100,000–300,000 / month | multiple RFQs, manual supplier search, report |
| Category audit | HUF 150,000–500,000 / project | review of existing suppliers and prices |

### 10.4 Risk

The managed model can easily turn the product into a service business if the manual steps are not consciously fed back into software development.

Rule:

> Every manual concierge step should generate learning, and whatever can be turned into a product feature later should be productized.

---

## 11. Recommended First Monetization Strategy

### 11.1 First 90 Days

Goal: prove willingness to pay, not maximize revenue.

Recommended model:

- keep the Free package;
- Pro package at early validation price;
- 10 welcome credits;
- keep credit packages;
- supplier side remains free;
- optional manual managed pilot;
- Stripe remains in test mode / controlled pilot;
- invoicing can initially be manual if needed.

Validation questions:

1. Is the buyer willing to pay for the Pro package?
2. Is the HUF 4,990 price too low / too high?
3. Would buyers accept a HUF 9,900–19,900 monthly fee?
4. Would they pay separately for Procura analysis / credits?
5. Do they prefer subscription, one-time fee or managed service?
6. When does willingness to pay appear on the supplier side?

### 11.2 3–6 Months

Goal: create a working paid SaaS model.

Possible direction:

| Package | Price | Content |
|---|---:|---|
| Free | HUF 0 | 1–3 RFQs, limited invitations |
| Starter | HUF 9,900 + VAT / month | smaller monthly usage |
| Pro | HUF 29,900 + VAT / month | active buyer companies |
| Team | HUF 49,900–99,900 + VAT / month | multiple users, multiple sites, better reports |
| Managed | custom | manual sourcing support |

The current HUF 4,990 Pro price can then become:

- early adopter pricing;
- annual discount;
- Starter package;
- temporary promotion.

### 11.3 6–12 Months

Goal: expand marketplace monetization.

Possible extensions:

- Supplier Plus;
- Verified Supplier;
- paid placement / boost;
- supplier analytics;
- offer quota;
- qualified lead fee;
- annual billing;
- Team / Enterprise tier;
- API / integration package;
- white-label / association edition.

---

## 12. Recommended Pricing Page Messages

### 12.1 Buyer Main Message

> Start for free and request multiple comparable offers with less emailing.

### 12.2 Pro Package Message

> For recurring business procurement: unlimited RFQs, more suppliers, complete decision trail and faster comparison.

### 12.3 Credit Message

> Procura analysis helps you understand the differences between incoming offers faster. Basic comparison is available; detailed analysis uses credits.

### 12.4 Supplier Message

> As a supplier, you can respond to relevant business RFQs for free. Paid supplier features will later help increase visibility and customer acquisition.

### 12.5 Messages to Avoid

- “paying for AI”;
- “automated decision-making”;
- “guaranteed cheapest supplier”;
- “guaranteed business acquisition for suppliers”;
- “public procurement system”.

---

## 13. Monetization Metrics

### 13.1 Buyer-Side Metrics

- Free → Pro conversion;
- upgrade rate after RFQ creation;
- upgrade rate after limit reached;
- number of active paying buyer companies;
- buyer MRR;
- buyer ARPA;
- churn;
- RFQ / paying company / month;
- number of accepted offers among paying companies;
- credit purchase rate;
- credit usage / RFQ.

### 13.2 Supplier-Side Metrics

- number of supplier registrations;
- invite → offer conversion;
- supplier return rate;
- supplier win rate;
- supplier profile completion;
- supplier premium interest;
- paid placement test conversion;
- qualified lead acceptance rate.

### 13.3 Marketplace Monetization Metrics

- average number of offers per RFQ;
- RFQ closing rate;
- accepted offer rate;
- buyer-estimated time savings;
- buyer-estimated financial savings;
- liquidity by category;
- revenue by category;
- MRR / category;
- CAC / paying buyer;
- payback period.

### 13.4 Credit Metrics

- welcome credit activation rate;
- time to first credit usage;
- credit package purchase rate;
- most popular credit package;
- auto-recharge activation rate;
- credit revenue / MRR ratio;
- credit usage by feature.

---

## 14. Legal, Invoicing and Compliance Considerations

### 14.1 Stripe and Payments

Before live payments, the following must be clarified:

- Stripe live mode setup;
- invoicing method;
- VAT handling;
- subscription cancellation rules;
- refund policy;
- legal nature of credit purchases;
- explicit consent for auto-recharge;
- payment method saving;
- payment data processing.

### 14.2 Legal Risks of Supplier Monetization

For supplier-side payment, attention must be paid to:

- clear marking of paid placement;
- avoiding unfair ranking;
- definition of lead quality;
- refund rules;
- complaint handling;
- advertising / direct marketing rules.

### 14.3 Success Fee and Escrow Risk

For success fee or escrow, separate legal review is required because it may raise questions around:

- intermediary liability;
- payment services regulation;
- handling disputed performance;
- platform responsibility;
- tax and invoicing issues.

Recommendation:

> Escrow, milestone payments and money movement inside the platform should not be part of the first paid version.

---

## 15. Product and Development Consequences

Monetization makes the following elements especially important.

### 15.1 Server-Side Limit Enforcement

All package limits must be enforced server-side. Hiding functions in the UI is not enough.

### 15.2 Auditable Credit Ledger

Every credit movement must be searchable:

- top-up;
- purchase;
- usage;
- bonus;
- refund later;
- auto-recharge.

### 15.3 Pricing Copy and UX

The pricing page should be simple:

- Free: trial;
- Pro / Starter: regular usage;
- credit: premium analysis;
- supplier: free at the beginning.

### 15.4 Upgrade Moments

The system should ask for payment when the user has already seen value.

Good upgrade moments:

- the free RFQ limit has been reached;
- more supplier invitations are needed;
- offers have arrived and the buyer requests detailed analysis;
- the buyer is already a returning RFQ creator;
- the buyer wants export or a full audit record.

Bad upgrade moments:

- before first registration;
- at the start of RFQ intake;
- before supplier response;
- when an invited supplier is submitting an offer.

---

## 16. Recommended Monetization Roadmap

### 16.1 Already Existing / Keep

- Free / Pro package;
- Stripe test mode;
- credit packages;
- credit ledger;
- welcome bonus;
- Pro plan limits;
- auto-recharge foundation;
- free supplier side;
- pricing page;
- Terms / Privacy pages.

### 16.2 Next 30 Days

- refine pricing copy;
- validate Pro price;
- clarify credit usage UX;
- measure upgrade events;
- buyer interviews with payment questions;
- define managed pilot offer;
- prepare legal review.

### 16.3 Next 90 Days

- test Starter / Pro / Team hypotheses;
- test annual pricing;
- analyze credit package usage;
- supplier premium interviews;
- validate paid placement on paper / in interviews;
- Stripe live readiness;
- build invoicing process.

### 16.4 Later Roadmap

- Team / Enterprise tier;
- Supplier Plus / Premium;
- verified supplier;
- paid placement;
- qualified lead fee;
- success fee pilot;
- partner / association models;
- white-label models;
- API monetization;
- procurement analytics / benchmark reports.

---

## 17. Recommended End State in 12–24 Months

In the longer term, Procura can have several revenue streams.

### 17.1 Buyer SaaS Subscription

The main stable MRR source:

- Starter;
- Pro;
- Team;
- Enterprise / Managed.

### 17.2 Usage-Based Credits

Additional revenue:

- analysis;
- price benchmark;
- contract draft;
- negotiation assistant;
- advanced reporting.

### 17.3 Supplier Monetization

Later marketplace revenue:

- premium profile;
- verified supplier;
- paid placement;
- offer quota;
- analytics;
- qualified leads.

### 17.4 Partner and Data-Type Revenue

Only with proper data protection and aggregation rules:

- anonymous benchmark reports;
- category / region market insights;
- industry association models;
- white-label Procura instance;
- API access.

---

## 18. Decision Recommendation

Based on the current state, the best monetization decision is:

1. **Keep the existing Free / Pro + credit model**, because it is already implemented and suitable for validation.
2. **Treat the HUF 4,990 Pro price as an early / validation price**, not as the final strategic price.
3. **Keep the supplier side free in the first validation phase**, because supplier supply and response rate are more important than early supplier revenue.
4. **Apply the credit model only to premium analysis**, not to the basic RFQ loop.
5. **Test a managed pilot offer**, because it can generate faster revenue and deeper market learning.
6. **Introduce Supplier Premium, paid placement, lead fee and success fee only after later validation.**
7. **Before live payments, complete legal, invoicing and VAT review.**

---

## 19. Short Strategic Summary

Procura’s first monetization strategy:

> Free entry for both buyer and supplier sides, buyer-side Pro subscription for regular use, credit-based premium analysis for higher-value decision support, and supplier monetization only once marketplace value has been proven.

The main business claim:

> Procura can charge money when it proves that Hungarian SMEs’ RFQ process becomes faster, more structured, more comparable and more searchable because of it.
