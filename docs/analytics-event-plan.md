# Marvelous Ascent — privacy-aware measurement plan

**Status:** specification only. No new analytics tag, GA4 connection or consent manager was deployed by this development release.

## The decisions analytics should support
1. Which service areas visitors find useful.
2. Which credible work examples are read.
3. Which pages lead to meaningful project conversations.
4. How many **confirmed server-side enquiries** occur (not just email-draft openings).
5. What visitors struggle to understand on mobile.

## Candidate events (not yet instrumented)

| Event | Trigger | Data allowed | Conversion? |
|---|---|---|---|
| `service_view` | service page viewed | slug and path only | No |
| `work_view` | public case study viewed | slug only | No |
| `brief_started` | visitor opens project brief | page path, optional consented campaign identifiers | No |
| `brief_reviewed` | visitor completes step 2 | page path, no form content | No |
| `brief_email_draft_opened` | local email draft handoff attempted | no PII | **No**; email may not have been sent |
| `lead_accepted` | server stores enquiry and returns 201 | anonymous success marker, no name/email/challenge | **Yes** |
| `newsletter_confirmed` | verified opt-in completion | no email in analytics | Not until provider is validated |

## Consent and data limits
- Do not put names, email addresses, free-text challenges, phone numbers, IP addresses or credential details in analytics events or query strings.
- Require an approved consent/tracking approach where applicable before setting nonessential tracking or marketing cookies.
- Only carry source/UTM parameters through an approved privacy-aware flow; avoid copying raw campaigns into the public page URL with personal identifiers.
- Establish a period-level baseline before making KPI improvement claims.
- Publish an accurate privacy notice mentioning the **actual** provider and retention policy before deployment.
- Do not count `mailto:` opening as a successful enquiry.

## Implementation gate
- [ ] Confirm chosen analytics provider and who owns the account.
- [ ] Set consent rules and audit third-party scripts.
- [ ] Instrument only the approved events.
- [ ] Verify events in an appropriate test property, including refusal of tracking consent.
- [ ] Confirm no personal data leakage via DevTools requests.
- [ ] Report actual funnel counts over a defined period.
