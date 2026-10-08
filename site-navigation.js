/* Lightweight interactions shared by the static service catalogue pages. */
(() => {
  const key = 'ma_theme';
  const root = document.documentElement;
  const toggle = document.querySelector('.ma-theme');
  let initial = 'dark';
  try {initial = localStorage.getItem(key) === 'light' ? 'light' : 'dark';} catch (_) {}
  function apply(theme) {
    root.setAttribute('data-theme',theme);
    if (toggle) {
      toggle.setAttribute('aria-pressed',String(theme==='light'));
      toggle.setAttribute('aria-label',theme==='light'?'Switch to dark theme':'Switch to light theme');
    }
  }
  apply(initial);
  if (toggle) toggle.addEventListener('click',()=>{
    const next=root.getAttribute('data-theme')==='light'?'dark':'light';
    apply(next);
    try {localStorage.setItem(key,next);} catch (_) {}
  });
  // Native <details> keeps navigation usable even without JavaScript.
  const menu = document.querySelector('.ma-mobile-menu');
  if (menu) {
    menu.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => { menu.open = false; });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary')?.focus();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }
})();
