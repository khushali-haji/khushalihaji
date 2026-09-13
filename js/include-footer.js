// Injects the shared site footer into <div id="footer-placeholder"></div>.
// Derives the includes path from this script's own URL, so it works both in
// local preview and on GitHub Pages regardless of where the site is mounted.
(function () {
  var s = document.currentScript;
  var base = s ? s.src.replace(/js\/[^/]*$/, '') : '/khushalihaji/';
  fetch(base + 'includes/footer.html?v=6')
    .then(function (response) { return response.text(); })
    .then(function (html) {
      var ph = document.getElementById('footer-placeholder');
      if (!ph) return;
      ph.innerHTML = html;
      var footer = ph.querySelector('.site-footer');
      if (!footer) return;

      // Pages can override the default "Let's make something" heading via
      // data-heading on the placeholder (e.g. the homepage's own greeting).
      if (ph.dataset.heading) {
        var heading = footer.querySelector('#sfHeading');
        if (heading) {
          heading.innerHTML = ph.dataset.heading;
          if (ph.dataset.headingClass) heading.classList.add(ph.dataset.headingClass);
        }
      }

      // "Home" defaults to the actual homepage, resolved relative to this
      // script's own location (same trick as `base` above) so it works from
      // any page depth and any mount point — not just the GitHub Pages path.
      // The homepage itself points "Home" elsewhere via data-home-label/-href
      // (e.g. at the About page), since linking home to itself is useless.
      var homeLink = footer.querySelector('#sfHomeLink');
      if (homeLink) {
        homeLink.textContent = ph.dataset.homeLabel || 'Home';
        homeLink.href = ph.dataset.homeHref || (base + 'index.html');
      }

      // Email button copies the address instead of handing off to a mail client.
      var emailBtn = footer.querySelector('#sf-email-btn');
      if (emailBtn) {
        var resetTimer;
        emailBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var email = 'khushali.haji@gmail.com';
          if (!(navigator.clipboard && navigator.clipboard.writeText)) {
            window.location.href = emailBtn.href;
            return;
          }
          navigator.clipboard.writeText(email).then(function () {
            emailBtn.textContent = emailBtn.dataset.copied;
            clearTimeout(resetTimer);
            resetTimer = setTimeout(function () {
              emailBtn.textContent = emailBtn.dataset.label;
            }, 1800);
          }).catch(function () {
            window.location.href = emailBtn.href;
          });
        });
      }

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
