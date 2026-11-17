(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  document.documentElement.classList.add('js');

  if (fine && !reduce) {
    var waterCursor = document.createElement('span');
    waterCursor.className = 'water-cursor';
    waterCursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(waterCursor);
    document.documentElement.classList.add('has-water-cursor');

    var cursorX = -100, cursorY = -100, targetX = -100, targetY = -100;
    var cursorVX = 0, cursorVY = 0, cursorFrame = 0, cursorReady = false;
    function animateWaterCursor() {
      cursorFrame = 0;
      var dx = targetX - cursorX, dy = targetY - cursorY;
      cursorVX = (cursorVX + dx * 0.2) * 0.64;
      cursorVY = (cursorVY + dy * 0.2) * 0.64;
      cursorX += cursorVX; cursorY += cursorVY;
      if (Math.abs(dx) < 0.12 && Math.abs(dy) < 0.12 && Math.abs(cursorVX) < 0.12 && Math.abs(cursorVY) < 0.12) {
        cursorX = targetX; cursorY = targetY; cursorVX = 0; cursorVY = 0;
      }
      var speed = Math.min(1, Math.sqrt(cursorVX * cursorVX + cursorVY * cursorVY) / 22);
      waterCursor.style.setProperty('--x', cursorX + 'px');
      waterCursor.style.setProperty('--y', cursorY + 'px');
      waterCursor.style.setProperty('--angle', Math.atan2(cursorVY, cursorVX) + 'rad');
      waterCursor.style.setProperty('--sx', 1 + speed * 0.28);
      waterCursor.style.setProperty('--sy', 1 - speed * 0.2);
      if (Math.abs(targetX - cursorX) >= 0.12 || Math.abs(targetY - cursorY) >= 0.12 || Math.abs(cursorVX) >= 0.12 || Math.abs(cursorVY) >= 0.12) {
        cursorFrame = requestAnimationFrame(animateWaterCursor);
      }
    }
    function moveWaterCursor(e) {
      if (e.pointerType === 'touch') return;
      targetX = e.clientX; targetY = e.clientY;
      if (!cursorReady) {
        cursorX = targetX; cursorY = targetY; cursorReady = true;
      }
      var target = e.target;
      var editing = target.closest && target.closest('input:not([type]), input[type="text"], input[type="email"], input[type="search"], input[type="url"], input[type="tel"], input[type="password"], textarea, [contenteditable="true"]');
      var text = target.closest && target.closest('h1,h2,h3,h4,p,a,button,label,li,dt,dd,span,strong,em,small');
      waterCursor.classList.toggle('is-hidden', !!editing);
      waterCursor.classList.toggle('is-text', !!text && !editing);
      if (!cursorFrame) cursorFrame = requestAnimationFrame(animateWaterCursor);
    }
    document.addEventListener('pointermove', moveWaterCursor, { passive: true });
    document.addEventListener('pointerover', moveWaterCursor, { passive: true });
    document.addEventListener('pointerout', function (e) {
      if (!e.relatedTarget) waterCursor.classList.add('is-hidden');
    });
    addEventListener('blur', function () { waterCursor.classList.add('is-hidden'); });
  }

  /* ================= nav ================= */
  var nav = $('#nav'), burger = $('#burger'), sheet = $('#sheet');
  function setSheet(open) {
    sheet.hidden = !open; burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setSheet(sheet.hidden); });
  $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setSheet(false); }); });
  var reachBtn = $('#reachBtn'), pop = $('#reachPop');
  function setPop(open) { pop.hidden = !open; reachBtn.setAttribute('aria-expanded', open); }
  reachBtn.addEventListener('click', function (e) { e.stopPropagation(); setPop(pop.hidden); });
  document.addEventListener('click', function (e) { if (!pop.hidden && !pop.contains(e.target)) setPop(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setPop(false); setSheet(false); } });

  var menu = $('#menu'), ind = $('#ind'), links = $$('a', menu), activeLink = null;
  function moveInd(a) {
    if (!a) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1; ind.style.width = a.offsetWidth + 'px'; ind.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  function setActive(id) {
    activeLink = null;
    links.forEach(function (l) { var on = l.getAttribute('href') === '#' + id; l.classList.toggle('on', on); if (on) activeLink = l; });
    moveInd(activeLink);
  }
  links.forEach(function (l) {
    l.addEventListener('pointerenter', function () { moveInd(l); });
    l.addEventListener('focus', function () { moveInd(l); });
  });
  menu.addEventListener('pointerleave', function () { moveInd(activeLink); });
  addEventListener('resize', function () { moveInd(activeLink); });

  var SECTIONS = $$('main > section[id], #top');
  function currentSection() {
    var mid = innerHeight * 0.5, cur = SECTIONS[0];
    SECTIONS.forEach(function (s) { if (s && s.getBoundingClientRect().top <= mid) cur = s; });
    return cur;
  }

  /* ================= scroll bookkeeping (one rAF per frame) ================= */
  var prog = $('#prog'), scrolled = false, listeners = [];
  function onFrame(fn) { listeners.push(fn); }
  var queued = false;
  function runFrame() {
    queued = false;
    var sc = scrollY > 24; if (sc !== scrolled) { scrolled = sc; nav.classList.toggle('scrolled', sc); }
    var h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? clamp(scrollY / h, 0, 1) : 0) + ')';
    var cs = currentSection();
    if (cs) {
      document.documentElement.classList.toggle('hero-active', cs.id === 'top');
      if (cs.id !== runFrame.last) {
        runFrame.last = cs.id;
        setActive(cs.id === 'top' || cs.id === 'contact' ? '' : cs.id);
        runFrame.el = cs;
      }
      var mood = cs.getAttribute('data-mood');
      nav.classList.toggle('on-dark', mood === 'chat' || mood === 'contact' || cs.id === 'chatroom' || cs.id === 'contact');
    }
    listeners.forEach(function (f) { f(); });
  }
  function requestFrame() { if (!queued) { queued = true; requestAnimationFrame(runFrame); } }
  addEventListener('scroll', requestFrame, { passive: true });
  addEventListener('resize', requestFrame);

  /* ================= orbit (mouse, touch, pen) ================= */
  function orbit(stage, target, st, lim) {
    var down = false, sx = 0, sy = 0, r0 = 0, z0 = 0, moved = 0;
    function apply() { target.style.setProperty('--rx', st.rx + 'deg'); target.style.setProperty('--rz', st.rz + 'deg'); }
    apply();
    stage.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      down = true; moved = 0; sx = e.clientX; sy = e.clientY; r0 = st.rx; z0 = st.rz; target.classList.add('drag');
      try { stage.setPointerCapture(e.pointerId); } catch (x) {}
    });
    stage.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      st.rz = z0 + dx * 0.4; st.rx = clamp(r0 - dy * 0.25, lim[0], lim[1]); apply();
    });
    function end() { down = false; target.classList.remove('drag'); }
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('dblclick', function () { st.rx = st.d[0]; st.rz = st.d[1]; apply(); });
    return apply;
  }

  /* ================= generic pinned scene ================= */
  function pinScene(wrap, n, cb) {
    function progress() {
      var r = wrap.getBoundingClientRect(), total = wrap.offsetHeight - innerHeight;
      return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    }
    function update() {
      var p = progress(), x = p * n, idx = Math.min(n - 1, Math.floor(x + 1e-6));
      cb(idx, clamp(x - idx, 0, 1), p);
    }
    onFrame(update); update();
    return {
      go: function (i) {
        var total = wrap.offsetHeight - innerHeight, top = wrap.getBoundingClientRect().top + scrollY;
        scrollTo({ top: top + total * ((i + 0.5) / n), behavior: reduce ? 'auto' : 'smooth' });
      }
    };
  }
  function buildDots(box, n, go, label) {
    var out = [];
    for (var i = 0; i < n; i++) {
      (function (i) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', label + ' ' + (i + 1));
        b.addEventListener('click', function () { go(i); }); box.appendChild(b); out.push(b);
      })(i);
    }
    return out;
  }
  function paintCard(card, ids, step, total, d, label) {
    $(ids.step).textContent = label + ' ' + (step + 1) + ' of ' + total;
    $(ids.title).textContent = d.t; $(ids.text).textContent = d.d;
    var tg = $(ids.tags); tg.innerHTML = '';
    d.g.forEach(function (t, k) { var s = document.createElement('span'); s.textContent = t; s.style.setProperty('--k', k); tg.appendChild(s); });
    if (!reduce) { card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap'); }
  }

  /* ================= LAYERS story ================= */
  if ($('#lyPin')) (function () {
  var stack = $('#stack'), stage = $('#stackStage');
  var sst = { rx: 62, rz: -36, d: [62, -36] };
  orbit(stage, stack, sst, [38, 80]);
  var LAYERS = [
    { t: 'Interface', d: 'What people see and touch. React and Vite on the web, Flutter on mobile, built to work from a phone to a wide desktop.', g: ['React', 'Vite', 'Flutter'] },
    { t: 'API', d: 'Where rooms, messages and sign-in are handled. ChatRoom exposes 14 REST endpoints, with the same pattern in Node and ASP.NET projects.', g: ['Django REST', 'Node and Express', 'ASP.NET'] },
    { t: 'Real time', d: 'A JWT is checked before a WebSocket is accepted, and Redis carries each message to every worker so the whole room hears it.', g: ['Django Channels', 'Redis pub/sub', 'JWT'] },
    { t: 'Data', d: 'Messages are saved first, then delivered, so nothing is lost if delivery fails. Different projects use different stores.', g: ['PostgreSQL', 'MongoDB', 'SQLite'] }
  ];
  var layerEls = $$('.layer', stack), lyCard = $('#lyTitle').closest('.story-card');
  var lyDots = [], lyScene, lyLast = -1;
  lyScene = pinScene($('#lyPin'), 4, function (idx, sub, p) {
    if (idx !== lyLast) {
      lyLast = idx;
      layerEls.forEach(function (l) { l.classList.toggle('on', +l.getAttribute('data-layer') === idx); });
      stack.classList.add('focus');
      paintCard(lyCard, { step: '#lyStep', title: '#lyTitle', text: '#lyText', tags: '#lyTags' }, idx, 4, LAYERS[idx], 'Layer');
      lyDots.forEach(function (b, k) { b.classList.toggle('on', k === idx); });
    }
    $('#lyFill').style.transform = 'scaleY(' + p + ')';
    stack.style.setProperty('--sz', (p * 52 - 8) + 'deg');
    stack.style.setProperty('--gap', (70 + Math.sin(sub * Math.PI) * 14) + 'px');
  });
  lyDots = buildDots($('#lyDots'), 4, lyScene.go, 'Layer');
  lyDots[0].classList.add('on');
  layerEls.forEach(function (l) { l.addEventListener('click', function () { lyScene.go(+l.getAttribute('data-layer')); }); });

  })();

  /* ================= CHATROOM story ================= */
  if ($('#crPin')) (function () {
  var plane = $('#crPlane'), crStage = $('#crStage');
  var NODES = [
    { id: 'client', l: 'Client', x: 24, y: 40 },
    { id: 'jwt', l: 'JWT check', x: 222, y: 40 },
    { id: 'cons', l: 'Consumer', x: 420, y: 40 },
    { id: 'db', l: 'PostgreSQL', x: 420, y: 210 },
    { id: 'redis', l: 'Redis', x: 222, y: 210 },
    { id: 'mem', l: 'Room members', x: 24, y: 210 }
  ];
  var base = document.createElement('div'); base.className = 'cr-base'; plane.appendChild(base);
  var N = {};
  function center(id) { var n = NODES.filter(function (q) { return q.id === id; })[0]; return [n.x + 58, n.y + 36]; }
  var EDGES = [['client', 'jwt'], ['jwt', 'cons'], ['cons', 'db'], ['cons', 'redis'], ['redis', 'mem']];
  var E = {};
  EDGES.forEach(function (e) {
    var a = center(e[0]), b = center(e[1]), dx = b[0] - a[0], dy = b[1] - a[1];
    var d = document.createElement('div'); d.className = 'edge';
    d.style.left = a[0] + 'px'; d.style.top = a[1] + 'px'; d.style.width = Math.sqrt(dx * dx + dy * dy) + 'px';
    d.style.transform = 'rotate(' + Math.atan2(dy, dx) + 'rad)'; plane.appendChild(d); E[e[1]] = d;
  });
  NODES.forEach(function (n) {
    var d = document.createElement('div'); d.className = 'node'; d.style.left = n.x + 'px'; d.style.top = n.y + 'px';
    var lb = document.createElement('span'); lb.className = 'lb'; lb.textContent = n.l; d.appendChild(lb);
    plane.appendChild(d); N[n.id] = d;
  });
  var cst = { rx: 60, rz: -34, d: [60, -34] };
  orbit(crStage, plane, cst, [36, 78]);

  var redisOn = true, auto = false, autoTimer = 0, lastIdx = -1, lastSub = 0;
  var crCard = $('#crTitle').closest('.story-card'), crDots = [];
  function crText(i) {
    var on = redisOn;
    return [
      { t: 'You press send', d: 'The message leaves your browser over a WebSocket, already tied to your session.', g: ['Browser', 'WebSocket'] },
      { t: 'The JWT is checked', d: 'Before the socket is trusted, the server verifies your token. No valid token, no connection.', g: ['SimpleJWT', 'Channels middleware'] },
      { t: 'It is saved, then published', d: 'The consumer writes the message to PostgreSQL first, then publishes it to the room group.', g: ['Django Channels', 'PostgreSQL'] },
      on ? { t: 'Redis fans it out', d: 'Redis hands the message to every worker that holds someone from this room.', g: ['Redis pub/sub', 'All workers'] }
         : { t: 'Redis is off', d: 'Nothing carries the message to the other workers. Only the worker that received it can deliver it.', g: ['No pub/sub', 'One worker only'] },
      on ? { t: 'Everyone hears it', d: 'Delivered to 3 of 3 members, whichever server they are connected to.', g: ['3 of 3 delivered'] }
         : { t: 'Only one hears it', d: 'Delivered to 1 of 3. Members B and C never hear it live. It is still saved in PostgreSQL.', g: ['1 of 3 delivered', 'Saved anyway'] }
    ][i];
  }
  function crRender(idx, sub, force) {
    if (idx !== lastIdx || force) {
      lastIdx = idx;
      paintCard(crCard, { step: '#crStep', title: '#crTitle', text: '#crText', tags: '#crTags' }, idx, 5, crText(idx), 'Step');
      crDots.forEach(function (b, k) { b.classList.toggle('on', k === idx); });
    }
    var order = ['client', 'jwt', 'cons', 'redis', 'mem'];
    order.forEach(function (id, k) {
      N[id].classList.toggle('cur', k === idx);
      N[id].classList.toggle('on', k < idx);
      N[id].classList.toggle('dead', id === 'redis' && !redisOn);
      N[id].classList.toggle('miss', id === 'mem' && !redisOn && idx === 4);
    });
    N.db.classList.toggle('cur', idx === 2);
    N.db.classList.toggle('on', idx > 2);
    function f(id, v) { E[id].style.setProperty('--f', v); }
    f('jwt', idx > 0 ? 1 : (idx === 0 ? sub : 0));
    f('cons', idx > 1 ? 1 : (idx === 1 ? sub : 0));
    f('db', idx > 2 ? 1 : (idx === 2 ? sub : 0));
    var toRedis = idx > 3 ? 1 : (idx === 3 ? sub : 0), toMem = idx > 4 ? 1 : (idx === 4 ? sub : 0);
    E.redis.classList.toggle('bad', !redisOn);
    f('redis', !redisOn ? Math.min(toRedis, 0.55) : toRedis);
    f('mem', redisOn ? toMem : 0);
    $('#crFill').style.transform = 'scaleY(' + clamp((idx + sub) / 5, 0, 1) + ')';
    lastSub = sub;
  }
  var crScene = pinScene($('#crPin'), 5, function (idx, sub, p) {
    if (auto) return;
    crRender(idx, sub, false);
    plane.style.setProperty('--sz', ((p - 0.5) * 30) + 'deg');
  });
  crDots = buildDots($('#crDots'), 5, function (i) { stopAuto(); crScene.go(i); }, 'Step');
  function stopAuto() { auto = false; cancelAnimationFrame(autoTimer); $('#send').disabled = false; }
  function playAuto() {
    stopAuto(); auto = true; $('#send').disabled = true;
    var per = reduce ? 120 : 900, t0 = performance.now();
    (function tick(ts) {
      if (!auto) return;
      var x = (ts - t0) / per;
      if (x >= 5) { crRender(4, 1, false); auto = false; $('#send').disabled = false; return; }
      crRender(Math.floor(x), x - Math.floor(x), false);
      autoTimer = requestAnimationFrame(tick);
    })(t0);
  }
  $('#send').addEventListener('click', function () {
    var sec = $('#crPin'), top = sec.getBoundingClientRect().top;
    /* make sure the scene is on screen, then play */
    if (top > 0 || top < -(sec.offsetHeight - innerHeight)) {
      scrollTo({ top: sec.getBoundingClientRect().top + scrollY + 4, behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(playAuto, reduce ? 0 : 700);
    } else playAuto();
  });
  addEventListener('wheel', function () { if (auto) stopAuto(); }, { passive: true });
  addEventListener('touchmove', function () { if (auto) stopAuto(); }, { passive: true });
  function setRedis(on) {
    redisOn = on; $('#redisOn').setAttribute('aria-pressed', on); $('#redisOff').setAttribute('aria-pressed', !on);
    crRender(Math.max(lastIdx, 0), lastSub, true);
  }
  $('#redisOn').addEventListener('click', function () { setRedis(true); });
  $('#redisOff').addEventListener('click', function () { setRedis(false); });
  crRender(0, 0, true);

  })();

  /* ================= generic stories (case pages) ================= */
  $$('[data-story]').forEach(function (wrap) {
    var data = JSON.parse($('script[type="application/json"]', wrap).textContent), n = data.length;
    var vis = $$('.v', wrap), card = $('.story-card', wrap), dots = [], last = -1;
    var ids = { step: $('.sc-step', wrap), title: $('h3', wrap), text: $('.sc-text', wrap), tags: $('.tags', wrap) };
    var fill = $('.rail i', wrap);
    var sc = pinScene(wrap, n, function (idx, sub, p) {
      if (idx !== last) {
        last = idx;
        var d = data[idx];
        ids.step.textContent = (wrap.getAttribute('data-label') || 'Part') + ' ' + (idx + 1) + ' of ' + n;
        ids.title.textContent = d.t; ids.text.textContent = d.d; ids.tags.innerHTML = '';
        (d.g || []).forEach(function (t, k) { var s = document.createElement('span'); s.textContent = t; s.style.setProperty('--k', k); ids.tags.appendChild(s); });
        if (!reduce) { card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap'); }
        vis.forEach(function (v, k) { v.classList.toggle('on', k === idx); v.classList.toggle('past', k < idx); });
        dots.forEach(function (b, k) { b.classList.toggle('on', k === idx); });
      }
      fill.style.transform = 'scaleY(' + p + ')';
      wrap.style.setProperty('--p', p); wrap.style.setProperty('--sub', sub);
    });
    dots = buildDots($('.dots', wrap), n, sc.go, wrap.getAttribute('data-label') || 'Part');
  });

  /* ================= performance lab (real measurement) ================= */
  if ($('#blob')) (function () {
  var tilesEl = $('#tiles'), blob = $('#blob'), view = $('#labView'), tiles = [], i;
  for (i = 0; i < 12; i++) { var t = document.createElement('div'); t.className = 'tile'; tilesEl.appendChild(t); tiles.push(t); }
  var blurIn = $('#blur'), blurOut = $('#blurOut'), mAll = $('#mAll'), mTwo = $('#mTwo');
  var fpsEl = $('#fps'), fpsBox = fpsEl.parentNode, worstEl = $('#worst'), traceEl = $('#trace'), note = $('#labNote');
  var bars = []; for (i = 0; i < 40; i++) { var b = document.createElement('i'); b.style.height = '4px'; traceEl.appendChild(b); bars.push(b); }
  var mode = 'all';
  function applyBlur() {
    var v = +blurIn.value; blurOut.textContent = v + ' px'; view.style.setProperty('--b', v + 'px');
    tiles.forEach(function (t, k) { t.classList.toggle('off', mode === 'two' && k > 1); });
  }
  blurIn.addEventListener('input', applyBlur);
  mAll.addEventListener('click', function () { mode = 'all'; mAll.setAttribute('aria-pressed', 'true'); mTwo.setAttribute('aria-pressed', 'false'); applyBlur(); });
  mTwo.addEventListener('click', function () { mode = 'two'; mTwo.setAttribute('aria-pressed', 'true'); mAll.setAttribute('aria-pressed', 'false'); applyBlur(); });
  applyBlur();
  if (reduce) { note.textContent = 'Motion is turned off on your device, so the live meter is paused.'; }
  else {
    var run2 = false, last = 0, acc = 0, frames = 0, hist = [];
    (function () {
      function loop(ts) {
        if (!run2) return;
        if (last) {
          var dt = ts - last; hist.push(dt); if (hist.length > 120) hist.shift();
          acc += dt; frames++;
          var w = view.clientWidth, h = view.clientHeight, p = ts / 1000;
          blob.style.transform = 'translate(' + ((Math.sin(p * 0.9) * 0.5 + 0.5) * (w - 220)) + 'px,' + ((Math.cos(p * 0.7) * 0.5 + 0.5) * (h - 220)) + 'px)';
          if (acc >= 500) {
            var fps = Math.round(frames * 1000 / acc); fpsEl.textContent = fps; fpsBox.classList.toggle('bad', fps < 45);
            worstEl.textContent = 'Worst frame: ' + Math.round(Math.max.apply(null, hist.slice(-60))) + ' ms';
            bars.forEach(function (bar, k) { var d = hist[hist.length - bars.length + k]; if (d == null) d = 0; bar.style.height = clamp(d * 0.8, 3, 40) + 'px'; bar.className = d > 24 ? 'bad' : ''; });
            acc = 0; frames = 0;
          }
        }
        last = ts; requestAnimationFrame(loop);
      }
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !run2) { run2 = true; last = 0; requestAnimationFrame(loop); } else if (!es[0].isIntersecting) run2 = false;
      }, { threshold: 0.2 }).observe(view);
    })();
  }

  })();

  /* ================= magnetic buttons + card spotlight ================= */
  if (fine && !reduce) {
    $$('.btn.red, .btn.ghost').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    $$('.card, .project-card, .certificate-card, .spec-card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ================= scroll reveal on everything else ================= */
  (function () {
    var groups = [
      ['.marq', 'up'],
      ['.sec h2', 'up'], ['.sub', 'up'], ['.card', 'scale'], ['.cols>div', 'up'], ['.sec p>.btn', 'up'],
      ['.lab-view', 'left'], ['.lab-panel', 'right'], ['.project-card', 'scale'], ['.certificate-card', 'scale'], ['.spec-card', 'left'],
      ['.case-hero > *:not(h1)', 'up'], ['.chap', 'up'], ['.facts li', 'scale'], ['.xlinks a', 'up'], ['.vis', 'scale'], ['.row.c a', 'up'], ['.social li', 'up'], ['.foot', 'up']
    ];
    var els = [];
    groups.forEach(function (gr) {
      $$(gr[0]).forEach(function (el) {
        if (el.hasAttribute('data-r')) return;
        el.setAttribute('data-r', gr[1]);
        var sibs = el.parentNode ? Array.prototype.filter.call(el.parentNode.children, function (s) { return s.matches(gr[0]); }) : [el];
        el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 6) * 0.09) + 's');
        els.push(el);
      });
    });
    var heads = $$('.sec h2, .hero h1, .case-hero h1');
    heads.forEach(function (h) {
      if (h.querySelector('.sr')) return;
      var k = 0;
      (function walk(n) {
        Array.prototype.slice.call(n.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (t) {
              if (!t) return;
              if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
              var w = document.createElement('span'); w.className = 'w';
              var s = document.createElement('span'); s.textContent = t; s.style.setProperty('--d', (k++ * 0.07) + 's');
              w.appendChild(s); frag.appendChild(w);
            });
            n.replaceChild(frag, c);
          } else if (c.nodeType === 1 && !c.classList.contains('grad')) walk(c);
        });
      })(h);
      h.removeAttribute('data-r'); h.style.opacity = 1;
    });
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('in'); }); $$('.w').forEach(function (w) { w.classList.add('in'); }); return; }
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); $$('.w', e.target).forEach(function (w) { w.classList.add('in'); }); obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { obs.observe(e); }); heads.forEach(function (h) { obs.observe(h); });
  })();

  /* ================= gentle parallax on cards and panels ================= */
  if (!reduce) {
    var par = $$('.card:nth-child(2n), .lab-panel, .cols>div:nth-child(2)');
    par.forEach(function (e, k) { e.setAttribute('data-par', ''); e.__f = (k % 2 ? -1 : 1) * 0.05; });
    onFrame(function () {
      par.forEach(function (el) {
        var b = el.getBoundingClientRect(); el.style.setProperty('--py', ((b.top + b.height / 2 - innerHeight / 2) * el.__f) + 'px');
      });
    });
  }

  /* ================= living background: one fixed canvas for the whole page ================= */
  (function () {
    var cv = $('#bgFixed'), ctx = cv.getContext('2d'); if (!ctx) return;
    var SC = 0.2, W = 0, H = 0, vis = !document.hidden, raf = 0, lastT = 0, lastDrawMood = null;
    /* palette per mood: base colour and 5 blobs [r,g,b,alpha] */
    var P = {
      hero:   { base: [244, 242, 238], b: [[242,161,151,0],[192,57,43,0],[255,214,170,0],[255,190,200,0],[255,170,120,0]] },
      cool:   { base: [255, 255, 255], b: [[150,185,230,.38],[242,161,151,.3],[255,214,170,.3],[110,166,196,.3],[200,210,245,.34]] },
      warm:   { base: [245, 245, 247], b: [[255,190,200,.45],[255,214,170,.5],[242,161,151,.4],[192,57,43,.15],[255,170,120,.3]] },
      chat:   { base: [0, 0, 0],       b: [[192,57,43,.62],[110,166,196,.3],[242,161,151,.26],[122,36,27,.6],[70,90,140,.3]] },
      speed:  { base: [245, 245, 247], b: [[242,178,92,.5],[192,57,43,.28],[255,214,170,.5],[242,161,151,.4],[255,190,200,.4]] },
      contact:{ base: [0, 0, 0],       b: [[192,57,43,.65],[242,161,151,.28],[110,166,196,.24],[122,36,27,.5],[255,170,120,.2]] }
    };
    var MAP = { top: 'hero', layers: 'cool', highlights: 'warm', chatroom: 'chat', speed: 'speed', compare: 'cool', specs: 'warm', contact: 'contact' };
    var cur = JSON.parse(JSON.stringify(P.hero)), target = P.hero;
    var SPOT = [[.25,.25,.12,.12,.22,.17],[.78,.2,.1,.1,.17,.25],[.6,.62,.15,.1,.13,.2],[.1,.78,.08,.12,.2,.14],[.9,.85,.1,.1,.15,.19]];
    function size() { W = Math.max(2, Math.round(innerWidth * SC)); H = Math.max(2, Math.round(innerHeight * SC)); cv.width = W; cv.height = H; }
    function draw(ts) {
      var t = ts / 1000, s = scrollY, sid = runFrame.last || 'top';
      var el = runFrame.el, mood = (el && el.getAttribute('data-mood')) || MAP[sid] || 'hero';
      lastDrawMood = sid;
      target = P[mood];
      var k = reduce ? 1 : 0.05;
      for (var c = 0; c < 3; c++) cur.base[c] = lerp(cur.base[c], target.base[c], k);
      cur.b.forEach(function (bl, i) { for (var c = 0; c < 4; c++) bl[c] = lerp(bl[c], target.b[i][c], k); });
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgb(' + Math.round(cur.base[0]) + ',' + Math.round(cur.base[1]) + ',' + Math.round(cur.base[2]) + ')';
      ctx.fillRect(0, 0, W, H);
      if (mood !== 'hero') {
        cur.b.forEach(function (bl, i) {
          var sp = SPOT[i];
          /* drifts with time and travels across the screen as you scroll */
          var x = (sp[0] + Math.sin(t * sp[4] + i * 1.7) * sp[2] + Math.sin(s * 0.0011 + i * 1.3) * 0.22) * W;
          var y = (sp[1] + Math.cos(t * sp[5] + i * 2.3) * sp[3] + Math.cos(s * 0.0008 + i * 0.9) * 0.16) * H;
          var rad = (0.5 - i * 0.03) * Math.max(W, H);
          var gr = ctx.createRadialGradient(x, y, 0, x, y, rad);
          gr.addColorStop(0, 'rgba(' + Math.round(bl[0]) + ',' + Math.round(bl[1]) + ',' + Math.round(bl[2]) + ',' + bl[3].toFixed(3) + ')');
          gr.addColorStop(1, 'rgba(' + Math.round(bl[0]) + ',' + Math.round(bl[1]) + ',' + Math.round(bl[2]) + ',0)');
          ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
        });
      }
    }
    function loop(ts) {
      if (!vis) { raf = 0; return; }
      if ((runFrame.last || 'top') === 'top') { raf = 0; return; }
      if (ts - lastT > 33) { lastT = ts; draw(ts); }
      raf = requestAnimationFrame(loop);
    }
    size(); addEventListener('resize', function () { size(); draw(performance.now()); });
    document.addEventListener('visibilitychange', function () { vis = !document.hidden; if (vis && !raf && !reduce && (runFrame.last || 'top') !== 'top') raf = requestAnimationFrame(loop); });
    draw(performance.now());
    if (reduce) { onFrame(function () { draw(performance.now()); }); return; }
    raf = requestAnimationFrame(loop);
    onFrame(function () {
      if (!vis || reduce) return;
      var sectionId = runFrame.last || 'top';
      if (sectionId === 'top') {
        if (lastDrawMood !== 'top') draw(performance.now());
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      } else if (!raf) {
        draw(performance.now());
        raf = requestAnimationFrame(loop);
      }
    });

    /* floating shapes: drift on their own and travel up and across as you scroll */
    var fl = $$('.fl'), FD = fl.map(function (el, i) { return { x: [.08,.86,.5,.7,.15,.32,.92,.62][i], y: [.2,.55,.1,.7,.85,.4,.15,.9][i], v: [.35,.6,.9,.25,.5,.75,.4,.65][i], p: i * 1.9 }; });
    onFrame(function () {
      var vw = innerWidth, vh = innerHeight, s = scrollY;
      fl.forEach(function (el, i) {
        var d = FD[i], span = vh + 400;
        var y = ((d.y * vh - s * d.v) % span + span) % span - 200;
        var x = d.x * vw + Math.sin(s * 0.002 + d.p) * 70;
        el.style.setProperty('--fx', x + 'px'); el.style.setProperty('--fy', y + 'px');
      });
    });
  })();

  /* ================= contact form ================= */
  var contactForm = $('#contactForm');
  if (contactForm) {
    var sendBtn = $('#sendBtn'), btnText = $('#btnText'), btnBar = $('#btnBar');
    var contactStatus = $('#contactStatus');
    if (window.emailjs) window.emailjs.init('yCgwIWXoWe_klsqNy');

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!contactForm.reportValidity()) return;

      var name = $('#from_name').value.trim();
      var email = $('#from_email').value.trim();
      var message = $('#message').value.trim();
      contactStatus.textContent = '';
      contactStatus.removeAttribute('data-state');

      if (!window.emailjs) {
        contactStatus.textContent = 'Email delivery is unavailable here. Opening your email app instead.';
        window.location.href = 'mailto:qasimakram46@hotmail.com?subject=' +
          encodeURIComponent('Portfolio contact from ' + name) + '&body=' +
          encodeURIComponent(message + '\n\n' + name + ' (' + email + ')');
        return;
      }

      sendBtn.disabled = true;
      btnText.textContent = 'Sending...';
      btnBar.classList.remove('sent');
      btnBar.classList.add('sending');
      contactStatus.textContent = 'Sending your message...';

      window.emailjs.send('portfolio_contack', 'template_mkyegym', {
        from_name: name,
        from_email: email,
        message: message
      }).then(function () {
        contactForm.reset();
        contactStatus.textContent = 'Message sent. Thanks for getting in touch!';
        contactStatus.setAttribute('data-state', 'success');
        btnText.textContent = 'Message sent';
        btnBar.classList.remove('sending');
        btnBar.classList.add('sent');
        sendBtn.disabled = false;
      }).catch(function (error) {
        console.error('EmailJS could not send the contact message.', error);
        contactStatus.textContent = 'Your message could not be sent. Please try again or email me directly.';
        contactStatus.setAttribute('data-state', 'error');
        btnText.textContent = 'Send message';
        btnBar.classList.remove('sending', 'sent');
        sendBtn.disabled = false;
      });
    });

    contactForm.addEventListener('input', function () {
      if (contactStatus.getAttribute('data-state') !== 'success') return;
      contactStatus.textContent = '';
      contactStatus.removeAttribute('data-state');
      btnText.textContent = 'Send message';
      btnBar.classList.remove('sent');
    });
  }

  requestFrame();
})();
