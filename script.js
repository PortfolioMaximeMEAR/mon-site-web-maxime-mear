// ── PROGRESS BAR + PARALLAX + BACK TO TOP + NAVBAR ──
var progressBar = document.getElementById('progress-bar');
var backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  var scrollY = window.scrollY;
  
  // Navbar scroll state
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 20);
  
  // Hide scroll hint
  var hint = document.querySelector('.scroll-hint');
  if (hint) hint.style.opacity = scrollY > 80 ? '0' : '';
  
  // Active nav link
  let cur = '';
  document.querySelectorAll('section[id]').forEach(s => { if (scrollY >= s.offsetTop - 80) cur = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
  
  // Progress bar
  if (progressBar) {
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (scrollY / docH) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  
  // Back to top button
  if (backToTop) backToTop.classList.toggle('show', scrollY > 500);
});

// Back to top click
if (backToTop) {
  backToTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── STAGGER REVEAL — auto-assign stagger classes to siblings ──
(function() {
  var containers = ['.exp-list', '.projets-grid-wip', '.certs-grid', '.loisirs-grid', '.reco-grid', '.ss-grid', '.about-kpis'];
  containers.forEach(function(sel) {
    var container = document.querySelector(sel);
    if (!container) return;
    var children = container.querySelectorAll('.reveal, .projet-wip-card, .cert-card, .loisir-card, .reco-card, .ss-card, .about-kpi, .exp-card');
    children.forEach(function(child, i) {
      child.classList.add('reveal');
      child.classList.add('stagger-' + Math.min(i + 1, 7));
    });
  });
})();

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── HORIZONTAL TIMELINE — Drag to scroll ──
(function() {
  var wrap = document.getElementById('htl-wrap');
  if (!wrap) return;
  var isDown = false, startX, scrollLeft;
  wrap.addEventListener('mousedown', function(e) { isDown = true; startX = e.pageX - wrap.offsetLeft; scrollLeft = wrap.scrollLeft; });
  wrap.addEventListener('mouseleave', function() { isDown = false; });
  wrap.addEventListener('mouseup', function() { isDown = false; });
  wrap.addEventListener('mousemove', function(e) {
    if (!isDown) return; e.preventDefault();
    var x = e.pageX - wrap.offsetLeft;
    wrap.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
  // Auto-scroll to current (last card)
  setTimeout(function() { wrap.scrollLeft = wrap.scrollWidth; }, 600);
})();

const filterBtns = document.querySelectorAll('.m-filter-btn');
const expCards = document.querySelectorAll('.exp-card');
const filterCount = document.getElementById('filter-count');

function updateCount() {
  const visible = document.querySelectorAll('.exp-card:not(.hidden)').length;
  if (filterCount) filterCount.textContent = visible + ' expérience' + (visible > 1 ? 's' : '') + ' affichée' + (visible > 1 ? 's' : '');
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const activeFilters = Array.from(filterBtns)
      .filter(b => b.classList.contains('active'))
      .map(b => b.getAttribute('data-filter'));
    expCards.forEach(card => {
      card.style.animation = 'none';
      const cardMatches = activeFilters.some(filter => card.classList.contains(filter));
      if (activeFilters.length === 0) {
        card.classList.add('hidden');
      } else if (cardMatches) {
        card.classList.remove('hidden');
        void card.offsetWidth;
        card.style.animation = 'fadeIn 0.4s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
    updateCount();
  });
});

const btnFr = document.getElementById('btn-fr');
const btnEn = document.getElementById('btn-en');
const translatableElements = document.querySelectorAll('[data-en]');
const pageTitle = document.getElementById('page-title');

translatableElements.forEach(el => { el.setAttribute('data-fr', el.innerHTML); });

btnEn.addEventListener('click', (e) => {
  e.preventDefault();
  if (btnEn.classList.contains('active')) return;
  btnFr.classList.remove('active'); btnEn.classList.add('active');
  document.body.classList.add('lang-en');
  translatableElements.forEach(el => { el.innerHTML = el.getAttribute('data-en'); });
  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
    if (!el.getAttribute('data-fr-ph')) el.setAttribute('data-fr-ph', el.getAttribute('placeholder'));
    if (el.getAttribute('data-en-ph')) el.setAttribute('placeholder', el.getAttribute('data-en-ph'));
  });
  if (filterCount) filterCount.textContent = filterCount.textContent.replace('expériences affichées', 'experiences shown').replace('expérience affichée', 'experience shown');
  if (pageTitle) document.title = pageTitle.getAttribute('data-en');
});

btnFr.addEventListener('click', (e) => {
  e.preventDefault();
  if (btnFr.classList.contains('active')) return;
  btnEn.classList.remove('active'); btnFr.classList.add('active');
  document.body.classList.remove('lang-en');
  translatableElements.forEach(el => { el.innerHTML = el.getAttribute('data-fr'); });
  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
    if (el.getAttribute('data-fr-ph')) el.setAttribute('placeholder', el.getAttribute('data-fr-ph'));
  });
  updateCount();
  if (pageTitle) document.title = pageTitle.getAttribute('data-fr');
});

