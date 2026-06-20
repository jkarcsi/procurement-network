# Procura — User Roles and Use Case Document

**Document status:** first developed English version  
**Language:** English  
**Related materials:** Procura one-pager; Target Group and Problem Validation Document; GitHub repository documentation and implementation plan  
**Project:** Procura — AI-assisted B2B RFQ and supplier network  
**First market:** Hungary  
**Initial focus:** General, non-strategic procurement needs of Hungarian SMEs with 10–100 employees  
**Recommended use:** MVP scope, backlog, user story mapping, functional specification, development tickets, UX planning

---

## 1. Purpose of This Document

This document defines the main user roles of the first version of Procura, their goals, permission logic and most important use cases.

The purpose of the document is to ensure that Procura is not designed as a generic feature set, but as a system built around **user roles and concrete business situations**.

The starting point of the document is:

> Procura’s first goal is to turn the manual and fragmented RFQ process of Hungarian SMEs into a structured, comparable and traceable decision-making workflow.

Therefore, the central logic of the roles and use cases is:

**buyer need → clarification → structured RFQ → supplier shortlist → sending / open tender → questions and answers → offer submission → comparison → decision → audit trail → feedback.**

---

## 2. Product Planning Principles

### 2.1 Procura Is Not an ERP in the First Version

The first version of Procura is not a full enterprise resource planning system, not a public procurement platform and not a procurement suite covering every industry.

The main goal of the first version is:

- fast RFQ creation;
- RFQ clarification;
- involving suppliers;
- structured offer collection;
- comparable offer presentation;
- logging decisions and events.

### 2.2 The System Gives the Buyer a Better Basis for Decision-Making

Procura should not make decisions instead of the buyer. The system helps the buyer:

- formulate the need more precisely;
- find relevant suppliers;
- request offers in a more standardized way;
- compare offers;
- make a documented decision.

The final business decision always belongs to the buyer.

### 2.3 The Supplier Side Needs a Low Entry Barrier

In the first version, it is critical that suppliers can respond easily.

Therefore, the product should support:

- simple token-based response for invited suppliers;
- no-registration or light-registration first offer submission for invited RFQs;
- later profile registration and profile claiming;
- applying to open opportunities as a registered supplier.

### 2.4 Hungarian User Communication Is Needed for the Hungarian Market

The user interface, emails, statuses, error messages and business wording should be in Hungarian. Internal code, technical identifiers and developer documentation may remain in English.

### 2.5 AI Features Should Be Presented as Business Outcomes

The user should not buy “AI”. The user should buy:

- faster RFQ creation;
- better clarification;
- smarter shortlists;
- more comparable offers;
- a better decision-making basis.

Therefore, in user-facing wording, expressions such as “intelligent clarification”, “Procura analysis” or “smart shortlist” are preferable to AI-centered marketing.

---

## 3. Role Overview

In the first version of Procura, there are three main role groups:

1. **Buyer side** — companies and users requesting offers.
2. **Supplier side** — companies and users submitting offers.
3. **Platform/admin side** — users supervising Procura’s operations, quality, categories and safety.

Within these groups, several concrete roles can be distinguished.

---

## 4. Main User Roles

## 4.1 Buyer

### Description

A Buyer is a company or business user who wants to request offers for an external service, equipment purchase, maintenance task, office procurement need or subcontracting task.

In the first target group, this is typically a Hungarian SME with 10–100 employees.

### Typical Persons

- managing director;
- owner;
- operations manager;
- office manager;
- finance/administrative employee;
- site manager;
- employee responsible for procurement tasks.

### Main Goals

- create a good RFQ quickly;
- reach more relevant suppliers;
- use fewer emails and less manual comparison;
- receive comparable offers;
- make a better decision;
- build a searchable procurement history.

### Most Important MVP Permissions

- registration and login;
- creating a company profile;
- creating an RFQ;
- answering clarification questions;
- editing the RFQ before sending;
- viewing the supplier shortlist;
- inviting additional suppliers;
- sending the RFQ;
- answering supplier clarification questions;
- viewing offers;
- comparing offers;
- accepting an offer;
- recording the decision;
- viewing the audit trail;
- rating the supplier after the process is closed.

---

## 4.2 Buyer Admin

### Description

The Buyer Admin is a higher-permission user of the buyer company. In the MVP, this may be the same person as the regular Buyer, but in later Team / Enterprise packages it can become a separate role.

### Typical Persons

- managing director;
- owner;
- finance manager;
- operations manager;
- administrator of a multi-site company.

### Main Goals

- control who can use the system within the company;
- see the company’s procurement processes;
- review decisions;
- manage subscription, package and payment;
- later configure approval rules.

### Minimum Handling in the MVP

In the first version, it is not necessarily required to implement the Buyer Admin role in full depth, but it is worth preparing for it in the data model and permission design.

For the MVP, the following may be sufficient:

- the first user belonging to a company = implicit admin;
- subscription and credits handled at company level;
- Company–User relationship prepared for later multi-user operation.

---

## 4.3 Supplier

### Description

