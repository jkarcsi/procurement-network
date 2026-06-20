# Procura — Flowcharts Document

**Document status:** first developed English version  
**Language:** English  
**Related materials:** Procura one-pager; Target Group and Problem Validation Document; User Roles and Use Case Document; MVP Scope Document; GitHub repository documentation and implementation plan  
**Project:** Procura — AI-assisted B2B RFQ and supplier network  
**First market:** Hungary  
**Initial focus:** General, non-strategic procurement needs of Hungarian SMEs with 10–100 employees  
**Recommended use:** MVP scope refinement, development tickets, UX planning, backend process modeling, admin operations, validation pilot

---

## 1. Purpose of This Document

This document describes the main business and product workflows of the first version of Procura at flowchart level.

The goal is not to define every screen or technical detail permanently, but to give the team, development work and later documentation a shared view of:

- how a buyer RFQ starts;
- how a short need becomes a structured RFQ;
- how suppliers enter the process;
- how an invited or registered supplier responds;
- how the clarification Q&A process works;
- how offers arrive and can be compared;
- how a decision is made;
- where the audit trail appears;
- where an admin may intervene;
- how supply gaps and category expansion requests can be handled.

The document builds on the previously defined core logic:

> short buyer need → clarification → structured RFQ → supplier shortlist → invitation / open opportunity → questions and answers → offer submission → comparison → decision → audit trail → feedback.

---

## 2. Diagram Notation and Interpretation

The document uses Mermaid-compatible flowcharts. These can be rendered visually in GitHub, Notion, Obsidian, Mermaid Live Editor or several Markdown renderers.

General interpretation:

- **Buyer**: buyer-side user or company.
- **Supplier**: registered supplier.
- **Invited Supplier**: invited supplier, potentially without registration.
- **System**: the Procura system, including rule-based and AI-based logic.
- **Admin**: internal Procura platform admin / operator.
- **RFQ**: request for quotation.
- **Audit trail**: searchable business event log.

The flowcharts do not always represent the final implementation sequence. They describe product and business logic.

---

## 3. High-Level Procura Value Creation Loop

This is Procura’s central business workflow. Every other sub-process connects to it.

```mermaid
flowchart TD
    A[Buyer briefly describes the procurement need] --> B[System suggests category and region]
    B --> C[System asks clarification questions]
    C --> D[Buyer answers and edits the RFQ]
    D --> E[System creates a structured RFQ]
    E --> F[System suggests a supplier shortlist]
    F --> G[Buyer selects / expands the supplier list]
    G --> H[RFQ is sent or published as an open opportunity]
    H --> I[Supplier may ask questions or submit an offer]
    I --> J[Buyer answers questions]
    J --> K[Supplier submits a structured offer]
    K --> L[Buyer compares offers]
    L --> M[Buyer makes a decision]
    M --> N[System sends notifications and writes audit trail]
    N --> O[Buyer rates the winning supplier]
    O --> P[Reputation, matching and data asset improve]
```

### Business Meaning

The goal of the first version of Procura is not to cover every procurement category or full ERP functionality. The goal is to make this loop fast, understandable, repeatable and measurable from a business perspective.

### Mandatory Parts from an MVP Perspective

- short intake;
- category/region detection or manual selection;
- clarification questions;
- structured RFQ;
- supplier shortlist;
- invitation;
- token-based supplier response;
- offer submission;
- offer list / comparison;
- decision;
- audit trail.

---

## 4. Buyer RFQ Creation Workflow

This is the most important first experience on the buyer side. The goal is to reach the state “I have an RFQ ready to send” within a few minutes.

```mermaid
flowchart TD
    A[Buyer enters the dashboard] --> B[Start new RFQ]
    B --> C[Enter short need]
    C --> D[System analyzes intake text]
    D --> E{Can a suitable category be found?}
    E -- Yes --> F[Category and region suggestion]
    E -- No --> G[Create category expansion request]
    G --> H[Buyer may manually select category or continue with admin review]
    F --> I[Buyer accepts or modifies category/region]
    H --> I
    I --> J[Display clarification questions]
    J --> K[Buyer answers]
    K --> L[System creates structured RFQ draft]
    L --> M[Buyer reviews and edits]
    M --> N{Is the RFQ complete enough?}
    N -- Yes --> O[READY status]
    N -- No --> P[Show missing data]
    P --> K
```

### Important UX Principle

