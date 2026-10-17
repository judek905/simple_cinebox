# CineBox

CineBox is a simple movie and TV series browsing website with a dark streaming-catalogue look. It is built with only three files and plain HTML, CSS and JavaScript, so there is nothing to install.

CineBox is an original project. It does not host or stream any video, and it does not use any code, logo or assets from other streaming services.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure: top bar, search box, content area, footer and the details popup |
| `style.css` | All styling: dark theme, hero banner, poster rows and grids, popup, responsive layout |
| `script.js` | All behaviour: data loading, rendering, search, My List, trailers and the featured banner |

## Features

- Sticky top bar with Home, Movies, TV Series and My List, plus a search box
- Featured banner that changes every few seconds, with dots to pick a title, a Play trailer button and a More details button
- Rows for Trending Now, Popular Movies and Popular TV Series, each with scroll arrows
- Poster cards with a rating badge, title, year and genre
- Details popup with poster, description, trailer and a + My List button
- Search that updates shortly after you stop typing, with a clear button and a message when nothing is found
- My List saved in your browser, so it stays after a refresh
- Movies and TV Series pages sorted by rating
- Works on phones, tablets and desktops

## How to run

You need a web browser and nothing else.

**Option 1: open the file.** Double-click `index.html`.

**Option 2: VS Code Live Server.** Install the "Live Server" extension, then right-click `index.html` and choose **Open with Live Server**.

**Option 3: a local server from the terminal.** In the project folder run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. If you have Node.js you can use `npx serve` instead.

## Demo data and live data

CineBox starts with a built-in set of demo movies and series, so it works straight away. A message at the top of the page tells you when demo data is being shown.

To load real, current titles from TMDB:

1. Create a free account at https://www.themoviedb.org/signup
2. Open your account settings, choose **API**, and request a developer key (personal or educational use is fine).
3. Copy the **API Key (v3 auth)**.
4. Open `script.js` and paste the key into the first setting near the top:

   ```js
   const API_KEY = 'paste_your_key_here';
   ```

5. Save the file and refresh the page.

With a key set, CineBox loads popular movies and series, searches the whole TMDB catalogue and fetches trailers when you ask for them. If TMDB cannot be reached, CineBox falls back to the demo data and shows a message.

Because this is a front-end only project, your key is visible to anyone who views the page source. A free TMDB key is low risk, but do not reuse keys that matter, and do not publish a page with a private key in it.

## How it works

- `loadData()` fetches titles from TMDB, or uses the demo lists `DEMO_MOVIES` and `DEMO_SERIES` when there is no key or the request fails.
- `render()` draws the page for the current view (home, movies, tv, list or search results).
- `card()` and `row()` build the poster cards and horizontal rows.
- `openModal()` fills and shows the details popup. `playTrailer()` embeds a YouTube trailer inside it.
- `readList()`, `writeList()` and `toggleList()` keep My List in the browser's `localStorage`.
- `debounce()` waits until you pause typing before running a search.

## Customising

**Colours.** Change the variables at the top of `style.css`. The green accent is `--green`.

```css
:root {
  --bg: #0f0f11;
  --green: #1fd16a;
}
```

**Demo titles.** Add a line to `DEMO_MOVIES` or `DEMO_SERIES` in `script.js`. The values are, in order: id, type (`'movie'` or `'tv'`), title, year, rating, genre, poster path, backdrop path, description and an optional YouTube trailer id.

**Banner speed.** Change `6500` (milliseconds) in the `setInterval` near the bottom of `script.js`.

## Troubleshooting

- **"Showing demo titles" message:** no API key is set, or the key was rejected. Check that it is pasted inside the quotes with no spaces.
- **Grey "No image" boxes:** an image failed to load. Check your internet connection. A few demo image paths may be out of date, and live data always uses current paths.
- **Live data does not load when you open the file directly:** run it through a local server (see Option 2 or 3).
- **No trailer available:** only some demo titles have a trailer. With a key, not every title has a YouTube trailer on TMDB.
- **My List is empty after a while:** it is stored in your browser. Clearing browser data, using private browsing or switching browsers removes it.

## Limitations

- My List uses `localStorage` only. There are no accounts and nothing syncs between devices or browsers.
- The Movies and TV Series pages show one page of results, with no genre filters or Load more.
- Search with a key covers movies and TV series only.
- The demo data is small, so search and lists are limited until you add a key.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie and TV data and images are provided by TMDB and are subject to TMDB's terms of use (https://www.themoviedb.org/api-terms-of-use). If you publish CineBox, review TMDB's attribution requirements, which include showing the TMDB logo in a credits area. Trailers are embedded from YouTube using its privacy-enhanced domain.