A Supplier is a company, subcontractor or service provider that can submit offers for buyer RFQs.

The supplier can be:

- an invited supplier;
- a registered supplier;
- a supplier applying to an open opportunity;
- later, a premium or verified supplier.

### Typical Persons

- owner of a service-provider company;
- salesperson;
- managing director;
- administrative employee;
- quotation preparer;
- professional lead.

### Main Goals

- receive relevant business RFQs;
- submit offers quickly;
- receive fewer irrelevant inquiries;
- become more visible on the buyer side;
- acquire new customers;
- later build reputation and recurring business.

### Most Important MVP Permissions

- registration and login;
- creating a supplier profile;
- setting categories;
- setting served regions;
- providing certificates / qualifications;
- viewing invited RFQs;
- browsing open RFQs;
- applying to open RFQs;
- submitting clarification questions;
- submitting offers;
- viewing response statistics;
- receiving notification when an offer is accepted.

---

## 4.4 Invited Supplier

### Description

An Invited Supplier is a supplier who has been invited to a specific RFQ but has not necessarily registered in the system yet.

This is a key role at launch because it reduces the marketplace cold-start problem: the buyer or the system can involve external suppliers without requiring them to create a full profile in advance.

### Main Goals

- quickly understand the invited RFQ;
- respond without registration friction;
- submit an offer easily;
- later, if value is visible, register and claim a profile.

### MVP Requirements

- unique and secure response link;
- viewing RFQ details;
- submitting an offer through a simple form;
- optional registration / profile claim after submitting the offer;
- tracking offer status at least through email notifications.

### Limitations

An invited, non-registered supplier should not see other buyer data, other RFQs or platform-level opportunities. Their access should be limited to the specific invitation.

However, they may be shown platform-level indicators, such as active open RFQs in their category and the number of closed RFQs already sent, active or decided in relevant categories. This can help motivate later registration without exposing confidential details.

---

## 4.5 Supplier Profile Owner

### Description

The Supplier Profile Owner is the user who manages a supplier company profile.

This role is important when a supplier relationship is created through cold outreach, lead discovery or buyer invitation. The supplier may later claim their profile.

### Main Goals

- correct company data;
- manage categories and regions;
- configure RFQ notifications;
- track response activity;
- manage premium or verified status in later phases.

### MVP / Near-Future Requirements

- profile claim;
- email verification;
- editing company data;
- category and region settings within package limits;
- managing notification email addresses;
- response statistics.

---

## 4.6 Platform Admin / Procura Admin

### Description

The Platform Admin is Procura’s internal operations and moderation role.

The admin role is especially important at launch because the marketplace is not yet self-sustaining. The admin must actively handle supply gaps, incorrect categories, problematic RFQs, users and abuse cases.

### Typical Persons

- founder / operator;
- customer support employee;
- marketplace manager;
- category manager;
- moderator;
- support agent.

### Main Goals

- maintain platform operability;
- manage categories and regions;
- identify supplier-side supply gaps;
- handle problematic RFQs;
- manage user and company data;
- handle abuse and spam;
- monitor basic reports and funnel metrics.

### Most Important MVP Permissions

- viewing the user list;
- managing companies and supplier profiles;
- viewing and moderating RFQs;
- maintaining categories and regions;
- viewing supply-gap signals;
- viewing credit ledger / subscription data;
- deactivating problematic users;
- viewing the audit trail.

---

## 4.7 System / Procura Intelligent Assistant

### Description

The System is not a human user, but from a product planning perspective it is useful to treat it as a separate “actor”. This includes both rule-based and AI-based processes.

### Main Responsibilities

- detecting category and region from intake text;
- suggesting clarification questions;
- producing a structured RFQ;
- creating a supplier shortlist;
- supporting offer comparison;
- sending notifications;
- updating statuses;
- recording audit log events;
- ensuring fallback behavior even without an AI key.

### Important Limitation

The system must not make the final business decision. It may suggest, structure, compare and warn, but it must not decide.

---

## 5. MVP-Level Permission Matrix

| Function / operation | Buyer | Buyer Admin | Supplier | Invited Supplier | Platform Admin | System |
|---|---:|---:|---:|---:|---:|---:|
| Registration / login | yes | yes | yes | optional | yes | no |
| Create company profile | yes | yes | yes | no / later | yes | no |
| Manage supplier profile | no | no | yes | after profile claim | yes | no |
| Create RFQ | yes | yes | no | no | yes / from support | partially |
| Analyze intake | no | no | no | no | no | yes |
| Generate clarification questions | no | no | no | no | no | yes |
| Answer clarification questions | yes | yes | no | no | from support | no |
| Send RFQ | yes | yes | no | no | from support | technically |
| View supplier shortlist | yes | yes | no | no | yes | creates it |
| Receive invitation | no | no | yes | yes | no | notifies |
| Browse open RFQs | no | no | yes | no | yes | no |
| Apply to RFQ | no | no | yes | no | no | no |
| Ask clarification question | no | no | yes | limited | may moderate | no |
| Answer clarification question | yes | yes | no | no | from support | no |
| Submit offer | no | no | yes | yes | from support | no |
| View offers | yes | yes | own offer | own offer | yes | analyzes |
| Offer comparison | yes | yes | no | no | yes | supports |
| Accept offer | yes | yes | no | no | from support | no |
| Rate supplier | yes | yes | no | no | may moderate | no |
| View audit trail | yes | yes | limited | no | yes | writes it |
| Manage users | no | later within company | later within company | no | yes | no |
| Manage categories / regions | no | no | no | no | yes | may suggest |
| Identify supply gaps | no | no | no | no | yes | supports |
| Manage payment / package | yes / limited | yes | yes / later | no | yes | technically |

