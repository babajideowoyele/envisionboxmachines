/* ==========================================================================
   theme.js — light/dark for every page

   Load it in <head> with `defer` omitted so the stored theme is applied
   before first paint; otherwise the page flashes the wrong theme.

     <script src="theme.js"></script>

   Any element with id="themeBtn" becomes the toggle. Pages without one still
   get the correct theme, they just cannot switch it.

   Order of preference:
     1. what the visitor last chose here (localStorage)
     2. their operating system setting (prefers-color-scheme)
     3. light
   ========================================================================== */
(function () {
  var KEY = 'ebox-theme';
  var html = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function systemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // apply immediately — this runs before <body> exists, so no flash
  var initial = stored() || (systemDark() ? 'dark' : 'light');
  html.setAttribute('data-theme', initial);

  function isDark() { return html.getAttribute('data-theme') === 'dark'; }

  function sync() {
    var btn = document.getElementById('themeBtn');
    if (!btn) return;
    var d = isDark();
    btn.setAttribute('aria-pressed', String(d));
    btn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
    // an icon rather than a glyph: ☀/☾ render differently on every platform
    btn.innerHTML = '<svg class="ico ico-sm" aria-hidden="true"><use href="#'
                  + (d ? 'i-moon' : 'i-sun') + '"/></svg>';
  }

  function set(theme) {
    html.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    sync();
  }

  function wire() {
    var btn = document.getElementById('themeBtn');
    if (btn && !btn.dataset.themeWired) {
      btn.dataset.themeWired = '1';
      btn.addEventListener('click', function () { set(isDark() ? 'light' : 'dark'); });
    }
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }

  // follow the OS only while the visitor has not made a choice here
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) {
      if (!stored()) { html.setAttribute('data-theme', e.matches ? 'dark' : 'light'); sync(); }
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();
