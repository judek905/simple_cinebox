/* CineBox: movie and TV browser (plain JavaScript, no build step).
   Works instantly with the built-in demo titles.
   For live data, paste a free TMDB API key (v3) below.

   This is a drop-in replacement for the original script.js: it uses the same
   HTML ids and classes, and injects the small amount of extra HTML and CSS
   that the new features need. */
'use strict';

const API_KEY = '';

const IMG = 'https://image.tmdb.org/t/p/';
const API = 'https://api.themoviedb.org/3';
const LIST_KEY = 'cinebox-list';
const META_KEY = 'cinebox-meta';      // your star ratings and "watched" marks
const PREF_KEY = 'cinebox-prefs';     // remembered sort order
const RECENT_KEY = 'cinebox-recent';  // recent searches
const SLIDE_MS = 7000;
const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="#222228"/>' +
  '<text x="200" y="305" text-anchor="middle" font-family="Arial" font-size="22" fill="#9a9aa6">No image</text></svg>'
);
const GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama',
  14: 'Fantasy', 27: 'Horror', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller', 9648: 'Mystery', 36: 'History',
  10751: 'Family', 10402: 'Music', 10759: 'Action', 10765: 'Sci-Fi',
};
const SORTS = [['default', 'Default'], ['rating', 'Top rated'], ['newest', 'Newest'], ['oldest', 'Oldest'], ['title', 'A to Z']];
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Demo data ---------- */
const d = (id, type, title, year, rating, genre, poster, backdrop, overview, trailer) =>
  ({ id, type, title, year, rating, genre, genres: [genre], poster, backdrop, overview, trailer: trailer || null });

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

/* ---------- Storage (all wrapped, so a blocked localStorage never breaks the app) ---------- */
const store = {
  get(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? fallback : v; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
};
const savedPrefs = store.get(PREF_KEY, {}) || {};

/* ---------- State and helpers ---------- */
const state = {
  view: 'home', query: '', movies: [], series: [], results: [], searching: false,
  hero: 0, heroItems: [], notice: '', current: null,
  titleOpen: false, pushed: false, base: '#/', ctx: [], opener: null, autoplay: '',
  genre: 'All', sort: savedPrefs.sort || 'default', listFilter: 'all',
  pages: { movie: 1, tv: 1 }, loadingMore: false,
  suggest: [], sIndex: -1,
};
const registry = new Map();
const details = new Map();
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const keyOf = (it) => `${it.type}-${it.id}`;
const imgUrl = (path, size) => (path ? `${IMG}${size}${path}` : FALLBACK);
const rate = (n) => (n ? Number(n).toFixed(1) : '');
const genresOf = (it) => (it.genres && it.genres.length ? it.genres : it.genre ? [it.genre] : []);
const setText = (sel, text) => { const n = $(sel); if (n) n.textContent = text; };
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const viewHash = (v) => (v === 'home' ? '#/' : `#/${v}`);

// Always hand back the one shared object for a title, so edits (like a fetched trailer) are never lost.
function register(items) {
  return items.map((it) => {
    const k = keyOf(it);
    if (!registry.has(k)) registry.set(k, it);
    return registry.get(k);
  });
}

/* My List, ratings and watched marks */
let listCache = null;
let metaCache = null;
function readList() { const v = store.get(LIST_KEY, []); return Array.isArray(v) ? v : []; }
function writeList(list) { store.set(LIST_KEY, list); listCache = null; }
const listKeys = () => { if (!listCache) listCache = new Set(readList().map(keyOf)); return listCache; };
const inList = (it) => listKeys().has(keyOf(it));
function getMeta() {
  if (!metaCache) {
    const m = store.get(META_KEY, {}) || {};
    metaCache = { ratings: m.ratings && typeof m.ratings === 'object' ? m.ratings : {}, watched: m.watched && typeof m.watched === 'object' ? m.watched : {} };
  }
  return metaCache;
}
const saveMeta = () => store.set(META_KEY, getMeta());

function updateCount() {
  const badge = $('#listCount');
  if (!badge) return;
  const n = readList().length;
  badge.textContent = n;
  badge.hidden = n === 0;
}

function toggleList(it) {
  if (!it) return;
  const had = inList(it);
  const list = readList();
  writeList(had ? list.filter((x) => keyOf(x) !== keyOf(it)) : [{ ...it }, ...list]);
  refreshAfterListChange();
  if (had) {
    toast(`Removed \u201C${it.title}\u201D from My List`, {
      label: 'Undo',
      run: () => { writeList([{ ...it }, ...readList().filter((x) => keyOf(x) !== keyOf(it))]); refreshAfterListChange(); },
    });
  } else {
    toast(`Added \u201C${it.title}\u201D to My List`);
  }
}

function refreshAfterListChange() {
  updateCount();
  if (state.view === 'list' && !state.query) render(); else syncCards();
  paintListButton();
  syncHeroButton();
}

function toggleWatched(it, on) {
  const m = getMeta();
  if (on) m.watched[keyOf(it)] = true; else delete m.watched[keyOf(it)];
  saveMeta();
  if (state.view === 'list' && !state.query) render(); else syncCards();
}

function setRating(it, n) {
  const m = getMeta();
  if (m.ratings[keyOf(it)] === n) delete m.ratings[keyOf(it)]; else m.ratings[keyOf(it)] = n;
  saveMeta();
  paintStars();
  syncCards();
}

function debounce(fn, wait) {
  let t;
  const run = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); };
  run.cancel = () => clearTimeout(t);
  return run;
}

/* ---------- Toasts ---------- */
function toast(message, action) {
  let box = $('#cbToasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'cbToasts';
    box.setAttribute('aria-live', 'polite');
    document.body.append(box);
  }
  const t = document.createElement('div');
  t.className = 'cb-toast';
  const span = document.createElement('span');
  span.textContent = message;
  t.append(span);
  if (action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = action.label;
    b.addEventListener('click', () => { action.run(); t.remove(); });
    t.append(b);
  }
  box.append(t);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => t.classList.add('out'), action ? 5200 : 3200);
  setTimeout(() => t.remove(), action ? 5600 : 3600);
}

/* ---------- Data loading ---------- */
async function api(path, extra = '', signal) {
  const res = await fetch(`${API}${path}?api_key=${API_KEY}${extra}`, { signal });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}
