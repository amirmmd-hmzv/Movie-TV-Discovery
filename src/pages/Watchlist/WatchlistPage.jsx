/**
 * WatchlistPage — User's saved movies and TV series with filtering and sorting.
 * Features: filter by media type (All/Movies/Series), sort (newest/oldest/rating).
 * Protected route (requires authentication).
 */
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWatchlist } from "@/context/WatchlistContext";
import { getDetailPath } from "@/lib/tmdb";
import { watchlistKey } from "@/lib/watchlistKeys";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { items, loading, remove } = useWatchlist();
  
  // ─────── State ───────
  const [deletingKey, setDeletingKey] = useState(null);
  const [filter, setFilter] = useState("all");          // all | movie | tv
  const [sort, setSort] = useState("newest");           // newest | oldest | rating

  /**
   * Navigate back or to home if no history available
   */
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  /**
   * Remove item from watchlist with loading state
   */
  const handleRemove = async (movieId, mediaType) => {
    const key = watchlistKey(movieId, mediaType);
    setDeletingKey(key);
    try {
      await remove(movieId, mediaType);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingKey(null);
    }
  };

  /**
   * Memoized filtered and sorted list
   * Prevents unnecessary recalculations on re-renders
   */
  const displayList = useMemo(() => {
    let list = [...items];

    // ─────── Apply Filter ───────
    if (filter !== "all") {
      list = list.filter((i) => i.mediaType === filter);
    }

    // ─────── Apply Sort ───────
    if (sort === "newest") {
      // Most recently added first
      list.sort(
        (a, b) =>
          new Date(b.addedDate || b.$createdAt) -
          new Date(a.addedDate || a.$createdAt),
      );
    } else if (sort === "oldest") {
      // Least recently added first
      list.sort(
        (a, b) =>
          new Date(a.addedDate || a.$createdAt) -
          new Date(b.addedDate || b.$createdAt),
      );
    } else if (sort === "rating") {
      // Highest rated first
      list.sort(
        (a, b) => Number(b.vote_average || 0) - Number(a.vote_average || 0),
      );
    }

    return list;
  }, [items, filter, sort]);

  // ─────── Loading State ───────
  if (loading) return <WatchlistSkeleton />;

  // ─────── Render ───────
  return (
    <main className="wl-page">
      {/* Background pattern decoration */}
      <div className="pattern" style={{ pointerEvents: "none" }} />

      <div className="wl-wrapper">
        {/* Header with back button and title */}
        <div className="wl-header">
          <button type="button" onClick={handleBack} className="wl-back-btn">
            ←
          </button>
          <div className="wl-header__text">
            <h1 className="wl-title">
              My <span className="text-gradient">Watchlist</span>
            </h1>
            <p className="wl-count">
              {items.length} {items.length === 1 ? "title" : "titles"} saved
            </p>
          </div>
        </div>

        {/* Filter tabs and sort dropdown */}
        <div className="wl-controls">
          {/* Filter tabs: All, Movies, Series */}
          <div className="wl-filter-tabs">
            {[
              { value: "all", label: "All" },
              { value: "movie", label: "Movies" },
              { value: "tv", label: "Series" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`wl-tab ${filter === tab.value ? "wl-tab--active" : ""}`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label}
                {/* Count badge for each filter */}
                <span className="wl-tab__count">
                  {tab.value === "all"
                    ? items.length
                    : items.filter((i) => i.mediaType === tab.value).length}
                </span>
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            className="wl-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort watchlist"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Empty state when no items match filter */}
        {displayList.length === 0 && (
          <div className="wl-empty">
            <div className="wl-empty__icon">
              <svg
                viewBox="0 0 24 24"
                width="52"
                height="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                  a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                  1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            </div>
            <h2 className="wl-empty__title">
              {filter === "all"
                ? "Nothing saved yet"
                : `No ${filter === "tv" ? "series" : "movies"} saved`}
            </h2>
            <p className="wl-empty__sub">
              {filter === "all"
                ? "Tap the heart on any title to save it here."
                : `Switch to "All" or add some ${filter === "tv" ? "series" : "movies"}.`}
            </p>
            {filter === "all" && (
              <Link to="/" className="wl-empty__cta">
                Browse Titles
              </Link>
            )}
          </div>
        )}

        {/* Watchlist grid */}
        {displayList.length > 0 && (
          <div className="movie-grid">
            {displayList.map((item) => {
              const key = watchlistKey(item.movieId, item.mediaType);
              const isDeleting = deletingKey === key;
              const score = Number(item.vote_average) || 0;
              
              // Color code scores: green (7.5+), yellow (5-7.5), red (<5)
              const scoreClass =
                score >= 7.5
                  ? "score--high"
                  : score >= 5
                    ? "score--mid"
                    : "score--low";

              return (
                <Link
                  to={getDetailPath(item.mediaType, item.movieId)}
                  key={key}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className={`movie-card ${isDeleting ? "wl-card--removing" : ""}`}
                  >
                    <div className="movie-card__poster-wrap">
                      {/* Poster image */}
                      <img
                        className="movie-card__poster"
                        src={item.poster_url || "/no-movie.svg"}
                        alt={item.title}
                        loading="lazy"
                      />
                      
                      {/* Overlay gradient */}
                      <div className="movie-card__overlay" aria-hidden="true" />
                      
                      {/* Media type badge: Movie or Series */}
                      <span className="movie-card__type-badge">
                        {item.mediaType === "tv" ? "Series" : "Movie"}
                      </span>
                      
                      {/* Vote score */}
                      <span className={`movie-card__score ${scoreClass}`}>
                        ★ {score > 0 ? score.toFixed(1) : "N/A"}
                      </span>
                      
                      {/* Favorite/Remove button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.movieId, item.mediaType);
                        }}
                        disabled={isDeleting}
                        className="movie-card__favorite-btn active"
                        title="Remove from watchlist"
                      >
                        {isDeleting ? "..." : "♥"}
                      </button>
                    </div>

                    {/* Card info: title and date added */}
                    <div className="movie-card__info">
                      <h3 className="movie-card__title">{item.title}</h3>
                      <div className="movie-card__meta">
                        {item.addedDate && (
                          <span className="movie-card__year">
                            {new Date(item.addedDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shine effect overlay */}
                    <div className="movie-card__shine" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * WatchlistSkeleton — Loading skeleton with shimmer effect
 * Shows while watchlist is fetching from Appwrite database
 */
function WatchlistSkeleton() {
  const sh = {
    background:
      "linear-gradient(90deg,rgba(255,217,61,0.04) 0%,rgba(255,217,61,0.12) 40%,rgba(255,217,61,0.04) 80%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.6s infinite linear",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        padding: "6rem 1.5rem 3rem",
      }}
    >
      {/* Title skeleton */}
      <div
        style={{
          ...sh,
          width: 180,
          height: 32,
          borderRadius: 10,
          marginBottom: 8,
        }}
      />
      
      {/* Subtitle skeleton */}
      <div
        style={{
          ...sh,
          width: 100,
          height: 14,
          borderRadius: 6,
          marginBottom: 32,
        }}
      />
      
      {/* Filter tabs skeleton */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[60, 72, 64].map((w, i) => (
          <div
            key={i}
            style={{ ...sh, width: w, height: 34, borderRadius: 999 }}
          />
        ))}
      </div>
      
      {/* Movie grid skeleton — 8 cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: "1.25rem",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            {/* Poster skeleton */}
            <div
              style={{
                ...sh,
                aspectRatio: "2/3",
                borderRadius: 14,
                marginBottom: 10,
              }}
            />
            {/* Title skeleton */}
            <div
              style={{
                ...sh,
                width: "75%",
                height: 12,
                borderRadius: 6,
                marginBottom: 6,
              }}
            />
            {/* Date skeleton */}
            <div style={{ ...sh, width: "45%", height: 10, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
