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
