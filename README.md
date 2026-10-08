# Marvelous Ascent

**Practical data, automation and digital systems for growing businesses.**

We help teams make sense of scattered information, reduce repetitive work and build credible digital experiences. This repository is our current **public agency website** — not yet a client platform.

**Site:** https://ayoleyi-dev.github.io/Marvelous-Ascent/

## What is here

- Homepage with data, web and workflow service introductions.
- Four detailed service/demo pages: lead generation, BI dashboards, web/social automation and document processing.
- Illustrative ROI scenarios, explicitly labelled as examples rather than measured customer outcomes.
- Sample analytics visualisation, **not** a live data feed.
- A delivered-work spotlight for SonofIAM, with other examples clearly marked fictional.
- Dark and light brand themes. The dark palette uses violet/lavender; the light palette uses teal/indigo accents.
- Project enquiry uses your email application to prepare a message; the visitor must press **Send** in that application.
- Newsletter form uses an existing external Make webhook; delivery, consent records, list storage and unsubscribing require separate end-to-end verification.
- Browser-local page personalisation is **not authentication**.

## File map

| Path | Purpose |
| --- | --- |
| `index.html` | Public homepage and contact |
| `style.css` | Original component/layout styles |
| `brand.css` | Current color, accessibility and theme overrides |
| `ui-scripts.js` | Homepage interactivity and forms |
| `automated-lead-gen.html` | Lead pipeline demo/service page |
| `custom-bi-dashboards.html` | Analytics service page |
| `web-social-automation.html` | Web/social service page |
| `automated-document-processing.html` | Document-processing demo/service page |
| `doc-processing.css`, `doc-processing.js` | Document demo assets |

## Preview locally

Serve the repository folder as static files rather than opening the pages using `file://`.

```bash
python -m http.server 8000
```

Open http://localhost:8000/ and check homepage, service pages, anchor links and forms. GitHub Pages can publish from the `main` branch after a reviewed merge.

## Current limitations and launch checks

1. Newsletter Make webhook is external and unverified here; do not claim subscribers are stored or delivered until an end-to-end test succeeds. Avoid exposing privileged webhook credentials or sensitive personal data in public client code.
2. The enquiry form prepares a `mailto:` draft; it does not save prospects in a database. Next iteration should use a secure server-side lead intake and CRM.
3. No secure client login, private file storage, tenant permissions, billing or client portal is implemented. Browser-local personalisation must not be treated as login.
4. Verify responsive rendering, navigation, accessibility and email handoff in actual mobile and desktop browsers.
5. Replace abstract project art with an authorised screenshot and validate project descriptions before publication.
6. Review privacy terms, consent, cookie/data disclosures, SEO crawl assets and analytics instrumentation before a full commercial launch.
7. Document-processing and dashboard examples are demonstrations; do not process confidential data until security and storage design is completed.

## Roadmap

- **Phase 0 — Foundation:** branding, content accuracy, clean repository, deploy checks.
- **Phase 1 — Public website:** service detail, credible work/case studies, responsive pages, legal/SEO.
- **Phase 2 — Lead intake:** validated brief, secure storage, CRM status and confirmations.
- **Phase 3 — Demo/proof:** transparent data examples and reusable deliverable templates.
- **Later:** agency operating console, automation monitoring, then authenticated client portal.

We build in small reviewable increments so the public site remains stable while the platform matures.

## Contact

- Email: meet.ayoleyi@gmail.com
- WhatsApp: https://wa.me/2349061367007

© 2026 Marvelous Ascent.

## Phase 1 — Service catalogue and page architecture

The canonical public catalogue is `services.html`, backed by structured copy in `data/services.json`. Seven static, indexable service detail pages are generated under `services/`.

After changing service descriptions, status, FAQ, scope or evidence links, regenerate the HTML and sitemap:

```bash
node scripts/generate-services.mjs
node scripts/generate-services.mjs --check
node scripts/check-site.mjs
```

Do **not** edit generated `services.html` or files under `services/` directly. Shared layout lives in `scripts/generate-services.mjs`, styles in `services.css` and theme behaviour in `site-navigation.js`.

The preserved historical demonstration pages are now labelled as simulations. The document-processing demo **does not accept file uploads**: its previous form pretended to upload and acknowledge a document without sending it. A real secure backend, data handling agreement and review are required before accepting documents from customers.

Current route flow: `index.html` → `services.html` → `services/<slug>.html` → `index.html#contact`. Search metadata and crawl routes are in `sitemap.xml` and `robots.txt`. Client authentication, CRM persistence and email integration remain future work.

## Welcoming public experience and case studies