The buyer should not feel that they are filling in a long administrative form. The first experience should feel like:

> “I briefly describe what I need, and the system helps me turn it into a good RFQ.”

### Edge Cases to Handle

- too short or unclear need;
- need that fits multiple categories;
- missing region;
- non-existing category;
- AI service unavailable;
- buyer abandons the process;
- buyer modifies the system suggestion.

---

## 5. Category and Region Handling Workflow

Category and region are the basis of matching. If they are wrong, the shortlist will also be wrong. Therefore, the buyer must always be able to override the system’s suggestion.

```mermaid
flowchart TD
    A[Intake text or manual selection] --> B[System creates category suggestion]
    B --> C[System creates region suggestion]
    C --> D[Buyer reviews]
    D --> E{Buyer accepts?}
    E -- Yes --> F[Category and region saved]
    E -- No --> G[Buyer modifies]
    G --> H{Does this category exist?}
    H -- Yes --> F
    H -- No --> I[Category expansion request]
    I --> J[Admin review queue]
    J --> K{Admin approves?}
    K -- Yes --> L[Create new category]
    K -- No --> M[Route to existing category or reject]
    L --> F
    M --> F
    F --> N[Recalculate shortlist]
```

### Product Decision

A category expansion request should not become a dead end. The buyer should be able to continue creating the RFQ, while the system notifies admin that a new or poorly covered category appeared.

### Admin Perspective

Admin should see:

- which categories receive many expansion requests;
- where there are not enough suppliers;
- which categories generate many miscategorized RFQs;
- which new categories are worth adding officially.

---

## 6. Supplier Shortlist and RFQ Sending Workflow

The purpose of the shortlist is not to decide in a black-box manner who should be selected, but to provide an understandable and editable recommendation.

```mermaid
flowchart TD
    A[RFQ in READY status] --> B[System starts supplier search]
    B --> C[Filter by category]
    C --> D[Filter by region / nationwide service]
    D --> E[Score relevance and activity]
    E --> F[Supplier shortlist]
    F --> G{Are there enough suppliers?}
    G -- Yes --> H[Buyer sees shortlist]
    G -- No --> I[Supply-gap signal]
    I --> J[Admin / lead discovery process]
    J --> H
    H --> K[Buyer selects invitees]
    K --> L[Buyer may add own supplier emails]
    L --> M{Publish as open opportunity too?}
    M -- Yes --> N[Create open opportunity]
    M -- No --> O[Invitation-only RFQ]
    N --> P[Send RFQ]
    O --> P
    P --> Q[Invitation records are created]
    Q --> R[Emails / outbox items]
    R --> S[RFQ SENT status]
    S --> T[Audit trail event]
```

### Shortlist Criteria

Useful MVP shortlist criteria:

- category match;
- region match;
- nationwide service;
- supplier profile completeness;
- previous response rate;
- qualifications / certifications;
- ratings, if available;
- manual admin priority, if needed.

### Important Product Principle

The buyer can add their own suppliers as well. This reduces the cold-start problem and allows Procura to rely not only on its own supplier database.

---

## 7. Invited Supplier Token-Based Response Workflow

This is one of the most important cold-start-reducing workflows. A supplier must not get stuck at registration if they only want to respond to one specific RFQ.

```mermaid
flowchart TD
    A[Supplier receives email invitation] --> B[Open token-based response link]
    B --> C{Is token valid?}
    C -- No --> D[Error page / request new link]
    C -- Yes --> E[View RFQ details]
    E --> F{Is supplier interested?}
    F -- No --> G[Decline invitation]
    G --> H[Invitation DECLINED status]
    F -- Yes --> I{Does supplier have a question?}
    I -- Yes --> J[Submit clarification question]
    J --> K[Notify buyer]
    K --> L[Buyer answers]
    L --> M[Supplier is notified about the answer]
    M --> N[Fill offer form]
    I -- No --> N
    N --> O[Price, price unit, deadline, validity, notes]
    O --> P[Submit offer]
    P --> Q[Offer SUBMITTED status]
    Q --> R[Notify buyer]
    R --> S{Supplier registers / claims profile?}
    S -- Yes --> T[Create or claim supplier profile]
    S -- No --> U[Supplier-side flow ends]
```

### MVP Minimum

- token is linked to one specific RFQ;
- token expiry and security rules;
- supplier can see the core RFQ details;
- supplier can ask a question;
- supplier can submit an offer;
- buyer is notified about the offer;
- supplier can register afterwards.

