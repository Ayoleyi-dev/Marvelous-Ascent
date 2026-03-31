/**
 * ═══════════════════════════════════════════════════════════════
 *  MARVELOUS ASCENT  —  ui-scripts.js
 *  Pure Vanilla JS front-end interactivity.
 *  No frameworks. No libraries. Runs after DOMContentLoaded.
 *
 *  Modules (clearly separated):
 *    1.  Dynamic Name Injection
 *    2.  Smooth Anchor Scroll
 *    3.  Mobile Nav Toggle
 *    4.  Sticky Header (shrink + hide-on-scroll-down)
 *    5.  Scroll Reveal  (IntersectionObserver)
 *    6.  Stat Counter Animation
 *    7.  ROI Industry Tab Switcher
 *    8.  Power BI Placeholder Toggle
 *    9.  Toast Notification Helper (exported to window)
 *   10.  Form Submission (Zapier Webhooks + Toast feedback)
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     CONFIG — replace with your actual Zapier Webhook URLs
  ───────────────────────────────────────────────────────────── */
  var CONTACT_WEBHOOK   = 'https://hook.eu1.make.com/5f8wrs6km9trssp355wh6xhiu544qnyz';
  var SUBSCRIBE_WEBHOOK = 'https://hook.eu1.make.com/9dwcriyxkyo8e27i8dg9cgzd3a4lfgac';
  var FETCH_TIMEOUT_MS  = 15000; // 15 s — generous for 3G

  /* ═══════════════════════════════════════════════════════════
     MODULE 1 — DYNAMIC NAME INJECTION
     Reads #business-name-input and updates every .dynamic-name
     span in real time as the user types.
     Also mirrors the value into the terminal widget's #term-name.
  ═══════════════════════════════════════════════════════════ */
  var nameInput    = document.getElementById('business-name-input');
  var dynamicSpans = document.querySelectorAll('.dynamic-name');
  var termName     = document.getElementById('term-name');

  var DEFAULT_TEXT = {
    /* Map each span's position to its neutral fallback.
       We read the initial textContent at boot time. */
  };

  // Capture each span's original placeholder text once
  dynamicSpans.forEach(function (span, i) {
    span.dataset.default = span.textContent.trim();
  });

  function updateDynamicNames(value) {
    var display = value.trim();

    dynamicSpans.forEach(function (span) {
      if (display) {
        span.textContent = display;
        span.classList.add('has-value');
      } else {
        span.textContent = span.dataset.default || 'your business';
        span.classList.remove('has-value');
      }
    });

    // Mirror to terminal widget
    if (termName) {
      termName.textContent = display
        ? display.toUpperCase().replace(/\s+/g, '_')
        : 'YOUR_COMPANY';
    }
  }

  if (nameInput) {
    // 'input' fires on every keystroke, paste, and cut — ideal for live update
    nameInput.addEventListener('input', function () {
      updateDynamicNames(this.value);
    });

    // If user navigates back and browser restores the value
    nameInput.addEventListener('change', function () {
      updateDynamicNames(this.value);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     MODULE 2 — SMOOTH ANCHOR SCROLL
     Catches all <a href="#..."> clicks and smoothly scrolls
     to the target, accounting for the sticky header height.
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    var targetId = anchor.getAttribute('href');
    if (targetId === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    var target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    var headerEl = document.getElementById('site-header');
    var offset   = headerEl ? headerEl.offsetHeight : 64;

    var top = target.getBoundingClientRect().top + window.pageYOffset - offset - 12;

    window.scrollTo({ top: top, behavior: 'smooth' });

    // Close mobile menu if open
    closeMobileNav();
  });

  /* ═══════════════════════════════════════════════════════════
     MODULE 3 — MOBILE NAV TOGGLE
  ═══════════════════════════════════════════════════════════ */
  var hamburger  = document.getElementById('hamburger');
  var mobileNav  = document.getElementById('mobile-nav');

  function closeMobileNav() {
    if (!mobileNav || !mobileNav.classList.contains('is-open')) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (hamburger) {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation');
    }
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
  }

  /* ═══════════════════════════════════════════════════════════
     MODULE 4 — STICKY HEADER
     • Adds .is-scrolled (border highlight) after 60px
     • Adds .is-hidden (slides header up) when scrolling down
       past 200px, removes it on scroll up
  ═══════════════════════════════════════════════════════════ */
  var siteHeader = document.getElementById('site-header');
  var lastY      = 0;

  if (siteHeader) {
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;

      siteHeader.classList.toggle('is-scrolled', y > 60);

      // Hide on scroll-down, show on scroll-up
      if (y > 200) {
        siteHeader.classList.toggle('is-hidden', y > lastY);
      } else {
        siteHeader.classList.remove('is-hidden');
      }

      lastY = y < 0 ? 0 : y;
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     MODULE 5 — SCROLL REVEAL
     All .reveal-up elements start hidden (opacity:0, translateY).
     Observer adds .is-visible when they enter the viewport.
     Each element fires exactly once then is unobserved.
  ═══════════════════════════════════════════════════════════ */
  var revealEls = document.querySelectorAll('.reveal-up');

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback — show everything immediately for unsupported browsers
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ═══════════════════════════════════════════════════════════
     MODULE 6 — STAT COUNTER ANIMATION
     Animates .stat__val[data-count] from 0 to its target value
     using an ease-out cubic curve via requestAnimationFrame.
     Fires once when the stat enters the viewport.
  ═══════════════════════════════════════════════════════════ */
  var statEls = document.querySelectorAll('.stat__val[data-count]');

  function animateStat(el) {
    var target   = parseFloat(el.dataset.count);
    var suffix   = el.dataset.suffix  || '';
    var duration = 1400; // ms
    var start    = null;

    function step(ts) {
      if (!start) start = ts;
      var elapsed  = ts - start;
      var progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic: fast start, gentle landing
      var eased    = 1 - Math.pow(1 - progress, 3);
      // Handle decimals (e.g. 8.4)
      var current  = Math.round(eased * target * 10) / 10;
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statEls.length) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(function (el) { statObserver.observe(el); });
  }

  /* ═══════════════════════════════════════════════════════════
     MODULE 7 — ROI INDUSTRY TAB SWITCHER
     Clicking a .roi-tab:
       • Updates active tab (aria-selected + CSS class)
       • Hides current panel, shows new one (data-active toggle)
     Arrow-key navigation between tabs for accessibility.
  ═══════════════════════════════════════════════════════════ */
  var roiTabs    = Array.from(document.querySelectorAll('.roi-tab'));
  var roiCards   = document.querySelectorAll('.roi-card');

  function activateTab(industry) {
    // Update tabs
    roiTabs.forEach(function (tab) {
      var active = tab.dataset.industry === industry;
      tab.classList.toggle('roi-tab--active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    // Swap panels:
    // 1. Remove data-active from all (triggers CSS display:none after exit)
    roiCards.forEach(function (card) {
      delete card.dataset.active;
    });

    // 2. Small delay so the browser can paint the removal
    //    before we add the new one (prevents flash)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        roiCards.forEach(function (card) {
          if (card.dataset.industry === industry) {
            card.dataset.active = '';
          }
        });
      });
    });
  }

  roiTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateTab(this.dataset.industry);
    });

    // Keyboard: left/right arrow keys move focus between tabs
    tab.addEventListener('keydown', function (e) {
      var idx   = roiTabs.indexOf(this);
      var total = roiTabs.length;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        roiTabs[(idx + 1) % total].focus();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        roiTabs[(idx - 1 + total) % total].focus();
      }
      // Enter/Space already fires click on buttons — no extra handling needed
    });
  });

  /* ═══════════════════════════════════════════════════════════
     MODULE 8 — POWER BI PLACEHOLDER TOGGLE
     Hides #bi-placeholder once the iframe loads a real src.
     If no src is set on page load, placeholder stays visible.
  ═══════════════════════════════════════════════════════════ */
  var biFrame       = document.getElementById('power-bi-embed');
  var biPlaceholder = document.getElementById('bi-placeholder');

  if (biFrame && biPlaceholder) {
    function checkBiSrc() {
      var src = biFrame.getAttribute('src') || '';
      // A valid URL will not be empty or equal to the page's own href
      var hasRealSrc = src.length > 0 && src !== window.location.href;
      biPlaceholder.style.display = hasRealSrc ? 'none' : '';
    }

    // Check on load
    checkBiSrc();

    // Hide placeholder when iframe finishes loading a real URL
    biFrame.addEventListener('load', function () {
      var src = biFrame.getAttribute('src') || '';
      if (src.length > 0 && src !== window.location.href) {
        biPlaceholder.style.display = 'none';
      }
    });

    // Expose helper so developers can set the src and trigger an update
    window.setMAPowerBIUrl = function (url) {
      biFrame.setAttribute('src', url);
      checkBiSrc();
    };
  }

  /* ═══════════════════════════════════════════════════════════
     MODULE 9 — TOAST NOTIFICATION HELPER
     Exposed on window so your other scripts (e.g. script.js)
     can call it without needing to be inside this IIFE.

     Usage:
       window.MAToast.show('Message here');          // success
       window.MAToast.show('Oops!', 'error');        // error
       window.MAToast.show('Heads up', 'info', 4000); // custom duration
  ═══════════════════════════════════════════════════════════ */
  var toastEl    = document.getElementById('success-toast');
  var toastMsgEl = document.getElementById('toast-msg');
  var toastClose = document.getElementById('toast-close');
  var toastTimer = null;

  function showToast(message, type, duration) {
    if (!toastEl || !toastMsgEl) return;

    type     = type     || 'success';   // 'success' | 'error' | 'info'
    duration = duration || 5000;        // ms before auto-dismiss

    // Reset classes
    toastEl.classList.remove('is-visible', 'is-error', 'is-info');

    // Apply type modifier
    if (type === 'error') toastEl.classList.add('is-error');
    if (type === 'info')  toastEl.classList.add('is-info');

    // Set message and show
    toastMsgEl.textContent = message;
    toastEl.classList.add('is-visible');

    // Auto-dismiss
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, duration);
  }

  function hideToast() {
    if (!toastEl) return;
    toastEl.classList.remove('is-visible');
    clearTimeout(toastTimer);
  }

  if (toastClose) {
    toastClose.addEventListener('click', hideToast);
  }

  // Expose on window
  window.MAToast = { show: showToast, hide: hideToast };

  /* ═══════════════════════════════════════════════════════════
     MODULE 10 — FORM SUBMISSION  (Zapier Webhooks)
     Handles both #contact-form and #subscribe-form.
     • Uses Fetch API with AbortController timeout
     • Double-submit guard via data-submitting attribute
     • Shows toast on success/error via MAToast
     • Throws on non-2xx HTTP status (Zapier can return 4xx)
  ═══════════════════════════════════════════════════════════ */

  /**
   * POST JSON to a Zapier webhook with a hard timeout.
   * Throws on network failure, timeout, or non-2xx HTTP status.
   */
  function postToWebhook(url, payload) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);

    return fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    })
    .then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
    })
    .catch(function (err) {
      clearTimeout(timer);
      throw err; // re-throw so callers can handle
    });
  }

  /**
   * Attaches a submit handler to a form.
   * @param {HTMLFormElement} form
   * @param {string}          webhookUrl
   * @param {string}          successMsg - shown in toast on success
   */
  function bindForm(form, webhookUrl, successMsg) {
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Double-submit guard
      if (form.dataset.submitting) return;
      form.dataset.submitting = '1';

      var submitBtn  = form.querySelector('[type="submit"]');
      var origLabel  = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Sending…';
      }

      // Collect all named fields
      var payload = {};
      var fd = new FormData(form);
      fd.forEach(function (value, key) { payload[key] = value; });

      postToWebhook(webhookUrl, payload)
        .then(function () {
          window.MAToast.show(successMsg, 'success', 6000);
          form.reset();
        })
        .catch(function (err) {
          var isTimeout = err && err.name === 'AbortError';
          var msg = isTimeout
            ? '⚠ Request timed out. Check your connection and try again.'
            : '✕ Something went wrong. Please try again.';
          window.MAToast.show(msg, 'error', 8000);
          console.error('[MA] Form submission error:', err);
        })
        .then(function () {
          // .finally() polyfill — runs after resolve or reject
          delete form.dataset.submitting;
          if (submitBtn) {
            submitBtn.disabled    = false;
            submitBtn.textContent = origLabel;
          }
        });
    });
  }

  // 1. Contact Form with Warm, Personalized Message
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var bizInput = document.getElementById('business-name-input');
      var clientName = bizInput && bizInput.value.trim() !== '' ? bizInput.value : 'there';
      
      var warmMessage = "Hey " + clientName + ", thanks so much for reaching out! A real human from our team will review your details and get back to you within 4 hours. Talk soon!";
      
      // Override the default bindForm behavior to inject the dynamic name
      var submitBtn = contactForm.querySelector('[type="submit"]');
      var origLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      
      var payload = {};
      new FormData(contactForm).forEach(function(v, k) { payload[k] = v; });
      
      postToWebhook(CONTACT_WEBHOOK, payload).then(function() {
        window.MAToast.show(warmMessage, 'success', 7000);
        contactForm.reset();
      }).catch(function() {
        window.MAToast.show('✕ Something went wrong. Please try again.', 'error', 6000);
      }).finally(function() {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origLabel; }
      });
    });
  }

  // 2. Newsletter Form
  bindForm(
    document.getElementById('subscribe-form'),
    SUBSCRIBE_WEBHOOK,
    '✓ You\'re subscribed! Check your inbox for a welcome email.'
  );
})(); 