---

## 6. Main Buyer-Side Use Cases

## UC-B1 — Buyer Registers and Creates a Company Profile

### Goal

The buyer can quickly start using the system, and Procura knows which company the buyer is requesting offers on behalf of.

### Primary Actor

Buyer

### Preconditions

- The buyer has not registered yet, or does not have an active company profile.

### Main Flow

1. The buyer opens the registration page.
2. The buyer enters their name, email address and password.
3. The buyer enters the company name, address, business activity and additional company data, including supplier-registration-related data where relevant.
4. The system creates the Buyer-type company and user.
5. The buyer enters the dashboard.
6. The system suggests creating the first RFQ.

### Alternatives

- The buyer arrives through an invitation.
- The buyer wants to join an existing company in a later Team feature.

### Acceptance Criteria

- The buyer can create an active account.
- The buyer is connected to a Buyer-type Company.
- The buyer can see the option to start an RFQ.

---

## UC-B2 — Buyer Starts an RFQ from a Short Text

### Goal

The buyer can start the procurement process with minimal administration.

### Primary Actor

Buyer

### Preconditions

- The buyer is logged in.
- The buyer’s company has an active account.

### Main Flow

1. The buyer selects “New RFQ”.
2. The buyer briefly describes what they need.
3. The system analyzes the need.
4. The system suggests a category and region.
5. The system generates clarification questions.
6. The buyer answers the questions.
7. The system creates a structured RFQ specification.
8. The buyer reviews and modifies it if needed.

### Alternatives

- The system cannot find a suitable category and creates a category expansion request.
- The buyer manually selects a category.
- Without AI functionality, rule-based fallback questions are displayed.

### Acceptance Criteria

- The buyer reaches a structured RFQ draft within a few minutes.
- The system stores the intake text, questions, answers and specification.
- The RFQ remains unpublished before sending.

---

## UC-B3 — Buyer Modifies Category, Region and RFQ Details

### Goal

The buyer can control which category and region the RFQ runs in.

### Primary Actor

Buyer

### Main Flow

1. The system suggests a category and region.
2. The buyer views the suggestion.
3. The buyer accepts or modifies the category.
4. The buyer accepts or modifies the region.
5. The system updates the relevant supplier shortlist.
6. The buyer reviews the finalized RFQ.

### Alternatives

- The buyer searches for a category that does not yet exist in the system.
- The system marks the category expansion request for admin review.

### Acceptance Criteria

- The buyer can always override the system’s category and region suggestion.
- The shortlist is recalculated after modification.

---

## UC-B4 — Buyer Views and Expands the Supplier Shortlist

### Goal

The buyer can invite relevant suppliers and add their own known suppliers.

### Primary Actor

Buyer

### Main Flow

1. The system creates a shortlist based on category, region and supplier data.
2. The buyer sees the suggested suppliers.
3. The buyer views the explanation for the shortlist.
4. The buyer selects who should receive the RFQ.
5. The buyer can add additional email addresses.
6. The system prepares the invitations.

### Alternatives

- There are too few relevant suppliers: the system creates a supply-gap signal.
- The buyer only wants to invite their own suppliers.
- The buyer also publishes the RFQ as an open opportunity.

### Acceptance Criteria

- The shortlist is understandable and explainable.
- The buyer can add their own suppliers.
- The system can handle invitations for both registered and non-registered suppliers.

---

## UC-B5 — Buyer Sends the RFQ

### Goal

The buyer sends the finalized RFQ to the selected suppliers.

### Primary Actor

Buyer

### Preconditions

- The RFQ specification is complete.
- There is at least one invited supplier or the RFQ can be published as an open opportunity.

### Main Flow

1. The buyer reviews the final RFQ.
2. The buyer reviews the invited supplier list.
3. The buyer enters or confirms the deadline.
4. The buyer sends the RFQ.
5. The system sends invitation emails.
6. The system creates token-based response links.
7. The RFQ status changes to sent.
8. The event is recorded in the audit trail.

### Alternatives

- Email provider is not configured: outbox fallback.
- Sending / analysis is limited due to credit or package limits.
- The system warns the buyer if the RFQ is incomplete.

### Acceptance Criteria

- Suppliers receive the RFQ, or the email appears in the outbox fallback.
- Every invitation is uniquely identifiable.
- The process is audited.

---

## UC-B6 — Buyer Answers Supplier Clarification Questions

### Goal

