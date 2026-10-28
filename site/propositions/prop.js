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

// ===== Film engine =====
(function(){
  var film = document.querySelector('.film');
  if(!film) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scenes = Array.prototype.slice.call(film.querySelectorAll('.scene'));
  var bars = Array.prototype.slice.call(film.querySelectorAll('.film-bars i'));
  var durs = scenes.map(function(s){ return parseFloat(s.dataset.dur || 6) * 1000; });
  var idx = 0, start = 0, paused = false, elapsedAtPause = 0, raf = null, started = false;
  var playBtn = film.querySelector('[data-film="play"]');

  function countUp(scene){
    scene.querySelectorAll('[data-count]').forEach(function(el){
      var end = parseFloat(el.dataset.count), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
      var delay = parseFloat(el.dataset.delay || 400);
      el.textContent = pre + '0' + suf;
      if(reduce){ el.textContent = pre + end + suf; return; }
      setTimeout(function(){
        var t0 = null;
        (function step(t){
          if(!t0) t0 = t;
          var p = Math.min((t - t0) / 1300, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(end * e) + suf;
          if(p < 1 && scene.classList.contains('active')) requestAnimationFrame(step);
          else el.textContent = pre + end + suf;
        })(performance.now());
      }, delay);
    });
  }
  function show(i){
    scenes.forEach(function(s, k){ s.classList.toggle('active', k === i); });
    film.setAttribute('data-theme', scenes[i].dataset.theme || 'dark');
    bars.forEach(function(b, k){ b.style.width = k < i ? '100%' : '0'; });
    countUp(scenes[i]);
    idx = i; start = performance.now(); elapsedAtPause = 0;
  }
  function tick(now){
    if(!paused){
      var el = now - start, p = Math.min(el / durs[idx], 1);
      if(bars[idx]) bars[idx].style.width = (p * 100) + '%';
      if(p >= 1){ show((idx + 1) % scenes.length); }
    }
    raf = requestAnimationFrame(tick);
  }
  function play(){ if(!started){ started = true; show(0); raf = requestAnimationFrame(tick); } }
  if(reduce){
    // Show all scenes' content statically: just display the gains scene
    var g = scenes.findIndex(function(s){ return s.classList.contains('gains'); });
    show(g >= 0 ? g : 0);
  } else if('IntersectionObserver' in window){
    var o = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ play(); if(paused && !film.dataset.userPaused) toggle(false); }
        else if(started && !paused){ toggle(true, true); }
      });
    }, {threshold: .35});
    o.observe(film);
  } else play();

  function toggle(p, auto){
    paused = p;
    if(p){ elapsedAtPause = performance.now() - start; }
    else { start = performance.now() - elapsedAtPause; }
    film.classList.toggle('paused', p);
    if(!auto) film.dataset.userPaused = p ? '1' : '';
    if(playBtn) { playBtn.textContent = p ? '▶' : '❚❚'; playBtn.setAttribute('aria-label', p ? 'Lecture' : 'Pause'); }
  }
  if(playBtn) playBtn.addEventListener('click', function(){ if(!started) play(); else toggle(!paused); });
  var rp = film.querySelector('[data-film="replay"]');
  if(rp) rp.addEventListener('click', function(){ if(!started){ play(); return; } if(paused) toggle(false); show(0); });
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
