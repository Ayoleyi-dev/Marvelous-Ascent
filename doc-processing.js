/**
 * ═══════════════════════════════════════════════════════════════
 *  MARVELOUS ASCENT  —  doc-processing.js
 *  All interactivity for automated-document-processing.html
 *
 *  Modules:
 *    1.  Shared utilities (smooth scroll, mobile nav, header)
 *    2.  Dynamic name injection
 *    3.  Scroll reveal (IntersectionObserver)
 *    4.  Stat counter animation
 *    5.  Brand colour picker  ← core feature
 *    6.  Industry simulator   ← core feature
 *    7.  File dropzone UX
 *    8.  POC form handler
 *    9.  Toast notification helper
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     MODULE 1 — SHARED UTILITIES
     (duplicated from ui-scripts.js so this page works standalone)
  ═══════════════════════════════════════════════════════════ */

  /* ── Smooth scroll ─────────────────────────────────────────── */
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
    var hdr    = document.getElementById('site-header');
    var offset = hdr ? hdr.offsetHeight : 64;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset - 12, behavior: 'smooth' });
    closeMobileNav();
  });

  /* ── Mobile nav ────────────────────────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    if (!mobileNav || !mobileNav.classList.contains('is-open')) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (hamburger) {
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      mobileNav.setAttribute('aria-hidden', String(!open));
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
  }

  /* ── Sticky header ─────────────────────────────────────────── */
  var siteHeader = document.getElementById('site-header');
  var lastY = 0;
  if (siteHeader) {
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      siteHeader.classList.toggle('is-scrolled', y > 60);
      if (y > 200) siteHeader.classList.toggle('is-hidden', y > lastY);
      else         siteHeader.classList.remove('is-hidden');
      lastY = y < 0 ? 0 : y;
    }, { passive: true });
  }

  /* ── Scroll reveal ─────────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window && revealEls.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.09, rootMargin: '0px 0px -32px 0px' });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Stat counter ──────────────────────────────────────────── */
  var statEls = document.querySelectorAll('.stat__val[data-count]');

  function animateStat(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var dur = 1400; var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = (Math.round(e * target * 10) / 10) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statEls.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateStat(e.target); so.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { so.observe(el); });
  }


  /* ═══════════════════════════════════════════════════════════
     MODULE 2 — DYNAMIC NAME INJECTION
  ═══════════════════════════════════════════════════════════ */
  var nameInput    = document.getElementById('business-name-input');
  var dynamicSpans = document.querySelectorAll('.dynamic-name');
  var termNameEl   = document.getElementById('term-name');

  // Capture defaults
  dynamicSpans.forEach(function (s) {
    s.dataset.default = s.textContent.trim();
  });

  function updateNames(val) {
    var display = val.trim();
    dynamicSpans.forEach(function (s) {
      s.textContent = display || s.dataset.default || 'your business';
      s.classList.toggle('has-value', !!display);
    });
    if (termNameEl) {
      termNameEl.textContent = display
        ? display.toUpperCase().replace(/\s+/g, '_')
        : 'YOUR_COMPANY';
    }
  }

  if (nameInput) {
    nameInput.addEventListener('input',  function () { updateNames(this.value); });
    nameInput.addEventListener('change', function () { updateNames(this.value); });
  }


  /* ═══════════════════════════════════════════════════════════
     MODULE 3 — TOAST HELPER
     Exposed globally so the POC form can use it.
  ═══════════════════════════════════════════════════════════ */
  var toastEl    = document.getElementById('success-toast');
  var toastMsgEl = document.getElementById('toast-msg');
  var toastClose = document.getElementById('toast-close');
  var toastTimer = null;

  function showToast(msg, type, duration) {
    if (!toastEl || !toastMsgEl) return;
    type     = type     || 'success';
    duration = duration || 5000;
    toastEl.classList.remove('is-visible', 'is-error');
    if (type === 'error') toastEl.classList.add('is-error');
    toastMsgEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, duration);
  }

  if (toastClose) {
    toastClose.addEventListener('click', function () {
      toastEl.classList.remove('is-visible');
      clearTimeout(toastTimer);
    });
  }

  window.MAToast = { show: showToast };


  /* ═══════════════════════════════════════════════════════════
     MODULE 4 — BRAND COLOUR PICKER
     ─────────────────────────────────────────────────────────
     Strategy: the user picks a colour → we update the CSS
     custom property `--green` on :root.  Because every accent
     in the page reads from `--green` (and its derived values
     --green-10, --green-18, --green-glow), the entire theme
     shifts instantly.

     Derived values that also need updating:
       --green-10:   rgba(r,g,b, 0.10)
       --green-18:   rgba(r,g,b, 0.18)
       --green-glow: rgba(r,g,b, 0.24)
       --border:     rgba(r,g,b, 0.17)
       --border-glass: rgba(r,g,b, 0.13)
  ═══════════════════════════════════════════════════════════ */
  var colorPicker    = document.getElementById('brand-color-input');
  var hexDisplay     = document.getElementById('color-hex-display');
  var swatchPreview  = document.getElementById('color-swatch-preview');
  var resetBtn       = document.getElementById('color-reset-btn');
  var presetSwatches = document.querySelectorAll('.preset-swatch');

  var DEFAULT_COLOR  = '#00FF66';
  var root           = document.documentElement;

  /**
   * Convert a hex colour string to an rgb triplet string "r,g,b"
   * Works for both #RGB and #RRGGBB formats.
   */
  function hexToRgbTriplet(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(function (c) { return c + c; }).join('');
    }
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return r + ',' + g + ',' + b;
  }

  /**
   * Apply a hex colour to all relevant CSS variables.
   * Updates root, swatch preview, hex display, and preset states.
   */
  function applyColor(hex) {
    var rgb = hexToRgbTriplet(hex);

    // Core brand colour
    root.style.setProperty('--green',        hex);
    // Derived transparencies
    root.style.setProperty('--green-10',     'rgba(' + rgb + ', 0.10)');
    root.style.setProperty('--green-18',     'rgba(' + rgb + ', 0.18)');
    root.style.setProperty('--green-glow',   'rgba(' + rgb + ', 0.24)');
    root.style.setProperty('--border',       'rgba(' + rgb + ', 0.17)');
    root.style.setProperty('--border-glass', 'rgba(' + rgb + ', 0.13)');

    // Update UI elements
    if (swatchPreview)  swatchPreview.style.background = hex;
    if (hexDisplay)     hexDisplay.textContent = hex.toUpperCase();
    if (colorPicker && colorPicker.value !== hex) colorPicker.value = hex;

    // Mark active preset
    presetSwatches.forEach(function (s) {
      s.classList.toggle('is-active', s.dataset.color.toUpperCase() === hex.toUpperCase());
    });
  }

  // Live update as user drags the colour wheel
  if (colorPicker) {
    colorPicker.addEventListener('input', function () {
      applyColor(this.value);
    });
    // Initialise swatch to default
    applyColor(DEFAULT_COLOR);
  }

  // Reset to default
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      applyColor(DEFAULT_COLOR);
    });
  }

  // Preset swatch clicks
  presetSwatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      applyColor(this.dataset.color);
    });
  });


  /* ═══════════════════════════════════════════════════════════
     MODULE 5 — INDUSTRY SIMULATOR
     ─────────────────────────────────────────────────────────
     Data definitions, raw text, and extracted table output
     are all defined here as plain JS objects.  The DOM is
     only touched when the user interacts — no polling.
  ═══════════════════════════════════════════════════════════ */

  /* ── RAW TEXT CONTENT (per industry) ───────────────────────
     Designed to look authentically messy — different
     delimiters, mixed date formats, abbreviations, typos,
     inconsistent casing. Exactly what real documents look like.
  ─────────────────────────────────────────────────────────── */
  var RAW_CONTENT = {

    healthcare: [
      '<span class="raw-highlight-warn">PATIENT RECORD</span> -- <span class="raw-highlight-dim">Dr. Adeyemi Specialist Clinic, Lagos</span>',
      '<span class="raw-highlight-dim">=========================================</span>',
      'pt name:   <span class="raw-highlight-warn">mrs adaeze c. okonkwo</span>         dob:  <span class="raw-highlight-error">03/14/1978</span>',
      'admsn dt:  <span class="raw-highlight-error">15-JAN-24</span>       ward: <span class="raw-highlight-warn">4B</span>      bed no: <span class="raw-highlight-warn">12</span>',
      '',
      'Dx (primary): <span class="raw-highlight-warn">T2DM / HTN</span>',
      'Dx (secondary): possible CKD stage 2 - <span class="raw-highlight-dim">pending labs</span>',
      '',
      'Medications prescribed:',
      '  - <span class="raw-highlight-warn">Metformin 500mg</span> BD  (x30 days)',
      '  - Lisinopril <span class="raw-highlight-warn">10mg</span> OD',
      '  - Amlodipine 5mg OD <span class="raw-highlight-dim">(see note 3)</span>',
      '',
      'INS prov: <span class="raw-highlight-warn">AXA Mansard</span>    policy#: <span class="raw-highlight-warn">AXM-009234-B</span>',
      'grp mbr: Okonkwo Enterprises Ltd',
      '',
      'Bill = <span class="raw-highlight-error">₦142,500</span>   paid?? <span class="raw-highlight-error">NO</span>    outstanding',
      'cashier: <span class="raw-highlight-dim">AMAKA_USR_04</span>    time: <span class="raw-highlight-error">14:32</span>',
      '',
      'Dr sig: <span class="raw-highlight-warn">Dr. A. Adeyemi</span>  MO  Reg# MDC-44821',
      '<span class="raw-highlight-dim">-- end of record --</span>',
    ].join('\n'),

    ecommerce: [
      '<span class="raw-highlight-error">orderid,custmr,prod,qty,$$,DATE,STATUS,notes</span>',
      '<span class="raw-highlight-dim">// EXPORT FROM WOOCOMMERCE - 24JAN2024 - INCOMPLETE HEADERS</span>',
      '',
      '<span class="raw-highlight-warn">#10291</span>,john doe,blue sneakers size 9,<span class="raw-highlight-warn">1</span>,$89.99,<span class="raw-highlight-error">2024/01/22</span>,shipped,',
      '<span class="raw-highlight-error">ORD-10292 - jane smith - RED HOODIE (M) - 2 @ $45.00 each - Jan 23 2024 - PENDING</span>',
      '<span class="raw-highlight-warn">10293</span>|Mike Johnson|Wireless Headphones|<span class="raw-highlight-warn">1</span>|<span class="raw-highlight-error">129.99</span>|01-24-2024|delivered|gift wrap',
      '10294;\"NGUYEN, LINH\";Yoga Mat (Purple);3;$27.00;Jan 25th;refunded;damaged',
      '<span class="raw-highlight-error">ERR_ROW: 10295 - MISSING CUSTOMER EMAIL - SKIP?</span>',
      '<span class="raw-highlight-warn">#10296</span>,Emeka Eze,USB-C Hub 7-Port,2,<span class="raw-highlight-error">$49.99 ea</span>,26/01/24,processing,bulk discount applied',
      '',
      '<span class="raw-highlight-dim">// NOTE: rows 10290 and 10295 skipped — contact ops</span>',
      '<span class="raw-highlight-dim">// TOTAL ROWS: 8  |  ERRORS: 3  |  DATE: Jan 26 2024</span>',
    ].join('\n'),

    legal: [
      '<span class="raw-highlight-dim">// SCANNED PDF — OCR PRE-PASS — CONFIDENCE 61%</span>',
      '<span class="raw-highlight-error">// MULTIPLE ENCODING ERRORS DETECTED</span>',
      '',
      'SERVÏCE AGR€EMENT &amp; TAX INVOÏCE',
      '<span class="raw-highlight-dim">------------------------------------------</span>',
      'Inv No:   <span class="raw-highlight-warn">MA-INV-2024-0047</span>',
      'Date:     <span class="raw-highlight-error">Januarv 18. 2024</span>  <span class="raw-highlight-dim">&lt;-- OCR error: "v" vs "y", "." vs ","</span>',
      'Due Date: <span class="raw-highlight-error">FEBRTJARY 17 2024</span> <span class="raw-highlight-dim">&lt;-- ligature error</span>',
      '',
      'BILLTO:  <span class="raw-highlight-warn">Greenfield Technologies Ltd</span>',
      'Addr:    22 Wuse Zone 5, <span class="raw-highlight-error">Ab0ja</span> <span class="raw-highlight-dim">&lt;-- "0" vs "u"</span>',
      'RC No:   <span class="raw-highlight-warn">RC-1182044</span>',
      '',
      'SERVICES RENDERED:',
      '  1. BI Dashboard Dev  .............. ₦850,000',
      '  2. Data Pipeline Setup  ........... <span class="raw-highlight-error">N230.000</span> <span class="raw-highlight-dim">&lt;-- period vs comma</span>',
      '  3. Monthly Retainer (3mo)  ......... ₦450,000',
      '',
      'Sub-total:   <span class="raw-highlight-warn">₦1,530,000</span>',
      'VAT (7.5%):  <span class="raw-highlight-error">N114750</span>   <span class="raw-highlight-dim">&lt;-- missing comma + currency prefix</span>',
      'TOTAL DUE:   <span class="raw-highlight-warn">₦1,644,750</span>',
      '',
      'Bank: <span class="raw-highlight-warn">First Bank of Nigeria</span>    Acct: <span class="raw-highlight-warn">3012-884-701</span>',
      'Auth sig: <span class="raw-highlight-dim">[STAMP OBSCURING SIGNATURE]</span>',
    ].join('\n'),
  };

  /* ── EXTRACTED TABLE HTML (per industry) ────────────────────
     Each value is a function that returns an HTML string.
     Using functions means we can dynamically include confidence
     percentages or other derived values.
  ─────────────────────────────────────────────────────────── */
  function confBadge(val, level) {
    return '<span class="conf-badge conf-badge--' + (level || 'high') + '">' + val + '</span>';
  }

  var EXTRACTED_OUTPUT = {

    healthcare: function () {
      var rows = [
        ['Patient Name',      'Mrs. Adaeze C. Okonkwo',                   confBadge('99.8%')],
        ['Date of Birth',     '1978-03-14',                                confBadge('99.9%')],
        ['Admission Date',    '2024-01-15',                                confBadge('100%')],
        ['Ward / Bed',        '4B — Bed 12',                               confBadge('100%')],
        ['Primary Diagnosis', 'Type 2 Diabetes Mellitus, Hypertension',   confBadge('98.7%')],
        ['Secondary Dx',      'Possible CKD Stage 2 (pending labs)',       confBadge('94.1%', 'medium')],
        ['Medications',       'Metformin 500mg BD · Lisinopril 10mg OD · Amlodipine 5mg OD', confBadge('99.1%')],
        ['Insurance Provider','AXA Mansard',                               confBadge('99.6%')],
        ['Policy Number',     'AXM-009234-B',                             confBadge('100%')],
        ['Group Member',      'Okonkwo Enterprises Ltd',                   confBadge('98.4%')],
        ['Billing Amount',    '₦142,500.00',                              confBadge('99.9%')],
        ['Payment Status',    'Unpaid — Outstanding',                      confBadge('97.4%')],
        ['Attending Physician','Dr. A. Adeyemi MO',                       confBadge('99.7%')],
        ['Doctor Reg. No.',   'MDC-44821',                                confBadge('100%')],
      ];

      return buildFieldTable(['Field', 'Extracted Value', 'Confidence'], rows, 14);
    },

    ecommerce: function () {
      var headers = ['Order ID', 'Customer', 'Product', 'Qty', 'Unit Price', 'Date', 'Status'];
      var rows = [
        ['10291', 'John Doe',        'Blue Sneakers (Size 9)',  '1', '$89.99',  '2024-01-22', 'shipped'],
        ['10292', 'Jane Smith',      'Red Hoodie (M)',           '2', '$45.00',  '2024-01-23', 'pending'],
        ['10293', 'Mike Johnson',    'Wireless Headphones',      '1', '$129.99', '2024-01-24', 'delivered'],
        ['10294', 'Linh Nguyen',     'Yoga Mat (Purple)',        '3', '$27.00',  '2024-01-25', 'refunded'],
        ['10296', 'Emeka Eze',       'USB-C Hub 7-Port',         '2', '$49.99',  '2024-01-26', 'processing'],
      ];
      return buildOrderTable(headers, rows);
    },

    legal: function () {
      var rows = [
        ['Invoice Number',   'MA-INV-2024-0047',                          confBadge('100%')],
        ['Invoice Date',     '2024-01-18',                                confBadge('99.2%')],
        ['Due Date',         '2024-02-17',                                confBadge('98.8%')],
        ['Client Name',      'Greenfield Technologies Ltd',               confBadge('99.9%')],
        ['Client Address',   '22 Wuse Zone 5, Abuja, Nigeria',            confBadge('97.6%')],
        ['RC Number',        'RC-1182044',                                confBadge('100%')],
        ['Line Item 1',      'BI Dashboard Development — ₦850,000',      confBadge('99.7%')],
        ['Line Item 2',      'Data Pipeline Setup — ₦230,000',           confBadge('99.1%')],
        ['Line Item 3',      'Monthly Retainer (3 months) — ₦450,000',   confBadge('99.8%')],
        ['Sub-total',        '₦1,530,000.00',                            confBadge('100%')],
        ['VAT (7.5%)',       '₦114,750.00',                              confBadge('99.9%')],
        ['Total Due',        '₦1,644,750.00',                            confBadge('100%')],
        ['Bank',             'First Bank of Nigeria',                     confBadge('99.5%')],
        ['Account Number',   '3012-884-701',                             confBadge('100%')],
      ];
      return buildFieldTable(['Field', 'Extracted Value', 'Confidence'], rows, 14);
    },
  };

  /* Table builders */
  function buildFieldTable(headers, rows, totalFields) {
    var statusClass = { 'shipped': 'status-shipped', 'pending': 'status-pending', 'delivered': 'status-delivered' };
    var html = '<div class="extracted-table-wrap"><table class="extracted-table">';
    html += '<thead><tr>';
    headers.forEach(function (h) { html += '<th>' + h + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      html += '<tr style="animation-delay:' + (i * 0.04) + 's">';
      html += '<td class="field-name">'  + r[0] + '</td>';
      html += '<td class="field-value">' + r[1] + '</td>';
      html += '<td>' + r[2] + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return { html: html, fields: totalFields, confidence: '99.1' };
  }

  function buildOrderTable(headers, rows) {
    var statusClass = { 'shipped': 'status-shipped', 'pending': 'status-pending', 'delivered': 'status-delivered', 'refunded': 'raw-highlight-error', 'processing': '' };
    var html = '<div class="extracted-table-wrap"><table class="extracted-table">';
    html += '<thead><tr>';
    headers.forEach(function (h) { html += '<th>' + h + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      var sc = statusClass[r[6]] || '';
      html += '<tr style="animation-delay:' + (i * 0.06) + 's">';
      html += '<td class="field-value">' + r[0] + '</td>';
      html += '<td>' + r[1] + '</td>';
      html += '<td>' + r[2] + '</td>';
      html += '<td style="text-align:center">' + r[3] + '</td>';
      html += '<td class="field-value">' + r[4] + '</td>';
      html += '<td>' + r[5] + '</td>';
      html += '<td class="' + sc + '" style="text-transform:capitalize">' + r[6] + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return { html: html, fields: 35, confidence: '98.7' };
  }

  /* ── Simulator DOM refs ──────────────────────────────────── */
  var industrySelect   = document.getElementById('industry-select');
  var rawContentEl     = document.getElementById('sim-raw-content');
  var charCountEl      = document.getElementById('sim-char-count');
  var runBtn           = document.getElementById('sim-run-btn');
  var btnText          = document.getElementById('sim-btn-text');
  var btnIcon          = document.getElementById('sim-btn-icon');
  var outputArea       = document.getElementById('sim-output-area');
  var outputEmpty      = document.getElementById('sim-output-empty');
  var outputBadge      = document.getElementById('output-badge');
  var outputMeta       = document.getElementById('sim-output-meta');
  var metaFields       = document.getElementById('meta-fields');
  var metaTime         = document.getElementById('meta-time');
  var simOverlay       = document.getElementById('sim-processing-overlay');
  var simConfidence    = document.getElementById('sim-confidence');
  var confBar          = document.getElementById('sim-conf-bar');
  var confPct          = document.getElementById('sim-conf-pct');

  var stepEls  = [1, 2, 3, 4].map(function (n) { return document.getElementById('step-' + n); });
  var stepStat = [1, 2, 3, 4].map(function (n) { return document.getElementById('s' + n + '-status'); });

  var isRunning  = false;
  var hasResults = false;

  /* Load raw content for the currently selected industry */
  function loadRawContent(industry) {
    if (!rawContentEl) return;
    rawContentEl.innerHTML = RAW_CONTENT[industry] || '';
    var plain = (RAW_CONTENT[industry] || '').replace(/<[^>]+>/g, '');
    if (charCountEl) charCountEl.textContent = plain.length + ' chars — messy';
    // Reset output area if we switch industry after a run
    if (hasResults) resetOutput();
  }

  function resetOutput() {
    hasResults = false;
    if (outputArea) {
      outputArea.innerHTML = '';
      if (outputEmpty) {
        outputEmpty.style.display = '';
        outputArea.appendChild(outputEmpty);
      }
    }
    if (outputBadge)   { outputBadge.textContent = 'AWAITING INPUT'; outputBadge.className = 'sim-panel__badge sim-panel__badge--ok'; }
    if (outputMeta)      outputMeta.style.display = 'none';
    if (simConfidence)   simConfidence.setAttribute('aria-hidden', 'true');
    if (confBar)         confBar.style.width = '0%';
    if (confPct)         confPct.textContent = '0%';
  }

  // Initialise on load
  if (industrySelect) {
    loadRawContent(industrySelect.value);

    industrySelect.addEventListener('change', function () {
      loadRawContent(this.value);
    });
  }

  /* Processing step sequencer */
  function runStepSequence(callback) {
    var timings = [380, 650, 980, 1380]; // ms when each step completes
    var labels  = ['✓ Done', '✓ Done', '✓ Done', '✓ Done'];

    // Reset all steps
    stepEls.forEach(function (el, i) {
      if (!el) return;
      el.classList.remove('is-running', 'is-done');
      if (stepStat[i]) stepStat[i].textContent = '—';
    });

    // Start first step immediately
    if (stepEls[0]) stepEls[0].classList.add('is-running');
    if (stepStat[0]) stepStat[0].textContent = '...';

    timings.forEach(function (t, i) {
      setTimeout(function () {
        // Complete step i
        if (stepEls[i])  { stepEls[i].classList.remove('is-running'); stepEls[i].classList.add('is-done'); }
        if (stepStat[i])   stepStat[i].textContent = labels[i];

        // Start step i+1
        if (i < stepEls.length - 1 && stepEls[i + 1]) {
          stepEls[i + 1].classList.add('is-running');
          if (stepStat[i + 1]) stepStat[i + 1].textContent = '...';
        }

        // After last step fires, wait a beat then call back
        if (i === timings.length - 1) {
          setTimeout(callback, 200);
        }
      }, t);
    });
  }

  /* Main run handler */
  if (runBtn) {
    runBtn.addEventListener('click', function () {
      if (isRunning) return;
      var industry = industrySelect ? industrySelect.value : 'healthcare';
      var result   = EXTRACTED_OUTPUT[industry];
      if (!result) return;

      isRunning = true;
      runBtn.disabled = true;
      btnText.textContent = 'Processing…';

      // Show overlay
      if (simOverlay) {
        simOverlay.classList.add('is-active');
        simOverlay.removeAttribute('aria-hidden');
      }

      var startTime = Date.now();

      runStepSequence(function () {
        var elapsed = Date.now() - startTime;

        // Hide overlay
        if (simOverlay) {
          simOverlay.classList.remove('is-active');
          simOverlay.setAttribute('aria-hidden', 'true');
        }

        // Build output
        var data = result();
        if (outputEmpty) outputEmpty.style.display = 'none';
        if (outputArea)  outputArea.innerHTML = data.html;

        // Update badges & meta
        if (outputBadge) {
          outputBadge.textContent = 'EXTRACTED';
          outputBadge.className   = 'sim-panel__badge sim-panel__badge--ok';
        }
        if (outputMeta)  outputMeta.style.display = 'flex';
        if (metaFields)  metaFields.textContent   = data.fields + ' fields';
        if (metaTime)    metaTime.textContent      = elapsed + 'ms';

        // Animate confidence bar
        if (simConfidence) {
          simConfidence.removeAttribute('aria-hidden');
          setTimeout(function () {
            if (confBar) confBar.style.width = data.confidence + '%';
            if (confPct) confPct.textContent  = data.confidence + '%';
          }, 60);
        }

        // Restore button
        runBtn.disabled     = false;
        btnText.textContent = 'Run Again';
        isRunning           = false;
        hasResults          = true;
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════
     MODULE 6 — FILE DROPZONE UX
     Handles drag-and-drop, file selection display, and removal.
  ═══════════════════════════════════════════════════════════ */
  var dropzone      = document.getElementById('file-dropzone');
  var fileInput     = document.getElementById('poc-file');
  var fileDropzoneUI = document.getElementById('file-dropzone-ui');
  var fileSelected   = document.getElementById('file-selected');
  var fileSelName    = document.getElementById('file-selected-name');
  var fileSelSize    = document.getElementById('file-selected-size');
  var fileRemoveBtn  = document.getElementById('file-remove');

  function formatBytes(bytes) {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function showFileSelected(file) {
    if (!fileDropzoneUI || !fileSelected) return;
    fileDropzoneUI.style.display = 'none';
    fileSelected.style.display   = 'flex';
    if (fileSelName) fileSelName.textContent = file.name;
    if (fileSelSize) fileSelSize.textContent = formatBytes(file.size);
  }

  function clearFileSelection() {
    if (!fileDropzoneUI || !fileSelected || !fileInput) return;
    fileInput.value      = '';
    fileSelected.style.display   = 'none';
    fileDropzoneUI.style.display = 'flex';
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      if (this.files && this.files[0]) showFileSelected(this.files[0]);
    });
  }

  if (fileRemoveBtn) {
    fileRemoveBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // Don't re-open file dialog
      clearFileSelection();
    });
  }

  /* Drag-and-drop */
  if (dropzone) {
    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault(); this.classList.add('is-dragover');
    });
    ['dragleave', 'dragend'].forEach(function (ev) {
      dropzone.addEventListener(ev, function () { this.classList.remove('is-dragover'); });
    });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault(); this.classList.remove('is-dragover');
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files[0] && fileInput) {
        // Create a DataTransfer to assign to the input
        try {
          var dt = new DataTransfer();
          dt.items.add(files[0]);
          fileInput.files = dt.files;
        } catch (_) { /* DataTransfer not supported — fallback silently */ }
        showFileSelected(files[0]);
      }
    });

    // Keyboard: Enter/Space opens file picker
    dropzone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (fileInput) fileInput.click();
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════
     MODULE 7 — POC UPLOAD FORM HANDLER
     Note: file upload requires a real backend endpoint.
     This handler collects metadata and shows a toast.
     Swap the fetch URL for your actual upload API later.
  ═══════════════════════════════════════════════════════════ */
  var pocForm   = document.getElementById('poc-upload-form');
  var pocSubmit = document.getElementById('poc-submit');
  var pocBtnTxt = document.getElementById('poc-btn-text');

  if (pocForm) {
    pocForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (pocForm.dataset.submitting) return;

      // Basic client-side validation
      var name    = pocForm.querySelector('#poc-name');
      var email   = pocForm.querySelector('#poc-email');
      var doctype = pocForm.querySelector('#poc-doctype');
      var file    = pocForm.querySelector('#poc-file');

      if (!name  || !name.value.trim())    { name.focus();    return; }
      if (!email || !email.value.trim())   { email.focus();   return; }
      if (!doctype || !doctype.value)      { doctype.focus(); return; }
      if (!file  || !file.files.length)    {
        showToast('Please attach a document before submitting.', 'error', 6000);
        if (dropzone) dropzone.focus();
        return;
      }

      pocForm.dataset.submitting = '1';
      if (pocSubmit) pocSubmit.classList.add('is-loading');
      if (pocBtnTxt) pocBtnTxt.textContent = 'Uploading securely…';

      /*
       * TODO: Replace this simulated delay with your actual upload fetch:
       *
       * var fd = new FormData(pocForm);
       * fetch('YOUR_UPLOAD_ENDPOINT', { method: 'POST', body: fd })
       *   .then(function(res) { ... })
       *   .catch(function(err) { ... });
       */
      setTimeout(function () {
        showToast('✓ Document received! Check your inbox within 24 hours for your custom Power BI dashboard.', 'success', 8000);
        pocForm.reset();
        clearFileSelection();
        delete pocForm.dataset.submitting;
        if (pocSubmit) pocSubmit.classList.remove('is-loading');
        if (pocBtnTxt) pocBtnTxt.textContent = 'Send My Document for Free Extraction →';
      }, 1800);
    });
  }

})(); // ← end IIFE