### Security Limitation

An invited, non-registered supplier should not see other RFQs, other buyer data or confidential platform-level information. However, aggregated marketing-style signals may be shown, for example: “there are currently X open opportunities in this category”, without details.

---

## 8. Registered Supplier Onboarding and Profile Workflow

The purpose of supplier onboarding is to let the supplier quickly define which categories and regions they cover. The first entry should not be too long.

```mermaid
flowchart TD
    A[Start supplier registration] --> B[Name, email, password]
    B --> C[Enter company data]
    C --> D[Select categories]
    D --> E[Set regions / nationwide service]
    E --> F[Contact details]
    F --> G{Has certificates or qualifications?}
    G -- Yes --> H[Certificates / website / description]
    G -- No --> I[Save profile]
    H --> I
    I --> J[Supplier profile active or under review]
    J --> K[Can appear in matching]
    K --> L[Invitations / open opportunities]
```

### Later Profile Claim Workflow

```mermaid
flowchart TD
    A[Supplier submitted offer as invited supplier] --> B[System offers profile claim]
    B --> C[Supplier enters / confirms email]
    C --> D[Email verification]
    D --> E{Verification successful?}
    E -- No --> F[Claim failed / support]
    E -- Yes --> G[Assign supplier profile]
    G --> H[Edit company data]
    H --> I[Set category and region]
    I --> J[Supplier portal available]
```

### Product Decision

The supplier side should keep two entry paths:

1. **Cold / self-registration** — supplier joins voluntarily.
2. **RFQ-based entry** — supplier first responds to a concrete RFQ, then claims their profile afterwards.

The second path is likely stronger for early marketplace validation.

---

## 9. Open Opportunity / Open Tender Workflow

The purpose of open opportunities is to ensure that the supplier side does not depend only on invitations. This strengthens the marketplace nature of the product, but only works well if there is enough supplier activity.

```mermaid
flowchart TD
    A[Buyer creates RFQ] --> B{Can it be published as an open opportunity?}
    B -- No --> C[Invitation-only RFQ]
    B -- Yes --> D[RFQ appears in open opportunities list]
    D --> E[Registered supplier logs in]
    E --> F[Supplier browses by category/region]
    F --> G[Supplier opens an RFQ]
    G --> H{Supplier applies?}
    H -- No --> I[No participation]
    H -- Yes --> J[Self-apply event is created]
    J --> K[Buyer / system sees the new interested supplier]
    K --> L[Supplier may ask questions]
    L --> M[Supplier submits an offer]
    M --> N[Buyer compares invited and self-applied offers]
```

### MVP Question

The open opportunity feature is launch-relevant if the goal is not only buyer-tool validation, but also marketplace validation. Since the current direction is a two-sided Procura network, it is worth keeping this in the MVP, but it does not need to be overcomplicated.

### Minimum Rules

- only registered suppliers should be able to apply to open RFQs;
- suppliers should see only relevant / filterable RFQs;
- the buyer should see if a supplier arrived through the self-apply path;
- offers must remain confidential;
- admin should be able to moderate open RFQs.

---

## 10. Clarification Q&A Workflow

The purpose of Q&A is to improve offer comparability. If a supplier asks an important question, the answer should preferably be visible to all participating suppliers so that there is no information asymmetry.

```mermaid
flowchart TD
    A[Supplier reads RFQ] --> B{Is something missing or unclear?}
    B -- No --> C[Offer submission]
    B -- Yes --> D[Submit clarification question]
    D --> E[System records the question]
    E --> F[Notify buyer]
    F --> G[Buyer answers]
    G --> H{Answer public to participants?}
    H -- Yes --> I[Answer visible to all participating suppliers]
    H -- No / exceptional --> J[Answer only to asker or admin review]
    I --> K[Suppliers are notified]
    J --> K
    K --> L[Suppliers can submit more accurate offers]
    L --> M[Audit trail event]
```

### Important Product Principle

Q&A is not primarily a private sales chat. It is an RFQ clarification mechanism. The goal is better and more comparable offers.

### Moderation Rules

Admin review may be justified if:

- the supplier asks for personal or confidential data;
- the question is irrelevant or spam-like;
- the buyer’s answer is commercially sensitive;
- the question raises legal or data protection concerns.

---

## 11. Offer Submission and Offer Handling Workflow

