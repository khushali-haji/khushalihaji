// Injects the shared site footer into <div id="footer-placeholder"></div>.
// Derives the includes path from this script's own URL, so it works both in
// local preview and on GitHub Pages regardless of where the site is mounted.
(function () {
  var s = document.currentScript;
  var base = s ? s.src.replace(/js\/[^/]*$/, '') : '/khushalihaji/';
  fetch(base + 'includes/footer.html?v=2')
    .then(function (response) { return response.text(); })
    .then(function (html) {
      var ph = document.getElementById('footer-placeholder');
      if (!ph) return;
      ph.innerHTML = html;
      var footer = ph.querySelector('.site-footer');
      if (!footer) return;
      if (!('IntersectionObserver' in window)) { footer.classList.add('in'); return; }
      // Reveal (slide up) when the footer scrolls into view, retract (slide down)
      // when it scrolls back out, so the motion reverses with scroll direction.
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          footer.classList.toggle('in', e.isIntersecting);
        });
      }, { threshold: 0.12 });
      io.observe(footer);
    })
    .catch(function () { /* footer is non-critical; fail quietly */ });
})();
