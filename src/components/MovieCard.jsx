import { Link } from "react-router-dom";

const MovieCard = ({
  movie: {
    id,
    media_type,
    title,
    name,
    overview,
    poster_path,
    release_date,
    first_air_date,
    vote_average,
    vote_count,
    original_language,
  },
}) => {
  // Handle both movies and TV series
  const displayTitle = title || name;
  const displayDate = release_date || first_air_date;
  const year = displayDate ? displayDate.split("-")[0] : "N/A";

  // Construct the route based on media type
  const routePath = media_type === "tv" ? `/tv/${id}` : `/movie/${id}`;

  return (
    <Link to={routePath} style={{ textDecoration: "none" }}>
      <div className="movie-card">
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
              : "/no-movie.svg"
          }
          alt={displayTitle}
        />

        <div className="mt-4">
          <h3>{displayTitle}</h3>

          <div className="content">
            <div className="rating">
              <img src="star.svg" alt="star icon" />
              <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
            </div>
            <span>•</span>
            <p className="lang">{original_language}</p>
            <span>•</span>
            <p className="year">{year}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