The buyer can handle suppliers’ pre-offer questions so that information remains consistent for all participants.

### Primary Actor

Buyer

### Secondary Actor

Supplier

### Main Flow

1. A supplier asks a question about the RFQ.
2. The system notifies the buyer.
3. The buyer opens the Q&A interface.
4. The buyer answers.
5. The answer becomes visible to the relevant suppliers.
6. The system logs the event.

### Important Product Principle

Material clarification questions related to the RFQ should preferably be public among participants in the given tender, so that all suppliers submit offers based on the same information.

### Acceptance Criteria

- The supplier question is recorded.
- The buyer’s answer is visible to invited / participating suppliers.
- Q&A events are searchable later.

---

## UC-B7 — Buyer Views Incoming Offers

### Goal

The buyer can see all incoming offers in one place.

### Primary Actor

Buyer

### Main Flow

1. A supplier submits an offer.
2. The system notifies the buyer.
3. The buyer opens the RFQ details.
4. The buyer sees the offers in a list.
5. The buyer views prices, pricing units, start date, validity and notes.
6. The buyer can enter comparison view.

### Alternatives

- No offer has arrived yet: empty state, reminder / invite another supplier.
- An offer would arrive after the deadline: blocked or flagged according to business rules.

### Acceptance Criteria

- The buyer sees all incoming offers under one RFQ.
- Offers are displayed in a structured and comparable way.
- The system indicates who responded and who did not.

---

## UC-B8 — Buyer Compares Offers

### Goal

The buyer can quickly understand which offer is strong or weak according to different aspects.

### Primary Actor

Buyer

### Secondary Actor

System

### Main Flow

1. The buyer opens comparison view.
2. The system displays offers in a table.
3. The buyer sees prices, deadlines, additional services, warranties and notes.
4. The buyer can request Procura analysis.
5. The system highlights the main differences and risks.
6. The buyer chooses based on their own decision criteria.

### Alternatives

- Too few offers arrived: the system indicates that the comparison is limited.
- Credit-based analysis and insufficient credits: credit purchase option.
- Weighted comparison matrix in a later version.

### Acceptance Criteria

- The buyer is not forced to compare offers in Excel.
- Offers are visible in the same structure.
- The analysis supports the buyer but does not decide instead of them.

---

## UC-B9 — Buyer Accepts an Offer and Closes the Process

### Goal

The buyer records the decision, and the winning supplier receives a notification.

### Primary Actor

Buyer

### Main Flow

1. The buyer selects the winning offer.
2. The system asks for confirmation.
3. The buyer accepts the offer.
4. The offer status becomes accepted.
5. The RFQ moves to decided / closed status.
6. The winning supplier is notified.
7. Non-winning offers can be marked as rejected.
8. The decision is recorded in the audit trail.

### Alternatives

- The buyer does not choose a winner and closes the process without result.
- The buyer wants to request more offers.
- A later version may support BAFO / second round.

### Acceptance Criteria

- The decision is clearly recorded within the RFQ.
- The supplier receives notification.
- The decision is searchable later.

---

## UC-B10 — Buyer Rates the Winning Supplier

### Goal

The system collects feedback about supplier performance, which can later improve matching and trust.

### Primary Actor

Buyer

### Preconditions

- The RFQ is closed.
- There is a winning supplier.

### Main Flow

1. The system requests a rating from the buyer.
2. The buyer gives a star rating.
3. The buyer optionally writes text feedback.
4. The system saves the rating.
5. The rating may later appear in the supplier’s reputation.
6. The rating may affect the matching score.

### Acceptance Criteria

- At most one rating belongs to one RFQ.
- The rating is connected to the correct supplier profile.
- The rating does not violate data protection or moderation rules.

---

## UC-B11 — Buyer Searches Previous RFQs

### Goal

The buyer can later find what RFQs they issued, who responded and what decision was made.

### Primary Actor

Buyer

### Main Flow

1. The buyer enters the dashboard.
2. The buyer sees their RFQs listed by status.
3. The buyer can search and filter by category, status and date.
4. The buyer opens a previous RFQ.
5. The buyer sees offers, decision and audit trail.

### Acceptance Criteria

- The buyer can search previous procurement processes.
- Process statuses are understandable.
- The audit trail contains business events.

---

## 7. Main Supplier-Side Use Cases

## UC-S1 — Supplier Registers and Creates a Profile

### Goal

The supplier can define which categories and regions they serve.

### Primary Actor

Supplier

### Main Flow

1. The supplier registers.
2. The supplier enters the company name and contact details.
3. The supplier selects service categories.
4. The supplier selects served regions.
5. The supplier may provide certificates, website and description.
6. The system creates the supplier profile.
7. The supplier can appear in the matching process.

### Acceptance Criteria

- The supplier profile is connected to categories and regions.
- The system can match RFQs based on the profile.
- The supplier can modify the profile later.

---

## UC-S2 — Invited Supplier Responds Through a Token Link

### Goal

The supplier can submit an offer for a specific invitation without registration or with minimal friction.

### Primary Actor

Invited Supplier

### Preconditions