// MAILTO — formulaire de contact dynamique
document.getElementById('btn-send-mail').addEventListener('click', () => {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value.trim();
  const message = document.getElementById('cf-message').value.trim();

  if (!subject && !message) {
    document.getElementById('cf-subject').focus();
    return;
  }

  const finalSubject = subject || 'Prise de contact — Portfolio Maxime Méar';
  const bodyLines = [];
  if (name)    bodyLines.push('De : ' + name);
  if (email)   bodyLines.push('Email : ' + email);
  if (name || email) bodyLines.push('');
  if (message) bodyLines.push(message);
  bodyLines.push('');
  bodyLines.push('---');
  bodyLines.push('Message envoyé depuis le portfolio de Maxime Méar');

  const mailto = 'mailto:maximemearpro@gmail.com'
    + '?subject=' + encodeURIComponent(finalSubject)
    + '&body='    + encodeURIComponent(bodyLines.join('\n'));

  window.location.href = mailto;

  setTimeout(() => {
    document.getElementById('cf-name').value    = '';
    document.getElementById('cf-email').value   = '';
    document.getElementById('cf-subject').value = '';
    document.getElementById('cf-message').value = '';

    const btn = document.getElementById('btn-send-mail');
    const original = btn.textContent;
    btn.textContent = '✓ Application mail ouverte !';
    btn.style.background = '#1D9E75';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 3000);
  }, 500);
});

// ═══════════════════════════════════════════
// ÉLÉMENTS DYNAMIQUES
// ═══════════════════════════════════════════

// ── ANIMATED NUMBER COUNTERS ──
function animateCounter(el, target, suffix) {
  suffix = suffix || '';
  var isDecimal = String(target).indexOf('.') !== -1;
  var duration = 1800;
  var start = performance.now();
  function tick(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = eased * target;
    if (isDecimal) {
      el.textContent = current.toFixed(1).replace('.', ',') + suffix;
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
    if (progress < 1) requestAnimationFrame(tick);
    else {
      if (isDecimal) el.textContent = String(target).replace('.', ',') + suffix;
      else el.textContent = target + suffix;
    }
  }
  requestAnimationFrame(tick);
}

var counterObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = 'true';
      var text = e.target.textContent.trim();
      var skip = ['🏆','Bac+5','Bac+6','N°1','~50%','100%','80%','3 ans'];
      if (skip.indexOf(text) !== -1) return;
      var cleaned = text.replace(/\s/g, '').replace(',', '.').replace('+', '');
      var num = parseFloat(cleaned);
      if (isNaN(num)) return;
      var suffix = text.indexOf('+') !== -1 ? '+' : '';
      animateCounter(e.target, num, suffix);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.hstat-n, .ak-number, .kpi-n').forEach(function(el) {
  counterObserver.observe(el);
});