Offer submission should be structured, but not too heavy. The MVP goal is comparability, not a full CPQ system.

```mermaid
flowchart TD
    A[Supplier wants to submit an offer] --> B[Open offer form]
    B --> C[Fill mandatory fields]
    C --> D[Net price]
    D --> E[Price unit / pricing structure]
    E --> F[Start / delivery deadline]
    F --> G[Offer validity]
    G --> H[Notes / conditions]
    H --> I{Are all required fields complete?}
    I -- No --> J[Error message and missing fields]
    J --> C
    I -- Yes --> K[Submit offer]
    K --> L[Offer SUBMITTED]
    L --> M[Notify buyer]
    M --> N[Audit trail event]
```

### MVP Offer Data

- supplier identifier or invited supplier details;
- RFQ identifier;
- net price;
- currency;
- price unit;
- start date / delivery deadline;
- offer validity;
- additional notes;
- status: submitted / accepted / rejected.

### Later Expansion

- line-item offers;
- attachments;
- alternative offers;
- multi-round bidding;
- BAFO;
- contractual conditions;
- PDF offer export/import.

---

## 12. Offer Comparison and Decision Workflow

The main buyer-side value is that offers do not need to be compared in emails and Excel.

```mermaid
flowchart TD
    A[Offers have arrived] --> B[Buyer opens RFQ]
    B --> C[Offer list]
    C --> D{At least 2 offers?}
    D -- No --> E[Limited comparison / invite another supplier]
    D -- Yes --> F[Comparison view]
    F --> G[Price, deadline, warranty, extra service, terms]
    G --> H{Buyer requests Procura analysis?}
    H -- Yes --> I[System highlights differences and risks]
    H -- No --> J[Buyer evaluates manually]
    I --> K[Buyer weighs decision criteria]
    J --> K
    K --> L{Buyer selects a winner?}
    L -- Yes --> M[Accept offer]
    L -- No --> N[Close RFQ without decision / new round]
    M --> O[Offer ACCEPTED]
    O --> P[RFQ DECIDED]
    P --> Q[Notify winning supplier]
    Q --> R[Handle non-winning offers]
    R --> S[Audit trail and later rating]
    N --> T[RFQ CLOSED]
```

### Important Decision Principle

The system must not make the final business decision by saying “choose this one”. Procura analysis only supports the buyer:

- summarizes;
- shows differences;
- flags risks;
- highlights missing information;
- but the decision belongs to the buyer.

---

## 13. RFQ Lifecycle Status Diagram

RFQ statuses should be simple. Technical statuses may remain in English, but the Hungarian UI needs understandable business labels.

```mermaid
stateDiagram-v2
    [*] --> READY: RFQ draft is created
    READY --> SENT: Buyer sends / publishes
    READY --> CLOSED: Buyer deletes or closes
    SENT --> DECIDED: Buyer accepts an offer
    SENT --> CLOSED: Deadline expires / buyer closes
    DECIDED --> CLOSED: Later admin or system closure
    CLOSED --> [*]
```

### Business Meaning of Statuses

| Technical status | Hungarian UI meaning | Business meaning |
|---|---|---|
| READY | Piszkozat / előkészítve | The RFQ has been prepared but not sent yet. |
| SENT | Kiküldve / aktív | Suppliers can already see it or have received it. |
| DECIDED | Döntés született | There is an accepted offer. |
| CLOSED | Lezárva | The process has ended, with or without a decision. |

### Open Product Decision

Later, it may be useful to introduce separate `DRAFT`, `READY`, `PUBLISHED`, `EXPIRED`, `CANCELLED` statuses, but for the MVP the simple status model is better if the current system is built around it.

---

## 14. Invitation and Offer Status Workflows

### 14.1 Invitation Status Workflow

```mermaid
stateDiagram-v2
    [*] --> SENT: Invitation sent
    SENT --> VIEWED: Supplier opens it
    SENT --> DECLINED: Supplier declines
    VIEWED --> DECLINED: Supplier declines
    VIEWED --> OFFERED: Supplier submits offer
    SENT --> OFFERED: Supplier submits offer directly
    DECLINED --> [*]
    OFFERED --> [*]
```

### 14.2 Offer Status Workflow

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED: Offer submitted
    SUBMITTED --> ACCEPTED: Buyer accepts
    SUBMITTED --> REJECTED: Buyer rejects / another offer wins
    ACCEPTED --> [*]
    REJECTED --> [*]
