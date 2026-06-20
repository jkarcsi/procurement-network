# Procura — MVP Scope Document

**Document status:** first developed English version  
**Language:** English  
**Related materials:** Procura one-pager; Target Group and Problem Validation Document; User Roles and Use Case Document; GitHub README; GitHub Implementation Plan  
**Project:** Procura — AI-assisted B2B RFQ and supplier network  
**First market:** Hungary  
**Initial focus:** General, non-strategic procurement needs of Hungarian SMEs with 10–100 employees  
**Recommended use:** MVP scope, development roadmap, backlog prioritization, validation plan, launch decision, Codex/Claude Code development brief

---

## 1. Purpose of This Document

This document defines the scope of Procura’s first commercially validatable and market-ready version.

The goal of the document is not to list every long-term idea, but to clearly separate:

1. **what belongs to the core MVP;**
2. **what has already been implemented in the repository and should therefore be kept and stabilized;**
3. **what is required for validation and launch;**
4. **what should remain for later development rounds;**
5. **what is not a goal of the first version.**

The document takes into account that the current state of the GitHub repository already goes beyond a classic narrow MVP. Several functions that would normally be P1/P2 or growth/revenue features have already been implemented. These should not be removed from the MVP; instead, they should be treated as part of the **current MVP / launch scope**.

---

## 2. Strategic MVP Definition

Procura’s MVP is not a full ERP system, not a public procurement system, not a complex enterprise procurement platform and not a marketplace covering every industry.

Procura’s MVP is:

> A lightweight B2B RFQ workspace tailored to Hungarian SMEs, which turns a short procurement need into a structured RFQ, involves relevant suppliers, collects comparable offers, supports the buyer’s decision and logs the process in a searchable way.

The purpose of the MVP is not to solve every corporate procurement problem. Its purpose is to prove the central business loop:

**short buyer need → intelligent clarification → structured RFQ → supplier shortlist → invitation / open opportunity → supplier questions → offer submission → offer comparison → buyer decision → audit trail → feedback.**

---

## 3. Scope Planning Principles

### 3.1 Already Implemented Features Are Not Removed

Because several important features have already been implemented in the repository, they should not be removed from the MVP just because they would have been moved to a later phase in an ideal from-scratch MVP.

Examples include:

- buyer/supplier authentication;
- RFQ wizard;
- supplier shortlist;
- token-based supplier response;
- open opportunities;
- offer submission and acceptance;
- Procura analysis;
- admin panel;
- notification system;
- credits and Stripe test mode;
- mobile companion app;
- public API;
- marketing/pricing/legal pages;
- claim profile;
- referral;
- embeddable widget;
- GDPR export and account deletion.

The MVP scope treats these as **to be kept, validated and stabilized**.

### 3.2 The MVP Focus Remains the Buyer-Led RFQ Loop

Despite the extra features already implemented, the product focus does not change. The first business validation still centers on:

- creating a buyer RFQ;
- involving suppliers;
- collecting offers;
- comparing offers;
- recording the decision.

Every other feature should support this loop.

### 3.3 The Hungarian Market Needs a Hungarian User Experience

The MVP user interface, emails, statuses, validation messages and business wording should be in Hungarian.

Technical code, variable names, slugs, APIs, developer documentation and internal identifiers may remain in English.

### 3.4 Position the Product as a Business Outcome, Not as an AI Product

The user-facing message should not primarily be “we use AI”. Instead, the message should be:

- faster RFQ creation;
- better clarification;
- smart shortlist;
- more comparable offers;
- decision support;
- searchable procurement history.

Possible names for AI-supported features:

- “intelligent clarification”;
- “Procura analysis”;
- “smart shortlist”;
- “offer comparison”.

### 3.5 The System Must Not Decide Instead of the Buyer

Procura may support the decision, highlight differences, risks, missing information and offer deviations, but it must not say: “choose this one”.

The final business decision always belongs to the buyer.

### 3.6 The MVP Must Work Without an AI Key

The core loop must not depend exclusively on an external AI provider. If there is no AI key or the service is unavailable, the system must remain usable through rule-based fallback mechanisms:

- keyword-based category recognition;
- region recognition;
- category-specific template questions;
- deterministic shortlist.

