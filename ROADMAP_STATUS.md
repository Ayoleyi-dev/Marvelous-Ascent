# Marvelous Ascent — roadmap status

**Snapshot:** 8 October 2026  
**Primary reference:** `Marvelous_Ascent_Master_Agency_Platform_Roadmap(1).pdf` (Phases 0–8).  
**Secondary reference:** `Marvelous_Ascent_Master_Roadmap(1).pdf` (public website MVP build order). The two plans use different names/numbers from Phase 3 onward; this status uses the **Master Agency & Platform** numbering.

This status separates **implemented**, **not verified**, and **not implemented**. A page existing in a static repository is not the same as a production service, secure data store or validated business result.

## Current position

We are **building out and quality-checking Phase 1: the proof-first public website**. Phase 1 is **not ready to sign off** until the visitor can reliably submit a qualified enquiry and the remaining public-site launch requirements are satisfied.

| Phase | Roadmap scope | What the code currently supports | Status / gate |
| --- | --- | --- | --- |
| 0 — Foundation & truth | Positioning, claim inventory, repo audit, analytics baseline and backlog | Shared brand, truth-first copy, docs, accessible frontend checks; measurement baseline and backlog sign-off not verified | Substantial foundation, gate still needs confirmation |
| 1 — Proof-first website | Home, services, credible case studies, process and project brief | Welcome-first home, seven generated service pages, SonofIAM and DIAMS case studies, interactive synthetic showcase, browser-only three-step enquiry, responsive UI | **Active. Gate incomplete** |
| 2 — Lead engine | CRM stages, routing, acknowledgement, discovery/proposal systems and pipeline | Email draft opens in visitor's mail app; no server-side lead capture or durable CRM record | Not implemented |
| 3 — Productised delivery | Templates, QA and handover packs, evidence capture | Service outlines and descriptions exist; repeatable delivery packs and acceptance evidence not established | Not implemented |
| 4 — Visibility, advertising & research | Reliable search/ads/research tracking and founder decision dashboard | Public metadata, sitemap, robots; integrations and reliable reporting not verified | Early groundwork only |
| 5 — Automation | Monitored operations automations with logs/fallback and measured time saved | Illustrative on-page demonstrations only | Not implemented as agency infrastructure |
| 6 — Internal agency OS | Projects, risks, tasks, assets, access, financials | No integrated agency operations console | Not implemented |
| 7 — Client portal MVP | Secure sign-in, project views, files, approvals, reports | No authenticated client portal | Not implemented |
| 8 — Platform & scale | Reusable configurations, partner/integration model and unit economics | No multi-tenant platform | Not implemented |

## Phase 1 currently present

- Welcoming homepage with problem-first service navigation and process explanation.
- Seven SEO-friendly service detail pages generated from `data/services.json`.
- Distinct SonofIAM delivered-website story and DIAMS professional-experience story; no fabricated revenue claims.
- A synthetic, explicitly labelled interactive workflow showcase.
- Project brief with three steps, validation, a review screen, and **mailto-only** handoff.
- Consistent visual identity, mobile/desktop layouts, automated static checks and browser layout checks.
- The service-page navigation polish branch adds a compact native mobile menu, direct section jumps, more readable service headings, and better card hierarchy.

## Unfinished before a public-site Phase 1 gate

1. **Real enquiry delivery:** choose a secure server-side intake flow, consent/anti-spam handling, actual delivery to a mailbox or CRM, error and confirmation states; test end-to-end. `mailto:` depends on the visitor sending the message and is not reliable lead capture.
2. **About, legal and disclosures:** founder/team/about content, privacy and cookie/tracking information as applicable, terms, service and cancellation terms, clear contact and accessibility policies, permission to use showcased work.
3. **Analytics baseline:** privacy-aware key-event plan and reliable measurement of source, service interest and actual enquiry completion.
4. **Quality assurance:** browser tests for actual navigation/forms, performance and accessibility audit, SEO previews, 404/error page and deployment review.
5. **Operational proof:** actual case-study permissions, service deliverables and client-ready examples with carefully documented boundaries.
6. **Email subscription:** validate the existing third-party webhook, subscriber consent/storage and unsubscribe process before marketing it.

## Next backlog sequence

1. Review/merge the service navigation polish after screenshot and interaction QA.
2. Build a credible **About / Working with us** page and ensure cross-page navigation includes it where useful.
3. Add and review privacy, terms and project-enquiry disclosures, accessibility contact route, custom 404.
4. Make the enquiry form a **secure, tested lead submission** rather than an email-app draft.
5. Validate analytics, newsletter subscription and Phase 1 production launch checklist.
6. Only then open Phase 2 CRM/pipeline work.

**Do not mark a later phase as complete because a front-end demonstration resembles it.**

## 8 October continuation — About, policies and lead-intake backend prepared

This update is layered **after** the Phase 1 navigation polish branch. It is still under review and has **not** been merged.

**Implemented in a review branch:**
- `about.html`, `privacy.html`, `terms.html`, `accessibility.html`, `404.html`, shared responsive styles and footer navigation.
- The sitemap includes the public trust pages and excludes the noindex 404 page.
- `project-brief.js` now supports a real server submission **only when explicit public configuration has been provided**. Until then it retains the transparent email-app draft method and required privacy acknowledgement.
- `backend/lead-worker.mjs`, D1 migration, Turnstile validation, email notification and tests; see `backend/README.md`.
- Browser and static regression checks plus dedicated launch, newsletter and analytics planning documents.

**What remains not done:**
- **No live backend is deployed or configured**; unmerged website remains on email draft. A successful automated unit test does not prove live delivery.
- Provider setup/credentials, real inbox+DB end-to-end testing, spam configuration, rate limits and operational monitoring.
- Legal review of all new draft policy pages and owner approval of About/case-study disclosures.
- Newsletter provider/list storage/unsubscribe validation and live analytics baseline.
- Final human visual/a11y/performance QA plus explicit merge approval.

See `docs/phase1-launch-checklist.md`, `docs/newsletter-audit.md` and `docs/analytics-event-plan.md` for acceptance steps.

**Milestone assessment remains:** Phase 1 frontend nearly complete; Phase 1 gate not yet passed. Do not report Phase 2 as operational before durable lead ownership, status tracking and a confirmed reply process.
