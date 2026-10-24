/* Word rays — hover (or tap) a word and short labels fan out from it on elbow
   connectors, drawn on a fixed full-viewport canvas. Same behaviour as the
   homepage tagline, but configured per page instead of hard-wired to its markup.

   WordRays.init({
     canvas,            // <canvas> fixed over the page: draws the cards
     linesCanvas,       // optional <canvas> fixed UNDER the page content: draws the connectors,
                        // so they come out from behind the words and their highlights
     triggers,          // elements with a data-key matching a key in `data`
     data: {            // one entry per trigger key
       [key]: { labels: ['…'], color, shadow, fonts: [{ f, w, style, size, upper? }] }
     },
     coarse,            // true (or a function returning true) while touch is in use: tap to open instead of hover
     bodyClass,         // added to <body> while open, so the page can fade itself
     introFor,          // optional { [key]: 'screen-reader intro: ' }
     layout             // optional () => saved layout (see below), or null for automatic
   });

   Saved layout (js/role-layout.js):
     { designPx, minWidth, cardScale, roles: { [key]: { items: [{ ax, ay, tx, ty, dir, route }] } } }
   Every position is an offset from the CENTRE OF ITS WORD, in ems of that word's font
   size (ax/ay = where the connector leaves the word, tx/ty = where it meets the card).
   Cards scale with the same ratio, so the whole composition is one rigid unit pinned to
   the word: it doesn't depend on the viewport's height, and it scales smoothly with the
   heading across desktop and landscape tablets. Below `minWidth` wide or `minHeight` tall (phones,
   including on their side), or when a role has no saved layout, the automatic layout is used.

   Returns { collapse }.
*/
(function () {
  'use strict';

  var EDGE = 24;        // min distance from a label to the viewport edge (automatic layout)
  var TOP_SAFE = 28;    // the nav hides while a role is open
  var BOTTOM_SAFE = 24;
  var G0 = 80;          // length of the shortest stem above/below the word
  var ELBOW = 34;       // horizontal run from the stem's turn to the card
  var SIDE_LEN = 46;    // length of a side stem
  var PAD_X = 11, PAD_Y = 5;
  var SHADOW = 3;       // hard offset shadow, like the site's cards
  var DESIGN_PX = 42;   // heading size the card sizes are authored at
  var CARD = '#faf8f4';
  var LINE_COL = 'rgba(34,28,20,0.5)';

  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function init(opts) {
    var canvas = opts.canvas;
    var ctx = canvas.getContext('2d');
    var lctx = opts.linesCanvas ? opts.linesCanvas.getContext('2d') : ctx;
    var triggers = Array.prototype.slice.call(opts.triggers);
    var data = opts.data;
    // true when the person is using touch: tap to open instead of hover. A function so it can
    // follow the input they are using right now (finger or mouse), not just the device at load.
    function isTap() { return typeof opts.coarse === 'function' ? !!opts.coarse() : !!opts.coarse; }
    var bodyClass = opts.bodyClass || 'ray-active';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var DURATION = reduce ? 1 : 820;

    var animFrame, activeKey = null, rayProgress = 0, animDir = 0, rays = [], lastTime = null;
    var hoverBounds = null;
    var viewW = window.innerWidth, viewH = window.innerHeight;
    var anchorScrollY = 0;

    function savedLayout() { return typeof opts.layout === 'function' ? opts.layout() : null; }

    // ─── Canvas ───────────────────────────────────────────────────────────────

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      canvas.style.width = viewW + 'px';
      canvas.style.height = viewH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (opts.linesCanvas) {
        var lc = opts.linesCanvas;
        lc.width = canvas.width; lc.height = canvas.height;
        lc.style.width = viewW + 'px'; lc.style.height = viewH + 'px';
        lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    resize();
    window.addEventListener('resize', function () { resize(); if (activeKey) refresh(); });

    function setFont(f) { ctx.font = f.style + ' ' + f.w + ' ' + f.size + 'px ' + f.f; }

    // Canvas text only uses a web font once it has loaded; ask for each one up front
    if (document.fonts && document.fonts.load) {
      Object.keys(data).forEach(function (k) {
        data[k].fonts.forEach(function (f) {
          document.fonts.load(f.style + ' ' + f.w + ' ' + f.size + 'px ' + f.f).catch(function () { });
        });
      });
    }

    // ─── Shared geometry ──────────────────────────────────────────────────────

    // The word's box at rest, in viewport coordinates, with no animation or nudge on it
    function measureWord(key) {
      var el = triggers.filter(function (t) { return t.dataset.key === key; })[0];
      if (!el) return null;

      var prevAnim = el.style.animation, prevTransform = el.style.transform, prevTransition = el.style.transition;
      el.style.transition = 'none';
      el.style.animation = 'none';
      el.style.transform = 'none';
      var r = el.getBoundingClientRect();
      el.style.transition = prevTransition;
      el.style.animation = prevAnim;
      el.style.transform = prevTransform;

      // Strip the hover padding so connectors start at the text, not its hit-box
      var cs = getComputedStyle(el);
      var padX = parseFloat(cs.paddingLeft) || 0;
      var padY = parseFloat(cs.paddingTop) || 0;
      var F = parseFloat(cs.fontSize) || 32;
      return {
        el: el, r: r, F: F,
        cx: r.left + r.width * 0.5,
        cy: r.top + r.height * 0.5,
        hw: Math.max(1, r.width * 0.5 - padX),
        hh: Math.max(1, Math.min(r.height * 0.5 - padY, F * 0.5))
      };
    }

    // One card per label, all the same height so the connectors step evenly. `s` scales
    // type, padding and shadow together.
    function measureItems(key, s) {
      var cfg = data[key];
      var fs = cfg.labels.map(function (_, i) {
        var f = cfg.fonts[i % cfg.fonts.length];
        return s === 1 ? f : Object.assign({}, f, { size: f.size * s });
      });
      var boxH = Math.max.apply(null, fs.map(function (f) { return f.size; })) * 1.3 + PAD_Y * 2 * s;
      return cfg.labels.map(function (text, i) {
        var f = fs[i];
        var shown = f.upper ? text.toUpperCase() : text;
        setFont(f);
        var pad = PAD_X * s;
        return {
          idx: i, text: shown, font: f, s: s, pad: pad, shadow: SHADOW * Math.max(0.75, s),
          w: ctx.measureText(shown).width + pad * 2, h: boxH
        };
      });
    }

    // Work out the path and card box from an item's anchor, attach point, side and route.
    //   route 'v': straight out of the word, one turn, then into the card
    //   route 'h': across, a vertical hop halfway, then into the card (two turns)
    function finalize(it) {
      var a = it.anchor, t = it.attach;
      it.bx = it.dir > 0 ? t.x : t.x - it.w;
      it.end = { x: t.x + it.dir * 8 * it.s, y: t.y };   // ends underneath the card, no end cap
      var pts = [a];
      if (it.route === 'h') {
        var mx = (a.x + it.end.x) / 2;
        pts.push({ x: mx, y: a.y }, { x: mx, y: t.y });
      } else {
        pts.push({ x: a.x, y: t.y });
      }
      pts.push(it.end);
      // drop points that sit on top of their neighbour so a straight run stays straight
      it.path = pts.filter(function (p, i) {
        return i === 0 || Math.abs(p.x - pts[i - 1].x) > 0.5 || Math.abs(p.y - pts[i - 1].y) > 0.5;
      });
      it.len = 0;
      for (var i = 1; i < it.path.length; i++) {
        it.len += Math.hypot(it.path[i].x - it.path[i - 1].x, it.path[i].y - it.path[i - 1].y);
      }
      return it;
    }

    // ─── Saved layout ─────────────────────────────────────────────────────────

    function configItems(key, m, all, role) {
      var s = clamp(m.F / (all.designPx || DESIGN_PX), 0.6, 1.3) * (all.cardScale || 1);
      // Narrower windows (portrait tablets): keep every card where it is relative to its
      // connector, but pull it in towards the word and make it a little smaller so the
      // whole composition fits the screen.
      var compact = viewW < (all.compactBelow || 900);
      var pull = compact ? (all.compactPull || 0.7) : 1;
      if (compact) s *= all.compactScale || 0.88;
      return measureItems(key, s).map(function (it, i) {
        var c = role.items[i];
        var ax = m.cx + c.ax * m.F, ay = m.cy + c.ay * m.F;
        it.anchor = { x: ax, y: ay };
        it.attach = { x: ax + (m.cx + c.tx * m.F - ax) * pull, y: ay + (m.cy + c.ty * m.F - ay) * pull };
        it.dir = c.dir > 0 ? 1 : -1;
        it.route = c.route === 'h' ? 'h' : 'v';
        if (compact) {
          // never let a card leave the screen
          var left = it.dir > 0 ? it.attach.x : it.attach.x - it.w;
          var dx = clamp(left, EDGE * 0.6, viewW - EDGE * 0.6 - it.w) - left;
          it.attach.x += dx;
          it.attach.y = clamp(it.attach.y, it.h / 2 + 12, viewH - it.h / 2 - 12);
        }
        return finalize(it);
      });
    }

    // ─── Automatic layout ─────────────────────────────────────────────────────
    // Labels leave the word on straight stems: stacked above and below it as a
    // butterfly (longest stems in the middle, labels flagging outward), plus one
    // straight out each side where nothing else is in the way.

    function autoItems(key, m) {
      var cx = m.cx, cy = m.cy, hw = m.hw, hh = m.hh;

      // A side is open when no other role sits on the same line in that direction
      var leftOpen = true, rightOpen = true;
      triggers.forEach(function (o) {
        if (o === m.el) return;
        var q = o.getBoundingClientRect();
        if (Math.abs((q.top + q.height / 2) - cy) > m.r.height * 0.6) return;
        if (q.left + q.width / 2 < cx) leftOpen = false; else rightOpen = false;
      });

      var N = data[key].labels.length;
      var narrow = viewW < 600;                 // phones: tighter, smaller stickers
      var g0 = narrow ? 22 : G0;
      var topEdge = cy - hh, botEdge = cy + hh;

      // Try to place everything at this scale; null if it can't fit the viewport
      function place(scale) {
        var items = measureItems(key, scale);
        var maxH = Math.max.apply(null, items.map(function (it) { return it.h; }));
        var step = maxH + (narrow ? 8 : 24);

        // Side slots first (one label each), only where there is clear room
        var rightRoom = viewW - (cx + hw) - EDGE - SIDE_LEN;
        var leftRoom = (cx - hw) - EDGE - SIDE_LEN;
        var order = items.slice();
        var rightItem = null, leftItem = null;
        if (rightOpen && N > 4) {
          var ri = order.findIndex(function (it) { return it.w + 8 <= rightRoom; });
          if (ri >= 0) rightItem = order.splice(ri, 1)[0];
        }
        if (leftOpen && N > 4) {
          var li = order.findIndex(function (it) { return it.w + 8 <= leftRoom; });
          if (li >= 0) leftItem = order.splice(li, 1)[0];
        }

        // Rest split between top and bottom. Try an even split first, then shift labels
        // to whichever side has more room until everything fits on screen.
        var m2 = order.length;
        var splits = [];
        for (var n = 0; n <= m2; n++) splits.push(n);
        splits.sort(function (x, y) { return Math.abs(x - m2 / 2) - Math.abs(y - m2 / 2) || y - x; });

        function attempt(nTop) {
          var top = order.slice(0, nTop), bot = order.slice(nTop);
          var out = [];

          // Preferred: a butterfly, labels flagging outward from the middle so the longest
          // stems sit in the centre and only ceil(k/2) tiers are needed. If that runs off
          // the screen, fall back to a one-way staircase.
          function cluster(list, sign) {
            var k = list.length;
            if (!k) return true;
            var span = hw * 0.78;
            var maxW = Math.max.apply(null, list.map(function (it) { return it.w; }));
            function spread(lo, hi) {
              return list.map(function (_, i) { return k === 1 ? (lo + hi) / 2 : lo + (hi - lo) * (i / (k - 1)); });
            }
            function fits(it, x, d) { return d > 0 ? x + ELBOW + it.w <= viewW - EDGE : x - ELBOW - it.w >= EDGE; }
            var kl = Math.floor(k / 2);
            var butterfly = list.map(function (_, i) { return i < kl ? { d: -1, t: i } : { d: 1, t: k - 1 - i }; });
            var flagRight = list.map(function (_, i) { return { d: 1, t: k - 1 - i }; });
            var flagLeft = list.map(function (_, i) { return { d: -1, t: i }; });
            var full = spread(cx - span, cx + span);
            var cands = [{ xs: full, p: butterfly }, { xs: full, p: flagRight }, { xs: full, p: flagLeft }];
            // Squeezed along the word so every card clears the screen edge (narrow phones):
            // all flag right when the word sits on the left, all flag left when it sits on the right
            var wl = cx - hw + 6, wr = cx + hw - 6;
            var rHi = Math.min(wr, viewW - EDGE - ELBOW - maxW);
            if (rHi >= wl && (k === 1 || (rHi - wl) / (k - 1) >= 10)) cands.push({ xs: spread(wl, rHi), p: flagRight });
            var lLo = Math.max(wl, EDGE + ELBOW + maxW);
            if (wr >= lLo && (k === 1 || (wr - lLo) / (k - 1) >= 10)) cands.push({ xs: spread(lLo, wr), p: flagLeft });
            var plan = cands.filter(function (c) {
              return list.every(function (it, i) { return fits(it, c.xs[i], c.p[i].d); });
            })[0];
            if (!plan) return false;
            var xs = plan.xs;
            plan = plan.p;
            list.forEach(function (it, i) {
              var ey = sign < 0 ? topEdge : botEdge;
              var dy = ey + sign * (g0 + plan[i].t * step);
              it.dir = plan[i].d;
              it.route = 'v';
              it.anchor = { x: xs[i], y: ey };
              it.attach = { x: xs[i] + it.dir * ELBOW, y: dy };
              out.push(it);
            });
            return true;
          }
          if (!cluster(top, -1) || !cluster(bot, 1)) return null;

          if (rightItem) {
            rightItem.dir = 1; rightItem.route = 'h';
            rightItem.anchor = { x: cx + hw, y: cy };
            rightItem.attach = { x: cx + hw + SIDE_LEN, y: cy };
            out.push(rightItem);
          }
          if (leftItem) {
            leftItem.dir = -1; leftItem.route = 'h';
            leftItem.anchor = { x: cx - hw, y: cy };
            leftItem.attach = { x: cx - hw - SIDE_LEN, y: cy };
            out.push(leftItem);
          }
          // nothing may leave the viewport (the fallback staircase can need more tiers)
          var inside = out.every(function (it) {
            return it.attach.y - it.h / 2 >= TOP_SAFE && it.attach.y + it.h / 2 <= viewH - BOTTOM_SAFE;
          });
          return inside ? out : null;
        }

        for (var si = 0; si < splits.length; si++) {
          var res = attempt(splits[si]);
          if (res) return res;
        }
        return null;
      }

      var placed = null;
      for (var scale = narrow ? 0.8 : 1; scale >= 0.5; scale -= 0.06) {
        placed = place(scale);
        if (placed) break;
      }
      return (placed || []).map(finalize);
    }

    // ─── Build ────────────────────────────────────────────────────────────────

    function buildRays(key) {
      var m = measureWord(key);
      if (!m) return [];
      var all = savedLayout();
      var role = all && all.roles && all.roles[key];
      var useSaved = role && role.items && role.items.length === data[key].labels.length &&
        viewW >= (all.minWidth || 700) && viewH >= (all.minHeight || 520);
      var items = useSaved ? configItems(key, m, all, role) : autoItems(key, m);

      // Box around the word and every label, padded so the cursor can travel out to
      // read a label; the composition only collapses once it leaves this region.
      var bL = m.cx - m.hw, bR = m.cx + m.hw, bT = m.cy - m.hh, bB = m.cy + m.hh;
      items.forEach(function (it) {
        bL = Math.min(bL, it.bx, it.anchor.x);
        bR = Math.max(bR, it.bx + it.w, it.anchor.x);
        bT = Math.min(bT, it.attach.y - it.h / 2, it.anchor.y);
        bB = Math.max(bB, it.attach.y + it.h / 2, it.anchor.y);
      });
      var padB = 50;
      hoverBounds = { left: bL - padB, right: bR + padB, top: bT - padB, bottom: bB + padB };
      return items;
    }

    function refresh() {
      if (!activeKey) return;
      anchorScrollY = window.scrollY;   // rebuilt from the word's rect as it is now
      rays = buildRays(activeKey);
      drawRays(rayProgress);
    }

    // ─── Drawing ──────────────────────────────────────────────────────────────

    function drawRays(progress) {
      ctx.clearRect(0, 0, viewW, viewH);
      if (lctx !== ctx) lctx.clearRect(0, 0, viewW, viewH);
      if (!rays.length || progress <= 0) return;
      var p = Math.min(progress, 1);
      var cfg = data[activeKey];

      ctx.save();
      ctx.translate(0, anchorScrollY - window.scrollY); // stay pinned to the word as the page scrolls
      if (lctx !== ctx) { lctx.save(); lctx.translate(0, anchorScrollY - window.scrollY); }

      rays.forEach(function (it, i) {
        var stagger = (i / rays.length) * 0.30;
        var rawP = Math.max(0, Math.min(1, (p - stagger) / (1 - stagger * 0.5)));
        if (rawP <= 0) return;
        var e = easeOutExpo(rawP);

        // Connector: straight out of the word, rounded turn(s), into the card
        var pts = it.path;
        lctx.save();
        lctx.strokeStyle = LINE_COL;
        lctx.lineWidth = 1.25;
        lctx.lineCap = 'round';
        lctx.lineJoin = 'round';
        lctx.setLineDash([it.len * e, it.len + 10]);
        lctx.beginPath();
        lctx.moveTo(pts[0].x, pts[0].y);
        for (var k = 1; k < pts.length - 1; k++) {
          var r = Math.min(8, Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y) / 2,
            Math.hypot(pts[k + 1].x - pts[k].x, pts[k + 1].y - pts[k].y) / 2);
          lctx.arcTo(pts[k].x, pts[k].y, pts[k + 1].x, pts[k + 1].y, Math.max(0, r));
        }
        lctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        lctx.stroke();
        lctx.restore();

        // Label card, wiped open outward from its connector (no fade)
        var bx = it.bx, by = it.attach.y - it.h / 2, sh = it.shadow;
        var reveal = (it.w + sh + 2) * e;
        ctx.save();
        ctx.beginPath();
        if (it.dir > 0) ctx.rect(bx - 1, by - 2, reveal + 1, it.h + sh + 4);
        else ctx.rect(bx + it.w + sh + 2 - reveal, by - 2, reveal, it.h + sh + 4);
        ctx.clip();

        ctx.fillStyle = cfg.shadow || cfg.color;
        ctx.fillRect(bx + sh, by + sh, it.w, it.h);
        ctx.fillStyle = CARD;
        ctx.fillRect(bx, by, it.w, it.h);
        ctx.strokeStyle = 'rgba(24,21,18,0.85)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, it.w - 1, it.h - 1);

        setFont(it.font);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillStyle = cfg.color;
        ctx.fillText(it.text, bx + it.pad, it.attach.y + 1);
        ctx.restore();
      });

      ctx.restore();
      if (lctx !== ctx) lctx.restore();
    }

    // ─── Animation ────────────────────────────────────────────────────────────

    function animate(ts) {
      if (!lastTime) lastTime = ts;
      var dt = ts - lastTime;
      lastTime = ts;

      if (animDir === 1) rayProgress = Math.min(1, rayProgress + dt / DURATION);
      else if (animDir === -1) rayProgress = Math.max(0, rayProgress - dt / DURATION);

      drawRays(rayProgress);

      if ((animDir === 1 && rayProgress < 1) || (animDir === -1 && rayProgress > 0)) {
        animFrame = requestAnimationFrame(animate);
      } else if (animDir === -1 && rayProgress <= 0) {
        ctx.clearRect(0, 0, viewW, viewH);
        if (lctx !== ctx) lctx.clearRect(0, 0, viewW, viewH);
        rays = []; activeKey = null;
        document.body.classList.remove(bodyClass);
        triggers.forEach(function (w) { w.classList.remove('active', 'dimmed'); });
      }
    }

    function startExpand(key) {
      cancelAnimationFrame(animFrame);
      activeKey = key;
      anchorScrollY = window.scrollY;
      rays = buildRays(key);
      animDir = 1;
      lastTime = null;
      animFrame = requestAnimationFrame(animate);
    }

    function startRetract() {
      cancelAnimationFrame(animFrame);
      animDir = -1;
      lastTime = null;
      animFrame = requestAnimationFrame(animate);
    }

    window.addEventListener('scroll', function () { if (activeKey) drawRays(rayProgress); }, { passive: true });

    function collapse() {
      triggers.forEach(function (w) { w.setAttribute('aria-expanded', 'false'); });
      startRetract();
    }

    // Screen readers can't see the canvas, so mirror the labels into a live region
    var live = document.createElement('div');
    live.className = 'sr-only';
    live.setAttribute('aria-live', 'polite');
    triggers[triggers.length - 1].parentNode.appendChild(live);

    function activateWord(el) {
      var key = el.dataset.key;
      startExpand(key);
      triggers.forEach(function (w) { w.setAttribute('aria-expanded', String(w === el)); });
      live.textContent = ((opts.introFor && opts.introFor[key]) || '') + data[key].labels.join(', ') + '.';
      document.body.classList.add(bodyClass);
      triggers.forEach(function (w) {
        w.classList.toggle('active', w === el);
        w.classList.toggle('dimmed', w !== el);
      });
    }

    // ─── Input ────────────────────────────────────────────────────────────────

    triggers.forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (activeKey === el.dataset.key) collapse(); else activateWord(el);
        } else if (e.key === 'Escape' && activeKey) {
          collapse();
        }
      });
      el.addEventListener('blur', function () {
        if (activeKey === el.dataset.key && !el.matches(':hover')) {
          setTimeout(function () { if (triggers.indexOf(document.activeElement) < 0) collapse(); }, 0);
        }
      });
    });

    // Touch: tap a word to open it, tap it again (or anywhere else) to close.
    // Mouse: hover opens it, and it stays open until the cursor leaves the composition.
    // Both are wired up and each checks which one is in use when the event fires.
    triggers.forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (!isTap()) return;
        e.stopPropagation();
        if (activeKey === el.dataset.key) { collapse(); return; }
        activateWord(el);
      });
      el.addEventListener('mouseenter', function () { if (!isTap()) activateWord(el); });
    });
    document.addEventListener('click', function () { if (isTap() && activeKey) collapse(); });

    // Stay open while the cursor is anywhere inside the composition's padded box
    document.addEventListener('mousemove', function (e) {
      if (isTap() || !activeKey || animDir === -1 || !hoverBounds) return;
      var offY = anchorScrollY - window.scrollY;
      var outside =
        e.clientX < hoverBounds.left || e.clientX > hoverBounds.right ||
        e.clientY < hoverBounds.top + offY || e.clientY > hoverBounds.bottom + offY;
      if (outside) collapse();
    });

    return { collapse: collapse };
  }

  window.WordRays = { init: init };
})();
