/* CineBox: simple movie and TV browser (plain JavaScript).
   Works instantly with the built-in demo titles.
   For live data, paste a free TMDB API key (v3) below. */
const API_KEY = '';

const IMG = 'https://image.tmdb.org/t/p/';
const API = 'https://api.themoviedb.org/3';
const LIST_KEY = 'cinebox-list';
const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="#222228"/>' +
  '<text x="200" y="305" text-anchor="middle" font-family="Arial" font-size="22" fill="#9a9aa6">No image</text></svg>'
);
const GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama',
  14: 'Fantasy', 27: 'Horror', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller', 9648: 'Mystery', 36: 'History',
  10751: 'Family', 10402: 'Music', 10759: 'Action', 10765: 'Sci-Fi',
};

/* ---------- Demo data ---------- */
const d = (id, type, title, year, rating, genre, poster, backdrop, overview, trailer) =>
  ({ id, type, title, year, rating, genre, poster, backdrop, overview, trailer: trailer || null });

const DEMO_MOVIES = [
  d(155, 'movie', 'The Dark Knight', '2008', 8.5, 'Action', '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    'Batman, Gordon and Harvey Dent set out to dismantle Gotham\'s organised crime, until a chaotic new criminal pushes the city to its limits.', 'EXeTwQWrcwY'),
  d(27205, 'movie', 'Inception', '2010', 8.4, 'Sci-Fi', '/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    'A thief who steals secrets from inside people\'s dreams is offered a final job: plant an idea instead of taking one.', 'YoHD9XEInc0'),
  d(157336, 'movie', 'Interstellar', '2014', 8.4, 'Adventure', '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    'With Earth running out of time, a former pilot joins a crew travelling through a wormhole to find humanity a new home.', 'zSWdZVtXT7E'),
  d(872585, 'movie', 'Oppenheimer', '2023', 8.1, 'Drama', '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    'The story of J. Robert Oppenheimer and the wartime project that built the first atomic bomb.', 'uYPbbksJxIg'),
  d(438631, 'movie', 'Dune', '2021', 7.8, 'Sci-Fi', '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', '/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
    'Paul Atreides travels to the desert planet Arrakis as rival houses fight for control of its priceless resource.', 'n9xhJrPXop4'),
  d(496243, 'movie', 'Parasite', '2019', 8.5, 'Thriller', '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', null,
    'A poor family slowly works its way into the lives of a wealthy household, with consequences nobody planned for.', '5xH0HfJHsaY'),
  d(324857, 'movie', 'Spider-Man: Into the Spider-Verse', '2018', 8.4, 'Animation', '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', null,
    'Teenager Miles Morales becomes Spider-Man and meets other heroes from across the multiverse.'),
  d(475557, 'movie', 'Joker', '2019', 8.1, 'Crime', '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', null,
    'A struggling performer in a decaying Gotham City is pushed toward a breaking point.'),
  d(419430, 'movie', 'Get Out', '2017', 7.6, 'Horror', '/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg', null,
    'A young photographer visits his girlfriend\'s family estate and slowly realises something is very wrong.'),
  d(313369, 'movie', 'La La Land', '2016', 7.9, 'Romance', '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', null,
    'A jazz pianist and an aspiring actress fall in love while chasing their dreams in Los Angeles.'),
  d(129, 'movie', 'Spirited Away', '2001', 8.5, 'Animation', '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', null,
    'A girl wanders into a world of spirits and must work in a bathhouse to free her parents.'),
];

const DEMO_SERIES = [
  d(1396, 'tv', 'Breaking Bad', '2008', 8.9, 'Crime', '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    'A high-school chemistry teacher diagnosed with cancer starts making drugs to secure his family\'s future.', 'HhesaQXLuRY'),
  d(66732, 'tv', 'Stranger Things', '2016', 8.6, 'Sci-Fi', '/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg', '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    'When a boy vanishes in a small Indiana town, his friends uncover secret experiments and a gate to another dimension.', 'b9EkMc79ZSU'),
  d(1399, 'tv', 'Game of Thrones', '2011', 8.4, 'Fantasy', '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    'Noble families fight for the Iron Throne of Westeros while an ancient threat gathers in the north.', 'rlR4PJn8b8I'),
  d(100088, 'tv', 'The Last of Us', '2023', 8.6, 'Drama', '/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg', null,
    'Twenty years after a fungal pandemic, a hardened survivor escorts a teenage girl across a ruined America.'),
  d(60059, 'tv', 'Better Call Saul', '2015', 8.9, 'Crime', '/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg', null,
    'The rise of small-time lawyer Jimmy McGill and how he becomes Saul Goodman.'),
  d(136315, 'tv', 'The Bear', '2022', 8.3, 'Drama', '/eKfVzzEazSIjJMrw9ADa2x8ksLz.jpg', null,
    'A young chef returns to Chicago to run his late brother\'s struggling sandwich shop.'),
];

/* ---------- State and helpers ---------- */
const state = { view: 'home', query: '', movies: [], series: [], results: [], searching: false, hero: 0, heroItems: [], notice: '', current: null };
const registry = new Map();
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const keyOf = (it) => `${it.type}-${it.id}`;
const imgUrl = (path, size) => (path ? `${IMG}${size}${path}` : FALLBACK);
const rate = (n) => (n ? Number(n).toFixed(1) : '');
const register = (items) => { items.forEach((it) => registry.set(keyOf(it), it)); return items; };

function readList() {
  try { const v = JSON.parse(localStorage.getItem(LIST_KEY)); return Array.isArray(v) ? v : []; } catch { return []; }
}
function writeList(list) {
  try { localStorage.setItem(LIST_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}
const inList = (it) => readList().some((x) => keyOf(x) === keyOf(it));
function toggleList(it) {
  const list = readList();
  const next = inList(it) ? list.filter((x) => keyOf(x) !== keyOf(it)) : [{ ...it }, ...list];
  writeList(next);
  updateCount();
}
function updateCount() {
  const n = readList().length;
  const badge = $('#listCount');
  badge.textContent = n;
  badge.hidden = n === 0;
}
function debounce(fn, wait) {
  let t;
  const run = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
  run.cancel = () => clearTimeout(t);
  return run;
}

/* ---------- Data loading ---------- */
async function api(path, extra = '') {
  const res = await fetch(`${API}${path}?api_key=${API_KEY}${extra}`);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}
function mapItem(x, type) {
  return {
    id: x.id, type, title: x.title || x.name || 'Untitled',
    year: (x.release_date || x.first_air_date || '').slice(0, 4),
    rating: x.vote_average || 0, genre: GENRES[(x.genre_ids || [])[0]] || '',
    poster: x.poster_path, backdrop: x.backdrop_path, overview: x.overview || '', trailer: null,
  };
}
async function loadData() {
  if (API_KEY) {
    try {
      const [m, t] = await Promise.all([api('/movie/popular'), api('/tv/popular')]);
      state.movies = register(m.results.map((x) => mapItem(x, 'movie')));
      state.series = register(t.results.map((x) => mapItem(x, 'tv')));
      return;
    } catch {
      state.notice = 'Could not reach TMDB, so demo titles are shown. Check your API key and connection.';
    }
  } else {
    state.notice = 'Showing demo titles. Add a TMDB API key at the top of script.js for live data.';
  }
  state.movies = register(DEMO_MOVIES);
  state.series = register(DEMO_SERIES);
}
const trending = () => [...state.movies, ...state.series].sort((a, b) => b.rating - a.rating);

async function runSearch(q) {
  state.query = q;
  $('#searchClear').hidden = !q;
  if (!q) { state.results = []; state.searching = false; render(); return; }
  state.searching = true;
  render();
  let results;
  if (API_KEY) {
    try {
      const data = await api('/search/multi', `&query=${encodeURIComponent(q)}`);
      results = data.results.filter((x) => x.media_type === 'movie' || x.media_type === 'tv').map((x) => mapItem(x, x.media_type));
    } catch { /* fall back to local filter */ }
  }
  if (!results) results = [...state.movies, ...state.series].filter((it) => it.title.toLowerCase().includes(q.toLowerCase()));
  if (state.query !== q) return; // a newer search replaced this one
  state.results = register(results);
  state.searching = false;
  render();
}

/* ---------- Rendering ---------- */
function card(it) {
  return `<article class="card" data-key="${esc(keyOf(it))}" tabindex="0" role="button" aria-label="${esc(it.title)}, view details">
    <div class="poster">
      <img src="${imgUrl(it.poster, 'w342')}" alt="${esc(it.title)} poster" loading="lazy" onerror="this.onerror=null;this.src=FALLBACK">
      ${rate(it.rating) ? `<span class="badge">${rate(it.rating)}</span>` : ''}
    </div>
    <h3>${esc(it.title)}</h3>
    <p><span>${esc(it.year)}</span><span>${esc(it.genre)}</span></p>
  </article>`;
}
function row(title, items) {
  return `<section class="section">
    <div class="section-head"><h2>${esc(title)}</h2>
      <div class="arrows">
        <button type="button" class="arrow" data-dir="-1" aria-label="Scroll ${esc(title)} left">&lsaquo;</button>
        <button type="button" class="arrow" data-dir="1" aria-label="Scroll ${esc(title)} right">&rsaquo;</button>
      </div></div>
    <div class="track">${items.map(card).join('')}</div>
  </section>`;
}
function gridPage(title, items, emptyText) {
  return `<h1 class="page-title">${title}</h1>${noticeHtml()}
    <section class="section">${items.length ? `<div class="grid">${items.map(card).join('')}</div>` : `<p class="empty">${emptyText}</p>`}</section>`;
}
const noticeHtml = () => (state.notice ? `<p class="note" role="status">${esc(state.notice)}</p>` : '');

function render() {
  const app = $('#app');
  document.querySelectorAll('.nav-links [data-view]').forEach((b) => {
    b.classList.toggle('active', !state.query && b.dataset.view === state.view);
  });

  if (state.query) {
    const title = `Results for &ldquo;${esc(state.query)}&rdquo;`;
    app.innerHTML = state.searching
      ? `<h1 class="page-title">${title}</h1><p class="empty" role="status">Searching&hellip;</p>`
      : gridPage(title, state.results, `No results for &ldquo;${esc(state.query)}&rdquo;. Try another title.`);
  } else if (state.view === 'movies') {
    app.innerHTML = gridPage('Movies', sortByRating(state.movies), 'No movies to show.');
  } else if (state.view === 'tv') {
    app.innerHTML = gridPage('TV Series', sortByRating(state.series), 'No TV series to show.');
  } else if (state.view === 'list') {
    app.innerHTML = gridPage('My List', register(readList()), 'Your list is empty. Open any title and select &ldquo;+ My List&rdquo; to save it here.');
  } else {
    state.heroItems = trending().filter((it) => it.backdrop).slice(0, 5);
    if (state.hero >= state.heroItems.length) state.hero = 0;
    app.innerHTML = `<section class="hero" id="hero" aria-label="Featured titles"></section>${noticeHtml()}
      ${row('Trending Now', trending().slice(0, 12))}
      ${row('Popular Movies', state.movies)}
      ${row('Popular TV Series', state.series)}`;
    paintHero();
  }
}
const sortByRating = (items) => [...items].sort((a, b) => b.rating - a.rating);

function paintHero() {
  const hero = $('#hero');
  const it = state.heroItems[state.hero];
  if (!hero || !it) { if (hero) hero.remove(); return; }
  hero.innerHTML = `
    <img class="hero-bg" src="${imgUrl(it.backdrop, 'w1280')}" alt="" onerror="this.onerror=null;this.style.display='none'">
    <div class="hero-content">
      <p class="hero-tag">${it.type === 'tv' ? 'TV series' : 'Movie'}</p>
      <h2 class="hero-title">${esc(it.title)}</h2>
      <p class="hero-meta"><span>${esc(it.year)}</span><span>${esc(it.genre)}</span>${rate(it.rating) ? `<span class="rate">&#9733; ${rate(it.rating)}</span>` : ''}</p>
      <p class="hero-text">${esc(it.overview)}</p>
      <div class="hero-actions">
        <button type="button" class="btn btn-primary" data-hero-play="${esc(keyOf(it))}">&#9654; Play trailer</button>
        <button type="button" class="btn btn-ghost" data-hero-info="${esc(keyOf(it))}">More details</button>
      </div>
    </div>
    <div class="dots" role="group" aria-label="Choose featured title">
      ${state.heroItems.map((h, i) => `<button type="button" class="dot${i === state.hero ? ' active' : ''}" data-dot="${i}" aria-label="Show ${esc(h.title)}"></button>`).join('')}
    </div>`;
}

/* ---------- Details modal ---------- */
function openModal(it, autoplay = false) {
  state.current = it;
  $('#mPoster').src = imgUrl(it.poster, 'w342');
  $('#mPoster').alt = `${it.title} poster`;
  $('#mPoster').onerror = function () { this.onerror = null; this.src = FALLBACK; };
  $('#mTitle').textContent = it.title;
  $('#mMeta').innerHTML = [
    it.type === 'tv' ? 'TV series' : 'Movie', it.year, it.genre,
    rate(it.rating) ? `<span class="rate">&#9733; ${rate(it.rating)}</span>` : '',
  ].filter(Boolean).map((x) => `<span>${x.startsWith('<') ? x : esc(x)}</span>`).join('');
  $('#mOverview').textContent = it.overview || 'No description is available for this title.';
  $('#mVideo').hidden = true;
  $('#mVideo').innerHTML = '';
  $('#mNote').hidden = true;
  paintListButton();
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#modalClose').focus();
  if (autoplay) playTrailer();
}
function closeModal() {
  $('#modal').hidden = true;
  $('#mVideo').innerHTML = '';
  document.body.style.overflow = '';
  state.current = null;
}
function paintListButton() {
  const saved = state.current && inList(state.current);
  const btn = $('#mList');
  btn.textContent = saved ? '\u2713 In My List' : '+ My List';
  btn.classList.toggle('saved', Boolean(saved));
}
async function playTrailer() {
  const it = state.current;
  if (!it) return;
  const note = $('#mNote');
  let key = it.trailer;
  if (!key && API_KEY) {
    try {
      const data = await api(`/${it.type}/${it.id}/videos`);
      const yt = (data.results || []).filter((v) => v.site === 'YouTube');
      const pick = yt.find((v) => v.type === 'Trailer') || yt.find((v) => v.type === 'Teaser');
      key = pick ? pick.key : null;
    } catch { key = null; }
  }
  if (state.current !== it) return;
  if (!key) {
    note.textContent = 'No trailer is available for this title.';
    note.hidden = false;
    return;
  }
  note.hidden = true;
  $('#mVideo').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?autoplay=1&rel=0" title="${esc(it.title)} trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  $('#mVideo').hidden = false;
}

/* ---------- Events ---------- */
document.addEventListener('click', (e) => {
  const view = e.target.closest('[data-view]');
  if (view) {
    e.preventDefault();
    state.view = view.dataset.view;
    state.query = '';
    $('#searchInput').value = '';
    $('#searchClear').hidden = true;
    render();
    window.scrollTo(0, 0);
    return;
  }
  const arrow = e.target.closest('.arrow');
  if (arrow) {
    const track = arrow.closest('.section').querySelector('.track');
    track.scrollBy({ left: Number(arrow.dataset.dir) * track.clientWidth * 0.85, behavior: 'smooth' });
    return;
  }
  const dot = e.target.closest('[data-dot]');
  if (dot) { state.hero = Number(dot.dataset.dot); paintHero(); return; }
  const play = e.target.closest('[data-hero-play]');
  if (play) { openModal(registry.get(play.dataset.heroPlay), true); return; }
  const info = e.target.closest('[data-hero-info]');
  if (info) { openModal(registry.get(info.dataset.heroInfo)); return; }
  const c = e.target.closest('.card');
  if (c) { openModal(registry.get(c.dataset.key)); return; }
  if (e.target === $('#modal')) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('card')) {
    e.preventDefault();
    openModal(registry.get(e.target.dataset.key));
  }
});

$('#modalClose').addEventListener('click', closeModal);
$('#mTrailer').addEventListener('click', playTrailer);
$('#mList').addEventListener('click', () => {
  if (!state.current) return;
  toggleList(state.current);
  paintListButton();
  if (state.view === 'list' && !state.query) render();
});

const debouncedSearch = debounce((q) => runSearch(q), 400);
$('#searchInput').addEventListener('input', (e) => {
  const q = e.target.value.trim();
  $('#searchClear').hidden = !e.target.value;
  if (!q) { debouncedSearch.cancel(); runSearch(''); return; }
  debouncedSearch(q);
});
$('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  runSearch($('#searchInput').value.trim());
});
$('#searchClear').addEventListener('click', () => {
  $('#searchInput').value = '';
  runSearch('');
  $('#searchInput').focus();
});

setInterval(() => {
  if (state.view === 'home' && !state.query && $('#modal').hidden && state.heroItems.length > 1 && $('#hero')) {
    state.hero = (state.hero + 1) % state.heroItems.length;
    paintHero();
  }
}, 6500);

/* ---------- Start ---------- */
(async function init() {
  updateCount();
  $('#app').innerHTML = '<p class="empty" role="status">Loading&hellip;</p>';
  await loadData();
  render();
})();