---

## 4. Target Group and MVP Usage Situation

### 4.1 Primary Target Group

The primary target group of the MVP is:

> Hungarian SMEs with 10–100 employees that regularly request quotations for office, maintenance, service, equipment procurement or subcontracting tasks, but do not have their own procurement department.

Typical users:

- managing director;
- owner;
- operations manager;
- office manager;
- finance/administrative employee;
- site manager;
- employee responsible for procurement tasks.

### 4.2 Secondary Target Group

The secondary target group is:

> Local and national service-provider SMEs, subcontractors and B2B service providers that want to acquire new business customers.

Typical suppliers:

- cleaning companies;
- air conditioning / HVAC providers;
- security companies;
- occupational safety and fire safety providers;
- IT support companies;
- office supply and equipment suppliers;
- printing service providers;
- maintenance providers;
- courier/logistics providers;
- smaller trade companies;
- marketing, HR, accounting or other B2B service providers.

### 4.3 Beachhead Market

The first live market focus of the MVP is:

> Recurring, local or regional B2B service and facility-related procurement needs of Hungarian SMEs with 10–100 employees.

Initial categories:

1. cleaning services;
2. air conditioning / HVAC;
3. security services;
4. occupational safety;
5. fire safety;
6. IT support.

Second wave:

- office supplies and office equipment;
- printing services;
- office furniture;
- courier and logistics services;
- warehouse equipment;
- maintenance trade work;
- landscaping / site maintenance;
- pest control;
- accounting;
- HR and payroll;
- marketing and web services;
- smaller construction or trade subcontracting tasks.

---

## 5. MVP Success Definition

The MVP is successful if it proves commercially that:

1. the buyer can create a structured RFQ within a few minutes;
2. the system can suggest or involve relevant suppliers;
3. the supplier can respond with low friction;
4. each RFQ receives at least 2–3 relevant offers on average;
5. the buyer can choose faster or with a better decision-making basis than before;
6. the process produces either a decision or a learning outcome;
7. important events are searchable later;
8. at least one side shows willingness to pay;
9. the first categories reveal where marketplace liquidity can be built.

---

## 6. MVP Scope to Keep Based on the Current Repository State

This section summarizes features that, based on the repository, have already been implemented or partially implemented and should therefore be treated as part of the MVP.

### 6.1 Core RFQ Loop

**Scope status:** keep, validate, stabilize.

Includes:

- one-sentence intake;
- intelligent / fallback clarification questions;
- structured RFQ specification;
- category and region recognition;
- deterministic supplier shortlist;
- RFQ sending to shortlist and additional email addresses;
- tokenized invitations;
- no-registration supplier response link;
- structured offer submission;
- offer viewing;
- Procura analysis / offer comparison;
- offer acceptance;
- RFQ statuses;
- audit trail.

This is Procura’s most important business product core. In every launch decision, this loop must take priority.

### 6.2 Buyer Side

**Scope status:** included in the MVP.

Features:

- buyer registration;
- buyer login/logout;
- buyer company profile;
- dashboard with RFQ list;
- starting a new RFQ;
- RFQ wizard;
- RFQ detail page;
- viewing supplier shortlist;
- adding extra supplier emails;
- sending RFQ;
- listing incoming offers;
- offer comparison;
- accepting an offer;
- credit balance / credit purchase;
- notifications;
- searching/filtering previous RFQs.

### 6.3 Supplier Side

**Scope status:** included in the MVP.

Features:

- supplier registration;
- supplier login/logout;
- supplier profile;
- setting categories;
- setting regions;
- providing certificates / qualifications;
- viewing invited RFQs;
- token-based offer submission;
- open opportunities page;
- applying to open RFQs;
- submitting an offer;
- notification of accepted offer;
- response statistics;
- profile claim option;
- entry paths connected to the referral program.

### 6.4 Invited Supplier / No-Registration Response

**Scope status:** critical MVP feature, keep.

Includes:

- unique token link;
- viewing RFQ details;
- simple offer form;
- submitting an offer without registration;
- optional later registration / profile claim;
- status update;
- audit and notification.

This function is strategically important because it reduces the marketplace cold-start problem.

