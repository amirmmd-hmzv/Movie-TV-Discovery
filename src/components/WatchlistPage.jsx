import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserWatchlist, removeFromWatchlist } from "../appwrite";
import "../styles/WatchlistPage.css";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingKey, setDeletingKey] = useState(null);
  const [filter, setFilter] = useState("all"); // all | movie | tv
  // const [sort, setSort] = useState("newest"); // newest | oldest | rating

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.$id) fetchWatchlist();
  }, [user?.$id]);

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      setError("");
      const items = await getUserWatchlist(user.$id);
      setWatchlist(items);
    } catch (err) {
      console.error(err);
      setError("Failed to load watchlist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (movieId, mediaType) => {
    const key = `${movieId}-${mediaType}`;
    setDeletingKey(key);
    try {
      await removeFromWatchlist(user.$id, Number(movieId), mediaType);
      setWatchlist((prev) =>
        prev.filter(
          (item) =>
            !(item.movieId === Number(movieId) && item.mediaType === mediaType),
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingKey(null);
    }
  };

  // ── Filter + Sort (client-side) ──────────────────
  const displayList = useMemo(() => {
    let list = [...watchlist];

    // filter
    if (filter !== "all") {
      list = list.filter((i) => i.mediaType === filter);
    }

    // sort
    // if (sort === "newest") {
    //   list.sort(
    //     (a, b) =>
    //       new Date(b.addedDate || b.$createdAt) -
    //       new Date(a.addedDate || a.$createdAt),
    //   );
    // } else if (sort === "oldest") {
    //   list.sort(
    //     (a, b) =>
    //       new Date(a.addedDate || a.$createdAt) -
    //       new Date(b.addedDate || b.$createdAt),
    //   );
    // } else if (sort === "rating") {
    //   list.sort(
    //     (a, b) => Number(b.vote_average || 0) - Number(a.vote_average || 0),
    //   );
    // }

    return list;
  }, [watchlist, filter,]);

  const routePath = (item) =>
    item.mediaType === "tv" ? `/tv/${item.movieId}` : `/movie/${item.movieId}`;

  // ── Loading skeleton ──────────────────────────────
  if (loading || isLoading) return <WatchlistSkeleton />;
  if (!user) return null;

  return (
    <main className="wl-page">
      <div className="pattern" style={{ pointerEvents: "none" }} />

      <div className="wl-wrapper">
        {/* ── Header ── */}
        <div className="wl-header">
          <button onClick={handleBack} className="wl-back-btn">
            ←
          </button>
          <div className="wl-header__text">
            <h1 className="wl-title">
              My <span className="text-gradient">Watchlist</span>
            </h1>
            <p className="wl-count">
              {watchlist.length} {watchlist.length === 1 ? "title" : "titles"}{" "}
              saved
            </p>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="wl-controls">
          {/* Filter tabs */}
          <div className="wl-filter-tabs">
            {[
              { value: "all", label: "All" },
              { value: "movie", label: "Movies" },
              { value: "tv", label: "Series" },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`wl-tab ${filter === tab.value ? "wl-tab--active" : ""}`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label}
                {tab.value === "all" && (
                  <span className="wl-tab__count">{watchlist.length}</span>
                )}
                {tab.value !== "all" && (
                  <span className="wl-tab__count">
                    {watchlist.filter((i) => i.mediaType === tab.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort select */}
          {/* <select
            className="wl-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
          </select> */}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="wl-error">
            <p>{error}</p>
            <button onClick={fetchWatchlist} className="wl-retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!error && displayList.length === 0 && (
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
                ? "Tap ♥ on any title to save it here."
                : `Switch to "All" or add some ${filter === "tv" ? "series" : "movies"}.`}
            </p>
            {filter === "all" && (
              <Link to="/" className="wl-empty__cta">
                Browse Titles
              </Link>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        {displayList.length > 0 && (
          <div className="movie-grid">
            {displayList.map((item) => {
              const key = `${item.movieId}-${item.mediaType}`;
              const isDeleting = deletingKey === key;
              const score = Number(item.vote_average) || 0;
              const scoreClass =
                score >= 7.5
                  ? "score--high"
                  : score >= 5
                    ? "score--mid"
                    : "score--low";

              return (
                <Link
                  to={routePath(item)}
                  key={key}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className={`movie-card ${isDeleting ? "wl-card--removing" : ""}`}
                  >
                    <div className="movie-card__poster-wrap">
                      <img
                        className="movie-card__poster"
                        src={item.poster_url || "/no-movie.svg"}
                        alt={item.title}
                        loading="lazy"
                      />
                      <div className="movie-card__overlay" aria-hidden="true" />

                      <span className="movie-card__type-badge">
                        {item.mediaType === "tv" ? "Series" : "Movie"}
                      </span>

                      <span className={`movie-card__score ${scoreClass}`}>
                        ★ {score > 0 ? score.toFixed(1) : "N/A"}
                      </span>

                      {/* heart — always red/saved */}
                      <button
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

/* ── Skeleton ────────────────────────────────────────── */
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
      <div
        style={{
          ...sh,
          width: 180,
          height: 32,
          borderRadius: 10,
          marginBottom: 8,
        }}
      />
      <div
        style={{
          ...sh,
          width: 100,
          height: 14,
          borderRadius: 6,
          marginBottom: 32,
        }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[60, 72, 64].map((w, i) => (
          <div
            key={i}
            style={{ ...sh, width: w, height: 34, borderRadius: 999 }}
          />
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: "1.25rem",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div
              style={{
                ...sh,
                aspectRatio: "2/3",
                borderRadius: 14,
                marginBottom: 10,
              }}
            />
            <div
              style={{
                ...sh,
                width: "75%",
                height: 12,
                borderRadius: 6,
                marginBottom: 6,
              }}
            />
            <div style={{ ...sh, width: "45%", height: 10, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
