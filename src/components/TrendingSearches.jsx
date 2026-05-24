import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function TrendingSearches({ trendingSearches }) {
  const listRef   = useRef(null);
  const drag      = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const navigate  = useNavigate();

  /* ── Mouse drag scroll ── */
  const onMouseDown = useCallback((e) => {
    const el = listRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!drag.current.active || !listRef.current) return;
    e.preventDefault();
    const x    = e.pageX - listRef.current.offsetLeft;
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
  const onItemClick = useCallback((e, movie) => {
    // اگه drag بیشتر از 5px بود، navigate نکن
    const moved = Math.abs(listRef.current?.scrollLeft - drag.current.scrollLeft) > 5;
    if (moved) { e.preventDefault(); return; }
    if (movie.movie_id && movie.mediaType) {
      navigate(`/${movie.mediaType}/${movie.movie_id}`);
    }
  }, [navigate]);

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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
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