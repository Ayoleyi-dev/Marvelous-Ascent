# Newsletter / mailing-list audit — must be verified before launch

The homepage currently contains a newsletter form wired to a third-party automation webhook. Its full destination, subscriber storage, opt-out flow and data-processing basis have **not** been independently checked in this release.

Do not claim that an email has joined a mailing list until the intended service responds with verified confirmation and the saved subscriber can be found.

## Required operational checks

1. Identify and approve the actual newsletter provider and connected Make automation scenario.
2. Confirm where a subscriber name/email are saved, which accounts can access the list, and how duplicate contacts are handled.
3. Decide an appropriate explicit marketing consent checkbox, privacy wording and unsubscribe procedure. Do not mix this permission with project-enquiry consent.
4. Move public unauthenticated webhook processing behind an appropriate validated integration, or protect the existing endpoint against spam and abuse.
5. Send an approved test to a test mailbox, find the stored subscriber, verify confirmation messaging, check unsubscribe and erase-on-request handling.
6. Confirm network, error and retry behaviour on desktop/mobile and in both themes.
7. Only then mark newsletter capture operational.

This check cannot be completed with GitHub repository access alone; it requires access to the live mailing provider and approval of handling arrangements. No dummy personal submissions were sent by this task.