```

### Business Rules

- Normally, there should be one accepted offer within one RFQ.
- Handling non-winning offers should be polite and clear.
- It should not be misleading for the supplier if no decision has been made yet.
- Later versions may add statuses such as “shortlisted”, “under review”, “withdrawn” or “expired”.

---

## 15. Supply Gap and Admin Intervention Workflow

At marketplace launch, supply gaps are natural. The system should treat them not as errors, but as admin-actionable signals.

```mermaid
flowchart TD
    A[RFQ category + region set] --> B[System supplier matching]
    B --> C{Enough relevant suppliers?}
    C -- Yes --> D[Shortlist is created]
    C -- No --> E[Supply-gap signal]
    E --> F[Admin dashboard]
    F --> G{What is the cause?}
    G -- Not enough suppliers --> H[Lead discovery / manual supplier search]
    G -- Wrong category --> I[Category correction]
    G -- Region too narrow --> J[Suggest region expansion]
    G -- New category --> K[Category expansion review]
    H --> L[Invite new supplier or create profile]
    I --> M[Fix RFQ / category]
    J --> N[Discuss with buyer or admin suggestion]
    K --> O[Create new category]
    L --> P[Refresh shortlist]
    M --> P
    N --> P
    O --> P
    P --> Q[RFQ can continue]
```

### Admin Goal

Admin does not only fix errors, but builds marketplace liquidity. Supply-gap signals can later turn into important growth and sales tasks.

### Metrics

- number of supply-gap signals by category;
- number of supply-gap signals by region;
- share of RFQs with too few suppliers;
- share of RFQs requiring admin intervention;
- number of new supplier leads;
- share of RFQs successfully completed after supply-gap handling.

---

## 16. Admin Moderation and Quality Assurance Workflow

Procura is a trust-based platform. The goal of admin moderation is not to slow the process down, but to reduce spam, bad data and abuse.

```mermaid
flowchart TD
    A[New user / company / RFQ / supplier profile / offer] --> B[System basic checks]
    B --> C{Suspicious or incomplete?}
    C -- No --> D[Normal process]
    C -- Yes --> E[Admin review queue]
    E --> F[Admin opens the item]
    F --> G{Problem type}
    G -- Spam / abuse --> H[Deactivate / reject]
    G -- Missing data --> I[Request modification]
    G -- Wrong category --> J[Fix category]
    G -- Duplicate profile --> K[Merge / claim handling]
    G -- Data protection risk --> L[Legal / privacy review]
    H --> M[Audit log]
    I --> M
    J --> M
    K --> M
    L --> M
```

### Key Admin Review Cases

- fake or spam supplier profile;
- unrealistic RFQ;
- offensive or unlawful content;
- incorrect company data;
- duplicate supplier profile;
- too many failed invitations;
- suspicious payment / credit activity;
- RFQ or offer containing sensitive data.

---

## 17. Payment, Credit and Plan Limit Workflow

In the MVP, monetization does not necessarily mean full live payment infrastructure, but the credit/subscription logic is an important validation tool.

```mermaid
flowchart TD
    A[Buyer or Supplier wants to use premium feature] --> B[System checks plan / credits]
    B --> C{Is feature available?}
    C -- Yes --> D[Feature runs]
    D --> E{Requires credits?}
    E -- Yes --> F[Credit deduction / ledger entry]
    E -- No --> G[No deduction]
    F --> H[Audit / billing event]
    G --> H
    C -- No --> I[Upgrade / credit purchase / limit message]
    I --> J{User pays or upgrades?}
    J -- Yes --> K[Stripe test/live checkout or manual billing]
    J -- No --> L[Feature does not run]
    K --> M[Plan / credits updated]
    M --> D
```

### Pre-Launch Minimum

- plan and credit rules should be clear;
- credit ledger should be searchable;
- user-facing limit messages should be understandable;
- before live payment, legal and invoicing decisions are needed;
- manual billing pilot is acceptable during validation.

---

## 18. Notification Workflow

Notifications are not optional convenience features; they are required for the marketplace to work. If the supplier does not see the invitation, or the buyer does not notice the offer, the loop breaks.

```mermaid
flowchart TD
    A[Business event occurs] --> B[System records event]
    B --> C{Actor to notify?}
    C -- None --> D[Audit log only]
    C -- Yes --> E[Select notification rule]
    E --> F{Channel}
    F -- Email --> G[Send email or write outbox]
    F -- In-app --> H[In-app notification]
    F -- Push / later --> I[Push notification]
    G --> J{Successful?}
    H --> K[Unread notification]
    I --> K
    J -- Yes --> L[Log delivery]
    J -- No --> M[Retry / outbox / error]
    K --> L
    M --> L
