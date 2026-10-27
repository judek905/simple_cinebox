import React, { useMemo, useState } from 'react';

const initialMovies = [
  {
    id: 1,
    title: 'The Dark Knight',
    year: '2008',
    genre: 'Action',
    rating: 8.5,
    poster:
      'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    overview:
      'Batman, Gordon and Harvey Dent join forces to dismantle Gotham\'s criminal underworld before a new chaos-driven villain can reshape the city.',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
  },
  {
    id: 2,
    title: 'Inception',
    year: '2010',
    genre: 'Sci-Fi',
    rating: 8.4,
    poster:
      'https://image.tmdb.org/t/p/w342/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    overview:
      'A thief enters dreams to plant a secret idea into a CEO\'s subconscious before time runs out.',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
  },
  {
    id: 3,
    title: 'Parasite',
    year: '2019',
    genre: 'Thriller',
    rating: 8.5,
    poster:
      'https://image.tmdb.org/t/p/w342/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    overview:
      'A poor family infiltrates the life of a wealthy household and begins to unravel each secret.',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
  },
  {
    id: 4,
    title: 'Stranger Things',
    year: '2016',
    genre: 'Sci-Fi',
    rating: 8.6,
    poster:
      'https://image.tmdb.org/t/p/w342/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg',
    overview:
      'A small Indiana town is thrown into chaos when a missing boy, mysterious powers and a dark dimension collide.',
    cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
  },
  {
    id: 5,
    title: 'La La Land',
    year: '2016',
    genre: 'Romance',
    rating: 7.9,
    poster:
      'https://image.tmdb.org/t/p/w342/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    overview:
      'An aspiring actress and a jazz pianist chase their dreams while falling in love in Los Angeles.',
    cast: ['Ryan Gosling', 'Emma Stone', 'John Legend'],
  },
  {
    id: 6,
    title: 'Breaking Bad',
    year: '2008',
    genre: 'Crime',
    rating: 8.9,
    poster:
      'https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    overview:
      'A chemistry teacher turns to cooking meth after a terminal diagnosis and runs from both his past and his future.',
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
  },
];

