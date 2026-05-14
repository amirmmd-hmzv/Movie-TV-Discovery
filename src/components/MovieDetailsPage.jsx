import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import Spinner from "./Spinner";
import "../styles/MovieDetailsPage.css";

function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Determine if it's a movie or TV series based on the URL path
  const mediaType = location.pathname.includes("/tv/") ? "tv" : "movie";

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      setError("");
      try {
        const endpoint = `/${mediaType}/${id}?append_to_response=credits,videos`;
        const res = await axiosInstance.get(endpoint);
        setMovie(res.data);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Failed to load details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, mediaType]);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="movie-details-error">
        <p>{error}</p>
        <button onClick={() => navigate("/")} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  if (!movie) return <div>No content found</div>;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-movie.png";

  const trailer = movie.videos?.results?.find((v) => v.type === "Trailer");
  const director = movie.credits?.crew?.find((c) => c.job === "Director");
  const creator =
    mediaType === "tv" && movie.created_by?.length > 0
      ? movie.created_by[0].name
      : null;
  const cast = movie.credits?.cast?.slice(0, 6) || [];

  // Handle both movie and TV series data
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const runtime = movie.runtime
    ? `${movie.runtime} min`
    : movie.episode_run_time
      ? `${movie.episode_run_time[0]} min/episode`
      : "N/A";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  // TV-specific data
  const numberOfSeasons = movie.number_of_seasons;
  const numberOfEpisodes = movie.number_of_episodes;
  const status = movie.status;
  const networks = movie.networks || [];
  const lastAirDate = movie.last_air_date;
  const nextAirDate = movie.next_episode_to_air?.air_date;

  return (
    <main className="movie-details">
      <button onClick={() => navigate("/")} className="back-button">
        ← Back
      </button>

      {backdropUrl && (
        <div
          className="movie-backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="backdrop-overlay" />
        </div>
      )}

      <div className="movie-details-container">
        <div className="movie-poster">
          <img src={posterUrl} alt={title} />
        </div>

        <div className="movie-info">
          <h1>{title}</h1>

          <div className="movie-meta">
            <span className="rating">
              ⭐ {movie.vote_average?.toFixed(1) || "N/A"} / 10
            </span>
            <span className="release-date">{year}</span>
            <span className="runtime">{runtime}</span>
            {mediaType === "tv" && status && (
              <span className="status">{status}</span>
            )}
          </div>

          {movie.genres && (
            <div className="genres">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <div className="overview">
            <h2>Overview</h2>
            <p>{movie.overview || "No overview available."}</p>
          </div>

          {mediaType === "tv" &&
            (numberOfSeasons || numberOfEpisodes || networks.length > 0) && (
              <div className="tv-info">
                <h2>Series Information</h2>
                <div className="tv-details">
                  {numberOfSeasons && (
                    <div className="tv-detail-item">
                      <span className="detail-label">Seasons:</span>
                      <span className="detail-value">{numberOfSeasons}</span>
                    </div>
                  )}
                  {numberOfEpisodes && (
                    <div className="tv-detail-item">
                      <span className="detail-label">Episodes:</span>
                      <span className="detail-value">{numberOfEpisodes}</span>
                    </div>
                  )}
                  {networks.length > 0 && (
                    <div className="tv-detail-item">
                      <span className="detail-label">Network:</span>
                      <span className="detail-value">{networks[0].name}</span>
                    </div>
                  )}
                  {lastAirDate && (
                    <div className="tv-detail-item">
                      <span className="detail-label">Last Aired:</span>
                      <span className="detail-value">
                        {new Date(lastAirDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {nextAirDate && (
                    <div className="tv-detail-item">
                      <span className="detail-label">Next Episode:</span>
                      <span className="detail-value">
                        {new Date(nextAirDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {director && mediaType === "movie" && (
            <div className="director">
              <h3>Director</h3>
              <p>{director.name}</p>
            </div>
          )}

          {creator && mediaType === "tv" && (
            <div className="director">
              <h3>Creator</h3>
              <p>{creator}</p>
            </div>
          )}

          {cast.length > 0 && (
            <div className="cast">
              <h3>Cast</h3>
              <div className="cast-list">
                {cast.map((actor) => (
                  <div key={actor.id} className="cast-member">
                    {actor.profile_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                      />
                    )}
                    <p>{actor.name}</p>
                    <small>{actor.character}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trailer && (
            <div className="trailer">
              <h3>Watch Trailer</h3>
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="trailer-button"
              >
                🎬 Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default MovieDetailsPage;