### 6.5 Open Opportunities

**Scope status:** since it has already been implemented, it remains in the MVP.

Functionality:

- buyer RFQ can also appear as an open opportunity;
- registered suppliers can browse opportunities matching their profile;
- suppliers can apply without invitation;
- self-apply source can be tracked;
- public tender board can support the growth loop.

Product logic:

- invitation-based RFQ = controlled, buyer-initiated process;
- open opportunity = marketplace validation and inbound supplier acquisition.

### 6.6 RFQ Q&A Thread

**Scope status:** implemented / part of launch scope.

Includes:

- supplier can ask a question about the RFQ;
- buyer can answer;
- thread is visible to participants;
- notifications are connected to it;
- the process helps make offers more comparable.

In the MVP, the purpose of Q&A is not to become a full chat system, but to clarify issues before offer submission.

### 6.7 Offers, Decision and Rating

**Scope status:** part of the MVP.

Includes:

- structured offer submission;
- offer statuses;
- offer acceptance;
- handling non-winning offers;
- review / rating after closed process;
- supplier rating affects matching.

Important limitation:

- the system must not become a full contract management system;
- accepting an offer is not the same as automatic contract signing;
- the MVP does not include e-signature, escrow or automatic invoicing.

### 6.8 Monetization: Credits, Stripe Test Mode, Pro Subscription

**Scope status:** existing, keep, but verify separately before launch.

Includes:

- credit ledger;
- credit balance;
- credit package purchase;
- Stripe test mode checkout;
- webhook-based credit allocation;
- Pro subscription;
- FREE/PRO limits;
- auto-recharge;
- credit-gated analysis features.

MVP product principle:

- in the first stage, monetization is a validation tool;
- the goal is not to maximize price immediately;
- the goal is to prove willingness to pay on either the buyer or supplier side.

### 6.9 Admin Panel

**Scope status:** included in the MVP and launch-critical.

Features:

- user list;
- company management;
- supplier profile management;
- RFQ viewing and moderation;
- credit ledger / subscription data;
- supply-gap alert;
- handling problematic users;
- viewing audit trail;
- basic marketplace operations.

The admin panel is critical because the early marketplace will not be self-running. Supply gaps, wrong categories and moderation issues must also be manageable manually.

### 6.10 Notifications

**Scope status:** part of the MVP.

Channels:

- transactional email;
- outbox fallback;
- in-app notification;
- Expo push in the mobile app.

Core events:

- RFQ invite;
- offer received;
- offer accepted;
- welcome;
- Q&A events;
- new matching RFQ / opportunity;
- core loop status changes.

The purpose of notifications in the MVP: neither buyers nor suppliers should miss business-critical events.

### 6.11 Web App and Mobile Companion App

**Scope status:** both should be kept, but with different launch priorities.

Web app:

- primary interface for buyer and admin sides;
- marketing, pricing, public tenders and SEO pages;
- full RFQ loop.

Mobile app:

- companion app;
- login + biometric unlock;
- buyer RFQ list/detail;
- RFQ creation;
- offer acceptance;
- credit balance/purchase;
- supplier invite and offer submission;
- open opportunities;
- notifications/push.

MVP launch priority:

- web first;
- mobile app store submission should not block the first validation;
- an internal test build or preview build may be sufficient.

### 6.12 Marketing, Public Pages and Growth Features

**Scope status:** existing, keep.

Includes:

- landing page;
- pricing page;
- terms and privacy pages;
- social proof;
- public tender board;
- programmatic SEO pages;
- sitemap;
- claim your business profile;
- referral program;
- embeddable “request offers” widget.

These are not part of the core loop, but they support:

- buyer acquisition;
- supplier acquisition;
- organic search visibility;
- marketplace supply building;
- validation campaigns.

### 6.13 Public API v1

**Scope status:** existing, keep, but not the first sales message.

Includes:

- `/api/v1/*` endpoints;
- hashed API keys;
- OpenAPI;
- mobile token auth;
- integration foundations.

The main role of the API in the MVP:

- serving the mobile app;
- preparing later integrations;
- supporting technical scalability.

It should not be sold as a separate API platform in the first validation phase.