// ── HERO PARTICLE CANVAS ──
(function() {
  var hero = document.getElementById('hero');
  if (!hero) return;
  var canvas = document.createElement('canvas');
  canvas.id = 'hero-particles';
  canvas.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0.35;';
  hero.insertBefore(canvas, hero.querySelector('.hero-content'));
  var ctx = canvas.getContext('2d');
  var w, h, particles = [];
  function resize() { w = canvas.width = hero.offsetWidth; h = canvas.height = hero.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (var i = 0; i < 45; i++) {
    particles.push({ x: Math.random()*(w||1200), y: Math.random()*(h||800), r: Math.random()*1.5+0.5, dx: (Math.random()-0.5)*0.25, dy: (Math.random()-0.5)*0.15-0.1, opacity: Math.random()*0.5+0.15 });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(232,192,106,' + p.opacity + ')'; ctx.fill();
    }
    for (var a = 0; a < particles.length; a++) {
      for (var b = a+1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 110) {
          ctx.beginPath(); ctx.moveTo(particles[a].x, particles[a].y); ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = 'rgba(232,192,106,' + (0.07*(1-dist/110)) + ')'; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── HERO TYPING EFFECT — single cycle, starts after 10s ──
(function() {
  var el = document.querySelector('.hero-sub');
  if (!el) return;
  function isFr() { return document.getElementById('btn-fr').classList.contains('active'); }
  var phrases = {
    fr: ['Maxime MEAR · Aéronautique · Spatial · Défense','Ingénieur Qualité & Amélioration Continue','EN 9100 · ISO 9001 · Lean Green Belt','Disponible CDI — Septembre 2026'],
    en: ['Maxime MEAR · Aeronautics · Space · Defense','Quality & Continuous Improvement Engineer','EN 9100 · ISO 9001 · Lean Green Belt','Available for CDI — September 2026']
  };
  var idx = 0, charIdx = 0, deleting = false, pauseTime = 0;
  var totalPhrases = phrases.fr.length;
  var cyclesDone = 0;
  function getPhrase() { var list = isFr() ? phrases.fr : phrases.en; return list[idx % list.length]; }
  function tick() {
    var phrase = getPhrase();
    if (pauseTime > 0) { pauseTime--; setTimeout(tick, 50); return; }
    if (!deleting) {
      charIdx++; el.textContent = phrase.substring(0, charIdx);
      if (charIdx >= phrase.length) {
        cyclesDone++;
        if (cyclesDone >= totalPhrases) { el.classList.add('typing-done'); return; } // Stop after all phrases shown
        deleting = true; pauseTime = 60;
      }
      setTimeout(tick, 45 + Math.random()*30);
    } else {
      charIdx--; el.textContent = phrase.substring(0, charIdx);
      if (charIdx <= 0) { deleting = false; idx++; setTimeout(tick, 300); }
      else setTimeout(tick, 25);
    }
  }
  setTimeout(function() { charIdx = getPhrase().length; pauseTime = 80; cyclesDone = 0; deleting = true; tick(); }, 10000);
})();

// ── PARALLAX SUBTIL — bande d'images ──
(function() {
  var band = document.querySelector('.img-band');
  if (!band) return;
  var imgs = band.querySelectorAll('img');
  window.addEventListener('scroll', function() {
    var rect = band.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      var offset = (progress - 0.5) * 30;
      imgs.forEach(function(img) { img.style.transform = 'translateY('+offset+'px) scale(1.05)'; });
    }
  }, { passive: true });
})();

// ── MAGNETIC HOVER — bouton nav CTA ──
(function() {
  var btn = document.querySelector('.nav-cta');
  if (!btn) return;
  btn.addEventListener('mousemove', function(e) {
    var rect = btn.getBoundingClientRect();
    var x = e.clientX - rect.left - rect.width/2;
    var y = e.clientY - rect.top - rect.height/2;
    btn.style.transform = 'translate('+(x*0.12)+'px,'+(y*0.12)+'px)';
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.3s ease';
    setTimeout(function(){ btn.style.transition = ''; }, 300);
  });
})();

// ── COMPTEUR DE PROJETS dans le badge WIP ──
(function() {
  var badge = document.querySelector('.wip-badge');
  if (!badge) return;
  var countSpan = document.createElement('span');
  countSpan.style.cssText = 'margin-left:0.75rem;padding:0.15rem 0.6rem;background:rgba(232,192,106,0.3);border-radius:100px;font-size:0.65rem;letter-spacing:0.08em;';
  var cards = document.querySelectorAll('.projet-wip-card');
  function isFr() { return document.getElementById('btn-fr').classList.contains('active'); }
  countSpan.textContent = cards.length + (isFr() ? ' projets' : ' projects');
  badge.appendChild(countSpan);
})();

// ── HAMBURGER MENU MOBILE ──
(function() {
  var hamburger = document.getElementById('nav-hamburger');
  var menu = document.getElementById('nav-links-menu');
  if (!hamburger || !menu) return;
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('open');
    menu.classList.toggle('mobile-open');
    document.body.style.overflow = menu.classList.contains('mobile-open') ? 'hidden' : '';
  });
  // Close menu when a link is clicked
  menu.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      hamburger.classList.remove('open');
      menu.classList.remove('mobile-open');
      document.body.style.overflow = '';
    });
  });
})();

