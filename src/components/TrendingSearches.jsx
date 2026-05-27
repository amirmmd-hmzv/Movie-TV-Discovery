import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * TrendingSkeleton — Loading skeleton for trending searches section
 * Shows animated placeholder cards while data is being fetched
 */
function TrendingSkeleton() {
  const shimmer = {
    background:
      "linear-gradient(90deg, rgba(255,217,61,0.04) 0%, rgba(255,217,61,0.13) 40%, rgba(255,217,61,0.04) 80%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.6s infinite linear",
    borderRadius: 8,
  };

  return (
    <section className="trending">
      <div className="trending-header">
        <div className="trending-bar" />
        <h2>Trending Searches</h2>
        <span className="trending-badge">Live</span>
      </div>

      {/* Skeleton scroll hint */}
      <div className="trending-scroll-hint">
        <span>loading...</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>

      {/* Skeleton cards — 8 items */}
      <ul
        style={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          padding: "1rem 0",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <li
            key={i}
            style={{
              flex: "0 0 160px",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {/* Rank skeleton */}
            <div
              style={{
                ...shimmer,
                width: 24,
                height: 18,
                borderRadius: 4,
              }}
            />

            {/* Poster skeleton */}
            <div
              style={{
                ...shimmer,
                width: "100%",
                aspectRatio: "2/3",
                borderRadius: 12,
              }}
            />

            {/* Count badge skeleton */}
            <div
              style={{
                ...shimmer,
                width: "70%",
                height: 14,
                borderRadius: 6,
              }}
            />
          </li>
        ))}
      </ul>

      <style>{`
        @keyframes shimmer {
          0%{background-position:-600px 0}
          100%{background-position:600px 0}
        }
      `}</style>
    </section>
  );
}

export default function TrendingSearches({ trendingSearches, isLoading }) {
  const listRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const navigate = useNavigate();

  /* ── Mouse drag scroll ── */
  const onMouseDown = useCallback((e) => {
    const el = listRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    };
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!drag.current.active || !listRef.current) return;
    e.preventDefault();
    const x = e.pageX - listRef.current.offsetLeft;
    const walk = (x - drag.current.startX) * 1.2;
    listRef.current.scrollLeft = drag.current.scrollLeft - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    drag.current.active = false;
    if (listRef.current) {
      listRef.current.style.cursor = "grab";
      listRef.current.style.userSelect = "";
    }
  }, []);

  /* ── Click vs drag guard ── */
  const onItemClick = useCallback(
    (e, movie) => {
      const moved =
        Math.abs(listRef.current?.scrollLeft - drag.current.scrollLeft) > 5;
      if (moved) {
        e.preventDefault();
        return;
      }
      if (movie.tmdb_id && movie.mediaType) {
        navigate(`/${movie.mediaType}/${movie.tmdb_id}`);
      }
    },
    [navigate],
  );

  // Show skeleton while loading
  if (isLoading) {
    return <TrendingSkeleton />;
  }

  // Don't render if no data
  if (!trendingSearches?.length) return null;

  return (
    <section className="trending">
      <div className="trending-header">
        <div className="trending-bar" />
        <h2>Trending Searches</h2>
        <span className="trending-badge">Live</span>
      </div>

      {/* scroll hint arrows — desktop only */}
      <div className="trending-scroll-hint">
        <span>drag to scroll</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>

      <ul
        ref={listRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: "grab" }}
      >
        {trendingSearches.map((movie, index) => (
          <li
            key={movie.$id}
            onClick={(e) => onItemClick(e, movie)}
            role={movie.movie_id ? "button" : undefined}
            tabIndex={movie.movie_id ? 0 : undefined}
            onKeyDown={(e) => e.key === "Enter" && onItemClick(e, movie)}
            aria-label={`${index + 1}. ${movie.title ?? movie.searchTerm}`}
          >
            <span className="rank">{index + 1}</span>

            <div className="poster-wrap">
              <img
                src={movie.poster_url || "/no-movie.svg"}
                alt={movie.title ?? movie.searchTerm}
                draggable={false}
                loading="lazy"
              />

              <div className="poster-overlay">
                {movie.title ?? movie.searchTerm}
              </div>

              {movie.count && (
                <span className="count-pill">
                  {movie.count >= 1000
                    ? `${(movie.count / 1000).toFixed(1).replace(/\.0$/, "")}k`
                    : movie.count}{" "}
                  searches
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