### 6.14 GDPR Export and Account Deletion

**Scope status:** existing, keep.

Includes:

- user data export;
- account deletion;
- basic data protection functions.

Needed before launch:

- legal / data protection expert review;
- privacy policy refinement;
- terms review;
- consent / cookie banner decision;
- documentation of data processing records and processes.

---

## 7. P0 — Mandatory MVP / Launch-Critical Scope

Without the P0 functions, Procura’s core business loop does not work or cannot be validated.

### 7.1 Account and Role Basics

P0:

- buyer registration;
- buyer login/logout;
- supplier registration;
- supplier login/logout;
- admin login;
- role-based access;
- active/inactive user handling;
- company linked to user;
- basic buyer/supplier/admin roles.

Acceptance criteria:

- buyer, supplier and admin roles work on separate routes and permissions;
- inactive users cannot log in;
- user is linked to a company where needed.

### 7.2 Buyer RFQ Wizard

P0:

- one-sentence intake;
- category suggestion;
- region suggestion;
- clarification questions;
- structured specification;
- editable RFQ draft;
- READY status;
- AI fallback.

Acceptance criteria:

- the buyer can reach a sendable RFQ within 3–5 minutes;
- it works without an AI key;
- category and region can be overridden.

### 7.3 Taxonomy and Category/Region Basics

P0:

- seeded categories;
- seeded regions;
- clarification questions connected to categories;
- supplier-category relationships;
- supplier-region relationships;
- nationwide service handling.

Acceptance criteria:

- at least the first beachhead categories work;
- Budapest + Hungarian counties can be handled;
- a usable structure exists for supplier matching.

### 7.4 Supplier Profile and Matching

P0:

- supplier profile;
- categories;
- regions;
- email;
- phone/website/description optionally;
- certification field;
- deterministic match score;
- shortlist explanation.

Acceptance criteria:

- the system can provide a relevant shortlist based on category and region;
- the buyer sees why a supplier is recommended;
- the supplier profile can be edited.

### 7.5 RFQ Sending and Invitation

P0:

- shortlist selection;
- adding extra supplier emails;
- RFQ deadline;
- RFQ send;
- tokenized invite;
- outbox fallback;
- transactional email;
- SENT status;
- audit log.

Acceptance criteria:

- every invitation is created with a unique token;
- without an email provider, sending can still be tested through the outbox;
- sending is logged.

### 7.6 Token-Based Supplier Response

P0:

- `/r/[token]` or equivalent public reply route;
- viewing RFQ details;
- offer form;
- price, priceUnit, startDate, validUntil, notes;
- submitting offer;
- OFFERED invite status;
- buyer notification.

Acceptance criteria:

- invited suppliers can submit offers without registration;
- token grants access only to the specific RFQ;
- offer is saved as structured data.

### 7.7 Offer List, Comparison and Decision

P0:

- listing incoming offers under the RFQ;
- structured offer display;
- accepting an offer;
- ACCEPTED status;
- RFQ DECIDED status;
- notifying the winning supplier;
- audit trail.

Acceptance criteria:

- buyer clearly sees what offers arrived;
- buyer can select a winner;
- decision is searchable later.

### 7.8 Audit Trail

P0:

- RFQ creation;
- RFQ modification;
- RFQ sending;
- invite creation;
- invite view;
- Q&A event;
- offer submit;
- offer accept;
- RFQ close;
- review;
- admin intervention;
- credit transaction.

Acceptance criteria:

- every important business mutation is audited;
- audit log does not contain unnecessary sensitive data;
- it is understandable in buyer and admin views.

### 7.9 Basic Admin Operation

P0:

- admin dashboard;
- user/company list;
- RFQ list;
- supplier list;
- credit ledger overview;
- supply-gap view;
- user deactivation;
- audit access.

Acceptance criteria:

- admin can supervise platform operations;
- supply gaps can be identified;
- problematic users can be handled.

### 7.10 Basic Monetization Gate

P0 for launch validation:

- FREE limits;
- Pro subscription logic;
- credit balance;
- credit usage;
- credit purchase flow in test mode;
- measuring willingness to pay.

Acceptance criteria:

- the system can model where and why users would pay;
- payment events can be logged;
- enabling live Stripe should be a separate launch decision, not automatic.

---

## 8. P1 — Strong MVP / Validation-Accelerating Scope

These features would not all be mandatory in a from-scratch MVP, but several already exist in the current repository and can therefore be treated as launch scope.

### 8.1 Open Opportunities and Public Tender Board

P1, but implemented: keep.

Purpose:

- activate the supplier side;
- inbound supplier acquisition;
- marketplace validation;
- SEO/growth support.

### 8.2 RFQ Q&A Thread

P1, but implemented: keep.

Purpose:

- more accurate offers;
- shared information basis;
- fewer misunderstandings;
- better offer comparability.

### 8.3 Procura Analysis in Credit-Gated Mode

P1, but existing: keep.

Purpose:

- summarize differences between offers;
- indicate risks and missing information;
- validate a monetization point.

Limitation:

- it must not decide instead of the buyer.

### 8.4 Reviews & Ratings

P1, but implemented: keep.

Purpose:

- build supplier trust;
- improve matching;
- create long-term reputation data.

### 8.5 Notifications and Push

P1, but implemented: keep.

Purpose:

- core events should not be missed;
- suppliers should respond faster;
- buyers should immediately see new offers.

### 8.6 Marketing / SEO / Referral / Claim Profile / Embeddable Widget

P1/Growth, but existing: keep.

Purpose:

- build initial demand and supply sides;
- claim supplier profiles;
- validate virality and referral;
- make buyer-side RFQ intake embeddable.

### 8.7 Mobile Companion App

P1/P2 by nature, but existing: keep.

Purpose:

- faster supplier response;
- push notifications;
- buyer decision while away from desk;
- modern product feel.

Launch priority:

- web first;
- mobile app store submission should not block first validation;
- internal test build or preview build may be enough.

---

## 9. P2 — Next Round, Not Launch-Blocking

These are important, but they are not required to start the first business validation.

### 9.1 Buyer Experience

- RFQ attachments;
- RFQ template and clone;
- recurring RFQ;
- deadline reminders;
- auto-close;
- weighted comparison matrix;
- BAFO / two-stage RFQ;
- saved / blocked suppliers;
- PDF export;
- calendar view;
- contract draft.

Note: RFQ attachments are a near-next item according to the repository implementation plan. If quick to implement, they may be valuable before launch, but they should not block validation of the core loop.

### 9.2 Supplier Experience

- deeper supplier analytics;
- offer templates;
- pricing presets;
- availability / pause invites;
- supplier organization multi-user;
- paid placement / boost;
- supplier offer quota + paywall;
- opportunity digest;
- auto-decline rules.

### 9.3 Trust and Compliance

- supplier verification;
- certificate verification;
- dispute resolution;
- procurement audit export;
- e-signature;
- contract workflow.

### 9.4 Monetization

- Team / Enterprise tier;
- annual billing discount;
- success fee option;
- supplier lead marketplace;
- white-label / association edition.

### 9.5 Integrations

- outbound webhooks;
- Számlázz.hu / Billingo / NAV Online Számla;
- Google / Microsoft SSO;
- calendar sync;
- Slack / Teams;
- Zapier / Make connector;
- API SDK.

### 9.6 Operations and Scaling

- Postgres migration;
- background job queue;
- Redis/shared-store rate limiting;
- observability dashboards;
- feature flags;
- backup and disaster recovery runbook;
- load/performance test;
- Playwright E2E test suite.

---

## 10. Explicitly Out of Scope for the First Launch Version

The following are not goals of the first launch version:

- full ERP;
- public procurement system;
- enterprise procurement suite;
- complex approval workflow;
- full contract management;
- automatic contract signing;
- escrow;
- money movement between buyer and supplier within the platform;
- KYC/AML;
- payment institution-like operation;
- full accounting/invoicing integration;
- international expansion;
- multilingual UI;
- multi-currency;
- coverage of every category;
- automatic supplier cold outreach without legal approval;
- raw price sharing between competitors;
- business decisions made by AI.

---

## 11. Launch-Hardening Scope

Based on the repository, the product already has many features. Before launch, the focus should not necessarily be on new features, but on stabilization.

