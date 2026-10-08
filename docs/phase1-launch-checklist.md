# Phase 1 public-site launch checklist

Development complete is **not** equal to production approved. This list aligns with the two master roadmaps and identifies what remains for a full launch gate.

## Content, brand and proof
- [x] Welcoming homepage, practical services, clear CTAs and process story
- [x] Seven structured service pages and case-study routes
- [x] About page added (founder/team wording needs approval)
- [x] SonofIAM and DIAMS proof distinctions visible
- [ ] Verify permission to display public project references and confirm service capabilities

## Legal, privacy and accessibility
- [x] Draft Privacy, Terms, Accessibility pages and custom 404 added
- [ ] Confirm applicable Nigerian and client-jurisdiction obligations with appropriate counsel
- [ ] Verify cookie/script/provider list, retention, third-party data processing and service cancellation/refund terms
- [ ] Complete manual keyboard, screen-reader, contrast and assistive-technology review
- [ ] Confirm custom 404 responds with actual HTTP 404 on GitHub Pages (file check alone is not proof)

## Enquiries
- [x] Guided three-step form with review and email-app fallback
- [x] Conditional backend implementation, anti-spam verification, D1 schema, notification and offline unit tests
- [ ] Obtain Cloudflare Worker/D1, Turnstile and Resend credentials and verified sender domain
- [ ] Deploy worker, apply DB migration and configure endpoint/public site key
- [ ] Test a real enquiry end to end: HTTP 201 → DB row → notification → reply, including failed connections
- [ ] Verify retention, account restrictions, abuse protection and privacy approval
- [ ] Confirm team owner, response process and subsequent enquiry/CRM stages

## Launch health
- [x] Static route, generated HTML and JavaScript syntax checks
- [x] Chromium responsive menu and example page layout checks
- [ ] Review screenshots with a human on representative devices in dark and light
- [ ] Audit Lighthouse performance, SEO social previews and production links
- [ ] Install and test privacy-aware analytics only after consent decisions
- [ ] Verify newsletter signup, list storage, confirmations and unsubscribe
- [ ] Document release rollback and backup procedure
- [ ] Explicit approval to merge development branch and publish

**No live backend or marketing provider has been activated by the repository-only implementation.**