```

### Critical Notification Events

- RFQ invitation to supplier;
- supplier opened the invitation;
- supplier submitted a question;
- buyer answered;
- new offer arrived;
- buyer accepted the offer;
- RFQ deadline is approaching;
- credit or plan limit reached;
- admin intervention is needed.

---

## 19. Audit Trail Cross-Cutting Workflow

The audit trail cuts across every important business process. It is not an afterthought, but the basis of trust, searchability and later compliance.

```mermaid
flowchart TD
    A[Important business event] --> B[Build event payload]
    B --> C[Identify actor]
    C --> D[Identify entity: RFQ / Offer / Invitation / Company]
    D --> E[Timestamp]
    E --> F[Save audit log]
    F --> G{Visible to whom?}
    G -- Buyer --> H[Buyer audit view]
    G -- Admin --> I[Admin audit view]
    G -- Supplier limited --> J[Supplier own events]
    G -- System only --> K[Internal log]
```

### Events to Log

- RFQ creation;
- RFQ modification;
- category/region modification;
- RFQ sending;
- supplier invitation;
- invitation opened;
- supplier question;
- buyer answer;
- offer submission;
- offer acceptance;
- RFQ closure;
- supplier rating;
- admin intervention;
- credit / subscription event.

### Important Data Protection Principle

The audit log should not contain unnecessarily sensitive data. The business event should be searchable, but the log should not duplicate every field without reason.

---

## 20. Concierge Pilot / Manual Validation Workflow

In addition to MVP software features, it may be useful to run the first RFQs in concierge mode. This helps validate the market even if some automations are not yet perfect.

```mermaid
flowchart TD
    A[Buyer signals procurement need] --> B[Procura operator / admin helps clarify]
    B --> C[Manual or semi-automated RFQ preparation]
    C --> D[Buyer approves]
    D --> E[Admin builds supplier list]
    E --> F[Supplier invitations]
    F --> G[Collect supplier responses]
    G --> H[Admin structures offers]
    H --> I[Buyer receives comparison view]
    I --> J[Buyer makes decision]
    J --> K[Collect feedback]
    K --> L[Product and category learnings]
```

### When Is It Useful?

- when validating new categories;
- when there are too few suppliers in the system;
- when testing first willingness to pay;
- when discovering UX or automation gaps;
- with a higher-value pilot customer.

### Risk

The concierge pilot should not become a fully manual agency service. The goal is to generate learning for software-based automation.

---

## 21. Main Buyer-Side Screen Flow

This is not a final UX wireframe, but a logical screen path.

```mermaid
flowchart TD
    A[Landing / Dashboard] --> B[New RFQ]
    B --> C[Intake page]
    C --> D[Clarification questions]
    D --> E[RFQ draft editor]
    E --> F[Category and region review]
    F --> G[Supplier shortlist]
    G --> H[Invitation and publishing]
    H --> I[RFQ details / status]
    I --> J[Q&A]
    I --> K[Offers]
    K --> L[Comparison]
    L --> M[Decision]
    M --> N[Closure / rating]
    N --> O[Previous RFQs / history]
```

### Buyer UX Priorities

- clear first CTA;
- few, targeted questions;
- editable RFQ;
- explainable shortlist;
- clearly visible status;
- offers in one place;
- understandable comparison;
- searchable history.

---

## 22. Main Supplier-Side Screen Flow

```mermaid
flowchart TD
    A[Supplier invitation or supplier dashboard] --> B{Entry path}
    B -- Token link --> C[RFQ invitation page]
    B -- Registered supplier --> D[Supplier dashboard]
    D --> E[Open opportunities]
    D --> F[Invited RFQs]
    C --> G[RFQ details]
    E --> G
    F --> G
    G --> H[Q&A]
    G --> I[Offer submission]
    I --> J[Offer status]
    J --> K{Registered supplier?}
    K -- No --> L[Profile claim / registration suggestion]
    K -- Yes --> M[Supplier statistics]