### 11.1 Audit Completeness

Before launch, verify that every important business mutation is audited:

- RFQ create/update/send/close;
- invite create/view/decline/offer;
- Q&A question/answer;
- offer submit/accept/reject;
- review;
- credit purchase/usage/auto-recharge;
- admin intervention;
- user deactivation;
- supplier profile modification.

### 11.2 Empty / Loading / Error States

Before launch, every important screen should handle:

- empty list;
- no offers;
- no suppliers;
- no credits;
- expired token;
- invalid token;
- network error;
- AI fallback;
- email fallback;
- permission error.

### 11.3 Responsive and UI Polish

The goal is not luxury design, but a reliable, modern and trust-building interface.

Priority:

- buyer RFQ wizard;
- RFQ detail;
- supplier reply page;
- offer comparison;
- supplier portal;
- admin supply-gap;
- pricing and landing page.

### 11.4 Production Database and Deployment

The repository points toward SQLite/Postgres compatibility. Before launch, decide:

- whether SQLite remains only for demo/dev;
- whether production should use managed Postgres;
- backup strategy;
- migration strategy;
- environments: dev, staging, prod;
- secrets handling;
- HTTPS / domain / email domain setup.

### 11.5 Background Jobs

Several external or slow operations exist in the core loop:

- email;
- push;
- AI analysis;
- Stripe webhook;
- notification;
- lead discovery later.

Before launch, at least decide whether these remain inline for the first pilot or move to a queue.

### 11.6 Security and Abuse Protection

Existing elements:

- HMAC session;
- hashed API keys;
- rate limiting;
- public token links;
- user active flag.

Before launch, verify:

- token expiration;
- token brute-force protection;
- public endpoint rate limit;
- admin route protection;
- API key scope;
- Stripe webhook signature;
- consequences of account deletion;
- email enumeration risk;
- handling supplier spam offers.

### 11.7 Legal and Compliance

Mandatory human review before launch:

- Terms of Service;
- Privacy Policy;
- cookie / consent banner;
- list of data processors;
- AI provider data-processing role;
- Stripe / Resend / analytics provider handling;
- account deletion and export process;
- lead discovery LIA/DPIA if cold supplier data collection starts.

---

## 12. Detailed MVP Module Scope

### 12.1 Landing and Acquisition

Included in MVP:

- landing page;
- one-sentence intake CTA;
- pricing page;
- terms/privacy pages;
- public tender board;
- programmatic SEO pages;
- social proof;
- referral;
- embeddable widget.

Not a first-round goal:

- multilingual marketing site;
- complex content marketing CMS;
- partner portal;
- white-label edition.

### 12.2 Authentication and Account

Included in MVP:

- email + password login;
- buyer/supplier/admin role;
- logout;
- HMAC-signed session;
- mobile token auth;
- biometric unlock on mobile;
- user active/inactive;
- account deletion;
- export.

Not a first-round goal:

- Google/Microsoft SSO;
- SAML/enterprise SSO;
- web passkeys;
- full multi-user company role management.

### 12.3 Company and Plan

Included in MVP:

- Company BUYER/SUPPLIER type;
- FREE/PRO plan;
- credit balance;
- referral code;
- embed token;
- Stripe customer/subscription fields;
- company-user relationship.

Later:

- buyer organization roles;
- supplier organization roles;
- enterprise seats;
- spend approval workflow;
- SLA packages.

### 12.4 RFQ

Included in MVP:

- intakeText;
- title;
- category;
- region;
- deadline;
- spec;
- READY/SENT/DECIDED/CLOSED statuses;
- isPublic;
- questions;
- invites;
- offers;
- Q&A;
- audit logs;
- review.

Later:

- attachments;
- templates;
- recurring;
- clone;
- auto-close;
- deadline reminder;
- multi-category RFQ;
- duplicate RFQ detection;
- spec quality meter.

### 12.5 Supplier Matching

Included in MVP:

- category score;
- region score;
- nationwide handling;
- response rate;
- certification bonus;
- rating bonus;
- matchReason.

Later:

- embeddings;
- learning-to-rank;
- price competitiveness;
- capacity signal;
- supplier pause;
- buyer favorites/blocklist.

