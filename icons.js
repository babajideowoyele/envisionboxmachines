/* ==========================================================================
   icons.js — make the pictogram sprite available to dynamic content

   Why this exists.

   `<use href="icons.svg#i-time">` works for icons that are in the HTML when
   the page loads, and silently fails for any element created afterwards:
   the browser resolves an external sprite during the initial parse and does
   not re-resolve it later. The element still gets its CSS box, so it takes up
   space and looks fine to a size check — it just paints nothing.

   That matters here because most surfaces render from data: the module cards,
   the event list, the assistant, the theme toggle. All of them would have
   shipped invisible icons.

   So the sprite is fetched once and inlined into the document. After that a
   same-document reference — `<use href="#i-time">` — resolves for anything,
   whenever it is created, because same-document references stay live.

   Load it in <head>, before anything that renders icons:
       <script src="icons.js"></script>

   Always reference icons as "#i-name", never "icons.svg#i-name".
   ========================================================================== */
(function () {
  var SRC = 'icons.svg';
  var MARKER = 'ebox-icon-sprite';
  if (document.getElementById(MARKER)) return;

  function inject(text) {
    if (document.getElementById(MARKER)) return;
    var host = document.createElement('div');
    host.id = MARKER;
    host.setAttribute('aria-hidden', 'true');
    // out of flow, but not display:none — Safari will not resolve <use>
    // against a sprite in a display:none subtree
    host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    host.innerHTML = text;
    var first = document.body.firstChild;
    if (first) document.body.insertBefore(host, first);
    else document.body.appendChild(host);
  }

  function load() {
    fetch(SRC, { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (t) {
        if (!t) return;
        // Strip comments first. The sprite's own header documents usage with
        // an example <svg class="ico">...</svg>, and a naive match would grab
        // that instead of the real root — injecting the documentation as
        // markup, which then renders as one blank icon on every page.
        var clean = t.replace(/<!--[\s\S]*?-->/g, '');
        var m = clean.match(/<svg[\s\S]*<\/svg>/i);
        if (m) inject(m[0]);
      })
      .catch(function () { /* icons are decoration; never break the page */ });
  }

  if (document.body) load();
  else document.addEventListener('DOMContentLoaded', load);
})();