```

### Supplier UX Priorities

- quick understanding of what the RFQ is about;
- clearly visible deadline;
- few required fields for the first offer;
- simple question submission;
- simple offer submission;
- motivation for later registration;
- statistics and reputation as later incentives.

---

## 23. Main Admin-Side Screen Flow

```mermaid
flowchart TD
    A[Admin dashboard] --> B[RFQ list]
    A --> C[User / company list]
    A --> D[Supplier profiles]
    A --> E[Categories and regions]
    A --> F[Supply-gap dashboard]
    A --> G[Audit log]
    A --> H[Credit / subscription data]
    B --> I[Handle problematic RFQ]
    C --> J[User deactivation / support]
    D --> K[Supplier verification / duplication]
    E --> L[Category expansion]
    F --> M[Supplier lead discovery task]
    G --> N[Event lookup]
    H --> O[Payment support]
```

### Admin UX Priorities

- visibility into where the marketplace gets stuck;
- quickly filterable RFQs;
- supply-gap focus;
- user/company search;
- moderation actions;
- audit trail;
- basic funnel metrics.

---

## 24. Mandatory Workflows for MVP Launch

Based on the previous documents and the current repository state, the following workflows must work end-to-end for MVP launch.

### P0 — Core Launch Workflows

1. Buyer registers / logs in.
2. Buyer uses a company profile.
3. Buyer starts an RFQ from a short text.
4. System suggests category and region or provides fallback.
5. System / category provides clarification questions.
6. Buyer receives and edits a structured RFQ.
7. System creates a supplier shortlist.
8. Buyer can also add own supplier email.
9. Buyer sends the RFQ.
10. Supplier opens it through a token link.
11. Supplier can ask a question.
12. Buyer can answer.
13. Supplier submits an offer.
14. Buyer sees and compares offers.
15. Buyer accepts an offer or closes the RFQ.
16. System writes audit trail.
17. Admin sees the critical workflows.

### P1 — Strong Validation Workflows

1. Open opportunities.
2. Supplier self-apply.
3. Supplier profile claim.
4. Supplier rating.
5. Procura analysis / comparison support.
6. Credit / package limit workflow.
7. Supply-gap dashboard.
8. Notification center / better notification handling.
9. GDPR export/delete.
10. Public API / integration foundation.

### P2 — Later Workflows

1. Multi-user buyer organization.
2. Approval workflow.
3. Multi-round tender / BAFO.
4. Contract generation.
5. Full payment settlement / escrow.
6. Invoicing integration.
7. Deeper supplier verification workflow.
8. Detailed supplier analytics.
9. Mobile-first workflow.
10. International multilingual rollout.

---

## 25. Out-of-Scope Workflows for the First Launch Version

The first launch version intentionally does not aim to include:

- full ERP workflow;
- public procurement legal workflow;
- automatic contract signing;
- full payment settlement;
- escrow;
- complex approval matrix;
- multiple countries and multiple languages;
- full supplier compliance audit;
- full invoicing and accounting workflow;
- enterprise SSO / enterprise IAM;
- native mobile-app-centered first go-to-market if the web-based B2B workflow has not yet been validated.

If a partial feature already exists in the repository for any of these, it does not need to be removed, but these workflows do not define the success of the first paid validation.

---

## 26. Summary

Based on Procura’s flowcharts, the product’s central logic is built around one repeatable business loop:

> buyer need → structured RFQ → supplier involvement → offers → comparison → decision → audit trail.

The most important planning conclusions:

1. **The buyer’s first experience should be fast and simple.**  
   A short need should become a sendable RFQ within a few minutes.

2. **The supplier entry barrier should be low.**  
   Token-based response and later profile claim are critical cold-start tools.

3. **Q&A should be a tool for better offer quality.**  
   It should be treated not as a chat system, but as a shared clarification mechanism.

4. **Offer comparison should be the main buyer-side value.**  
   This differentiates Procura from simple lead generation or directory models.

5. **Admin workflows are not secondary.**  
   The early marketplace is not self-running, so supply-gap handling, moderation and category management are needed.

6. **The audit trail cuts across every workflow.**  
   It provides searchability, trust and the foundation for later compliance.

7. **The first launch does not need to cover every workflow.**  
   The goal is for the core RFQ loop to work with real SME buyers and suppliers, provide measurable value and show willingness to pay.

If these workflows operate reliably, Procura will not merely be an RFQ form, but a lightweight, intelligent procurement workspace for Hungarian SMEs.
