// Hands the pointer position from one page to the next, so the custom cursor is
// already there when a page loads instead of appearing on the first mouse move.
//
// Every page owns its own cursor code and starts with the arrow hidden until it
// sees a mousemove. After a click the pointer is usually still, so the new page
// had no arrow (and, on pages that only hide the real cursor once the arrow is
// live, the native cursor showed through). Here the last position is kept in
// sessionStorage and replayed as one ordinary mousemove once the page is ready,
// so each page's existing cursor code runs exactly as if the mouse had moved.
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var KEY = 'khCursorPos';
  var store;
  try { store = window.sessionStorage; } catch (e) { return; }

  var pos = null;     // "x,y" of the latest real mouse move
  var queued = false;

  function save() {
    queued = false;
    try { if (pos) store.setItem(KEY, pos); } catch (e) { /* storage blocked: skip */ }
  }

  document.addEventListener('mousemove', function (e) {
    if (!e.isTrusted) return;   // ignore our own replayed event
    pos = e.clientX + ',' + e.clientY;
    if (!queued) { queued = true; requestAnimationFrame(save); }
  }, { passive: true });

  window.addEventListener('pagehide', save);

  // Pointer left the window: forget it, so the next page does not draw an arrow
  // somewhere the mouse no longer is.
  document.documentElement.addEventListener('mouseleave', function () {
    pos = null;
    try { store.removeItem(KEY); } catch (e) { /* ignore */ }
  });

  var saved;
  try { saved = store.getItem(KEY); } catch (e) { return; }
  if (!saved) return;
  var xy = saved.split(',');
  var x = parseFloat(xy[0]), y = parseFloat(xy[1]);
  if (isNaN(x) || isNaN(y)) return;
  pos = saved;

  function replay() {
    if (x > window.innerWidth || y > window.innerHeight) return;
    var target = document.elementFromPoint(x, y) || document.body;
    target.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
  }

  // Wait until every page script has attached its mousemove listener.
  function ready() { requestAnimationFrame(replay); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
