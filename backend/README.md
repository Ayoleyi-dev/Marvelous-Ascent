# Project enquiries — deployable backend, **not yet deployed**

The public GitHub Pages site cannot independently store submitted enquiries. This folder contains a Cloudflare Worker and D1 SQL database migration that can be deployed when the agency has approved provider credentials. It is **not** live by merely merging this repository.

## What is implemented
- Origin allowlist, strict server validation, anti-spam Cloudflare Turnstile verification (action and hostname checks).
- Required privacy acknowledgement; no arbitrary account/file uploads.
- D1 record creation followed by optional email alert through Resend.
- A generated enquiry reference, safe HTTP response and explicit browser success/error states.
- A daily scheduled cleanup of `new` enquiries older than 90 days.
- No browser-side database secrets, provider API keys or hard-coded credentials.
- Unit tests cover success and important failure paths using mocks; they do not establish production delivery.

## Required setup before switching on submissions

1. Verify ownership of a Cloudflare account and a sending domain for Resend. Approve the provider privacy/data-processing terms; legal reviewer to review our public privacy notice.
2. Create Cloudflare D1 database, copy `wrangler.example.toml` to `wrangler.toml`, insert the actual D1 database UUID and set `NOTIFY_FROM` to the verified sending address.
3. Apply `schema.sql` to D1 using Wrangler.
4. Create a Cloudflare Turnstile widget restricted to `ayoleyi-dev.github.io`, with action `project_brief`. Store its **secret** on the Worker using `wrangler secret put TURNSTILE_SECRET`. The browser receives only the site key.
5. Set `RESEND_API_KEY` via Wrangler secrets. Verify the receiving address and sender delivery. Never put secrets in `lead-config.js` or Git.
6. Deploy the Worker. Send a real test enquiry, verify a D1 record, email notification, correct acknowledgement, spam rejection and data deletion policy.
7. After successful verification, edit the public `lead-config.js`: set `endpoint` to the deployed Worker `https://.../enquiry` URL and `turnstileSiteKey` to the **public** site key.
8. Check both dark/light themes and low-bandwidth failures, invalid forms, disabled captcha, wrong-origin requests, and email-provider outage handling.
9. Configure access controls and backups as appropriate. Agree who has access to enquiries and who is responsible for replies.

When no endpoint/site key is configured, the website stays in **email-draft mode**, with an explicit warning that the visitor must send from their email app. It will not misrepresent unsent drafts as successful leads.

## Maintenance
- `node --test backend/test/lead-worker.test.mjs` for offline tests.
- D1 is an internal lead register, **not** a full CRM. Unconverted records marked `new` are removed after 90 days; records moved to other statuses, notified emails, backups and contract records need separately documented retention procedures.
- Respect user access/correction/deletion requests and avoid logging raw submitted details.
- The current homepage newsletter's legacy Make webhook is **out of scope** for this Worker. It requires a separate verified subscription, consent and unsubscribe audit.
