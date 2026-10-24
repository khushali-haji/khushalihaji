/* Fine-tune board for the About page heading, its hover labels and connectors.

   Open the About page with  ?tune=1  and a panel appears. Pick a role, then drag its
   cards (dashed boxes) and connector start points (dots) into place, or nudge them
   with the arrow keys (Shift = 10px, Alt = 0.25px). The heading itself can be dragged
   and resized too. Everything saves in this browser as you go. When it looks right,
   press "Copy config" and paste the result back to Claude (or into js/role-layout.js).

   Positions are saved as offsets from the centre of each role word, in ems of its font
   size, so they follow the heading instead of the viewport: the composition stays put
   when the window height changes and scales with the heading across desktop and
   landscape-tablet widths. See the notes at the top of js/word-rays.js.
*/
(function () {
  'use strict';

  var STORE = 'roleLayoutTune:v1';
  var BASE_TITLE = { vw: 3.3, max: 42, dx: 0, dy: 0, gap: 0 };

  function round3(v) { return Math.round(v * 1000) / 1000; }
  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'style') n.style.cssText = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  function init(o) {
    var api = o.api, keys = o.keys, data = o.data, titleEl = o.titleEl;

    // ─── State ──────────────────────────────────────────────────────────────

    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) { }
    var cfg = saved || copy(o.base || {});
    cfg.designPx = cfg.designPx || 42;
    cfg.minWidth = cfg.minWidth || 700;
    cfg.cardScale = cfg.cardScale || 1;
    cfg.title = Object.assign({}, BASE_TITLE, cfg.title || {});
    cfg.roles = cfg.roles || {};
    window.ROLE_LAYOUT_LIVE = cfg;

    function ensureRoles() {
      keys.forEach(function (k) {
        var r = cfg.roles[k];
        if (!r || !r.items || r.items.length !== data[k].labels.length) {
          cfg.roles[k] = { items: api.autoLayout(k) };
        }
      });
    }

    var role = keys[0], sel = 0, part = 'card', snap = 1;

    function persist() { try { localStorage.setItem(STORE, JSON.stringify(cfg)); } catch (e) { } }
    function changed() {
      persist();
      if (window.applyRoleTitle) window.applyRoleTitle(cfg.title);
      api.refresh();
      syncFields();
    }

    // ─── Styles ─────────────────────────────────────────────────────────────

    document.head.appendChild(el('style', {
      text: [
        '#rt-panel{position:fixed;top:0;bottom:0;width:330px;z-index:100001;background:#1c1c1e;color:#f2f2f7;font:12px/1.45 -apple-system,system-ui,sans-serif;overflow:auto;padding:12px 14px 40px;box-shadow:0 0 30px rgba(0,0,0,.35);cursor:auto}',
        '#rt-panel.right{right:0}#rt-panel.left{left:0}#rt-panel.min{bottom:auto;width:auto;padding-bottom:12px;border-radius:0 0 0 10px}',
        '#rt-panel.min .rt-body{display:none}',
        '#rt-panel h3{margin:14px 0 6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8e8e93;font-weight:600}',
        '#rt-panel button{font:inherit;color:#f2f2f7;background:#3a3a3c;border:0;border-radius:6px;padding:5px 9px;cursor:pointer}',
        '#rt-panel button.on{background:#0a84ff}#rt-panel button.warn{background:#ff9f0a;color:#000}',
        '#rt-panel input,#rt-panel textarea{font:inherit;color:#f2f2f7;background:#2c2c2e;border:1px solid #48484a;border-radius:6px;padding:4px 6px;width:100%}',
        '#rt-panel textarea{height:140px;font:11px/1.4 ui-monospace,Menlo,monospace}',
        '.rt-row{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0}',
        '.rt-grid{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:6px 8px;align-items:center}',
        '.rt-grid label{color:#8e8e93}',
        '.rt-note{color:#8e8e93;margin:4px 0}',
        '.rt-bad{color:#ff9f0a}',
        '.cursor-arrow{z-index:2147483000 !important}',   // the site's cursor stays visible over the board
        '#rt-layer{position:fixed;inset:0;pointer-events:none;z-index:100000}',
        '.rt-card{position:absolute;pointer-events:auto;cursor:grab;outline:1.5px dashed #0a84ff;background:rgba(10,132,255,.07);touch-action:none}',
        '.rt-card.sel{outline:2px solid #ff9f0a;background:rgba(255,159,10,.14)}',
        '.rt-card b{position:absolute;left:-1px;top:-17px;background:#0a84ff;color:#fff;font:600 10px/1 -apple-system,system-ui,sans-serif;padding:3px 5px;border-radius:3px}',
        '.rt-card.sel b{background:#ff9f0a;color:#000}',
        '.rt-dot{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid #0a84ff;background:#fff;pointer-events:auto;cursor:grab;touch-action:none}',
        '.rt-dot.sel{border-color:#ff9f0a;background:#ff9f0a}',
        '.rt-title{position:absolute;pointer-events:auto;cursor:move;outline:1.5px dashed #30d158;touch-action:none}',
        '.rt-title b{position:absolute;right:0;bottom:-17px;background:#30d158;color:#000;font:600 10px/1 -apple-system,system-ui,sans-serif;padding:3px 5px;border-radius:3px}'
      ].join('\n')
    }));

    // ─── Panel ──────────────────────────────────────────────────────────────

    var panel = el('div', { id: 'rt-panel', 'class': 'right' });
    var layer = el('div', { id: 'rt-layer' });
    document.body.appendChild(layer);
    document.body.appendChild(panel);

    var fields = {};
    function num(id, step) {
      var i = el('input', { type: 'number', step: step || '0.01' });
      i.addEventListener('input', function () { onField(id, parseFloat(i.value)); });
      fields[id] = i;
      return i;
    }
    function lab(t) { return el('label', { text: t }); }

    var readout = el('div', { 'class': 'rt-note' });
    var warn = el('div', { 'class': 'rt-note rt-bad' });
    var roleRow = el('div', { 'class': 'rt-row' });
    var itemRow = el('div', { 'class': 'rt-row' });
    var partRow = el('div', { 'class': 'rt-row' });
    var out = el('textarea', { spellcheck: 'false', placeholder: 'Press "Copy config" to fill this in.' });

    function button(text, fn, cls) { return el('button', { text: text, 'class': cls || '', onclick: fn }); }

    var snapInput = el('input', { type: 'number', step: '1', value: '1', min: '1' });
    snapInput.addEventListener('input', function () { snap = Math.max(1, parseFloat(snapInput.value) || 1); });

    var dock = button('Dock left', function () {
      var right = panel.classList.contains('right');
      panel.classList.toggle('right', !right);
      panel.classList.toggle('left', right);
      dock.textContent = right ? 'Dock right' : 'Dock left';
    });
    var mini = button('Minimise', function () {
      panel.classList.toggle('min');
      mini.textContent = panel.classList.contains('min') ? 'Expand' : 'Minimise';
    });

    var body = el('div', { 'class': 'rt-body' }, [
      readout, warn,
      el('h3', { text: 'Role' }), roleRow,
      el('h3', { text: 'Label (click a card on the page too)' }), itemRow,
      el('h3', { text: 'Selected label' }),
      el('div', { 'class': 'rt-grid' }, [
        lab('Card X'), num('tx'), lab('Card Y'), num('ty'),
        lab('Start X'), num('ax'), lab('Start Y'), num('ay')
      ]),
      el('div', { 'class': 'rt-note', text: 'Card X/Y is where the connector meets the card; Start X/Y is where it leaves the word. All in ems from the word\'s centre.' }),
      partRow,
      el('div', { 'class': 'rt-row' }, [
        button('◀', function () { nudge(-1, 0, false); }), button('▲', function () { nudge(0, -1, false); }),
        button('▼', function () { nudge(0, 1, false); }), button('▶', function () { nudge(1, 0, false); }),
        el('span', { text: 'or arrow keys · Shift 10px · Alt 0.25px', 'class': 'rt-note', style: 'align-self:center' })
      ]),
      el('div', { 'class': 'rt-row' }, [
        button('Flip card side', function () { cur().dir = -cur().dir; changed(); }),
        button('Elbow: turn once ↔ twice', function () { cur().route = cur().route === 'h' ? 'v' : 'h'; changed(); }),
        button('Reset this label', function () {
          var a = api.autoLayout(role)[sel];
          Object.assign(cur(), { ax: a.ax, ay: a.ay, tx: a.tx, ty: a.ty, dir: a.dir, route: a.route });
          changed();
        })
      ]),
      el('div', { 'class': 'rt-grid' }, [lab('Snap (px)'), snapInput, lab(''), lab('')]),

      el('h3', { text: 'Heading (or drag the green box)' }),
      el('div', { 'class': 'rt-grid' }, [
        lab('Size vw'), num('t.vw', '0.1'), lab('Max px'), num('t.max', '1'),
        lab('Move X'), num('t.dx'), lab('Move Y'), num('t.dy'),
        lab('Role gap'), num('t.gap'), lab(''), lab('')
      ]),
      el('div', { 'class': 'rt-note', text: 'Move and gap are in ems of the heading size.' }),

      el('h3', { text: 'Whole composition' }),
      el('div', { 'class': 'rt-grid' }, [
        lab('Card scale'), num('cardScale'), lab('Use below px'), num('minWidth', '10')
      ]),
      el('div', { 'class': 'rt-note', text: 'Under that width the automatic layout takes over (phones).' }),

      el('h3', { text: 'Save' }),
      el('div', { 'class': 'rt-row' }, [
        button('Copy config', copyConfig, 'on'),
        button('Reseed this role from auto', function () { cfg.roles[role] = { items: api.autoLayout(role) }; sel = 0; changed(); buildItems(); }, 'warn'),
        button('Forget saved edits', function () {
          if (confirm('Throw away your saved edits in this browser and reload?')) { localStorage.removeItem(STORE); location.href = location.pathname + '?tune=1'; }
        }, 'warn')
      ]),
      out
    ]);

    panel.appendChild(el('div', { 'class': 'rt-row', style: 'justify-content:space-between;align-items:center' }, [
      el('b', { text: 'Fine-tune board', style: 'font-size:13px' }),
      el('span', {}, [dock, document.createTextNode(' '), mini])
    ]));
    panel.appendChild(body);

    function cur() { return cfg.roles[role].items[sel]; }

    function buildRoles() {
      roleRow.textContent = '';
      keys.forEach(function (k) {
        roleRow.appendChild(button(k, function () { role = k; sel = 0; api.open(k); buildRoles(); buildItems(); syncFields(); }, k === role ? 'on' : ''));
      });
    }
    function buildItems() {
      itemRow.textContent = '';
      cfg.roles[role].items.forEach(function (it, i) {
        itemRow.appendChild(button((i + 1) + ' ' + data[role].labels[i], function () { sel = i; buildItems(); syncFields(); }, i === sel ? 'on' : ''));
      });
      partRow.textContent = '';
      ['card', 'anchor'].forEach(function (p) {
        partRow.appendChild(button('Nudge the ' + (p === 'card' ? 'card' : 'start point'), function () { part = p; buildItems(); }, part === p ? 'on' : ''));
      });
    }

    function onField(id, v) {
      if (isNaN(v)) return;
      if (id.indexOf('t.') === 0) cfg.title[id.slice(2)] = v;
      else if (id === 'cardScale' || id === 'minWidth') cfg[id] = v;
      else cur()[id] = v;
      persist();
      if (window.applyRoleTitle) window.applyRoleTitle(cfg.title);
      api.refresh();
    }

    function syncFields() {
      var c = cur();
      ['tx', 'ty', 'ax', 'ay'].forEach(function (k) { if (document.activeElement !== fields[k]) fields[k].value = round3(c[k]); });
      ['vw', 'max', 'dx', 'dy', 'gap'].forEach(function (k) { if (document.activeElement !== fields['t.' + k]) fields['t.' + k].value = cfg.title[k]; });
      ['cardScale', 'minWidth'].forEach(function (k) { if (document.activeElement !== fields[k]) fields[k].value = cfg[k]; });
      var m = api.metrics();
      if (m) {
        var s = Math.max(0.6, Math.min(1.3, m.F / cfg.designPx)) * cfg.cardScale;
        readout.textContent = 'Window ' + m.viewW + '×' + m.viewH + ' · heading ' + round3(m.F) + 'px · card scale ' + round3(s) +
          (c ? ' · card at ' + Math.round(c.tx * m.F) + ',' + Math.round(c.ty * m.F) + 'px from the word centre' : '');
        warn.textContent = m.saved ? '' : 'At this window size (under ' + cfg.minWidth + 'px wide or ' + (cfg.minHeight || 520) + 'px tall) the automatic layout is shown, not your saved one. Enlarge the window to edit.';
      }
    }

    function serialize() {
      var L = [];
      L.push('window.ROLE_LAYOUT = {');
      L.push('  designPx: ' + cfg.designPx + ',');
      L.push('  minWidth: ' + cfg.minWidth + ',');
      L.push('  cardScale: ' + cfg.cardScale + ',');
      L.push('  title: ' + JSON.stringify(cfg.title) + ',');
      L.push('  roles: {');
      keys.forEach(function (k, ki) {
        L.push('    ' + k + ': { items: [');
        cfg.roles[k].items.forEach(function (it, i, arr) {
          var o2 = { label: data[k].labels[i], ax: round3(it.ax), ay: round3(it.ay), tx: round3(it.tx), ty: round3(it.ty), dir: it.dir, route: it.route };
          L.push('      ' + JSON.stringify(o2) + (i < arr.length - 1 ? ',' : ''));
        });
        L.push('    ] }' + (ki < keys.length - 1 ? ',' : ''));
      });
      L.push('  }');
      L.push('};');
      return L.join('\n');
    }

    function copyConfig() {
      var t = serialize();
      out.value = t;
      out.select();
      var done = function () { try { document.execCommand('copy'); } catch (e2) { } };
      try { navigator.clipboard.writeText(t).catch(done); } catch (e) { done(); }
    }

    // ─── Moving things ──────────────────────────────────────────────────────

    function move(part2, dxPx, dyPx, F) {
      var c = cur(), kx = part2 === 'card' ? 'tx' : 'ax', ky = part2 === 'card' ? 'ty' : 'ay';
      c[kx] = round3(c[kx] + dxPx / F);
      c[ky] = round3(c[ky] + dyPx / F);
    }
    function nudge(dx, dy, big, fine) {
      var m = api.metrics(); if (!m) return;
      var step = fine ? 0.25 : (big ? 10 : 1);
      move(part, dx * step, dy * step, m.F);
      changed();
    }
    document.addEventListener('keydown', function (e) {
      if (/^(INPUT|TEXTAREA|BUTTON)$/.test(e.target.tagName)) return;
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d) return;
      e.preventDefault();
      nudge(d[0], d[1], e.shiftKey, e.altKey);
    });

    // Drag a handle: converts the pointer's travel to ems from the word's centre
    function drag(handle, getPart, idx) {
      handle.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        sel = idx; part = getPart(); buildItems(); syncFields();
        var m = api.metrics(); if (!m) return;
        var c = cur(), kx = part === 'card' ? 'tx' : 'ax', ky = part === 'card' ? 'ty' : 'ay';
        var sx = e.clientX, sy = e.clientY, ox = c[kx] * m.F, oy = c[ky] * m.F;
        handle.setPointerCapture(e.pointerId);
        function mv(ev) {
          var nx = ox + (ev.clientX - sx), ny = oy + (ev.clientY - sy);
          nx = Math.round(nx / snap) * snap; ny = Math.round(ny / snap) * snap;
          if (ev.shiftKey) { if (Math.abs(ev.clientX - sx) > Math.abs(ev.clientY - sy)) ny = oy; else nx = ox; }
          c[kx] = round3(nx / m.F); c[ky] = round3(ny / m.F);
          changed();
        }
        function up() { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); }
        handle.addEventListener('pointermove', mv);
        handle.addEventListener('pointerup', up);
      });
    }

    // Heading drag
    var titleBox = el('div', { 'class': 'rt-title' }, [el('b', { text: 'heading' })]);
    layer.appendChild(titleBox);
    titleBox.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var F = parseFloat(getComputedStyle(titleEl).fontSize) || 42;
      var sx = e.clientX, sy = e.clientY, ox = cfg.title.dx, oy = cfg.title.dy;
      titleBox.setPointerCapture(e.pointerId);
      function mv(ev) {
        cfg.title.dx = round3(ox + (ev.clientX - sx) / F);
        cfg.title.dy = round3(oy + (ev.clientY - sy) / F);
        changed();
      }
      function up() { titleBox.removeEventListener('pointermove', mv); titleBox.removeEventListener('pointerup', up); }
      titleBox.addEventListener('pointermove', mv);
      titleBox.addEventListener('pointerup', up);
    });

    // ─── Handle overlay, kept in step with the canvas every frame ──────────

    var cardEls = [], dotEls = [];
    function frame() {
      var items = api.items();
      while (cardEls.length < items.length) {
        (function (i) {
          var c = el('div', { 'class': 'rt-card' }, [el('b', { text: String(i + 1) })]);
          var d = el('div', { 'class': 'rt-dot' });
          layer.appendChild(c); layer.appendChild(d);
          drag(c, function () { return 'card'; }, i);
          drag(d, function () { return 'anchor'; }, i);
          cardEls.push(c); dotEls.push(d);
        })(cardEls.length);
      }
      cardEls.forEach(function (c, i) {
        var it = items[i];
        c.style.display = dotEls[i].style.display = it ? '' : 'none';
        if (!it) return;
        c.style.left = it.card.x + 'px'; c.style.top = it.card.y + 'px';
        c.style.width = it.card.w + 'px'; c.style.height = it.card.h + 'px';
        dotEls[i].style.left = it.anchor.x + 'px'; dotEls[i].style.top = it.anchor.y + 'px';
        c.classList.toggle('sel', i === sel); dotEls[i].classList.toggle('sel', i === sel);
      });
      var r = titleEl.getBoundingClientRect();
      titleBox.style.left = r.left + 'px'; titleBox.style.top = r.top + 'px';
      titleBox.style.width = r.width + 'px'; titleBox.style.height = r.height + 'px';
      requestAnimationFrame(frame);
    }

    // ─── Start ──────────────────────────────────────────────────────────────

    api.setSticky(true);
    // let the page's entrance animations finish so the words are measured where they settle
    document.querySelectorAll('[data-reveal],[data-frame]').forEach(function (n) { n.classList.add('is-in'); });
    if (window.applyRoleTitle) window.applyRoleTitle(cfg.title);
    setTimeout(function () {
      ensureRoles();
      persist();
      buildRoles(); buildItems();
      api.open(role);
      syncFields();
      requestAnimationFrame(frame);
    }, 1500);

    return { text: function () { return serialize(); }, config: function () { return cfg; } };
  }

  window.RoleTuner = { init: init };
})();
