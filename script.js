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
  { id: 'GSP-BabdJPY', title: 'Talking Head 04', cat: 'heads' },
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
const videoRatings = new Map();
const publicRatings = new Map();
const ratingEndpoint = '/.netlify/functions/ratings';
let visitorId;
try { visitorId = localStorage.getItem('eun-rating-visitor'); } catch {}
if (!/^[a-f0-9-]{36}$/i.test(visitorId || '')) {
  visitorId = crypto.randomUUID();
  try { localStorage.setItem('eun-rating-visitor', visitorId); } catch {}
}

function updateRatingBadge(card, id) {
  const summary = publicRatings.get(id);
  const badge = card.querySelector('.rating-badge');
  badge.hidden = !summary?.count;
  badge.textContent = summary?.count ? `★ ${summary.average.toFixed(1)} · ${summary.count}` : '';
  badge.setAttribute('aria-label', summary?.count ? `Average ${summary.average} out of 5 from ${summary.count} ratings` : 'No ratings yet');
}

async function loadPublicRatings() {
  try {
    const response = await fetch(ratingEndpoint, { cache: 'no-store' });
    if (!response.ok) return;
    const summaries = await response.json();
    Object.entries(summaries).forEach(([id, summary]) => publicRatings.set(id, summary));
    grid.querySelectorAll('.work-card').forEach(card => updateRatingBadge(card, PROJECTS[Number(card.dataset.index)].id));
  } catch { /* Visitors can retry by selecting a star. */ }
}


function getRating(id) {
  if (videoRatings.has(id)) return videoRatings.get(id);
  let rating = 0;
  try {
    const saved = Number(localStorage.getItem(`eun-video-rating:${id}`));
    if (Number.isInteger(saved) && saved >= 1 && saved <= 5) rating = saved;
  } catch { /* Ratings still work when browser storage is unavailable. */ }
  videoRatings.set(id, rating);
  return rating;
}

function ratingHTML(p) {
  const rating = getRating(p.id);
  return `<div class="video-rating" role="group" aria-label="Rate ${p.title}">
    <span class="rating-label">Rate</span>
    <div class="rating-stars">${[1, 2, 3, 4, 5].map(star =>
      `<button type="button" class="rating-star${star <= rating ? ' is-filled' : ''}" data-rating="${star}" aria-label="Rate ${p.title} ${star} out of 5 stars" aria-pressed="${star === rating}"><span aria-hidden="true">★</span></button>`
    ).join('')}</div>
    <span class="rating-status" aria-live="polite"></span>
  </div>`;
}

function cardHTML(p, index) {
  const cat = CATEGORIES[p.cat] || CATEGORIES.all;
  return `
    <article class="work-card" data-cat="${p.cat}" data-index="${index}"
             style="--c1:${cat.c1};--c2:${cat.c2}">
      <span class="rating-badge" aria-live="polite" hidden></span>
      <div class="poster">
        <img class="video-thumb" src="https://i.ytimg.com/vi/${p.id}/hqdefault.jpg" alt="${p.title}" loading="lazy">
        <button class="poster-icon" type="button" aria-label="Play ${p.title}">${playIcon}</button>
      </div>
      ${ratingHTML(p)}
    </article>`;
}

function renderCards(list) {
  grid.innerHTML = list.map((p, i) => cardHTML(p, PROJECTS.indexOf(p))).join('');
  grid.querySelectorAll('.work-card').forEach(card => updateRatingBadge(card, PROJECTS[Number(card.dataset.index)].id));
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
loadPublicRatings();

/* ---------- Play YouTube videos inside the cards ---------- */
grid.addEventListener('click', async e => {
  const card = e.target.closest('.work-card');
  if (!card) return;
  const p = PROJECTS[Number(card.dataset.index)];
  if (!p) return;
  const ratingButton = e.target.closest('.rating-star');
  if (ratingButton) {
    const rating = Number(ratingButton.dataset.rating);
    const buttons = card.querySelectorAll('.rating-star');
    buttons.forEach(button => { button.disabled = true; });
    const status = card.querySelector('.rating-status');
    status.textContent = 'Saving…';
    try {
      const response = await fetch(ratingEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: p.id, visitor: visitorId, rating })
      });
      if (!response.ok) throw new Error('Unable to save');
      const summary = await response.json();
      publicRatings.set(p.id, summary);
      videoRatings.set(p.id, rating);
      try { localStorage.setItem(`eun-video-rating:${p.id}`, String(rating)); } catch {}
      buttons.forEach(button => {
        const star = Number(button.dataset.rating);
        button.classList.toggle('is-filled', star <= rating);
        button.setAttribute('aria-pressed', String(star === rating));
      });
      updateRatingBadge(card, p.id);
      status.textContent = 'Thanks!';
    } catch {
      status.textContent = 'Could not save. Try again.';
    } finally {
      buttons.forEach(button => { button.disabled = false; });
    }
    return;
  }
  if (e.target.closest('.video-rating, .rating-badge')) return;
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