- The supplier has received an invitation to an RFQ.
- The invitation contains a unique response link.

### Main Flow

1. The supplier opens the link received by email.
2. The system displays the RFQ details.
3. The supplier reads the specification.
4. The supplier submits an offer through a structured form.
5. The supplier enters price, pricing unit, start date, validity and notes.
6. The system saves the offer.
7. The buyer is notified.
8. The supplier can optionally register / claim their profile.

### Alternatives

- The supplier declines the invitation.
- The supplier wants to ask a question before submitting an offer.
- The token has expired or is invalid.

### Acceptance Criteria

- The supplier can submit an offer based on an invitation without registration if the business rule allows it.
- The token only grants access to the specific RFQ.
- The submitted offer appears for the buyer.

---

## UC-S3 — Registered Supplier Browses Open Opportunities

### Goal

The supplier can find relevant open RFQs, not only receive invitations.

### Primary Actor

Supplier

### Preconditions

- The supplier is registered.
- The supplier has completed a profile with categories and regions.

### Main Flow

1. The supplier enters the supplier portal.
2. The supplier opens the open opportunities page.
3. The system displays RFQs matching the supplier profile.
4. The supplier opens an RFQ.
5. The supplier decides whether to apply.
6. After applying, participation / invitation is created.
7. The supplier can submit an offer.

### Acceptance Criteria

- The supplier sees only relevant or filterable open opportunities.
- Application is recorded as a trackable event.
- The buyer sees that the supplier came from self-apply.

---

## UC-S4 — Supplier Asks a Clarification Question

### Goal

The supplier can clarify missing information before submitting an offer.

### Primary Actor

Supplier

### Secondary Actor

Buyer

### Main Flow

1. The supplier opens the RFQ.
2. The supplier finds missing or ambiguous information.
3. The supplier submits a question.
4. The system notifies the buyer.
5. The buyer answers.
6. The answer becomes visible to participating suppliers.

### Acceptance Criteria

- The supplier’s question is recorded.
- The Q&A thread is visible to all relevant participants.
- The Q&A helps produce more comparable offers.

---

## UC-S5 — Supplier Submits an Offer

### Goal

The supplier can submit a structured offer that is comparable for the buyer.

### Primary Actor

Supplier or Invited Supplier

### Main Flow

1. The supplier opens the RFQ.
2. The supplier enters company name and contact data if needed.
3. The supplier enters the net price.
4. The supplier enters the pricing unit.
5. The supplier enters the start date or delivery deadline.
6. The supplier enters offer validity.
7. The supplier may add notes or additional conditions.
8. The supplier submits the offer.
9. The system confirms submission.
10. The buyer is notified.

### Alternatives

- The system shows an error for missing mandatory fields.
- The supplier may save it as a template in a later version.
- The supplier may withdraw or modify the offer before the deadline if business rules allow it.

### Acceptance Criteria

- The offer is saved as structured data.
- The offer is connected to the correct RFQ and invitation.
- The buyer is notified.

---

## UC-S6 — Supplier Receives Notification of Accepted Offer

### Goal

The supplier learns when the buyer has selected their offer.

### Primary Actor

Supplier

### Main Flow

1. The buyer accepts the offer.
2. The system updates the offer status.
3. The system sends notification to the supplier.
4. The supplier opens the accepted offer details.
5. The supplier contacts the buyer or follows the defined next step.

### Acceptance Criteria

- The winning supplier receives notification.
- The accepted status is searchable.
- Communication with non-winning suppliers is a later UX decision, but rejection must not be misleading.

---

## UC-S7 — Supplier Tracks Own Performance

### Goal

The supplier can see how active and successful they are on the platform.

### Primary Actor

Supplier

### MVP / Near-Future Features

- number of invitations;
- number of responses;
- response rate;
- average response time;
- number of won offers;
- ratings;
- activity by category.

### Acceptance Criteria

- The supplier sees basic statistics.
- Statistics encourage faster and better responses.
- Later premium features can build on this.

---

## 8. Platform Admin Use Cases

## UC-A1 — Admin Manages Users and Companies

### Goal

The admin can manage platform users, companies and problematic accounts.

### Primary Actor

Platform Admin

### Main Flow

1. Admin logs into the admin panel.
2. Admin opens the user / company list.
3. Admin searches, filters and views details.
4. Admin deactivates a user if needed.
5. Admin checks company type, package and activity.
6. The modification is logged.

### Acceptance Criteria

- Admin access requires proper permission.
- A deactivated user cannot log in.
- Critical changes are auditable.

---

## UC-A2 — Admin Monitors and Moderates RFQs

### Goal

The admin can see if an RFQ is incorrect, spam-like, assigned to the wrong category or indicates a supply gap.

### Primary Actor

Platform Admin

### Main Flow

1. Admin opens the RFQ list.
2. Admin filters by status, category and region.
3. Admin opens a problematic RFQ.
4. Admin checks category, region and specification.
5. If needed, admin corrects it in a support capacity or notifies the buyer.
6. In case of a supply gap, admin starts a supplier-expansion task.

### Acceptance Criteria

