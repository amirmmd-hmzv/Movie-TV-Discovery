import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserWatchlist, removeFromWatchlist } from "../appwrite";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch watchlist
  useEffect(() => {
    if (user?.userId) {
      fetchWatchlist();
    }
  }, [user?.userId]);

  const fetchWatchlist = async () => {
    try {
      setIsLoadingWatchlist(true);
      setError("");
      const items = await getUserWatchlist(user.userId);
      setWatchlist(items);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
      setError("Failed to load watchlist. Please try again.");
      setWatchlist([]);
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const handleRemove = async (movieId, mediaType) => {
    setDeletingId(movieId);
    try {
      await removeFromWatchlist(user.userId, movieId, mediaType);
      setWatchlist((prev) =>
        prev.filter(
          (item) => !(item.movieId === movieId && item.mediaType === mediaType),
        ),
      );
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      alert("Failed to remove from watchlist");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || isLoadingWatchlist) {
    return (
      <div className="watchlist-loading">
        <div className="spinner"></div>
        <p>Loading your watchlist...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen above
  }

  const routePath = (item) =>
    item.mediaType === "tv" ? `/tv/${item.movieId}` : `/movie/${item.movieId}`;

  return (
    <div className="watchlist-page">
      <div className="pattern" />

      <div className="watchlist-container">
        {/* Header */}
        <div className="watchlist-header">
          <h1 className="watchlist-title">
            My <span className="text-gradient">Watchlist</span>
          </h1>
          <p className="watchlist-count">
            {watchlist.length} {watchlist.length === 1 ? "item" : "items"}
          </p>
        </div>

        {error && <div className="watchlist-error">{error}</div>}

        {/* Empty State */}
        {watchlist.length === 0 && !error ? (
          <div className="watchlist-empty">
            <div className="empty-icon">📽️</div>
            <h2>Your watchlist is empty</h2>
            <p>Start adding movies and TV shows to your watchlist!</p>
            <Link to="/" className="btn btn-signup">
              Explore Now
            </Link>
          </div>
        ) : (
          /* Watchlist Grid */
          <div className="watchlist-grid">
            {watchlist.map((item) => (
              <article
                key={`${item.movieId}-${item.mediaType}`}
                className="watchlist-card"
              >
                {/* Poster */}
                <div className="watchlist-card__poster-wrap">
                  <Link to={routePath(item)}>
                    <img
                      src={item.poster_url || "/no-movie.png"}
                      alt={item.title}
                      className="watchlist-card__poster"
                      loading="lazy"
                    />
                  </Link>

                  {/* Type Badge */}
                  <span className="watchlist-card__type">
                    {item.mediaType === "tv" ? "Series" : "Movie"}
                  </span>

                  {/* Rating */}
                  {item.vote_average > 0 && (
                    <span className="watchlist-card__rating">
                      ★ {item.vote_average.toFixed(1)}
                    </span>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.movieId, item.mediaType)}
                    disabled={deletingId === item.movieId}
                    className="watchlist-card__remove"
                    title="Remove from watchlist"
                  >
                    {deletingId === item.movieId ? "..." : "✕"}
                  </button>
                </div>

                {/* Info */}
                <div className="watchlist-card__info">
                  <Link
                    to={routePath(item)}
                    className="watchlist-card__title-link"
                  >
                    <h3 className="watchlist-card__title">{item.title}</h3>
                  </Link>

                  {item.overview && (
                    <p className="watchlist-card__overview">{item.overview}</p>
                  )}

                  <div className="watchlist-card__meta">
                    <span className="watchlist-card__date">
                      Added {new Date(item.addedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