// ── MODALES PROJETS ──
// ── MODAL KPI COUNTER ANIMATION ──
function animateModalKpis(modal) {
  if (!modal) return;
  modal.querySelectorAll('.pm-kpi-n').forEach(function(el) {
    if (el.dataset.animated) return;
    var raw = el.textContent.trim();
    var match = raw.match(/^([+\-]?[\d\s,.]+)/);
    if (!match) return;
    var numStr = match[1].replace(/\s/g, '').replace(',', '.');
    var num = parseFloat(numStr);
    if (isNaN(num)) return;
    var suffix = raw.replace(match[0], '');
    var prefix = '';
    if (raw.startsWith('+')) prefix = '+';
    if (raw.startsWith('-')) { prefix = '-'; num = Math.abs(num); }
    var isDecimal = numStr.indexOf('.') !== -1;
    var useComma = match[0].indexOf(',') !== -1;
    var hasSpace = match[0].indexOf(' ') !== -1;
    var duration = 1200;
    var start = performance.now();
    el.dataset.animated = 'true';
    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = eased * num;
      var display;
      if (isDecimal) {
        display = current.toFixed(1);
        if (useComma) display = display.replace('.', ',');
      } else {
        display = Math.floor(current).toString();
        if (hasSpace) display = display.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }
      el.textContent = prefix + display + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function openProjectModal(id) {
  var modal = document.getElementById('modal-' + id);
  if (!modal) return;
  // Reset animated flags for fresh count
  modal.querySelectorAll('.pm-kpi-n').forEach(function(el) { delete el.dataset.animated; });
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Re-run translation if EN is active
  if (document.getElementById('btn-en').classList.contains('active')) {
    modal.querySelectorAll('[data-en]').forEach(function(el) {
      if (!el.getAttribute('data-fr')) el.setAttribute('data-fr', el.innerHTML);
      el.innerHTML = el.getAttribute('data-en');
    });
  }
  // Animate KPIs after modal opens
  setTimeout(function() { animateModalKpis(modal); }, 300);
}
function closeProjectModal() {
  document.querySelectorAll('.pm-overlay.open').forEach(function(m) { m.classList.remove('open'); });
  document.body.style.overflow = '';
}
// Close on overlay click (not modal body)
document.querySelectorAll('.pm-overlay').forEach(function(overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeProjectModal();
  });
});
// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeProjectModal();
});

// ── SKILL TILES — tilt 3D au hover ──
document.querySelectorAll('.skill-tile').forEach(function(tile) {
  tile.addEventListener('mousemove', function(e) {
    var rect = tile.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;
    tile.style.transform = 'perspective(600px) rotateY('+(x*5)+'deg) rotateX('+(-y*5)+'deg)';
  });
  tile.addEventListener('mouseleave', function() {
    tile.style.transform = '';
    tile.style.transition = 'transform 0.4s ease';
    setTimeout(function(){ tile.style.transition = ''; }, 400);
  });
});