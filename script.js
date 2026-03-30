/**
 * Marvelous Ascent — script.js
 * Handles async Zapier webhook submissions for:
 *   - #contact-form   → CONTACT_WEBHOOK_URL
 *   - #subscribe-form → SUBSCRIBE_WEBHOOK_URL
 *
 * Zero dependencies. Vanilla ES2017+.
 */

// ─── REPLACE THESE WITH YOUR ACTUAL ZAPIER WEBHOOK URLs ──────────────────────
const CONTACT_WEBHOOK_URL   = 'https://hook.eu1.make.com/5f8wrs6km9trssp355wh6xhiu544qnyz';
const SUBSCRIBE_WEBHOOK_URL = 'https://hook.eu1.make.com/9dwcriyxkyo8e27i8dg9cgzd3a4lfgac';
// ─────────────────────────────────────────────────────────────────────────────

// Timeout in ms before we give up and show a network error (15s suits 3G)
const FETCH_TIMEOUT_MS = 15_000;

/**
 * Posts JSON to a webhook URL with a hard timeout.
 * Throws on non-2xx HTTP status OR on network/timeout failure.
 *
 * @param {string} url        - Zapier webhook endpoint
 * @param {object} payload    - Plain object; will be JSON-stringified
 * @returns {Promise<void>}
 */
async function postJSON(url, payload) {
  // AbortController lets us kill the fetch after FETCH_TIMEOUT_MS
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method:  'POST',
      // ↓ Critical: without this header Zapier ignores the body
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    });
  } finally {
    // Always clear the timer whether fetch resolved, rejected, or timed out
    clearTimeout(timer);
  }

  // fetch() only rejects on *network* failure — it resolves on 4xx/5xx.
  // We must manually check .ok to surface HTTP-level errors.
  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}`);
  }
}

/**
 * Shows a temporary status message directly below the form.
 * Re-uses a single `.form-message` node per form (created once, reused).
 *
 * @param {HTMLElement} form    - The form element
 * @param {string}      text    - Message to display
 * @param {'success'|'error'|'pending'} state
 */
function setMessage(form, text, state) {
  let msgEl = form.querySelector('.form-message');

  // Create the message element the first time we need it
  if (!msgEl) {
    msgEl = document.createElement('p');
    msgEl.className = 'form-message';
    form.insertAdjacentElement('afterend', msgEl);
  }

  // Drive all visual states via CSS data-attribute — zero inline styles
  msgEl.dataset.state = state;   // CSS targets [data-state="success"] etc.
  msgEl.textContent   = text;
}

/**
 * Clears the status message for a form.
 * @param {HTMLElement} form
 */
function clearMessage(form) {
  const msgEl = form.querySelector('.form-message')
    // insertAdjacentElement puts it *after* the form, not inside it
    ?? form.nextElementSibling?.classList.contains('form-message')
      ? form.nextElementSibling
      : null;

  if (msgEl) msgEl.textContent = '';
}

/**
 * Core submit handler — shared by both forms.
 *
 * @param {SubmitEvent}  event      - The form submit event
 * @param {string}       webhookUrl - Zapier endpoint for this specific form
 */
async function handleSubmit(event, webhookUrl) {
  event.preventDefault();

  const form   = event.currentTarget;
  const submit = form.querySelector('[type="submit"]');

  // ── Double-submit guard ─────────────────────────────────────────────────
  // The `data-submitting` attribute acts as a mutex.
  // If a request is already in-flight, bail out immediately.
  if (form.dataset.submitting) return;
  form.dataset.submitting = '1';

  // Disable the button & show a loading label so the user gets feedback fast
  const originalLabel    = submit.textContent;
  submit.disabled        = true;
  submit.textContent     = 'Sending…';

  // Collect all named form fields into a plain object
  const payload = Object.fromEntries(new FormData(form));

  try {
    await postJSON(webhookUrl, payload);

    setMessage(form, '✓ Got it! We\'ll be in touch soon.', 'success');
    form.reset();

    // Auto-dismiss the success message after 6 seconds
    setTimeout(() => setMessage(form, '', 'idle'), 6_000);

  } catch (err) {
    // Distinguish between a user-aborted timeout and a genuine server error
    const isTimeout = err.name === 'AbortError';
    const msg = isTimeout
      ? '⚠ Request timed out. Check your connection and try again.'
      : '✕ Something went wrong. Please try again.';

    setMessage(form, msg, 'error');

    // Log the full error for debugging — invisible to the user
    console.error('[Marvelous Ascent] Form submission failed:', err);

  } finally {
    // ── Always re-enable the form — even if something unexpected happened ──
    delete form.dataset.submitting;
    submit.disabled    = false;
    submit.textContent = originalLabel;
  }
}

// ─── BOOTSTRAP ───────────────────────────────────────────────────────────────
// DOMContentLoaded fires as soon as the HTML is parsed — before images/fonts.
// This is the earliest safe moment to attach event listeners.
document.addEventListener('DOMContentLoaded', () => {

  const contactForm   = document.getElementById('contact-form');
  const subscribeForm = document.getElementById('subscribe-form');

  // Guard: only attach listeners if the elements actually exist on this page.
  // This makes the script safe to include on any page without errors.
  if (contactForm) {
    contactForm.addEventListener('submit', (e) =>
      handleSubmit(e, CONTACT_WEBHOOK_URL)
    );
  }

  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) =>
      handleSubmit(e, SUBSCRIBE_WEBHOOK_URL)
    );
  }

});