function mapItem(x, type) {
  const genres = [...new Set((x.genre_ids || []).map((id) => GENRES[id]).filter(Boolean))];
  return {
    id: x.id, type, title: x.title || x.name || 'Untitled',
    year: (x.release_date || x.first_air_date || '').slice(0, 4),
    rating: x.vote_average || 0, genre: genres[0] || '', genres,
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

async function loadMore(type) {
  if (!API_KEY || state.loadingMore) return;
  state.loadingMore = true;
  const btn = $('#loadMore');
  if (btn) { btn.disabled = true; btn.textContent = 'Loading\u2026'; }
  const y = window.scrollY;
  try {
    const page = state.pages[type] + 1;
    const data = await api(`/${type}/popular`, `&page=${page}`);
    const field = type === 'movie' ? 'movies' : 'series';
    const fresh = register(data.results.map((x) => mapItem(x, type)));
    state[field] = [...new Map([...state[field], ...fresh].map((it) => [keyOf(it), it])).values()];
    state.pages[type] = page;
  } catch {
    toast('Could not load more titles. Try again.');
  }
  state.loadingMore = false;
  render();
  window.scrollTo(0, y);
}

let searchCtl = null;
async function runSearch(q, { silent = false } = {}) {
  state.query = q;
  state.genre = 'All';
  const clear = $('#searchClear');
  if (clear) clear.hidden = !q;
  if (searchCtl) searchCtl.abort();
  if (!q) {
    state.results = [];
    state.searching = false;
    if (!silent) history.replaceState(null, '', viewHash(state.view));
    setTitle();
    render();
    renderSuggest();
    return;
  }
  if (!silent) history.replaceState(null, '', `#/search/${encodeURIComponent(q)}`);
  setTitle(`\u201C${q}\u201D`);
  state.searching = true;
  render();
  searchCtl = new AbortController();
  let results;
  if (API_KEY) {
    try {
      const data = await api('/search/multi', `&query=${encodeURIComponent(q)}`, searchCtl.signal);
      results = data.results.filter((x) => x.media_type === 'movie' || x.media_type === 'tv').map((x) => mapItem(x, x.media_type));
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  if (!results) {
    const lower = q.toLowerCase();
    results = [...state.movies, ...state.series].filter((it) =>
      it.title.toLowerCase().includes(lower) || it.year === lower || genresOf(it).some((g) => g.toLowerCase() === lower));
  }
  if (state.query !== q) return; // a newer search replaced this one
  state.results = register(results);
  state.searching = false;
  render();
  renderSuggest();
}
const debouncedSearch = debounce((q) => runSearch(q), 300);

function saveRecent(q) {
  if (!q) return;
  const rest = store.get(RECENT_KEY, []).filter((x) => String(x).toLowerCase() !== q.toLowerCase());
  store.set(RECENT_KEY, [q, ...rest].slice(0, 6));
}
function clearSearch() {
  debouncedSearch.cancel();
  const input = $('#searchInput');
  if (input) input.value = '';
  runSearch('');
}

/* ---------- Details (cast, runtime, similar titles, trailer) ---------- */
const fmtRuntime = (m) => (m ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : '');
function similarLocal(it) {
  const gs = genresOf(it);
  return [...registry.values()]
    .filter((o) => keyOf(o) !== keyOf(it) && genresOf(o).some((g) => gs.includes(g)))
    .sort((a, b) => b.rating - a.rating).slice(0, 8);
}
async function loadDetails(it) {
  const k = keyOf(it);
  if (details.has(k)) return details.get(k);
  let result = null;
  if (API_KEY) {
    try {
      const x = await api(`/${it.type}/${it.id}`, '&append_to_response=videos,credits,similar');
      const yt = ((x.videos && x.videos.results) || []).filter((v) => v.site === 'YouTube');
      const pick = yt.find((v) => v.type === 'Trailer') || yt.find((v) => v.type === 'Teaser');
      result = {
        tagline: x.tagline || '',
        runtime: it.type === 'movie' ? fmtRuntime(x.runtime) : (x.number_of_seasons ? plural(x.number_of_seasons, 'season') : ''),
        genres: (x.genres || []).map((g) => g.name),
        cast: ((x.credits && x.credits.cast) || []).slice(0, 6).map((c) => c.name),
        similar: register(((x.similar && x.similar.results) || []).filter((s) => s.poster_path).slice(0, 8).map((s) => mapItem(s, it.type))),
        trailer: pick ? pick.key : null,
      };
      if (result.trailer && !it.trailer) it.trailer = result.trailer;
    } catch { result = null; }
  }
  if (!result) {
    result = { tagline: '', runtime: '', genres: genresOf(it), cast: [], similar: similarLocal(it), trailer: it.trailer };
    if (API_KEY) return result; // failed request: show basics but retry next time
  }
  details.set(k, result);
  return result;
}
async function fetchOne(arg) {
  const [type, id] = arg.split('-');
  if (!['movie', 'tv'].includes(type) || !id) return null;
  try {
    const x = await api(`/${type}/${id}`);
    return register([mapItem({ ...x, genre_ids: (x.genres || []).map((g) => g.id) }, type)])[0];
  } catch { return null; }
}

/* ---------- Rendering ---------- */
function card(it) {
  const k = keyOf(it);
  const saved = inList(it);
  const meta = getMeta();
  const mine = meta.ratings[k];
  const seen = meta.watched[k];
  const tag = [seen ? 'Watched' : '', mine ? `\u2605 ${mine}` : ''].filter(Boolean).join(' \u00B7 ');
  return `<article class="card" data-key="${esc(k)}" tabindex="0" role="button" aria-keyshortcuts="L" aria-label="${esc(it.title)}, view details">
    <div class="poster">
      <img src="${imgUrl(it.poster, 'w342')}" alt="${esc(it.title)} poster" loading="lazy" draggable="false">
      ${rate(it.rating) ? `<span class="badge">${rate(it.rating)}</span>` : ''}
      <button type="button" class="cb-quick${saved ? ' saved' : ''}" data-quick="${esc(k)}" tabindex="-1" aria-hidden="true" title="${saved ? 'Remove from' : 'Add to'} My List">${saved ? '&#10003;' : '+'}</button>
      ${tag ? `<span class="cb-seen">${esc(tag)}</span>` : ''}
    </div>
    <h3>${esc(it.title)}</h3>
    <p><span>${esc(it.year)}</span><span>${esc(it.genre)}</span></p>
  </article>`;
}
function syncCards() {
  document.querySelectorAll('.card').forEach((c) => {
    const it = registry.get(c.dataset.key);
    if (it) c.outerHTML = card(it);
  });
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
const noticeHtml = () => (state.notice
  ? `<p class="note" role="status">${esc(state.notice)} <button type="button" class="cb-link" data-dismiss-notice>Dismiss</button></p>` : '');

function sortItems(items, fallback) {
  const mode = state.sort === 'default' ? fallback : state.sort;
  const arr = [...items];
  switch (mode) {
    case 'rating': return arr.sort((a, b) => b.rating - a.rating);
    case 'newest': return arr.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
    case 'oldest': return arr.sort((a, b) => (Number(a.year) || 9999) - (Number(b.year) || 9999));
    case 'title': return arr.sort((a, b) => a.title.localeCompare(b.title));
    default: return arr;
  }
}

function gridPage(title, all, emptyHtml, o = {}) {
  let items = all;
  if (o.list) {
    const watched = getMeta().watched;
    if (state.listFilter === 'todo') items = items.filter((it) => !watched[keyOf(it)]);
    if (state.listFilter === 'seen') items = items.filter((it) => watched[keyOf(it)]);
  }
  const genres = [...new Set(all.flatMap(genresOf))].sort();
  if (state.genre !== 'All' && !genres.includes(state.genre)) state.genre = 'All';
  if (state.genre !== 'All') items = items.filter((it) => genresOf(it).includes(state.genre));
  items = sortItems(items, o.fallback || 'none');

  const chip = (attr, value, label, active) =>
    `<button type="button" class="cb-chip${active ? ' active' : ''}" ${attr}="${esc(value)}" aria-pressed="${active}">${esc(label)}</button>`;
  const genreChips = genres.length > 1
    ? `<div class="cb-chips" role="group" aria-label="Filter by genre">${['All', ...genres].map((g) => chip('data-genre', g, g, g === state.genre)).join('')}</div>` : '';
  const listTabs = o.list
    ? `<div class="cb-chips" role="group" aria-label="Filter your list">${[['all', 'All'], ['todo', 'To watch'], ['seen', 'Watched']].map(([v, l]) => chip('data-listfilter', v, l, v === state.listFilter)).join('')}</div>` : '';
  const sortSelect = `<label class="cb-sort">Sort <select data-sort aria-label="Sort titles">${SORTS.map(([v, l]) =>
    `<option value="${v}"${v === state.sort ? ' selected' : ''}>${l}</option>`).join('')}</select></label>`;
  const tools = all.length
    ? `<div class="cb-toolbar"><div class="cb-filters">${listTabs}${genreChips}</div>
        <div class="cb-tools">${sortSelect}<button type="button" class="cb-pill" data-surprise>Surprise me</button>${o.list ? '<button type="button" class="cb-pill" data-clear-list>Clear list</button>' : ''}</div></div>
       <p class="cb-count" role="status">${plural(items.length, 'title')}</p>` : '';
  const more = o.more && API_KEY
    ? `<div class="cb-more"><button type="button" class="cb-pill" id="loadMore" data-more="${o.more}">Load more</button></div>` : '';
  return `<h1 class="page-title">${title}</h1>${noticeHtml()}${tools}
    <section class="section">${items.length ? `<div class="grid">${items.map(card).join('')}</div>` : `<p class="empty">${emptyHtml}</p>`}</section>${more}`;
}

const skeleton = () => `<div class="cb-skel cb-skel-hero" aria-hidden="true"></div>
  ${[0, 1].map(() => `<div class="cb-skel-row" aria-hidden="true">${Array.from({ length: 10 }, () => '<div class="cb-skel cb-skel-card"></div>').join('')}</div>`).join('')}
  <p class="cb-visually-hidden" role="status">Loading</p>`;

function setTitle(part) { document.title = part ? `${part} \u2013 CineBox` : 'CineBox'; }

function render() {
  const app = $('#app');
  if (!app) return;
  document.querySelectorAll('.nav-links [data-view]').forEach((b) => {
    b.classList.toggle('active', !state.query && b.dataset.view === state.view);
  });

  if (state.query) {
    const title = `Results for &ldquo;${esc(state.query)}&rdquo;`;
    app.innerHTML = state.searching && !state.results.length
      ? `<h1 class="page-title">${title}</h1><div class="grid" aria-hidden="true">${Array.from({ length: 8 }, () => '<div class="cb-skel cb-skel-grid"></div>').join('')}</div><p class="cb-visually-hidden" role="status">Searching</p>`
      : gridPage(title, state.results, `No results for &ldquo;${esc(state.query)}&rdquo;. Try another title, a year, or a genre like Horror.`);
  } else if (state.view === 'movies') {
    app.innerHTML = gridPage('Movies', state.movies, 'No movies to show.', { fallback: 'rating', more: 'movie' });
  } else if (state.view === 'tv') {
    app.innerHTML = gridPage('TV Series', state.series, 'No TV series to show.', { fallback: 'rating', more: 'tv' });
  } else if (state.view === 'list') {
    app.innerHTML = gridPage('My List', register(readList()),
      'Your list is empty. Select the + on any poster to save it here, or <button type="button" class="cb-link" data-view="movies">browse movies</button>.', { list: true });
  } else {
    state.heroItems = trending().filter((it) => it.backdrop).slice(0, 5);
    if (state.hero >= state.heroItems.length) state.hero = 0;
    app.innerHTML = `<section class="hero" id="hero" aria-label="Featured titles"></section>${noticeHtml()}
      ${row('Trending Now', trending().slice(0, 12))}
      ${row('Popular Movies', state.movies)}
      ${row('Popular TV Series', state.series)}`;
    paintHero();
  }
  document.querySelectorAll('.track').forEach(updateArrows);
  const more = $('#loadMore');
  if (more && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { obs.disconnect(); loadMore(more.dataset.more); }
    }, { rootMargin: '300px' }).observe(more);
  }
}

/* ---------- Hero ---------- */
function paintHero() {
  const hero = $('#hero');
  const it = state.heroItems[state.hero];
  if (!hero || !it) { if (hero) hero.remove(); return; }
  const many = state.heroItems.length > 1;
  const k = esc(keyOf(it));
  hero.innerHTML = `
    <img class="hero-bg" src="${imgUrl(it.backdrop, 'w1280')}" alt="">
    <div class="hero-content">
      <p class="hero-tag">${it.type === 'tv' ? 'TV series' : 'Movie'}</p>
      <h2 class="hero-title">${esc(it.title)}</h2>
      <p class="hero-meta"><span>${esc(it.year)}</span><span>${esc(it.genre)}</span>${rate(it.rating) ? `<span class="rate">&#9733; ${rate(it.rating)}</span>` : ''}</p>
      <p class="hero-text">${esc(it.overview)}</p>
      <div class="hero-actions">
        <button type="button" class="btn btn-primary" data-hero-play="${k}">&#9654; Play trailer</button>
        <button type="button" class="btn btn-ghost" data-hero-info="${k}">More details</button>
        <button type="button" class="btn btn-ghost" data-hero-list="${k}">${inList(it) ? '\u2713 In My List' : '+ My List'}</button>
        <button type="button" class="btn btn-ghost" data-surprise>Surprise me</button>
      </div>
    </div>
    ${many ? `<button type="button" class="cb-hero-step" data-hero-step="-1" aria-label="Previous featured title">&lsaquo;</button>
              <button type="button" class="cb-hero-step" data-hero-step="1" aria-label="Next featured title">&rsaquo;</button>` : ''}
    ${many && !reduceMotion ? `<span class="cb-progress" aria-hidden="true" style="animation-duration:${SLIDE_MS}ms"></span>` : ''}
    <div class="dots" role="group" aria-label="Choose featured title">
      ${state.heroItems.map((h, i) => `<button type="button" class="dot${i === state.hero ? ' active' : ''}" data-dot="${i}" aria-label="Show ${esc(h.title)}"></button>`).join('')}
    </div>`;
}
function stepHero(dir) {
  const n = state.heroItems.length;
  if (n < 2 || !$('#hero')) return;
  state.hero = (state.hero + dir + n) % n;
  paintHero();
}
function syncHeroButton() {
  const b = $('[data-hero-list]');
  const it = b && registry.get(b.dataset.heroList);
  if (it) b.textContent = inList(it) ? '\u2713 In My List' : '+ My List';
}

/* ---------- Rows: arrow state ---------- */
function updateArrows(track) {
  const section = track.closest('.section');
  if (!section) return;
  const [prev, next] = section.querySelectorAll('.arrow');
  if (prev) prev.disabled = track.scrollLeft <= 4;
  if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
}

/* ---------- Routing (hash based: back button, refresh and shared links all work) ---------- */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [a, ...rest] = raw.split('/');
  let arg = rest.join('/');
  try { arg = decodeURIComponent(arg); } catch { /* keep raw */ }
  return { a: a || 'home', arg };
}
async function route() {
  const { a, arg } = parseHash();
  if (a === 'title') {
    let it = registry.get(arg);
    if (!it && API_KEY) it = await fetchOne(arg);
    if (!it) { history.replaceState(null, '', '#/'); return route(); }
    showModal(it);
    return;
  }
  if (state.titleOpen) hideModalUi();
  if (a === 'search' && arg) {
    const input = $('#searchInput');
    if (input && input.value !== arg) input.value = arg;
    if (arg !== state.query) await runSearch(arg, { silent: true });
    return;
  }
  const view = ['movies', 'tv', 'list'].includes(a) ? a : 'home';
  const changed = view !== state.view || Boolean(state.query);
  if (state.query) {
    state.query = '';
    state.results = [];
    const input = $('#searchInput');
    if (input) input.value = '';
    const clear = $('#searchClear');
    if (clear) clear.hidden = true;
  }
  if (view !== state.view) { state.genre = 'All'; state.listFilter = 'all'; }
  state.view = view;
  if (changed) render();
  setTitle(view === 'home' ? '' : { movies: 'Movies', tv: 'TV Series', list: 'My List' }[view]);
}
function goView(v) {
  const target = viewHash(v);
  const here = location.hash || '#/';
  if (here === target || (v === 'home' && here === '#')) {
    if (state.query) clearSearch();
  } else {
    location.hash = target;
  }
  window.scrollTo(0, 0);
}
function openTitle(it, ctx) {
  if (!it) return;
  register([it]);
  if (ctx) state.ctx = ctx;
  if (state.titleOpen) {
    history.replaceState(null, '', `#/title/${keyOf(it)}`);
    showModal(it);
    return;
  }
  state.base = location.hash || '#/';
  state.pushed = true;
  location.hash = `#/title/${keyOf(it)}`;
}
function closeTitle() {
  if (!state.titleOpen) return;
  if (state.pushed) { state.pushed = false; history.back(); return; }
  history.replaceState(null, '', state.base || '#/');
  route();
}
function surprise() {
  const all = [...state.movies, ...state.series];
  const fresh = all.filter((it) => !inList(it) && !getMeta().watched[keyOf(it)]);
  const pool = fresh.length ? fresh : all;
  if (pool.length) openTitle(pool[Math.floor(Math.random() * pool.length)], []);
}

/* ---------- Details modal ---------- */
function ensureModalExtras() {
  if ($('#mExtra')) return;
  const overview = $('#mOverview');
  const listBtn = $('#mList');
  if (overview) overview.insertAdjacentHTML('afterend', '<div id="mExtra" class="cb-extra"></div>');
  if (listBtn) {
    listBtn.insertAdjacentHTML('afterend',
      '<button type="button" class="btn btn-ghost" id="mShare">Share</button>' +
      '<button type="button" class="btn btn-ghost" id="mPrev" aria-label="Previous title" title="Previous (left arrow)">&lsaquo;</button>' +
      '<button type="button" class="btn btn-ghost" id="mNext" aria-label="Next title" title="Next (right arrow)">&rsaquo;</button>');
  }
}
function showModal(it) {
  const modal = $('#modal');
  if (!modal) return;
  ensureModalExtras();
  if (!state.titleOpen) state.opener = document.activeElement;
  const wasOpen = state.titleOpen;
  state.current = it;
  state.titleOpen = true;

  const poster = $('#mPoster');
  if (poster) {
    poster.removeAttribute('data-failed');
    poster.src = imgUrl(it.poster, 'w342');
    poster.alt = `${it.title} poster`;
  }
  setText('#mTitle', it.title);
  const meta = $('#mMeta');
  if (meta) {
    meta.innerHTML = [
      it.type === 'tv' ? 'TV series' : 'Movie', it.year, it.genre,
      rate(it.rating) ? `<span class="rate">&#9733; ${rate(it.rating)}</span>` : '',
    ].filter(Boolean).map((x) => `<span>${x.startsWith('<') ? x : esc(x)}</span>`).join('');
  }
  setText('#mOverview', it.overview || 'No description is available for this title.');
  const video = $('#mVideo');
  if (video) { video.hidden = true; video.innerHTML = ''; }
  const note = $('#mNote');
  if (note) note.hidden = true;
  const many = state.ctx.length > 1 && state.ctx.includes(keyOf(it));
  ['#mPrev', '#mNext'].forEach((s) => { const b = $(s); if (b) b.hidden = !many; });
  paintListButton();

  paintExtras(it, details.get(keyOf(it)) || null);
  loadDetails(it).then((dt) => { if (state.current === it) paintExtras(it, dt); });

  modal.hidden = false;
  modal.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  document.body.classList.add('cb-modal-open');
  setTitle(`${it.title}${it.year ? ` (${it.year})` : ''}`);
  if (!wasOpen) { const close = $('#modalClose'); if (close) close.focus(); }
  if (state.autoplay === keyOf(it)) { state.autoplay = ''; playTrailer(); }
}
function hideModalUi() {
  const modal = $('#modal');
  if (modal) modal.hidden = true;
  const video = $('#mVideo');
  if (video) video.innerHTML = '';
  document.body.style.overflow = '';
  document.body.classList.remove('cb-modal-open');
  state.titleOpen = false;
  state.pushed = false;
  state.current = null;
  setTitle(state.query ? `\u201C${state.query}\u201D` : state.view === 'home' ? '' : { movies: 'Movies', tv: 'TV Series', list: 'My List' }[state.view]);
  const back = state.opener;
  state.opener = null;
  if (back && document.contains(back) && back.focus) back.focus({ preventScroll: true });
}
function paintListButton() {
  const btn = $('#mList');
  if (!btn) return;
  const saved = Boolean(state.current && inList(state.current));
  btn.textContent = saved ? '\u2713 In My List' : '+ My List';
  btn.classList.toggle('saved', saved);
}
function paintExtras(it, dt) {
  const box = $('#mExtra');
  if (!box) return;
  const k = keyOf(it);
  const meta = getMeta();
  const parts = [];
  if (!dt) {
    parts.push(API_KEY ? '<div class="cb-skel cb-loading-line" aria-hidden="true"></div>' : '');
  } else {
    if (dt.tagline) parts.push(`<p class="cb-tagline">${esc(dt.tagline)}</p>`);
    const gs = dt.genres && dt.genres.length ? dt.genres : genresOf(it);
    const tags = [dt.runtime, ...gs].filter(Boolean);
    if (tags.length) parts.push(`<div class="cb-tags">${tags.map((t) => `<span class="cb-tag">${esc(t)}</span>`).join('')}</div>`);
    if (dt.cast && dt.cast.length) parts.push(`<p class="cb-cast"><strong>Starring</strong> ${esc(dt.cast.join(', '))}</p>`);
  }
  const mine = meta.ratings[k] || 0;
  parts.push(`<div class="cb-row">
      <div class="cb-rate" role="group" aria-label="Your rating">${[5, 4, 3, 2, 1].map((n) =>
        `<button type="button" class="cb-star${n <= mine ? ' on' : ''}" data-star="${n}" aria-label="Rate ${n} out of 5" aria-pressed="${n === mine}">&#9733;</button>`).join('')}</div>
      <label class="cb-check"><input type="checkbox" data-watched${meta.watched[k] ? ' checked' : ''}> Mark as watched</label>
    </div>`);
  if (dt && dt.similar && dt.similar.length) {
    parts.push(`<h3>More like this</h3><div class="cb-similar">${dt.similar.map((s) =>
      `<button type="button" class="cb-mini" data-open="${esc(keyOf(s))}" title="${esc(s.title)}"><img src="${imgUrl(s.poster, 'w185')}" alt="" loading="lazy" draggable="false"><span>${esc(s.title)}</span></button>`).join('')}</div>`);
  }
  box.innerHTML = parts.join('');
}
function paintStars() {
  if (!state.current) return;
  const mine = getMeta().ratings[keyOf(state.current)] || 0;
  document.querySelectorAll('#mExtra .cb-star').forEach((b) => {
    const n = Number(b.dataset.star);
    b.classList.toggle('on', n <= mine);
    b.setAttribute('aria-pressed', String(n === mine));
  });
}
async function playTrailer() {
  const it = state.current;
  if (!it) return;
  const note = $('#mNote');
  const video = $('#mVideo');
  let key = it.trailer;
  if (!key) { const dt = await loadDetails(it); key = dt && dt.trailer; }
  if (state.current !== it) return;
  if (!key || !video) {
    if (note) { note.textContent = 'No trailer is available for this title.'; note.hidden = false; }
    return;
  }
  if (note) note.hidden = true;
  video.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?autoplay=1&rel=0" title="${esc(it.title)} trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  video.hidden = false;
}
function stepModal(dir) {
  const ctx = state.ctx;
  if (ctx.length < 2 || !state.current) return;
  const i = ctx.indexOf(keyOf(state.current));
  if (i < 0) return;
  const next = registry.get(ctx[(i + dir + ctx.length) % ctx.length]);
  if (next) openTitle(next);
}
function trapFocus(e) {
  const modal = $('#modal');
  const nodes = [...modal.querySelectorAll('button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])')]
    .filter((n) => !n.disabled && !n.hidden && n.getClientRects().length > 0);
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
async function shareCurrent() {
  const it = state.current;
  if (!it) return;
  const url = `${location.href.split('#')[0]}#/title/${keyOf(it)}`;
  try {
    if (navigator.share) { await navigator.share({ title: it.title, text: `Check out ${it.title} on CineBox`, url }); return; }
    await navigator.clipboard.writeText(url);
    toast('Link copied to clipboard');
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    toast('Could not copy the link. Copy it from the address bar instead.');
  }
}

/* ---------- Search suggestions ---------- */
function ensureSuggest() {
  let box = $('#cbSuggest');
  const form = $('#searchForm');
  if (!box && form) {
    if (getComputedStyle(form).position === 'static') form.style.position = 'relative';
    box = document.createElement('ul');
    box.id = 'cbSuggest';
    box.className = 'cb-suggest';
    box.setAttribute('role', 'listbox');
    box.setAttribute('aria-label', 'Search suggestions');
    box.hidden = true;
    form.append(box);
  }
  return box;
}
function hideSuggest() {
  const box = $('#cbSuggest');
  if (box) box.hidden = true;
  state.sIndex = -1;
}
function renderSuggest() {
  const input = $('#searchInput');
  const box = ensureSuggest();
  if (!input || !box) return;
  const q = input.value.trim();
  let rows = [];
  if (document.activeElement === input) {
    if (!q) {
      rows = store.get(RECENT_KEY, []).slice(0, 5).map((text) => ({ recent: String(text) }));
    } else {
      const lower = q.toLowerCase();
      const pool = state.query === q && state.results.length
        ? state.results
        : [...registry.values()].filter((it) => it.title.toLowerCase().includes(lower));
      rows = pool.slice(0, 6).map((it) => ({ it }));
    }
  }
  state.suggest = rows;
  if (state.sIndex >= rows.length) state.sIndex = -1;
  box.hidden = rows.length === 0;
  box.innerHTML = rows.map((r, i) => (r.recent
    ? `<li role="option" id="cbs-${i}" data-recent="${esc(r.recent)}" aria-selected="false"><span class="cb-clock" aria-hidden="true">&#8634;</span><span>${esc(r.recent)}</span></li>`
    : `<li role="option" id="cbs-${i}" data-suggest="${esc(keyOf(r.it))}" aria-selected="false"><img src="${imgUrl(r.it.poster, 'w92')}" alt="" draggable="false"><span>${esc(r.it.title)}<small>${esc([r.it.type === 'tv' ? 'TV series' : 'Movie', r.it.year].filter(Boolean).join(', '))}</small></span></li>`)).join('');
  input.setAttribute('aria-expanded', String(!box.hidden));
  paintSuggestActive();
}
function paintSuggestActive() {
  const input = $('#searchInput');
  document.querySelectorAll('#cbSuggest li').forEach((li, i) => {
    li.classList.toggle('active', i === state.sIndex);
    li.setAttribute('aria-selected', String(i === state.sIndex));
  });
  if (input) {
    if (state.sIndex >= 0) input.setAttribute('aria-activedescendant', `cbs-${state.sIndex}`);
    else input.removeAttribute('aria-activedescendant');
  }
}
function pickSuggest(row) {
  if (!row) return;
  const input = $('#searchInput');
  if (row.recent) {
    if (input) input.value = row.recent;
    saveRecent(row.recent);
    hideSuggest();
    runSearch(row.recent);
    return;
  }
  saveRecent(input ? input.value.trim() : '');
  hideSuggest();
  openTitle(row.it, state.query ? state.results.map(keyOf) : []);
}

/* ---------- Events ---------- */
let suppressClick = false;
let drag = null;

document.addEventListener('click', (e) => {
  if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
  const t = e.target;
  if (!t || !t.closest) return;
  let hit;

  if ((hit = t.closest('[data-view]'))) { e.preventDefault(); goView(hit.dataset.view); return; }
  if (t.closest('[data-dismiss-notice]')) {
    state.notice = '';
    const n = t.closest('.note');
    if (n) n.remove();
    return;
  }
  if ((hit = t.closest('.arrow'))) {
    const track = hit.closest('.section').querySelector('.track');
    track.scrollBy({ left: Number(hit.dataset.dir) * track.clientWidth * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' });
    return;
  }
  if ((hit = t.closest('[data-dot]'))) { state.hero = Number(hit.dataset.dot); paintHero(); return; }
  if ((hit = t.closest('[data-hero-step]'))) { stepHero(Number(hit.dataset.heroStep)); return; }
  if ((hit = t.closest('[data-hero-play]'))) { state.autoplay = hit.dataset.heroPlay; openTitle(registry.get(hit.dataset.heroPlay), state.heroItems.map(keyOf)); return; }
  if ((hit = t.closest('[data-hero-info]'))) { openTitle(registry.get(hit.dataset.heroInfo), state.heroItems.map(keyOf)); return; }
  if ((hit = t.closest('[data-hero-list]'))) { toggleList(registry.get(hit.dataset.heroList)); return; }
  if (t.closest('[data-surprise]')) { surprise(); return; }
  if ((hit = t.closest('[data-genre]'))) { state.genre = hit.dataset.genre; render(); return; }
  if ((hit = t.closest('[data-listfilter]'))) { state.listFilter = hit.dataset.listfilter; render(); return; }
  if (t.closest('[data-clear-list]')) {
    const prev = readList();
    if (!prev.length) return;
    writeList([]);
    refreshAfterListChange();
    toast('Cleared My List', { label: 'Undo', run: () => { writeList(prev); refreshAfterListChange(); } });
    return;
  }
  if ((hit = t.closest('[data-more]'))) { loadMore(hit.dataset.more); return; }
  if ((hit = t.closest('[data-quick]'))) { e.stopPropagation(); toggleList(registry.get(hit.dataset.quick)); return; }

  /* search box */
  if (t.closest('#searchClear')) { clearSearch(); const i = $('#searchInput'); if (i) i.focus(); return; }
  if ((hit = t.closest('[data-suggest]'))) { pickSuggest(state.suggest[[...hit.parentNode.children].indexOf(hit)]); return; }
  if ((hit = t.closest('[data-recent]'))) { pickSuggest(state.suggest[[...hit.parentNode.children].indexOf(hit)]); return; }

  /* modal */
  if (t.closest('#modalClose') || t === $('#modal')) { closeTitle(); return; }
  if (t.closest('#mTrailer')) { playTrailer(); return; }
  if (t.closest('#mList')) { toggleList(state.current); return; }
  if (t.closest('#mShare')) { shareCurrent(); return; }
  if (t.closest('#mPrev')) { stepModal(-1); return; }
  if (t.closest('#mNext')) { stepModal(1); return; }
  if ((hit = t.closest('[data-star]'))) { if (state.current) setRating(state.current, Number(hit.dataset.star)); return; }
  if ((hit = t.closest('[data-open]'))) {
    const dt = state.current && details.get(keyOf(state.current));
    openTitle(registry.get(hit.dataset.open), dt && dt.similar ? dt.similar.map(keyOf) : []);
    return;
  }

  /* cards */
  if ((hit = t.closest('.card'))) {
    const siblings = [...hit.parentElement.children].filter((n) => n.classList.contains('card')).map((n) => n.dataset.key);
    openTitle(registry.get(hit.dataset.key), siblings);
  }
});

document.addEventListener('change', (e) => {
  const t = e.target;
  if (!t || !t.matches) return;
  if (t.matches('[data-sort]')) {
    state.sort = t.value;
    store.set(PREF_KEY, { ...savedPrefs, sort: state.sort });
    render();
    const s = $('[data-sort]');
    if (s) s.focus();
  } else if (t.matches('[data-watched]') && state.current) {
    toggleWatched(state.current, t.checked);
  }
});

document.addEventListener('keydown', (e) => {
  const t = e.target;
  const typing = t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);

  if (t && t.id === 'searchInput') {
    const n = state.suggest.length;
    const open = n > 0 && !$('#cbSuggest').hidden;
    if (e.key === 'ArrowDown' && open) { e.preventDefault(); state.sIndex = (state.sIndex + 1) % n; paintSuggestActive(); return; }
    if (e.key === 'ArrowUp' && open) { e.preventDefault(); state.sIndex = state.sIndex <= 0 ? n - 1 : state.sIndex - 1; paintSuggestActive(); return; }
    if (e.key === 'Enter' && open && state.sIndex >= 0) { e.preventDefault(); pickSuggest(state.suggest[state.sIndex]); return; }
  }

  if (e.key === 'Escape') {
    const box = $('#cbSuggest');
    if (state.titleOpen) closeTitle();
    else if (box && !box.hidden) hideSuggest();
    else if (state.query) clearSearch();
    return;
  }
  if (state.titleOpen) {
    if (e.key === 'Tab') trapFocus(e);
    else if (!typing && e.key === 'ArrowRight') stepModal(1);
    else if (!typing && e.key === 'ArrowLeft') stepModal(-1);
    return;
  }
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

  const onCard = t && t.classList && t.classList.contains('card');
  if (e.key === '/') { e.preventDefault(); const i = $('#searchInput'); if (i) i.focus(); }
  else if (e.key === '?') toast('Shortcuts: / search, L add or remove a focused title, arrow keys browse in details, Esc close');
  else if (onCard && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault();
    const key = t.dataset.key;
    toggleList(registry.get(key));
    const again = document.querySelector(`.card[data-key="${key}"]`);
    if (again) again.focus();
  } else if (onCard && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    const siblings = [...t.parentElement.children].filter((n) => n.classList.contains('card')).map((n) => n.dataset.key);
    openTitle(registry.get(t.dataset.key), siblings);
  }
});

/* search input */
document.addEventListener('input', (e) => {
  if (!e.target || e.target.id !== 'searchInput') return;
  const q = e.target.value.trim();
  const clear = $('#searchClear');
  if (clear) clear.hidden = !e.target.value;
  state.sIndex = -1;
  renderSuggest();
  if (!q) { debouncedSearch.cancel(); runSearch(''); return; }
  debouncedSearch(q);
});
document.addEventListener('submit', (e) => {
  if (!e.target || e.target.id !== 'searchForm') return;
  e.preventDefault();
  debouncedSearch.cancel();
  const q = ($('#searchInput').value || '').trim();
  saveRecent(q);
  hideSuggest();
  runSearch(q);
});
document.addEventListener('focusin', (e) => { if (e.target && e.target.id === 'searchInput') renderSuggest(); });
document.addEventListener('focusout', (e) => { if (e.target && e.target.id === 'searchInput') hideSuggest(); });
document.addEventListener('mousedown', (e) => { if (e.target.closest && e.target.closest('#cbSuggest')) e.preventDefault(); });

/* images that fail to load fall back to a placeholder (one retry only) */
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!img || img.tagName !== 'IMG' || img.dataset.failed) return;
  img.dataset.failed = '1';
  if (img.classList.contains('hero-bg')) img.style.display = 'none';
  else img.src = FALLBACK;
}, true);

/* hero: auto-advance is driven by the progress bar, which pauses on hover, focus and while a title is open */
document.addEventListener('animationend', (e) => {
  if (e.target.classList && e.target.classList.contains('cb-progress')) stepHero(1);
});
let touchX = null;
document.addEventListener('touchstart', (e) => { touchX = e.target.closest && e.target.closest('#hero') ? e.touches[0].clientX : null; }, { passive: true });
document.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 50) stepHero(dx < 0 ? 1 : -1);
}, { passive: true });