The homepage now begins with what visitors need to accomplish, rather than unverified ROI figures or technical performance claims. It includes four problem-first paths, a real-work preview, transparent delivery steps and a guided project brief. The layout uses `welcome.css` over the existing brand tokens and keeps both colour themes.

- `work.html` — entry point to selected proof-first case studies.
- `work/sonofiam.html` — delivered website and commerce foundation; public website is the evidence, while outcomes such as conversion or SEO changes remain unmeasured.
- `work/diams.html` — operational master tracker designed while working as a Data & Analytics Officer. This is founding professional experience, **not** an independently contracted agency case study. No internal contact records or sensitive workbook screenshots are published.
- `project-brief.html` and `project-brief.js` — three-step intake, browser-side validation, safe text rendering and review. Submission **opens the visitor's own email app** and requires them to press Send. There is no backend, automatic lead record or response-time guarantee.

The previous fictional healthcare, ecommerce and real-estate testimonials, automated ROI figures and fake performance proof have been removed from the homepage. The old concept/demo pages remain secondary and explicitly labelled.

### Manual review before release

1. Check welcome copy, service fit and tone with real prospects.
2. Preview both themes at 360px, 768px and desktop widths.
3. Test keyboard focus, mobile menu, reduced motion and screen-reader labels.
4. Complete project brief with invalid and valid inputs, verify the review screen and email app handoff.
5. Approve SonofIAM case-study wording and verify that public use of the website as evidence is appropriate.
6. Confirm the DIAMS description contains no confidential workbook contents.
7. Verify newsletter integrations separately: no subscriber storage or email automation is established by this phase.

The new pages are included in the generated sitemap. Do not merge the development PR until those checks are reviewed.

## Interactive workflow showcase

The homepage `#showcase` section provides three keyboard-accessible examples: reporting clarity, smoother operations and web presence. These are **fictional, static examples**, not live customer data, connected workflows or quantified business results.

- `showcase.js` owns the three scenario records and updates the preview using safe DOM APIs; it does not make requests or send notifications.
- `showcase.css` provides a high-contrast, responsive experience in both dark and light modes.
- The page continues to link into canonical service descriptions and the guided project brief.
- On desktop and mobile, check that the three tabs work by mouse, touch and keyboard (arrow keys, Home/End), and that each preview stays legible in both themes.

Do not introduce mock conversion improvements, anonymous partner logos or live-looking client metrics into the showcase.

## Hero layout and brand consistency QA

The welcome headline uses a compact responsive scale and balanced two-column layout, rather than an oversized 5rem desktop title. On screens below 900px, the welcome card stacks under the introduction; phone widths use another smaller headline scale.

One shared lockup now appears in every public header and footer:
`<span class="brand-lockup__mark">[MA]</span><span class="brand-lockup__name">Marvelous Ascent</span>` inside a `brand-lockup` anchor. The mark/name styling lives in `brand.css`, and the generated service-page version lives in `scripts/generate-services.mjs`. Do not re-introduce a different mark on individual pages.

The static test checks the markup and generated service-page parity. A separate browser layout workflow checks 390px, 768px, 1440px and 1650px viewports, verifies the headline and card do not overflow or overlap, and uploads screenshot artifacts for human review. Run locally after installing `playwright@1.56.1` and the Chromium browser:

```bash
node scripts/check-site.mjs
node scripts/generate-services.mjs --check
node scripts/check-layout.mjs
```

Before merging, inspect the uploaded screenshots in GitHub Actions and double-check the actual Chrome/Edge presentation in both light and dark modes.

## Phase 1 service navigation polish

The service catalogue and all seven generated service pages now share a compact responsive navigation menu for mobile screens, readable service headings, a clearer path into the project brief, and stronger cards and FAQ styling. Each service detail page includes anchored shortcuts to its challenge, deliverables, approach, evidence and FAQs. The proof pages and project brief use the same mobile menu.

- Template: `scripts/generate-services.mjs`; generated pages must stay in sync.
- Styles: `services.css`, respecting `brand.css` tokens and both colour themes.
- Interaction: `site-navigation.js` enhances the native `<details>` menu with Escape, outside-click, and navigation-close support; no JavaScript is needed to initially open the menu.
- Browser check: `node scripts/check-service-layout.mjs`; it checks navigation, anchors, horizontal overflow, and phone/tablet/desktop layouts in dark/light modes.

For the **actual milestone audit and what's left before Phase 2**, see [ROADMAP_STATUS.md](ROADMAP_STATUS.md). A live lead-capture backend, About/legal pages, analytics baseline and further release gates are still outstanding.
