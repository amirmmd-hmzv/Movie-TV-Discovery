import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "../appwrite";

const MovieCard = ({
  movie: {
    id,
    media_type,
    title,
    name,
    poster_path,
    release_date,
    first_air_date,
    vote_average,
    original_language,
    ...movieData
  },
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if in watchlist on mount
  useEffect(() => {
    if (user?.userId) {
      checkWatchlist();
    }
  }, [user?.userId, id, media_type]);

  const checkWatchlist = async () => {
    try {
      const inWatchlist = await isInWatchlist(user.userId, id, media_type);
      setIsFavorite(inWatchlist);
    } catch (error) {
      console.error("Error checking watchlist:", error);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to add to watchlist");
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeFromWatchlist(user.userId, id, media_type);
        setIsFavorite(false);
      } else {
        await addToWatchlist(user.userId, id, media_type, {
          title: title || name,
          poster_path,
          vote_average,
          overview: movieData.overview,
          release_date,
          first_air_date,
          media_type,
          ...movieData,
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const displayTitle = title || name;
  const displayDate = release_date || first_air_date;
  const year = displayDate ? displayDate.split("-")[0] : "N/A";
  const routePath = media_type === "tv" ? `/tv/${id}` : `/movie/${id}`;
  const score = vote_average ? vote_average.toFixed(1) : "N/A";

  // رنگ امتیاز بر اساس مقدار
  const scoreClass =
    vote_average >= 7.5
      ? "score--high"
      : vote_average >= 5
        ? "score--mid"
        : "score--low";

  return (
    <Link to={routePath} className="movie-card-link">
      <article className="movie-card">
        {/* ── Poster ── */}
        <div className="movie-card__poster-wrap">
          <img
            className="movie-card__poster"
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                : "/no-movie.svg"
            }
            alt={displayTitle}
            loading="lazy"
          />

          {/* overlay روی hover */}
          <div className="movie-card__overlay" aria-hidden="true" />

          {/* نوع محتوا — گوشه بالا چپ */}
          <span className="movie-card__type-badge">
            {media_type === "tv" ? "Series" : "Movie"}
          </span>

          {/* امتیاز — گوشه بالا راست */}
          <span className={`movie-card__score ${scoreClass}`}>★ {score}</span>

          {/* Favorite Heart Button — گوشه پایین راست */}
          <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`movie-card__favorite-btn ${isFavorite ? "active" : ""}`}
            title={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

        {/* ── Info ── */}
        <div className="movie-card__info">
          <h3 className="movie-card__title">{displayTitle}</h3>

          <div className="movie-card__meta">
            <span className="movie-card__lang">
              {original_language?.toUpperCase()}
            </span>
            <span className="movie-card__dot">·</span>
            <span className="movie-card__year">{year}</span>
          </div>
        </div>

        {/* shine sweep on hover */}
        <div className="movie-card__shine" aria-hidden="true" />
      </article>
    </Link>
  );
};

export default MovieCard;