/* rows: arrow state while scrolling, and click-and-drag scrolling with a mouse */
document.addEventListener('scroll', (e) => {
  if (e.target.classList && e.target.classList.contains('track')) updateArrows(e.target);
}, true);
document.addEventListener('pointerdown', (e) => {
  const track = e.target.closest && e.target.closest('.track');
  if (!track || e.pointerType !== 'mouse' || e.button !== 0) return;
  drag = { track, x: e.clientX, left: track.scrollLeft, moved: false };
});
document.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (Math.abs(dx) > 6) { drag.moved = true; drag.track.classList.add('dragging'); }
  if (drag.moved) drag.track.scrollLeft = drag.left - dx;
});
document.addEventListener('pointerup', () => {
  if (!drag) return;
  drag.track.classList.remove('dragging');
  suppressClick = drag.moved;
  drag = null;
  setTimeout(() => { suppressClick = false; }, 0);
});

/* back to top */
window.addEventListener('scroll', () => {
  const b = $('#cbTop');
  if (b) b.classList.toggle('show', window.scrollY > 700);
}, { passive: true });

window.addEventListener('hashchange', route);
/* keep several open tabs in sync */
window.addEventListener('storage', (e) => {
  if (e.key === LIST_KEY || e.key === META_KEY) {
    listCache = null;
    metaCache = null;
    refreshAfterListChange();
  }
});