- Admin sees RFQ status and important business data.
- Admin can identify miscategorized or underserved needs.
- Data-handling principles related to buyer business data are not violated.

---

## UC-A3 — Admin Manages Categories and Regions

### Goal

The platform taxonomy can evolve based on real buyer needs.

### Primary Actor

Platform Admin

### Main Flow

1. Admin opens the category / region manager.
2. Admin views existing categories.
3. Admin sees category expansion requests.
4. Admin creates a new category or modifies an existing one.
5. Admin assigns clarification questions to the category.
6. After the change, new RFQs can use the category.

### Acceptance Criteria

- Categories can be maintained.
- Categories have related clarification questions.
- Category expansion is not ad hoc, but controlled by admin.

---

## UC-A4 — Admin Handles Supply-Gap Signals

### Goal

The admin identifies which categories or regions do not have enough suppliers.

### Primary Actor

Platform Admin

### Main Flow

1. The system indicates that there are too few suitable suppliers for an RFQ.
2. Admin opens the supply-gap view.
3. Admin sees problematic category-region pairs.
4. Admin decides whether lead discovery, manual supplier search or category correction is needed.
5. Admin creates a task or expands the database.

### Acceptance Criteria

- Admin sees where supplier supply is missing.
- The supply gap can be connected to a specific RFQ, category and region.
- The signal supports marketplace liquidity building.

---

## UC-A5 — Admin Handles Abuse, Spam or Incorrect Data

### Goal

Protecting platform quality and trust.

### Primary Actor

Platform Admin

### Typical Cases

- fake supplier profile;
- spam offer;
- unrealistic or abusive RFQ;
- offensive content;
- incorrect company data;
- duplicate profile;
- wrong category or region;
- complaint from buyer or supplier.

### Acceptance Criteria

- Admin can handle problematic accounts or content.
- Critical interventions are logged.
- User trust is preserved.

---

## 9. System Use Cases

## UC-SYS1 — System Suggests Category and Region

### Goal

The system preliminarily identifies the type of procurement from the buyer’s short text.

### Primary Actor

System

### Main Flow

1. The buyer provides the intake text.
2. Based on keywords, category data and AI / fallback logic, the system suggests a category.
3. The system suggests a region if it can be recognized.
4. The buyer can accept or modify the suggestion.

### Acceptance Criteria

- The system suggestion can be overridden.
- There is a working fallback without AI.
- If categorization fails, a category expansion request may be created.

---

## UC-SYS2 — System Creates a Supplier Shortlist

### Goal

The system recommends relevant suppliers for the RFQ.

### Primary Actor

System

### Criteria

- category match;
- region match;
- nationwide service;
- response rate;
- qualifications / certificates;
- rating;
- later, price competitiveness and historical performance.

### Acceptance Criteria

- The shortlist is explainable.
- The buyer understands why these suppliers were ranked higher.
- The system should not be a black box for the most important matching decisions.

---

## UC-SYS3 — System Writes Audit Log

### Goal

All important business events should be searchable later.

### Primary Actor

System

### Events to Log

- RFQ creation;
- RFQ modification;
- RFQ sending;
- supplier invitation;
- invitation viewed;
- question submitted;
- answer submitted;
- offer submitted;
- offer accepted;
- RFQ closed;
- supplier rated;
- admin intervention;
- credit transactions.

### Acceptance Criteria

- Important business mutations are auditable.
- The audit trail is usable in both buyer and admin views.
- The audit log does not contain unnecessarily sensitive data.

---

## UC-SYS4 — System Sends Notifications

### Goal

Roles should be notified of important events in time.

### Recipients and Events

| Event | Recipient | Channel |
|---|---|---|
| RFQ invitation | Supplier / Invited Supplier | email |
| New offer received | Buyer | email / in-app / push |
| Offer accepted | Supplier | email / in-app / push |
| New open opportunity | Supplier | later digest / push |
| Clarification question received | Buyer | email / in-app |
| Clarification answer received | Supplier | email / in-app |
| Deadline approaching | Buyer / Supplier | later version |

### Acceptance Criteria

- The notification is connected to a business event.
- Important events are not lost.
- Notification preferences should be added later.

---

## 10. Main End-to-End Workflows

## 10.1 Invitation-Based RFQ Workflow

### Roles

- Buyer
- System
- Invited Supplier
- Supplier
- Platform Admin optionally

### Workflow

1. Buyer creates an RFQ from a short text.
2. System asks clarification questions.
3. Buyer answers.
4. System creates a structured specification.
5. System suggests a shortlist.
6. Buyer selects invited suppliers.
7. Buyer may add additional email-based suppliers.
8. Buyer sends the RFQ.
9. Supplier receives the invitation.
10. Supplier opens the RFQ through a token link.
11. Supplier may ask a question.
12. Buyer answers.
13. Supplier submits an offer.
14. Buyer views and compares offers.
15. Buyer makes a decision.
16. System notifies the winning supplier.
17. Buyer may rate supplier performance.
18. Audit trail closes the process.

---

## 10.2 Open Opportunity / Open Tender Workflow