export default function CineBoxInteraction() {
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [watchlist, setWatchlist] = useState([2, 4]);
  const [selectedMovie, setSelectedMovie] = useState(initialMovies[0]);

  const genres = ['All', ...new Set(initialMovies.map((movie) => movie.genre))];

  const filteredMovies = useMemo(() => {
    return initialMovies.filter((movie) => {
      const matchesQuery = movie.title.toLowerCase().includes(query.toLowerCase());
      const matchesGenre = activeGenre === 'All' || movie.genre === activeGenre;
      return matchesQuery && matchesGenre;
    });
  }, [query, activeGenre]);

  const toggleWatchlist = (id) => {
    setWatchlist((current) =>
      current.includes(id)
        ? current.filter((movieId) => movieId !== id)
        : [...current, id]
    );
  };

  return (
    <>
      <style>{`
        .cinebox-interaction {
          --bg: #101118;
          --panel: #171a25;
          --panel-soft: rgba(255, 255, 255, 0.04);
          --text: #f4f6fb;
          --muted: #a7acbc;
          --accent: #f44336;
          --accent-strong: #ff5a5f;
          --shadow: rgba(0, 0, 0, 0.35);
          font-family: Inter, 'Segoe UI', sans-serif;
          background: linear-gradient(180deg, #0d1018 0%, #121724 100%);
          color: var(--text);
          padding: 28px;
          border-radius: 26px;
          box-shadow: 0 25px 50px var(--shadow);
          max-width: 1180px;
          margin: 32px auto;
        }

        .cinebox-interaction * { box-sizing: border-box; }

        .cinebox-topbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .cinebox-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cinebox-brand-mark {
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, var(--accent), #ff8a65);
          border-radius: 4px;
          box-shadow: 0 0 16px rgba(244, 67, 54, 0.7);
        }

        .cinebox-brand h2 {
          margin: 0;
          font-size: clamp(1.4rem, 2vw, 2rem);
          letter-spacing: 0.04em;
        }

        .cinebox-search {
          flex: 1 1 280px;
          max-width: 420px;
          min-width: 220px;
          position: relative;
        }

        .cinebox-search input {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255,255,255,0.04);
          color: var(--text);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .cinebox-search input:focus {
          border-color: rgba(255, 94, 94, 0.7);
          box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.18);
        }

        .cinebox-watchlist {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          border-radius: 999px;
          padding: 10px 14px;
          color: var(--muted);
          font-size: 0.9rem;
        }

        .cinebox-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 22px;
        }

        .cinebox-filter {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: var(--text);
          border-radius: 999px;
          padding: 8px 14px;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }

        .cinebox-filter.active {
          background: linear-gradient(135deg, var(--accent), var(--accent-strong));
          border-color: transparent;
          box-shadow: 0 8px 20px rgba(244, 67, 54, 0.35);
        }

        .cinebox-filter:hover {
          transform: translateY(-1px);
        }

        .cinebox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 18px;
        }

        .cinebox-card {
          position: relative;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          overflow: hidden;
          transition: transform 0.18s ease, border-color 0.18s ease;
        }

        .cinebox-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.18);
        }

        .cinebox-poster {
          display: block;
          width: 100%;
          height: 250px;
          object-fit: cover;
        }

        .cinebox-card-body {
          padding: 12px 12px 16px;
        }

        .cinebox-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
        }

        .cinebox-card h3 {
          margin: 0;
          font-size: 1rem;
          line-height: 1.35;
        }

        .cinebox-badge {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 0.72rem;
          opacity: 0.9;
        }

        .cinebox-meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin: 0;
          color: var(--muted);
          font-size: 0.82rem;
        }

        .cinebox-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .cinebox-action,
        .cinebox-primary {
          border: none;
          border-radius: 10px;
          padding: 9px 12px;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }

        .cinebox-primary {
          background: linear-gradient(135deg, var(--accent), var(--accent-strong));
          color: white;
          flex: 1;
        }

        .cinebox-action {
          background: rgba(255,255,255,0.05);
          color: var(--text);
        }

        .cinebox-action.saved {
          background: rgba(255, 92, 92, 0.18);
          color: #ffd9d9;
        }

        .cinebox-action:hover,
        .cinebox-primary:hover {
          transform: translateY(-1px);
        }

        .cinebox-empty {
          padding: 32px 12px;
          color: var(--muted);
          text-align: center;
          border: 1px dashed rgba(255,255,255,0.12);
          border-radius: 14px;
        }

        .cinebox-modal {
          position: fixed;
          inset: 0;
          background: rgba(8, 10, 15, 0.78);
          display: grid;
          place-items: center;
          padding: 24px;
          z-index: 1000;
        }

        .cinebox-modal-panel {
          width: min(880px, 100%);
          max-height: 84vh;
          overflow: auto;
          border-radius: 22px;
          background: linear-gradient(180deg, #1a1d2b, #0f1220);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
        }

        .cinebox-modal-inner {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 20px;
          padding: 22px;
        }

        .cinebox-modal-poster {
          width: 100%;
          border-radius: 18px;
          object-fit: cover;
          aspect-ratio: 2 / 3;
          box-shadow: 0 16px 28px rgba(0,0,0,0.25);
        }

        .cinebox-modal-copy {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cinebox-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .cinebox-modal-header h3 {
          margin: 0;
          font-size: clamp(1.6rem, 2vw, 2.2rem);
        }

        .cinebox-close {
          border: none;
          background: rgba(255,255,255,0.06);
          color: var(--text);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .cinebox-modal-meta {
          color: var(--muted);
          font-size: 0.9rem;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .cinebox-overview {
          margin: 0;
          color: #e9ebf7;
          line-height: 1.7;
        }

        .cinebox-cast {
          margin: 0;
          color: var(--muted);
        }

        .cinebox-modal-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 8px;
        }

        @media (max-width: 620px) {
          .cinebox-interaction {
            padding: 18px;
          }

          .cinebox-modal-inner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="cinebox-interaction">
        <div className="cinebox-topbar">
          <div className="cinebox-brand">
            <span className="cinebox-brand-mark" aria-hidden="true" />
            <h2>CineBox</h2>
          </div>

          <label className="cinebox-search" aria-label="Search movie library">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, actors, or genres"
            />
          </label>

          <div className="cinebox-watchlist">My List: {watchlist.length}</div>
        </div>

        <div className="cinebox-filters" aria-label="Filter by genre">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={`cinebox-filter ${activeGenre === genre ? 'active' : ''}`}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        {filteredMovies.length > 0 ? (
          <div className="cinebox-grid">
            {filteredMovies.map((movie) => {
              const saved = watchlist.includes(movie.id);

              return (
                <article key={movie.id} className="cinebox-card">
                  <img
                    className="cinebox-poster"
                    src={movie.poster}
                    alt={`${movie.title} poster`}
                  />

                  <div className="cinebox-card-body">
                    <div className="cinebox-title-row">
                      <h3>{movie.title}</h3>
                      <span className="cinebox-badge">★ {movie.rating.toFixed(1)}</span>
                    </div>

                    <p className="cinebox-meta">
                      <span>{movie.year}</span>
                      <span>{movie.genre}</span>
                    </p>

                    <div className="cinebox-actions">
                      <button
                        type="button"
                        className="cinebox-primary"
                        onClick={() => setSelectedMovie(movie)}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        className={`cinebox-action ${saved ? 'saved' : ''}`}
                        onClick={() => toggleWatchlist(movie.id)}
                        aria-label={saved ? `Remove ${movie.title} from My List` : `Add ${movie.title} to My List`}
                      >
                        {saved ? 'Saved' : '+ List'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="cinebox-empty">No titles match your current search.</div>
        )}
      </div>

      {selectedMovie && (
        <div className="cinebox-modal" role="dialog" aria-modal="true">
          <div className="cinebox-modal-panel">
            <div className="cinebox-modal-inner">
              <img
                className="cinebox-modal-poster"
                src={selectedMovie.poster}
                alt={`${selectedMovie.title} poster`}
              />

              <div className="cinebox-modal-copy">
                <div className="cinebox-modal-header">
                  <h3>{selectedMovie.title}</h3>
                  <button
                    type="button"
                    className="cinebox-close"
                    aria-label="Close details"
                    onClick={() => setSelectedMovie(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="cinebox-modal-meta">
                  <span>{selectedMovie.year}</span>
                  <span>{selectedMovie.genre}</span>
                  <span>★ {selectedMovie.rating.toFixed(1)}</span>
                </div>

                <p className="cinebox-overview">{selectedMovie.overview}</p>

                <p className="cinebox-cast">
                  <strong>Cast:</strong> {selectedMovie.cast.join(', ')}
                </p>

                <div className="cinebox-modal-actions">
                  <button
                    type="button"
                    className="cinebox-primary"
                    onClick={() => toggleWatchlist(selectedMovie.id)}
                  >
                    {watchlist.includes(selectedMovie.id) ? 'Remove from My List' : 'Add to My List'}
                  </button>
                  <button
                    type="button"
                    className="cinebox-action"
                    onClick={() => setSelectedMovie(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