### 12.6 Offers

Included in MVP:

- structured offer form;
- net price;
- price unit;
- start date;
- validity;
- notes;
- submitted/accepted/rejected status;
- offer accepted notification;
- comparison.

Later:

- line items;
- attachments;
- alternative offers;
- BAFO;
- weighted scoring;
- contract draft;
- invoice integration.

### 12.7 Reviews and Trust

Included in MVP:

- buyer rating after decision;
- supplier rating sum/count;
- rating impact on matching.

Later:

- verified supplier;
- certificate verification;
- dispute resolution;
- public review policy;
- trust score;
- complaint workflow.

### 12.8 Admin

Included in MVP:

- users;
- companies;
- suppliers;
- RFQs;
- credit ledger;
- supply gaps;
- basic moderation;
- audit access.

Later:

- category-region heatmap;
- funnel dashboard;
- cohort analytics;
- supplier verification queue;
- lead discovery review queue;
- abuse case management.

---

## 13. MVP Validation Plan Scope

### 13.1 First Validation Goal

The goal is not to validate every implemented feature at once. The goal is to prove the core loop with real buyers and suppliers.

First validation workflow:

1. Buyer creates RFQ.
2. Procura helps clarify the need.
3. Buyer selects / extends supplier list.
4. RFQ is sent.
5. Suppliers respond through token link or supplier portal.
6. Buyer compares offers.
7. Buyer decides or closes.
8. Buyer gives feedback.
9. Supplier side gives feedback.

### 13.2 Validation Minimum

- at least 5–10 real RFQs;
- at least 5 contacted suppliers per RFQ;
- at least 2 relevant offers on average per RFQ;
- at least 3 beachhead categories tested;
- buyer interview after every closed process;
- supplier interviews with at least 10 respondents;
- willingness-to-pay measurement.

### 13.3 Validation Questions

Buyer side:

- was it faster than the previous manual method;
- did the RFQ quality improve;
- were supplier recommendations relevant;
- were offers more comparable;
- would they pay for it;
- which package would they accept.

Supplier side:

- was the RFQ relevant;
- was it easy to respond;
- was there enough information to submit an offer;
- did registration / token link model cause friction;
- would they pay for a relevant lead or subscription;
- would they like to receive more similar inquiries.

---

## 14. MVP Metrics

### 14.1 Buyer Metrics

- number of buyer registrations;
- onboarding completion rate;
- RFQ creation rate;
- RFQ draft → sent conversion;
- time from intake to sending;
- number of invited suppliers per RFQ;
- number of incoming offers per RFQ;
- offer comparison usage rate;
- decision / close rate;
- buyer return rate;
- payment conversion;
- buyer satisfaction.

### 14.2 Supplier Metrics

- number of supplier registrations;
- profile completion rate;
- invite open rate;
- invite → offer conversion;
- open opportunity → application conversion;
- average response time;
- supplier win rate;
- supplier return rate;
- supplier willingness to pay;
- profile claim rate.

### 14.3 Marketplace Metrics

- average number of offers per RFQ;
- share of RFQs with 0 offers;
- share of RFQs with 2+ offers;
- number of category-region supply gaps;
- liquidity by category;
- admin intervention rate;
- spam / abuse cases;
- open tender activity;
- referral conversion;
- SEO/public page conversion.

### 14.4 Monetization Metrics

- credit usage;
- credit purchase intent;
- Stripe checkout start;
- Stripe checkout complete in test mode;
- Pro upgrade intent;
- free limit hit rate;
- analysis feature usage;
- supplier premium/lead fee interest.

---

## 15. Go / No-Go Decision Points

### 15.1 Go Signals

It is worth continuing development and moving more actively toward the market if:

- the buyer-side problem is quickly understood;
- the buyer can create an RFQ within 3–5 minutes;
- each RFQ receives at least 2 relevant offers on average;
- suppliers are willing to respond;
- token-based response works and does not create a trust problem;
- buyers say comparison is better than Excel/email;
- at least some users would pay or show payment intent;
- repeatable demand appears in the first categories;
- the admin side can handle supply-gap situations.

### 15.2 No-Go / Pivot Signals