### Roles

- Buyer
- Registered Supplier
- System
- Platform Admin optionally

### Workflow

1. Buyer creates an RFQ.
2. Buyer decides that the RFQ can also appear as an open opportunity.
3. System publishes the RFQ among open opportunities.
4. Supplier browses opportunities matching their profile.
5. Supplier applies.
6. System creates participation / invitation.
7. Supplier submits an offer.
8. Buyer compares invited and self-applied offers.
9. Buyer makes a decision.
10. System logs and notifies.

---

## 10.3 Handling a Supply Gap

### Roles

- Buyer
- System
- Platform Admin
- potential Supplier

### Workflow

1. Buyer creates an RFQ in a given category and region.
2. System finds too few relevant suppliers.
3. System creates a supply-gap signal.
4. Admin sees the gap.
5. Admin starts manual or automated supplier search.
6. Admin / system may involve new suppliers.
7. The involved supplier may respond or claim a profile.

---

## 11. RFQ Statuses and Business Meaning

| Status | Meaning | Triggered by | Possible next status |
|---|---|---|---|
| READY | The RFQ is prepared but not sent yet | Buyer / System | SENT, CLOSED |
| SENT | The RFQ has been sent or published | Buyer | DECIDED, CLOSED |
| DECIDED | The buyer has made a decision and there is an accepted offer | Buyer | closed / review |
| CLOSED | The RFQ is closed without decision or after deadline | Buyer / System / Admin | reopening based on later rules |

### Important Product Principle

Statuses should be understandable in Hungarian on the user interface, for example:

- Draft / prepared;
- Sent;
- Decision made;
- Closed.

Technical statuses may remain in English at code level.

---

## 12. Invitation and Offer Statuses

## 12.1 Invitation Statuses

| Status | Meaning |
|---|---|
| SENT | Invitation sent |
| VIEWED | Supplier opened it |
| DECLINED | Supplier declined |
| OFFERED | Supplier submitted an offer |

## 12.2 Offer Statuses

| Status | Meaning |
|---|---|
| SUBMITTED | Offer submitted |
| ACCEPTED | Offer accepted |
| REJECTED | Offer rejected |

---

## 13. MVP User Story List

## 13.1 Buyer User Stories

1. **As a Buyer**, I want to describe a procurement need in one sentence so that I do not need to write an RFQ document from scratch.
2. **As a Buyer**, I want the system to ask clarification questions so that I can send out a better RFQ.
3. **As a Buyer**, I want to modify the suggested category and region so that the RFQ goes exactly where it should.
4. **As a Buyer**, I want to receive a relevant supplier shortlist so that I do not have to search everything manually.
5. **As a Buyer**, I want to invite my own suppliers too so that my existing contacts can participate.
6. **As a Buyer**, I want to send the RFQ to multiple suppliers so that I can receive competing offers.
7. **As a Buyer**, I want to answer supplier clarification questions so that all bidders work from the same information.
8. **As a Buyer**, I want to see incoming offers in one place so that I do not have to search through emails.
9. **As a Buyer**, I want a comparison view so that I can decide faster.
10. **As a Buyer**, I want to accept the selected offer so that the process can be closed.
11. **As a Buyer**, I want to search previous decisions so that I can later see what we chose and why.
12. **As a Buyer**, I want to rate the winning supplier so that future decisions can be based on better information.

## 13.2 Supplier User Stories

1. **As a Supplier**, I want to create a profile so that I can define which services and regions I cover.
2. **As a Supplier**, I want to receive invitations to relevant RFQs so that I can acquire new business customers.
3. **As an Invited Supplier**, I want to respond to a specific RFQ without registration so that I can submit an offer quickly.
4. **As a Supplier**, I want to browse open opportunities so that I can submit offers not only by invitation.
5. **As a Supplier**, I want to ask a question before submitting an offer so that I can provide a more accurate offer.
6. **As a Supplier**, I want to submit a structured offer so that the buyer can easily understand the price and conditions.
7. **As a Supplier**, I want to receive notification when my offer is accepted.
8. **As a Supplier**, I want to see my response statistics so that I know how effectively I use the platform.

## 13.3 Admin User Stories

1. **As an Admin**, I want to see users and companies so that I can manage platform operations.
2. **As an Admin**, I want to see RFQs so that I can filter out incorrect or problematic requests.
3. **As an Admin**, I want to maintain categories and regions so that matching becomes more accurate.
4. **As an Admin**, I want to see supply-gap signals so that I know where supplier supply needs to be built.
5. **As an Admin**, I want to manage problematic profiles so that platform trust is preserved.
6. **As an Admin**, I want to see credit and subscription data so that I can support paid usage.

---

## 14. Priority Recommendation for the MVP

## 14.1 P0 — Mandatory Launch Use Cases

Without these, Procura’s core workflow does not work:

- Buyer registration / login;
- Supplier registration / login;
- company profile;
- supplier profile with categories and regions;
- RFQ creation from short text;
- clarification questions;
- structured RFQ;
- shortlist;
- sending invitation;
- token-based supplier response;
- offer submission;
- offer list;
- offer acceptance;
- audit trail.