/* ---------- Injected styles (new features only; your own style.css is untouched) ---------- */
function injectStyles() {
  if ($('#cb-enhance')) return;
  const css = `
.poster{position:relative}
.cb-visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.cb-link{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}
.cb-toolbar{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;margin:0 0 12px}
.cb-filters{display:grid;gap:10px}
.cb-chips,.cb-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.cb-chip,.cb-pill{font:inherit;font-size:.85rem;color:inherit;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:6px 14px;cursor:pointer;transition:background .15s,transform .1s}
.cb-chip:hover,.cb-pill:hover{background:rgba(255,255,255,.18)}
.cb-chip:active,.cb-pill:active{transform:scale(.96)}
.cb-chip.active{background:var(--accent,#e50914);border-color:transparent;color:#fff}
.cb-sort{display:inline-flex;gap:6px;align-items:center;font-size:.85rem}
.cb-sort select{font:inherit;color:inherit;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:5px 8px}
.cb-sort option{color:#111}
.cb-count{font-size:.85rem;opacity:.7;margin:0 0 10px}
.cb-more{display:flex;justify-content:center;margin:24px 0}
.cb-quick{position:absolute;right:8px;bottom:8px;width:32px;height:32px;border-radius:50%;border:0;cursor:pointer;font-size:18px;line-height:1;color:#fff;background:rgba(0,0,0,.7);opacity:0;transform:scale(.85);transition:opacity .15s,transform .15s,background .15s}
.card:hover .cb-quick,.card:focus-visible .cb-quick,.cb-quick.saved{opacity:1;transform:none}
.cb-quick.saved{background:var(--accent,#e50914)}
@media (hover:none){.cb-quick{opacity:1;transform:none}}
.cb-seen{position:absolute;left:8px;bottom:8px;max-width:calc(100% - 56px);font-size:.7rem;padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.72);color:#fff}
@keyframes cbShimmer{from{background-position:-400px 0}to{background-position:400px 0}}
@keyframes cbFade{from{opacity:0}to{opacity:1}}
@keyframes cbProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.cb-skel{background:linear-gradient(90deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.06) 75%);background-size:800px 100%;animation:cbShimmer 1.3s infinite linear;border-radius:10px}
.cb-skel-hero{height:min(56vh,460px);margin-bottom:24px}
.cb-skel-row{display:flex;gap:14px;overflow:hidden;margin-bottom:24px}
.cb-skel-card{flex:0 0 160px;aspect-ratio:2/3}
.cb-skel-grid{aspect-ratio:2/3}
.cb-loading-line{height:14px;width:60%}
.hero{position:relative}
.hero-bg{animation:cbFade .6s ease}
.cb-progress{position:absolute;left:0;bottom:0;height:3px;width:100%;background:var(--accent,#e50914);transform-origin:left;animation:cbProgress ${SLIDE_MS}ms linear forwards;z-index:3}
.hero:hover .cb-progress,.hero:focus-within .cb-progress,body.cb-modal-open .cb-progress{animation-play-state:paused}
.cb-hero-step{position:absolute;top:50%;transform:translateY(-50%);z-index:3;width:42px;height:42px;border-radius:50%;border:0;color:#fff;background:rgba(0,0,0,.5);font-size:26px;line-height:1;cursor:pointer;opacity:0;transition:opacity .2s}
.cb-hero-step[data-hero-step="-1"]{left:12px}
.cb-hero-step[data-hero-step="1"]{right:12px}
.hero:hover .cb-hero-step,.cb-hero-step:focus-visible{opacity:1}
@media (hover:none){.cb-hero-step{display:none}}
.arrow:disabled{opacity:.3;cursor:default}
.track.dragging{scroll-snap-type:none;scroll-behavior:auto;cursor:grabbing;user-select:none}
.cb-extra{margin-top:14px;display:grid;gap:12px}
.cb-extra h3{margin:4px 0 0;font-size:.95rem}
.cb-tagline{font-style:italic;opacity:.8;margin:0}
.cb-tags{display:flex;gap:6px;flex-wrap:wrap}
.cb-tag{font-size:.75rem;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,.1)}
.cb-cast{margin:0;font-size:.9rem;opacity:.85}
.cb-row{display:flex;align-items:center;gap:6px 18px;flex-wrap:wrap}
.cb-rate{display:inline-flex;flex-direction:row-reverse;justify-content:flex-end;gap:2px}
.cb-star{background:none;border:0;padding:0 2px;font-size:1.6rem;line-height:1;cursor:pointer;color:rgba(255,255,255,.3);transition:transform .1s,color .1s}
.cb-star.on,.cb-star:hover,.cb-star:hover ~ .cb-star{color:#f5c518}
.cb-star:active{transform:scale(1.2)}
.cb-check{display:inline-flex;gap:8px;align-items:center;cursor:pointer;font-size:.9rem}
.cb-similar{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}
.cb-mini{flex:0 0 96px;background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer}
.cb-mini img{width:96px;aspect-ratio:2/3;object-fit:cover;border-radius:8px;display:block;transition:transform .15s}
.cb-mini:hover img,.cb-mini:focus-visible img{transform:scale(1.05)}
.cb-mini span{display:block;font-size:.75rem;margin-top:4px;opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#mPrev[hidden],#mNext[hidden]{display:none!important}
#cbToasts{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);display:grid;gap:8px;z-index:9999;width:max-content;max-width:calc(100vw - 32px)}
.cb-toast{display:flex;gap:14px;align-items:center;background:#25252d;color:#f2f2f5;border:1px solid rgba(255,255,255,.16);padding:10px 16px;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.45);animation:cbFade .2s ease;font-size:.9rem}
.cb-toast.out{opacity:0;transition:opacity .3s}
.cb-toast button{background:none;border:0;color:#ff7a80;font:inherit;font-weight:600;cursor:pointer}
.cb-suggest{position:absolute;top:calc(100% + 6px);left:0;right:0;min-width:260px;margin:0;padding:6px;list-style:none;background:var(--surface,#1b1b22);color:var(--text,#f2f2f5);border:1px solid rgba(255,255,255,.16);border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,.5);z-index:500;max-height:70vh;overflow:auto}
.cb-suggest[hidden]{display:none}
.cb-suggest li{display:flex;gap:10px;align-items:center;padding:6px 8px;border-radius:8px;cursor:pointer;font-size:.9rem}
.cb-suggest li.active,.cb-suggest li:hover{background:rgba(255,255,255,.12)}
.cb-suggest img{width:34px;height:50px;object-fit:cover;border-radius:4px;flex:none}
.cb-suggest small{display:block;opacity:.65;font-size:.75rem}
.cb-clock{width:34px;text-align:center;opacity:.6}
#cbTop{position:fixed;right:20px;bottom:20px;width:44px;height:44px;border-radius:50%;border:0;color:#fff;background:var(--accent,#e50914);font-size:20px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4);opacity:0;pointer-events:none;transform:translateY(10px);transition:opacity .2s,transform .2s;z-index:400}
#cbTop.show{opacity:1;pointer-events:auto;transform:none}
@media (prefers-reduced-motion:reduce){.cb-skel,.hero-bg,.cb-toast{animation:none}.cb-quick,.cb-hero-step,#cbTop,.cb-mini img{transition:none}}
`;
  const style = document.createElement('style');
  style.id = 'cb-enhance';
  style.textContent = css;
  document.head.append(style);

  const top = document.createElement('button');
  top.id = 'cbTop';
  top.type = 'button';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '&uarr;';
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  document.body.append(top);
}

/* ---------- Start ---------- */
async function init() {
  const app = $('#app');
  if (!app) return;
  injectStyles();
  updateCount();
  app.innerHTML = skeleton();
  await loadData();
  render();
  route();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