Be cautious if:

- RFQ needs are rare on the buyer side;
- the target group does not quickly understand the value;
- suppliers do not respond;
- one RFQ does not receive at least 2 relevant offers;
- the process requires too much manual admin work;
- supplier acquisition is too expensive;
- buyers want a fully manual concierge service rather than software;
- nobody wants to pay;
- legal/compliance risk is too high because of cold supplier outreach.

---

## 16. Development Priority for the Next Rounds

### 16.1 Immediate Next Development Focus

Based on the logic of the repository implementation plan, the next reasonable focus is:

1. audit completeness;
2. empty/loading/error states;
3. RFQ attachments;
4. Postgres migration;
5. background job queue;
6. E2E test suite;
7. observability;
8. backup/DR runbook;
9. legal review;
10. production launch checklist.

### 16.2 Why Not Start with Another New Feature?

Because based on the repository, many features have already been implemented. The biggest risk is no longer whether another visible feature is missing, but whether:

- the core loop is stable enough;
- every state is handled properly;
- auditability exists;
- payment and credit logic is consistent;
- the admin side can see problems;
- the production environment is viable;
- legal materials are in order.

---

## 17. Launch Checklist

### 17.1 Product

- [ ] Buyer RFQ loop runs end-to-end without errors.
- [ ] Supplier token response runs end-to-end without errors.
- [ ] Open opportunity flow works.
- [ ] Offer accept works.
- [ ] Review works.
- [ ] Q&A works.
- [ ] Notifications work.
- [ ] Admin can see problematic RFQs.
- [ ] Supply-gap works.
- [ ] Credit usage works.
- [ ] Stripe test flow works.

### 17.2 UX

- [ ] Hungarian user-facing texts are correct.
- [ ] Empty states are correct.
- [ ] Error handling is correct.
- [ ] Web is usable on mobile.
- [ ] Supplier reply page is simple and trust-building.
- [ ] Pricing is clear.
- [ ] Landing message is clear.

### 17.3 Technical

- [ ] Build is green.
- [ ] Lint is green.
- [ ] Unit tests are green.
- [ ] Smoke test is green.
- [ ] CI is green.
- [ ] Docker build works.
- [ ] Production env vars are documented.
- [ ] Postgres decision is made.
- [ ] Backup strategy is documented.
- [ ] Rate limit is verified.
- [ ] Admin route is protected.

### 17.4 Compliance

- [ ] Terms of Service legal review.
- [ ] Privacy Policy legal review.
- [ ] Cookie/consent decision.
- [ ] List of data processors.
- [ ] AI provider data-processing role clarified.
- [ ] Stripe/Resend/analytics provider documented.
- [ ] Account deletion tested.
- [ ] Export tested.
- [ ] Lead discovery does not start without counsel sign-off.

### 17.5 Business Validation

- [ ] 20–30 buyer interviews.
- [ ] 20–30 supplier interviews.
- [ ] 5–10 real RFQs.
- [ ] At least 100 potential suppliers in the first categories.
- [ ] Willingness to pay measured.
- [ ] Buyer feedback collected.
- [ ] Supplier feedback collected.

---

## 18. Summary

Based on the current repository state, Procura’s MVP scope is not a minimal demo, but a launch-near product scope with many already implemented features.

The core business loop:

> short buyer need → intelligent clarification → structured RFQ → supplier shortlist → invitation / open opportunity → Q&A → offer submission → comparison → decision → audit trail → feedback.

The main conclusions of this document:

1. **The core MVP is mostly already in place.**
2. **Already implemented launch-relevant features should not be removed.**
3. **The next focus should be stabilization, audit, UX polish, compliance and launch readiness.**
4. **Validation should continue to focus on recurring, non-strategic procurement processes of Hungarian SMEs with 10–100 employees.**
5. **The long-term platform, data, fintech and infrastructure vision should remain on the roadmap, but it must not distract from the first paid validation.**

Procura’s first market-ready version does not need to prove that it solves every procurement problem. It needs to prove that for a Hungarian SME, it provides a faster, more transparent, more comparable and more traceable process than the previous manual RFQ workflow — and that at least one side is willing to pay for it.