## 14.2 P1 — Strong MVP / Validation Value

These significantly improve validation and business value:

- open opportunities;
- supplier self-apply;
- supplier Q&A thread;
- offer comparison;
- Procura analysis;
- supplier rating;
- admin supply-gap view;
- basic payment / credit logic;
- notifications.

## 14.3 P2 — Next Round

These are important, but not necessarily required for the first validation:

- RFQ attachments;
- RFQ templates and cloning;
- recurring RFQs;
- deadline reminders;
- weighted comparison matrix;
- multi-user buyer organization;
- supplier analytics;
- supplier offer templates;
- supplier verification;
- PDF export;
- accounting / invoicing integration;
- Slack / Teams / calendar integration.

---

## 15. Important Open Product Decisions

### 15.1 Is a Separate Buyer Admin Needed in the MVP?

Not necessarily in the short term. The first buyer user can be the implicit company admin. In the long term, role management will be needed for multi-user companies.

### 15.2 Can a Supplier Register Without Submitting an Offer?

Yes, but the value is stronger when they arrive because of a concrete RFQ. In the first UX, invited offer submission and post-offer profile claim may be more important than cold supplier onboarding.

### 15.3 Is Open Tender Needed Already in the MVP?

Yes, if the goal is also marketplace validation. If the goal is only buyer-tool validation, it can be moved later. Based on the current repository, open opportunities are already an important part of the two-sided loop.

### 15.4 Can Suppliers See Each Other’s Offers?

By default, no. For competition integrity and trust, suppliers should not see the details of each other’s offers. Clarification questions may be shared, but offers should remain confidential.

### 15.5 Should There Be Anonymous Offer Ranking?

It may be useful for buyer objectivity, but it should be handled carefully. In the MVP, a structured comparison view may be enough. Anonymous ranking can be a later feature.

### 15.6 How Automatic Should Decision Support Be?

The system may provide summaries and highlight risks, differences and strengths, but it should not say “choose this one”. The business responsibility for the decision belongs to the buyer.

---

## 16. UX Consequences

### 16.1 Buyer UX

On the buyer side, speed is the most important factor. The system should create the feeling:

> “I briefly describe what I need, and within a few minutes I have an RFQ ready to send.”

UX consequences:

- clear first CTA: “Request offers”;
- one-sentence intake;
- few, targeted clarification questions;
- easily editable RFQ;
- explainable shortlist;
- simple sending;
- clear offer comparison.

### 16.2 Supplier UX

On the supplier side, reducing friction is the most important factor. The system should create the feeling:

> “This is a real, relevant business opportunity that I can respond to quickly.”

UX consequences:

- token-link response;
- short RFQ summary;
- clearly visible deadline;
- simple offer form;
- minimal registration pressure;
- post-offer profile claim;
- clear notification of status changes.

### 16.3 Admin UX

On the admin side, operational overview is the most important factor. The system should support the question:

> “Where does the marketplace get stuck, where is supplier supply insufficient, and where is there a moderation problem?”

UX consequences:

- RFQ status dashboard;
- supply-gap dashboard;
- later category-region heatmap;
- problematic RFQ flags;
- user/company search;
- audit trail access;
- basic funnel metrics.

---

## 17. Metrics by Role

## 17.1 Buyer Metrics

- number of new buyer registrations;
- buyer onboarding completion rate;
- RFQ creation rate;
- RFQ publishing / sending rate;
- average time from intake to sending;
- number of invited suppliers per RFQ;
- number of received offers per RFQ;
- offer acceptance rate;
- buyer return rate;
- payment conversion.

## 17.2 Supplier Metrics

- number of new supplier registrations;
- profile completion rate;
- invitation open rate;
- invitation → offer conversion;
- open opportunity → application conversion;
- average response time;
- offer win rate;
- supplier return rate;
- payment / premium conversion.

## 17.3 Admin / Marketplace Metrics

- number of category-region supply gaps;
- share of RFQs with too few suppliers;
- share of RFQs requiring admin intervention;
- number of spam / abuse cases;
- share of closed RFQs;
- average number of offers per RFQ;
- liquidity by category;
- buyer and supplier NPS / satisfaction.

---

## 18. Summary

The first version of Procura has three main human roles:

1. **Buyer** — requests offers, compares them and makes a decision.
2. **Supplier** — responds to relevant RFQs, submits offers and acquires customers.
3. **Platform Admin** — operates and quality-controls the marketplace.

Two transitional roles are especially important:

- **Invited Supplier**, who can respond to a specific RFQ without registration or with light access;
- **Supplier Profile Owner**, who later claims and maintains the supplier profile.

The most important use case of the system is not a single screen or feature, but the full procurement loop:

> short buyer need → clarification → structured RFQ → supplier shortlist → invitation / open opportunity → Q&A → offer submission → comparison → decision → audit trail → rating.

If this loop is fast, understandable, reliable and repeatable, Procura will not be a simple RFQ form, but a lightweight procurement workspace for Hungarian SMEs.
