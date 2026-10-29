(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        if(e.target.dataset.onview && handlers[e.target.dataset.onview]) handlers[e.target.dataset.onview](e.target);
        io.unobserve(e.target);
      }
    });
  },{threshold:.18}) : null;

  var handlers = {
    counters: function(root){
      root.querySelectorAll('[data-count]').forEach(function(el){
        var end = parseFloat(el.dataset.count), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
        if(reduce){ el.textContent = pre + end + suf; return; }
        var t0 = null, dur = 1400;
        function step(t){
          if(!t0) t0 = t;
          var p = Math.min((t - t0)/dur, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(end * e) + suf;
          if(p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    },
    flow: function(root){ runFlow(root); }
  };

  document.querySelectorAll('.reveal,[data-onview]').forEach(function(el){
    if(io) io.observe(el); else { el.classList.add('in'); if(el.dataset.onview) handlers[el.dataset.onview](el); }
  });

  // Typed line in hero
  var typed = document.querySelector('[data-typed]');
  if(typed){
    var lines = JSON.parse(typed.dataset.typed), li = 0;
    if(reduce){ typed.textContent = lines[0]; }
    else {
      (function typeLine(){
        var txt = lines[li], i = 0;
        typed.textContent = '';
        var iv = setInterval(function(){
          typed.textContent = txt.slice(0, ++i);
          if(i >= txt.length){
            clearInterval(iv);
            setTimeout(function(){ li = (li + 1) % lines.length; typeLine(); }, 2600);
          }
        }, 34);
      })();
    }
  }

  // Phone clock + notifications loop
  var clock = document.querySelector('.phone-time');
  if(clock){
    var d = new Date();
    clock.textContent = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    var dd = document.querySelector('.phone-date');
    if(dd) dd.textContent = d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  }
  var notifs = Array.prototype.slice.call(document.querySelectorAll('.notif'));
  if(notifs.length){
    if(reduce){ notifs.forEach(function(n){ n.classList.add('show'); }); }
    else {
      (function cycle(){
        notifs.forEach(function(n){ n.classList.remove('show'); });
        notifs.forEach(function(n, k){ setTimeout(function(){ n.classList.add('show'); }, 700 + k * 1300); });
        setTimeout(cycle, 700 + notifs.length * 1300 + 4200);
      })();
    }
  }

  // Workflow animation
  var flowTimer = null;
  function runFlow(root){
    var nodes = root.querySelectorAll('.node'), line = root.querySelector('.flow-line i'), log = root.querySelector('.flow-log');
    var mobile = window.matchMedia('(max-width:880px)').matches;
    clearTimeout(flowTimer);
    nodes.forEach(function(n){ n.classList.remove('on'); });
    if(line){ line.style.width = mobile ? '' : '0'; line.style.setProperty('--h','0'); }
    if(reduce){
      nodes.forEach(function(n){ n.classList.add('on'); });
      if(log) log.textContent = root.dataset.done || '';
      return;
    }
    var k = 0;
    (function step(){
      if(k >= nodes.length){ if(log) log.textContent = '✔ ' + (root.dataset.done || 'Terminé'); return; }
      var n = nodes[k];
      n.classList.add('on');
      var pct = nodes.length > 1 ? (k / (nodes.length - 1)) * 100 : 100;
      if(line){ if(mobile) line.style.setProperty('--h', pct + '%'); else line.style.width = pct + '%'; }
      if(log) log.textContent = '› ' + (n.dataset.log || '');
      k++;
      flowTimer = setTimeout(step, 1300);
    })();
  }
  document.querySelectorAll('[data-replay]').forEach(function(b){
    b.addEventListener('click', function(){ runFlow(document.querySelector(b.dataset.replay)); });
  });
})();

// ===== Film engine : timeline absolue, seek, son synchronisé =====
(function(){
  var film = document.querySelector('.film');
  if(!film) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wrap = film.closest('.film-wrap') || film.parentNode;
  var scenes = Array.prototype.slice.call(film.querySelectorAll('.scene'));
  var bars = Array.prototype.slice.call(film.querySelectorAll('.film-bars i'));
  var durs = scenes.map(function(s){ return parseFloat(s.dataset.dur || 6); });
  var starts = [], total = 0;
  durs.forEach(function(d){ starts.push(total); total += d; });
  var audio = wrap.querySelector('.film-audio');
  var track = wrap.querySelector('.sc-track'), fill = wrap.querySelector('.sc-fill'), knob = wrap.querySelector('.sc-knob');
  var tip = wrap.querySelector('.sc-tip'), cur = wrap.querySelector('.sc-cur'), tot = wrap.querySelector('.sc-tot');
  var playing = false, started = false, base = 0, anchor = 0, idx = -1, soundOn = false, userPaused = false, lastSec = -1, dragging = false;

  function fmt(t){ t = Math.max(0, Math.floor(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
  if(tot) tot.textContent = fmt(total);
  if(track){ track.setAttribute('aria-valuemax', Math.round(total)); }
  var segs = wrap.querySelector('.sc-segs');
  if(segs){
    scenes.forEach(function(s, k){
      var g = document.createElement('i');
      g.style.left = (starts[k] / total * 100) + '%';
      g.style.width = (durs[k] / total * 100) + '%';
      g.title = s.dataset.name || '';
      segs.appendChild(g);
    });
  }
  function useAudio(){ return soundOn && audio && !audio.paused && audio.readyState >= 2; }
  function now(){ return playing ? base + (performance.now() - anchor) / 1000 : base; }
  var lastSync = 0;
  function audioSync(t){
    if(!useAudio()) return;
    var p = performance.now(); if(p - lastSync < 700) return; lastSync = p;
    var d = audio.currentTime - t;
    if(Math.abs(d) > total / 2) d -= Math.sign(d) * total;
    if(Math.abs(d) < 1.5){ if(Math.abs(d) > .06){ base = (t + d + total) % total; anchor = p; } }
    else { try{ audio.currentTime = t; }catch(e){} }
  }
  function sceneAt(t){ for(var i = scenes.length - 1; i >= 0; i--) if(t >= starts[i]) return i; return 0; }
  function activate(i, off){
    var s = scenes[i];
    s.classList.remove('active'); void s.offsetWidth;
    scenes.forEach(function(x, k){ x.classList.toggle('active', k === i); });
    film.setAttribute('data-theme', s.dataset.theme || 'dark');
    idx = i;
    if(off > 0.05 && s.getAnimations){
      void s.offsetHeight; void getComputedStyle(s).opacity;
      s.getAnimations({subtree: true}).forEach(function(an){ try{ an.currentTime = off * 1000; }catch(e){} });
    }
  }
  function counters(t){
    var s = scenes[idx]; if(!s) return;
    var lt = (t - starts[idx]) * 1000;
    s.querySelectorAll('[data-count]').forEach(function(el){
      var end = parseFloat(el.dataset.count), d = parseFloat(el.dataset.delay || 400);
      var p = Math.min(Math.max((lt - d) / 1300, 0), 1), e = 1 - Math.pow(1 - p, 3);
      var txt = (el.dataset.pre || '') + Math.round(end * e) + (el.dataset.suf || '');
      if(el.textContent !== txt) el.textContent = txt;
    });
  }
  function render(t){
    if(t >= total){ t = t % total; base = t; anchor = performance.now(); }
    var i = sceneAt(t);
    if(i !== idx) activate(i, t - starts[i]);
    var lt = t - starts[i];
    bars.forEach(function(b, k){ b.style.width = k < i ? '100%' : (k > i ? '0' : (lt / durs[i] * 100) + '%'); });
    counters(t);
    var pct = t / total * 100;
    if(fill) fill.style.width = pct + '%';
    if(knob) knob.style.left = pct + '%';
    var sec = Math.floor(t);
    if(sec !== lastSec){ lastSec = sec; if(cur) cur.textContent = fmt(t); if(track) track.setAttribute('aria-valuenow', sec); if(track) track.setAttribute('aria-valuetext', fmt(t) + ' sur ' + fmt(total) + ' · ' + (scenes[i].dataset.name || '')); }
  }
  (function loop(){ var t = now(); audioSync(t); render(t); requestAnimationFrame(loop); })();

  function setBtns(){
    wrap.querySelectorAll('[data-film="play"]').forEach(function(b){ b.textContent = playing ? '❚❚' : '▶'; b.setAttribute('aria-label', playing ? 'Pause' : 'Lecture'); });
    wrap.querySelectorAll('[data-film="sound"]').forEach(function(b){
      b.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
      if(b.classList.contains('sc-sound')){ b.textContent = soundOn ? '🔊' : '🔇'; b.setAttribute('aria-label', soundOn ? 'Couper le son' : 'Activer le son'); }
      var l = b.querySelector('.fs-l'); if(l) l.textContent = soundOn ? 'Son activé' : 'Activer le son';
    });
    film.classList.toggle('sound-on', soundOn);
    film.classList.toggle('paused', !playing);
  }
  function syncAudio(t){ if(!audio || !soundOn) return; try{ audio.currentTime = t; }catch(e){} if(playing){ var pr = audio.play(); if(pr && pr.catch) pr.catch(function(){}); } else audio.pause(); }
  function play(){
    if(playing) return;
    base = now(); anchor = performance.now(); playing = true; started = true;
    syncAudio(base); setBtns();
  }
  function pause(){
    if(!playing) return;
    base = now(); playing = false;
    if(audio) audio.pause(); setBtns();
  }
  function seek(t){
    t = Math.min(Math.max(t, 0), total - 0.01);
    base = t; anchor = performance.now(); idx = -1;
    film.classList.add('nofade');
    syncAudio(t); render(t);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ film.classList.remove('nofade'); }); });
  }
  function toggleSound(){
    var t = now();
    soundOn = !soundOn;
    base = t; anchor = performance.now();
    if(soundOn){ if(!playing){ playing = true; started = true; userPaused = false; } syncAudio(t); }
    else if(audio) audio.pause();
    setBtns();
  }
  if(audio){
    ['loadedmetadata', 'canplay'].forEach(function(ev){ audio.addEventListener(ev, function(){ if(soundOn){ lastSync = 0; if(Math.abs(audio.currentTime - now()) > .3){ try{ audio.currentTime = now() % total; }catch(e){} } } }); });
    audio.addEventListener('playing', function(){ lastSync = 0; });
  }

  wrap.querySelectorAll('[data-film="play"]').forEach(function(b){ b.addEventListener('click', function(){ if(playing){ userPaused = true; pause(); } else { userPaused = false; play(); } }); });
  wrap.querySelectorAll('[data-film="replay"]').forEach(function(b){ b.addEventListener('click', function(){ userPaused = false; seek(0); play(); }); });
  wrap.querySelectorAll('[data-film="sound"]').forEach(function(b){ b.addEventListener('click', toggleSound); });

  if(track){
    var wasPlaying = false;
    function ratio(e){ var r = track.getBoundingClientRect(); var q = wrap.classList.contains('is-rot') ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width; return Math.min(Math.max(q, 0), 1); }
    function showTip(e){
      if(!tip) return; var q = ratio(e), t = q * total, i = sceneAt(t);
      tip.textContent = fmt(t) + ' · ' + (scenes[i].dataset.name || '');
      tip.style.left = (q * 100) + '%'; tip.classList.add('on');
    }
    track.addEventListener('pointerdown', function(e){ dragging = true; wasPlaying = playing; track.setPointerCapture(e.pointerId); seek(ratio(e) * total); showTip(e); track.classList.add('drag'); });
    track.addEventListener('pointermove', function(e){ showTip(e); if(dragging) seek(ratio(e) * total); });
    track.addEventListener('pointerup', function(){ dragging = false; track.classList.remove('drag'); if(wasPlaying && !playing) play(); });
    track.addEventListener('pointerleave', function(){ if(!dragging && tip) tip.classList.remove('on'); });
    track.addEventListener('keydown', function(e){
      var t = now(), k = e.key;
      if(k === 'ArrowRight'){ seek(t + 5); } else if(k === 'ArrowLeft'){ seek(t - 5); }
      else if(k === 'Home'){ seek(0); } else if(k === 'End'){ seek(total - 1); }
      else if(k === 'PageDown'){ var i = sceneAt(t); seek(starts[Math.min(i + 1, scenes.length - 1)]); }
      else if(k === 'PageUp'){ var j = sceneAt(t); seek(starts[Math.max(j - 1, 0)]); }
      else if(k === ' '){ if(playing){ userPaused = true; pause(); } else { userPaused = false; play(); } }
      else return;
      e.preventDefault();
    });
  }

  // ----- Plein écran paysage (rotation CSS si le téléphone reste en portrait)
  var scrubEl = wrap.querySelector('.scrub'), isFull = false, autoFull = false, nativeFull = false;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  function layout(){
    if(!isFull) return;
    var w = window.innerWidth, h = window.innerHeight, rot = h > w;
    var AW = rot ? h : w, AH = rot ? w : h;
    wrap.classList.toggle('is-rot', rot);
    wrap.style.width = AW + 'px'; wrap.style.height = AH + 'px';
    wrap.style.transformOrigin = 'top left';
    wrap.style.transform = rot ? 'rotate(90deg) translateY(-100%)' : 'none';
    var over = AH < 620, sh = (scrubEl && !over) ? scrubEl.offsetHeight + 14 : 0, pad = over ? 0 : (AW > 900 ? 24 : 8);
    wrap.classList.toggle('sc-over', over);
    var fitW = Math.max(200, Math.min(AW - 2 * pad, (AH - sh - pad) * 16 / 9));
    var Lw = Math.max(720, fitW), s = fitW / Lw, fh = fitW * 9 / 16;
    var top = Math.max(pad, (AH - sh - fh) / 2);
    film.style.width = Lw + 'px'; film.style.height = (Lw * 9 / 16) + 'px';
    film.style.marginLeft = (-Lw / 2) + 'px'; film.style.top = top + 'px';
    film.style.transform = 'scale(' + s + ')';
    if(scrubEl){ scrubEl.style.width = Math.max(fitW, Math.min(AW - 16, 520)) + 'px'; scrubEl.style.top = (over ? top + fh - scrubEl.offsetHeight - 8 : top + fh + 8) + 'px'; scrubEl.style.bottom = 'auto'; }
  }
  function lockLandscape(){ try{ if(screen.orientation && screen.orientation.lock){ var p = screen.orientation.lock('landscape'); if(p && p.catch) p.catch(function(){}); } }catch(e){} }
  function enterFull(auto){
    if(isFull) return;
    isFull = true; autoFull = !!auto;
    wrap.classList.add('is-full'); document.documentElement.classList.add('film-lock');
    layout();
    if(!auto){
      var de = document.documentElement, rq = de.requestFullscreen || de.webkitRequestFullscreen;
      if(rq){ try{ var p = rq.call(de, {navigationUI: 'hide'}); nativeFull = true; if(p && p.then) p.then(function(){ lockLandscape(); setTimeout(layout, 120); }).catch(function(){ nativeFull = false; }); else lockLandscape(); }catch(e){ nativeFull = false; } }
    }
    userPaused = false; seek(now()); play(); wake();
    var x = wrap.querySelector('.full-x'); if(x) try{ x.focus({preventScroll: true}); }catch(e){}
  }
  function exitFull(){
    if(!isFull) return;
    isFull = false; autoFull = false;
    wrap.classList.remove('is-full', 'is-rot', 'sc-over', 'idle'); document.documentElement.classList.remove('film-lock');
    ['width', 'height', 'transform', 'transformOrigin'].forEach(function(k){ wrap.style[k] = ''; });
    ['width', 'height', 'marginLeft', 'top', 'transform'].forEach(function(k){ film.style[k] = ''; });
    if(scrubEl) ['width', 'top', 'bottom'].forEach(function(k){ scrubEl.style[k] = ''; });
    var fe = document.fullscreenElement || document.webkitFullscreenElement;
    if(fe){ try{ (document.exitFullscreen || document.webkitExitFullscreen).call(document); }catch(e){} }
    try{ if(screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); }catch(e){}
    nativeFull = false; seek(now());
    setTimeout(function(){ try{ wrap.scrollIntoView({block: 'center'}); }catch(e){} }, 60);
  }
  var idleT = null;
  function wake(){ wrap.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function(){ if(isFull && !dragging) wrap.classList.add('idle'); }, 2800); }
  ['pointerdown', 'pointermove', 'keydown'].forEach(function(ev){ wrap.addEventListener(ev, function(){ if(isFull) wake(); }); });
  film.__full = enterFull; film.__exitFull = exitFull;
  wrap.querySelectorAll('[data-film="full"]').forEach(function(b){ b.addEventListener('click', function(){ if(isFull) exitFull(); else enterFull(false); }); });
  wrap.querySelectorAll('[data-film="exitfull"]').forEach(function(b){ b.addEventListener('click', exitFull); });
  document.addEventListener('keydown', function(e){ if(isFull && e.key === 'Escape') exitFull(); });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function(ev){ document.addEventListener(ev, function(){ if(isFull && nativeFull && !(document.fullscreenElement || document.webkitFullscreenElement)) exitFull(); else setTimeout(layout, 60); }); });
  var ot = null, wasLand = window.innerWidth > window.innerHeight;
  function onViewport(){
    clearTimeout(ot);
    ot = setTimeout(function(){
      var land = window.innerWidth > window.innerHeight, turned = land && !wasLand; wasLand = land;
      if(isFull){ if(autoFull && !land) exitFull(); else layout(); return; }
      if(coarse && turned && !reduce){
        var r = film.getBoundingClientRect(), vis = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if(vis > Math.min(r.height, window.innerHeight) * .3) enterFull(true);
      }
    }, 260);
  }
  window.addEventListener('resize', onViewport);
  window.addEventListener('orientationchange', onViewport);

  film.__seek = function(t){ seek(t); }; film.__now = now;
  if(reduce){
    var g = scenes.findIndex(function(s){ return s.classList.contains('gains'); });
    seek(g >= 0 ? starts[g] + durs[g] - .1 : 0);
  } else if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ if(!userPaused) play(); }
        else if(playing){ pause(); }
      });
    }, {threshold: .35}).observe(film);
  } else play();
  setBtns();
})();

