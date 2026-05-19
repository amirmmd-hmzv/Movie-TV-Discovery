import { Link } from "react-router-dom";

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
  },
}) => {
  const displayTitle = title || name;
  const displayDate = release_date || first_air_date;
  const year = displayDate ? displayDate.split("-")[0] : "N/A";
  const routePath = media_type === "tv" ? `/tv/${id}` : `/movie/${id}`;
  const score = vote_average ? vote_average.toFixed(1) : "N/A";

  // رنگ امتیاز بر اساس مقدار
  const scoreClass =
    vote_average >= 7.5 ? "score--high"
    : vote_average >= 5  ? "score--mid"
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
          <span className={`movie-card__score ${scoreClass}`}>
            ★ {score}
          </span>
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