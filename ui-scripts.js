/**
 * ═══════════════════════════════════════════════════════════════
 * MARVELOUS ASCENT  —  ui-scripts.js
 * Pure Vanilla JS front-end interactivity (No libraries).
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  var CONTACT_WEBHOOK   = 'https://hook.eu1.make.com/5f8wrs6km9trssp355wh6xhiu544qnyz';
  var SUBSCRIBE_WEBHOOK = 'https://hook.eu1.make.com/9dwcriyxkyo8e27i8dg9cgzd3a4lfgac';
  var FETCH_TIMEOUT_MS  = 15000;

  /* ═══════════════════════════════════════════════════════════
     DYNAMIC NAMES & CUSTOMIZER
  ═══════════════════════════════════════════════════════════ */
  var nameInput = document.getElementById('business-name-input');
  var dynamicSpans = document.querySelectorAll('.dynamic-name');
  var termName = document.getElementById('term-name');

  dynamicSpans.forEach(function (span) { span.dataset.default = span.textContent.trim(); });

  function updateDynamicNames(value) {
    var display = value.trim();
    dynamicSpans.forEach(function (span) {
      if (display) { span.textContent = display; span.classList.add('has-value'); } 
      else { span.textContent = span.dataset.default || 'your business'; span.classList.remove('has-value'); }
    });
    if (termName) termName.textContent = display ? display.toUpperCase().replace(/\s+/g, '_') : 'YOUR_COMPANY';
  }

  if (nameInput) {
    nameInput.addEventListener('input', function () { 
      updateDynamicNames(this.value); 
      SessionManager.saveCustomization('businessName', this.value);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     THEME TOGGLER (Light/Dark Mode)
  ═══════════════════════════════════════════════════════════ */
  var themeToggles = document.querySelectorAll('.theme-toggle');
  var rootEl = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'light') {
      rootEl.setAttribute('data-theme', 'light');
      themeToggles.forEach(function(btn) { btn.textContent = '🌙'; });
      localStorage.setItem('ma_theme', 'light');
    } else {
      rootEl.removeAttribute('data-theme');
      themeToggles.forEach(function(btn) { btn.textContent = '☀️'; });
      localStorage.setItem('ma_theme', 'dark');
    }
  }

  var savedTheme = localStorage.getItem('ma_theme');
  if (savedTheme) applyTheme(savedTheme);

  themeToggles.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var current = rootEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(current);
    });
  });

  /* ═══════════════════════════════════════════════════════════
     COLOR PICKERS
  ═══════════════════════════════════════════════════════════ */
  var primaryPicker = document.getElementById('primary-color-input');
  var secondaryPicker = document.getElementById('secondary-color-input');

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return r + ',' + g + ',' + b;
  }

  function updatePrimary(hex) {
    if (!hex) return;
    var rgb = hexToRgb(hex);
    rootEl.style.setProperty('--green', hex);
    rootEl.style.setProperty('--green-10', 'rgba(' + rgb + ', 0.10)');
    rootEl.style.setProperty('--green-18', 'rgba(' + rgb + ', 0.18)');
    rootEl.style.setProperty('--green-glow', 'rgba(' + rgb + ', 0.24)');
    rootEl.style.setProperty('--border-glass', 'rgba(' + rgb + ', 0.13)');
    SessionManager.saveCustomization('primaryColor', hex);
  }

  function updateSecondary(hex) {
    if (!hex) return;
    rootEl.style.setProperty('--orange', hex);
    rootEl.style.setProperty('--orange-12', 'rgba(' + hexToRgb(hex) + ', 0.12)');
    SessionManager.saveCustomization('secondaryColor', hex);
  }

  if (primaryPicker) {
    primaryPicker.addEventListener('input', function() { updatePrimary(this.value); });
  }
  if (secondaryPicker) {
    secondaryPicker.addEventListener('input', function() { updateSecondary(this.value); });
  }

  /* ═══════════════════════════════════════════════════════════
     CUSTOM CURSOR
  ═══════════════════════════════════════════════════════════ */
  var cursorDot = document.getElementById('cursor-dot');
  var cursorOutline = document.getElementById('cursor-outline');
  if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
    var mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px';
    });
    function animateCursor() {
      outlineX += (mouseX - outlineX) * 0.15; outlineY += (mouseY - outlineY) * 0.15;
      cursorOutline.style.left = outlineX + 'px'; cursorOutline.style.top = outlineY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    document.querySelectorAll('a, button, input, textarea, .svc-card, .pow-card').forEach(function(el) {
      el.addEventListener('mouseenter', function() { cursorOutline.classList.add('is-hovering'); });
      el.addEventListener('mouseleave', function() { cursorOutline.classList.remove('is-hovering'); });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     UI UTILS: SCROLL, NAV, REVEAL, TABS, STATS
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor || anchor.closest('.user-menu')) return;
    var targetId = anchor.getAttribute('href');
    if (targetId === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    var offset = document.getElementById('site-header').offsetHeight || 64;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset - 12, behavior: 'smooth' });
    closeMobileNav();
  });

  var hamburger = document.getElementById('hamburger'), mobileNav = document.getElementById('mobile-nav');
  function closeMobileNav() { if (mobileNav && mobileNav.classList.contains('is-open')) { mobileNav.classList.remove('is-open'); hamburger.classList.remove('is-open'); } }
  if (hamburger) { hamburger.addEventListener('click', function () { mobileNav.classList.toggle('is-open'); hamburger.classList.toggle('is-open'); }); }

  var header = document.getElementById('site-header'), lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 60);
    if (y > 200) { header.classList.toggle('is-hidden', y > lastY); } else { header.classList.remove('is-hidden'); }
    lastY = y < 0 ? 0 : y;
  }, { passive: true });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal-up').forEach(function (el) { revealObserver.observe(el); });

  document.querySelectorAll('.roi-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var ind = this.dataset.industry;
      document.querySelectorAll('.roi-tab').forEach(function(t) { t.classList.toggle('roi-tab--active', t.dataset.industry === ind); });
      document.querySelectorAll('.roi-card').forEach(function(c) { delete c.dataset.active; });
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        document.querySelectorAll('.roi-card').forEach(function(c) { if(c.dataset.industry === ind) c.dataset.active = ''; });
      });});
    });
  });

  function animateStat(el) {
    var target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', start = null;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / 1400, 1), eased = 1 - Math.pow(1 - prog, 3);
      el.textContent = (Math.round(eased * target * 10) / 10) + suffix;
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var statObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if(e.isIntersecting) { animateStat(e.target); statObs.unobserve(e.target); }});
  });
  document.querySelectorAll('.stat__val[data-count]').forEach(function(el) { statObs.observe(el); });

  /* ═══════════════════════════════════════════════════════════
     TOAST NOTIFICATIONS
  ═══════════════════════════════════════════════════════════ */
  var toastEl = document.getElementById('success-toast'), toastMsgEl = document.getElementById('toast-msg'), toastTimer;
  window.MAToast = {
    show: function(msg, type, dur) {
      toastEl.className = 'success-toast';
      if(type) toastEl.classList.add('is-' + type);
      toastMsgEl.textContent = msg;
      toastEl.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function(){ toastEl.classList.remove('is-visible'); }, dur || 5000);
    }
  };
  document.getElementById('toast-close').addEventListener('click', function() { toastEl.classList.remove('is-visible'); });

  /* ═══════════════════════════════════════════════════════════
     SESSION MANAGER & AUTH MODAL
  ═══════════════════════════════════════════════════════════ */
  var SessionManager = {
    user: null,
    init: function() {
      try { this.user = JSON.parse(localStorage.getItem('ma_session')); } catch(e){}
      this.render(); this.loadCustom();
    },
    save: function(u) { this.user = u; localStorage.setItem('ma_session', JSON.stringify(u)); this.render(); },
    logout: function() { this.user = null; localStorage.removeItem('ma_session'); this.render(); window.MAToast.show('Logged out', 'success', 3000); },
    render: function() {
      var authC = document.getElementById('auth-container');
      var uplC = document.getElementById('uploads');
      if (!authC) return;
      if (this.user) {
        authC.innerHTML = '<div class="user-menu"><button class="user-menu__trigger" id="usr-btn"><span class="user-avatar">' + this.user.name.charAt(0) + '</span><span class="user-name">' + this.user.name + '</span> ▾</button><div class="user-menu__dropdown" id="usr-drop" hidden><button class="user-menu__item user-menu__item--danger" id="logout-btn">Sign Out</button></div></div>';
        document.getElementById('usr-btn').addEventListener('click', function(e){ e.stopPropagation(); var d=document.getElementById('usr-drop'); d.hidden = !d.hidden; });
        document.addEventListener('click', function(){ var d=document.getElementById('usr-drop'); if(d) d.hidden = true; });
        document.getElementById('logout-btn').addEventListener('click', function(){ SessionManager.logout(); });
        if(uplC) uplC.style.display = 'block';
      } else {
        authC.innerHTML = '<button class="nav-link nav-link--cta" id="login-trigger">Sign In →</button>';
        document.getElementById('login-trigger').addEventListener('click', function(){ AuthModal.open(); });
        if(uplC) uplC.style.display = 'none';
      }
    },
    saveCustomization: function(k, v) {
      try { var c = JSON.parse(localStorage.getItem('ma_custom')||'{}'); c[k] = v; localStorage.setItem('ma_custom', JSON.stringify(c)); } catch(e){}
    },
    loadCustom: function() {
      try {
        var c = JSON.parse(localStorage.getItem('ma_custom')||'{}');
        if (c.businessName && document.getElementById('business-name-input')) { document.getElementById('business-name-input').value = c.businessName; updateDynamicNames(c.businessName); }
        if (c.primaryColor && document.getElementById('primary-color-input')) { document.getElementById('primary-color-input').value = c.primaryColor; updatePrimary(c.primaryColor); }
        if (c.secondaryColor && document.getElementById('secondary-color-input')) { document.getElementById('secondary-color-input').value = c.secondaryColor; updateSecondary(c.secondaryColor); }
      } catch(e){}
    }
  };

  var AuthModal = {
    init: function() {
      if(document.getElementById('auth-modal')) return;
      var m = document.createElement('div'); m.id = 'auth-modal'; m.className = 'modal';
      m.innerHTML = '<div class="modal__overlay" data-close></div><div class="modal__content"><button class="modal__close" data-close>✕</button><div class="auth-tabs"><button class="auth-tab auth-tab--active">Sign In</button></div><form id="auth-form" class="auth-form"><div class="field"><label>Your Name</label><input type="text" id="auth-name" required></div><button type="submit" class="btn btn--primary btn--full">Continue →</button></form></div>';
      document.body.appendChild(m);
      m.addEventListener('click', function(e){ if(e.target.matches('[data-close]')) m.classList.remove('is-open'); });
      document.getElementById('auth-form').addEventListener('submit', function(e){
        e.preventDefault();
        var n = document.getElementById('auth-name').value;
        SessionManager.save({name: n});
        m.classList.remove('is-open');
        window.MAToast.show('Welcome, ' + n + '!', 'success');
      });
    },
    open: function() { document.getElementById('auth-modal').classList.add('is-open'); }
  };

  /* ═══════════════════════════════════════════════════════════
     WEBHOOKS FOR FORMS
  ═══════════════════════════════════════════════════════════ */
  function bindForm(form, webhookUrl, successMsg) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.dataset.submitting) return;
      form.dataset.submitting = '1';
      var submitBtn = form.querySelector('[type="submit"]'), origLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      
      var payload = {}; new FormData(form).forEach(function (v, k) { payload[k] = v; });
      var ctrl = new AbortController(), timer = setTimeout(function(){ ctrl.abort(); }, FETCH_TIMEOUT_MS);
      
      fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal })
      .then(function(r){ clearTimeout(timer); if(!r.ok) throw new Error('HTTP'); window.MAToast.show(successMsg, 'success'); form.reset(); })
      .catch(function(e){ clearTimeout(timer); window.MAToast.show('✕ Error sending. Try again.', 'error'); })
      .finally(function(){ delete form.dataset.submitting; if(submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origLabel; } });
    });
  }

  var cForm = document.getElementById('contact-form');
  if(cForm) {
    cForm.addEventListener('submit', function(e) {
      var n = document.getElementById('business-name-input'), nVal = (n && n.value.trim()) ? n.value : 'there';
      bindForm(cForm, CONTACT_WEBHOOK, "Hey " + nVal + ", thanks! We'll reply within 4 hours.");
    });
  }
  bindForm(document.getElementById('subscribe-form'), SUBSCRIBE_WEBHOOK, '✓ Subscribed!');

  /* Initialize Data */
  document.addEventListener('DOMContentLoaded', function() {
    SessionManager.init();
    AuthModal.init();
    
    // Live Dashboard Mock Data Loop
    var pEl = document.getElementById('mock-pipeline'), lEl = document.getElementById('mock-leads'), cEl = document.getElementById('mock-conversion'), uEl = document.getElementById('last-updated');
    if(pEl) {
      setInterval(function() {
        pEl.textContent = '$' + (1.24 + (Math.random()-0.5)*0.08).toFixed(2) + 'M';
        lEl.textContent = 842 + Math.floor((Math.random()-0.5)*20);
        cEl.textContent = (24.8 + (Math.random()-0.5)*1.5).toFixed(1) + '%';
        uEl.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }, 5000);
    }
  });

})();
