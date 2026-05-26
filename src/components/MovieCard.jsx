import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWatchlist } from "@/context/WatchlistContext";
import { getDetailPath, posterUrl } from "@/lib/tmdb";

export default function MovieCard({
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
}) {

  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggle } = useWatchlist();
  const [isLoading, setIsLoading] = useState(false);

  const isFavorite = user?.$id ? isSaved(id, media_type) : false;

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      await toggle(id, media_type, {
        title: title || name,
        name,
        poster_path,
        vote_average,
        overview: movieData.overview,
        release_date,
        first_air_date,
        ...movieData,
      });
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayTitle = title || name;
  const displayDate = release_date || first_air_date;
  const year = displayDate ? displayDate.split("-")[0] : "N/A";
  const routePath = getDetailPath(media_type, id);
  const score = vote_average ? vote_average.toFixed(1) : "N/A";

  const scoreClass =
    vote_average >= 7.5
      ? "score--high"
      : vote_average >= 5
        ? "score--mid"
        : "score--low";

  return (
    <Link to={routePath} className="movie-card-link">
      <article className="movie-card">
        <div className="movie-card__poster-wrap">
          <img
            className="movie-card__poster"
            src={posterUrl(poster_path)}
            alt={displayTitle}
            loading="lazy"
          />
          <div className="movie-card__overlay" aria-hidden="true" />
          <span className="movie-card__type-badge">
            {media_type === "tv" ? "Series" : "Movie"}
          </span>
          <span className={`movie-card__score ${scoreClass}`}>★ {score}</span>
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`movie-card__favorite-btn ${isFavorite ? "active" : ""}`}
            title={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

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

        <div className="movie-card__shine" aria-hidden="true" />
      </article>
    </Link>
  );
}