// ===== Démos produit (showcase) =====
(function(){
  var stages = Array.prototype.slice.call(document.querySelectorAll('[data-demo]'));
  if(!stages.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  stages.forEach(function(st){
    var times = st.dataset.steps.split(',').map(Number);
    var loop = parseFloat(st.dataset.loop || 15) * 1000;
    var timers = [], ivs = [], running = false, visible = false;
    var bar = st.querySelector('.sf-bar i');

    function clearAll(){ timers.forEach(clearTimeout); ivs.forEach(clearInterval); timers = []; ivs = []; }
    function later(fn, ms){ timers.push(setTimeout(fn, ms)); }

    function typeIn(el){
      var txt = el.dataset.text || '', i = 0;
      if(reduce){ el.textContent = txt; return; }
      el.textContent = '';
      var iv = setInterval(function(){ el.textContent = txt.slice(0, ++i); if(i >= txt.length) clearInterval(iv); }, 26);
      ivs.push(iv);
    }
    function countIn(el){
      var end = parseFloat(el.dataset.count), suf = el.dataset.suf || '';
      if(reduce){ el.textContent = end + suf; return; }
      var t0 = null, dur = 1100;
      (function step(t){
        if(!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e) + suf;
        if(p < 1 && running) requestAnimationFrame(step); else el.textContent = end + suf;
      })(performance.now());
    }
    function apply(i){
      st.classList.add('s' + i);
      st.querySelectorAll('[data-type-at="' + i + '"]').forEach(typeIn);
      st.querySelectorAll('[data-count-at="' + i + '"]').forEach(countIn);
    }
    function resetState(){
      for(var i = 1; i <= times.length; i++) st.classList.remove('s' + i);
      st.querySelectorAll('[data-type-at]').forEach(function(el){ el.textContent = ''; });
      st.querySelectorAll('[data-count-at]').forEach(function(el){ el.textContent = '0' + (el.dataset.suf || ''); });
    }
    function progress(){
      if(!bar) return;
      bar.style.transition = 'none'; bar.style.width = '0';
      void bar.offsetWidth;
      bar.style.transition = 'width ' + (loop / 1000) + 's linear'; bar.style.width = '100%';
    }
    function run(){
      clearAll(); running = true;
      st.classList.add('noanim'); resetState(); void st.offsetWidth; st.classList.remove('noanim'); st.classList.remove('out');
      progress();
      times.forEach(function(t, k){ later(function(){ apply(k + 1); }, t * 1000); });
      later(function(){ st.classList.add('out'); }, loop - 450);
      later(function(){ if(visible) run(); else { running = false; st.classList.remove('out'); for(var i = 1; i <= times.length; i++) apply(i); } }, loop);
    }

    if(reduce){ for(var i = 1; i <= times.length; i++) apply(i); }
    else if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        es.forEach(function(e){ visible = e.isIntersecting; if(visible && !running) run(); });
      }, {threshold: .45}).observe(st);
    } else run();

    var rp = st.querySelector('[data-demo-replay]');
    if(rp) rp.addEventListener('click', function(){ visible = true; run(); });
  });
})();
