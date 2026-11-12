/* Eun Creatives — YouTube portfolio gallery. */

// Category keys + the two colors used for each card's gradient.
const CATEGORIES = {
  social: { label: 'Short-Form Social Media', c1: '#ff38ac', c2: '#7a1a5c' },
  podcast: { label: 'Podcast Clip', c1: '#3c36b5', c2: '#020288' },
  all:   { label: 'All work',            c1: '#3c36b5', c2: '#020288' },
  vlog:  { label: 'Short Vlog',     c1: '#a4fbc4', c2: '#2f9e6b' },
  ugc:   { label: 'UGC Ad',           c1: '#a4fbc4', c2: '#2f9e6b' },
  heads: { label: 'Talking Head', c1: '#fb9e22', c2: '#b45e00' },
  ai:    { label: 'AI Short Reels',      c1: '#00d4ff', c2: '#0057a8' },
};

const PROJECTS = [
  { id: '_r4ryn-SUug', title: 'AI Short Reel 01', cat: 'ai' },
  { id: 'ogtM6V-I-Zo', title: 'Podcast Clip 01', cat: 'podcast' },
  { id: 'IEBtHm4Sf5Y', title: 'Podcast Clip 02', cat: 'podcast' },
  { id: 'EunGrnf--ac', title: 'UGC Ad 01', cat: 'ugc' },
  { id: '4fDBlDhXdME', title: 'UGC Ad 02', cat: 'ugc' },
  { id: 'lHM6VJErUTo', title: 'UGC Ad 03', cat: 'ugc' },
  { id: 't8IMeADS3NE', title: 'UGC Ad 04', cat: 'ugc' },
  { id: 'IfX7Dw9voHk', title: 'UGC Ad 05', cat: 'ugc' },
  { id: 'buN8ykqrrxo', title: 'Short-Form Social Media 01', cat: 'social' },
  { id: 'Tj0G5FCl26g', title: 'UGC Ad 06', cat: 'ugc' },
  { id: 'xS4Jjd2t_3s', title: 'UGC Ad 07', cat: 'ugc' },
  { id: 'c8rhzrCbzXU', title: 'Short Vlog 01', cat: 'vlog' },
  { id: 'wMOc-taL85c', title: 'Short Vlog 02', cat: 'vlog' },
  { id: 'rlqBIpldvwc', title: 'Talking Head 01', cat: 'heads' },
  { id: 'd4ijnQFpjDo', title: 'Talking Head 02', cat: 'heads' },
  { id: '0VfMaLLGWAo', title: 'Talking Head 03', cat: 'heads' },
];

/* ---------- Helpers ---------- */
const $ = sel => document.querySelector(sel);
const playIcon = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
/* ---------- Render filters ---------- */
const filtersEl = $('#filters');
const usedCats = ['all', ...new Set(PROJECTS.map(p => p.cat))];
usedCats.forEach((key, i) => {
  const btn = document.createElement('button');
  btn.className = 'filter-btn' + (i === 0 ? ' active' : '');
  btn.textContent = CATEGORIES[key] ? CATEGORIES[key].label : key;
  btn.dataset.cat = key;
  filtersEl.appendChild(btn);
});

/* ---------- Render cards ---------- */
const grid = $('#workGrid');
let cardObserver;

function cardHTML(p, index) {
  const cat = CATEGORIES[p.cat] || CATEGORIES.all;
  return `
    <article class="work-card" data-cat="${p.cat}" data-index="${index}"
             style="--c1:${cat.c1};--c2:${cat.c2}">
      <div class="poster">
        <img class="video-thumb" src="https://i.ytimg.com/vi/${p.id}/hqdefault.jpg" alt="${p.title}" loading="lazy">
        <button class="poster-icon" type="button" aria-label="Play ${p.title}">${playIcon}</button>
      </div>
    </article>`;
}

function renderCards(list) {
  grid.innerHTML = list.map((p, i) => cardHTML(p, PROJECTS.indexOf(p))).join('');
  observeCards();
}

/* ---------- Filtering ---------- */
filtersEl.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cat = btn.dataset.cat;
  const filtered = cat === 'all' ? PROJECTS.slice() : PROJECTS.filter(p => p.cat === cat);
  renderCards(filtered);
});

renderCards(PROJECTS.slice());

/* ---------- Play YouTube videos inside the cards ---------- */
grid.addEventListener('click', e => {
  const card = e.target.closest('.work-card');
  if (!card) return;
  const p = PROJECTS[Number(card.dataset.index)];
  const poster = card.querySelector('.poster');
  if (!p || !poster || poster.dataset.playing) return;
  poster.dataset.playing = '1';
  const player = document.createElement('iframe');
  player.className = 'yt-embed';
  player.src = `https://www.youtube.com/embed/${p.id}?autoplay=1&rel=0&playsinline=1`;
  player.title = p.title;
  player.allowFullscreen = true;
  player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  poster.replaceChildren(player);
});

/* ---------- Scroll reveal ---------- */
function observeCards() {
  const cards = document.querySelectorAll('.work-card');
  if (!cards.length) return;
  if (!('IntersectionObserver' in window)) { cards.forEach(c => c.classList.add('in')); return; }
  if (!cardObserver) {
    cardObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
  }
  cards.forEach(c => cardObserver.observe(c));
}

/* ---------- Nav smooth scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ---------- Stat counters ---------- */
const statNums = document.querySelectorAll('.stat dd[data-count]');
if ('IntersectionObserver' in window && statNums.length) {
  const statObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count);
      const suffix = el.querySelector('i');
      const suffixHTML = suffix ? suffix.outerHTML : '';
      const dur = 1200, start = performance.now();
      function tick(now) {
        const prog = Math.min((now - start) / dur, 1);
        el.innerHTML = Math.floor(prog * end) + suffixHTML;
        if (prog < 1) requestAnimationFrame(tick); else el.innerHTML = end + suffixHTML;
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statObs.observe(el));
}

/* ---------- Active nav highlight ---------- */
const navLinks = document.querySelectorAll('.site-header nav a[href^="#"]');
const sections = document.querySelectorAll('main section[id]');
if ('IntersectionObserver' in window && sections.length) {
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector('.site-header nav a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(sec => navObs.observe(sec));
}

