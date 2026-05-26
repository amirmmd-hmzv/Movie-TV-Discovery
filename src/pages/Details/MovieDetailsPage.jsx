/**
 * MovieDetailsPage — Full movie/TV series details with credits and media info.
 * Shows backdrop, poster, ratings, genres, overview, cast, director/creator.
 * Supports both movies (/movie/:id) and TV series (/tv/:id) routes.
 * Integrates with watchlist context for add/remove functionality.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "@/axiosConfig";
import { useAuth } from "@/context/AuthContext";
import { useWatchlist } from "@/context/WatchlistContext";
import { getMediaTypeFromPath, posterUrl } from "@/lib/tmdb";

/**
 * SkeletonLoader — Shows animated placeholder while details load.
 * Uses shimmer effect (#ffd93d color) for premium feel.
 */
function SkeletonLoader() {
  const shimmer = {
    background:
      "linear-gradient(90deg, rgba(255,217,61,0.04) 0%, rgba(255,217,61,0.13) 40%, rgba(255,217,61,0.04) 80%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.6s infinite linear",
    borderRadius: 8,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#000",
        padding: "1.5rem 1rem 5rem",
        overflowX: "hidden",
      }}
    >
      {/* Back button skeleton */}
      <div
        style={{
          ...shimmer,
          width: 90,
          height: 42,
          marginBottom: "2rem",
          borderRadius: 8,
        }}
      />

      {/* Hero grid: poster + info panel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "2.5rem",
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0 1rem 3rem",
        }}
      >
        {/* Poster skeleton */}
        <div
          style={{
            ...shimmer,
            width: "100%",
            aspectRatio: "2/3",
            borderRadius: 16,
          }}
        />

        {/* Info panel skeleton */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            paddingTop: 4,
          }}
        >
          {/* Media type badge skeleton */}
          <div
            style={{ ...shimmer, width: 80, height: 24, borderRadius: 999 }}
          />
          {/* Title skeleton */}
          <div
            style={{
              ...shimmer,
              width: "68%",
              height: "2.6rem",
              borderRadius: 10,
            }}
          />
          {/* Meta chips skeleton (year, runtime, votes) */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[70, 90, 120].map((w, i) => (
              <div
                key={i}
                style={{ ...shimmer, width: w, height: 30, borderRadius: 8 }}
              />
            ))}
          </div>
          {/* Genre tags skeleton */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[85, 72, 98].map((w, i) => (
              <div
                key={i}
                style={{ ...shimmer, width: w, height: 30, borderRadius: 999 }}
              />
            ))}
          </div>
          {/* Overview label skeleton */}
          <div
            style={{
              ...shimmer,
              width: 65,
              height: 11,
              borderRadius: 6,
              marginTop: "0.5rem",
            }}
          />
          {/* Overview text lines skeleton */}
          {["92%", "85%", "78%", "55%"].map((w, i) => (
            <div
              key={i}
              style={{ ...shimmer, width: w, height: 14, borderRadius: 6 }}
            />
          ))}
          {/* Trailer button skeleton */}
          <div
            style={{
              ...shimmer,
              width: 150,
              height: 44,
              borderRadius: 8,
              marginTop: "0.5rem",
            }}
          />
        </div>
      </div>

      {/* Cast section skeleton */}
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 1rem" }}>
        {/* "Cast" title skeleton */}
        <div
          style={{
            ...shimmer,
            width: 60,
            height: 20,
            borderRadius: 6,
            marginBottom: "1.5rem",
          }}
        />
        {/* Cast grid skeleton — 8 actor cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: "1rem",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  ...shimmer,
                  width: "100%",
                  aspectRatio: "2/3",
                  borderRadius: 12,
                  marginBottom: 10,
                }}
              />
              <div
                style={{
                  ...shimmer,
                  width: "80%",
                  height: 11,
                  borderRadius: 6,
                  margin: "0 auto 6px",
                }}
              />
              <div
                style={{
                  ...shimmer,
                  width: "60%",
                  height: 10,
                  borderRadius: 6,
                  margin: "0 auto",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Main MovieDetailsPage Component
 * Fetches and displays comprehensive media information from TMDB API
 */
function MovieDetailsPage() {
  // ─────── Route & Navigation ───────
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mediaType = getMediaTypeFromPath(location.pathname);

  // ─────── Authentication & Watchlist ───────
  const { user } = useAuth();
  const { isSaved, toggle } = useWatchlist();

  // ─────── State Management ───────
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // ─────── Computed Values ───────
  const isFavorite = user?.$id ? isSaved(id, mediaType) : false;

  /**
   * Fetch movie/TV details from TMDB API on mount or ID change
   * Appends: credits (cast/crew) and videos (trailers)
   */
  useEffect(() => {
    setIsLoading(true);
    setError("");
    setImgLoaded(false);
    axiosInstance
      .get(`/${mediaType}/${id}?append_to_response=credits,videos`)
      .then((res) => setMovie(res.data))
      .catch(() => setError("Failed to load details. Please try again."))
      .finally(() => setIsLoading(false));
  }, [id, mediaType]);

  /**
   * Handle watchlist add/remove toggle
   * Redirects to login if user not authenticated
   */
  const handleToggleFavorite = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsToggling(true);
    try {
      await toggle(id, mediaType, movie);
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    } finally {
      setIsToggling(false);
    }
  };

  // ─────── Render States ───────

  if (isLoading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="details-error">
        <p>{error}</p>
        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/")
          }
          className="back-btn"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  if (!movie) return null;

  // ─────── Data Extraction ───────

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;
  const posterSrc = posterUrl(movie.poster_path);

  // Extract trailer from videos array
  const trailer = movie.videos?.results?.find((v) => v.type === "Trailer");
  
  // Extract director (movies) or creator (TV series)
  const director = movie.credits?.crew?.find((c) => c.job === "Director");
  const creator =
    mediaType === "tv" && movie.created_by?.length > 0
      ? movie.created_by[0].name
      : null;
  
  // Get first 8 cast members
  const cast = movie.credits?.cast?.slice(0, 8) || [];

  // Title and date handling (movie vs TV)
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  // Runtime: different format for movies vs TV
  let runtime = "N/A";
  if (mediaType === "movie") {
    runtime = movie.runtime ? `${movie.runtime} min` : "N/A";
  } else if (
    movie.episode_run_time?.length > 0 &&
    movie.episode_run_time[0] > 0
  ) {
    runtime = `${movie.episode_run_time[0]} min/ep`;
  }

  // Score with color coding: green (7.5+), yellow (5-7.5), red (<5)
  const score = movie.vote_average ? Math.round(movie.vote_average * 10) : 0;
  const scoreColor =
    score >= 75 ? "#4ade80" : score >= 50 ? "#ffd93d" : "#ff4c29";

  // TV-specific metadata
  const numberOfSeasons = movie.number_of_seasons;
  const numberOfEpisodes = movie.number_of_episodes;
  const status = movie.status;
  const networks = movie.networks || [];
  const lastAirDate = movie.last_air_date;
  const nextAirDate = movie.next_episode_to_air?.air_date;

  // ─────── Render ───────

  return (
    <main className="details-page">
      {/* Backdrop image */}
      {backdropUrl && (
        <div className="details-backdrop">
          <img src={backdropUrl} alt="" aria-hidden />
          <div className="details-backdrop__fade" />
        </div>
      )}

      {/* Back button */}
      <button onClick={() => navigate("/")} className="back-btn">
        ← Back
      </button>

      {/* Hero section: poster + info */}
      <div className="details-hero">
        {/* Poster with score overlay */}
        <div className={`details-poster-wrap ${imgLoaded ? "is-loaded" : ""}`}>
          <img
            className="details-poster"
            src={posterSrc}
            alt={title}
            onLoad={() => setImgLoaded(true)}
          />
          <div
            className="details-score"
            style={{ "--score-color": scoreColor }}
          >
            <span className="details-score__num" style={{ color: scoreColor }}>
              {movie.vote_average?.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Info panel: title, genres, overview, etc. */}
        <div className="details-info">
          {/* Media type badge: "Movie" or "TV Series" */}
          <span className="details-badge">
            {mediaType === "tv" ? "TV Series" : "Movie"}
          </span>

          {/* Title with watchlist favorite button */}
          <div className="details-title-wrap">
            <h1 className="details-title">{title}</h1>
            <button
              onClick={handleToggleFavorite}
              disabled={isToggling}
              className={`details-favorite-btn ${isFavorite ? "active" : ""}`}
              title={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          </div>

          {/* Meta information: year, runtime, vote count, status */}
          <div className="details-meta">
            <span className="meta-chip">{year}</span>
            <span className="meta-chip">{runtime}</span>
            {movie.vote_count && (
              <span className="meta-chip">
                {movie.vote_count.toLocaleString()} votes
              </span>
            )}
            {mediaType === "tv" && status && (
              <span
                className={`meta-chip ${status === "Returning Series" ? "meta-chip--green" : ""}`}
              >
                {status}
              </span>
            )}
          </div>

          {/* Genre tags */}
          {movie.genres?.length > 0 && (
            <div className="details-genres">
              {movie.genres.map((g) => (
                <span key={g.id} className="genre-tag">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Overview section */}
          <div className="details-section">
            <h2 className="details-section__label">Overview</h2>
            <p className="details-overview">
              {movie.overview || "No overview available."}
            </p>
          </div>

          {/* TV-specific grid: seasons, episodes, network, air dates */}
          {mediaType === "tv" &&
            (numberOfSeasons || numberOfEpisodes || networks.length > 0) && (
              <div className="tv-grid">
                {numberOfSeasons && (
                  <div className="tv-grid__cell">
                    <span className="tv-grid__label">Seasons</span>
                    <span className="tv-grid__val">{numberOfSeasons}</span>
                  </div>
                )}
                {numberOfEpisodes && (
                  <div className="tv-grid__cell">
                    <span className="tv-grid__label">Episodes</span>
                    <span className="tv-grid__val">{numberOfEpisodes}</span>
                  </div>
                )}
                {networks[0] && (
                  <div className="tv-grid__cell">
                    <span className="tv-grid__label">Network</span>
                    <span className="tv-grid__val">{networks[0].name}</span>
                  </div>
                )}
                {lastAirDate && (
                  <div className="tv-grid__cell">
                    <span className="tv-grid__label">Last Aired</span>
                    <span className="tv-grid__val">
                      {new Date(lastAirDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {nextAirDate && (
                  <div className="tv-grid__cell">
                    <span className="tv-grid__label">Next Ep</span>
                    <span className="tv-grid__val">
                      {new Date(nextAirDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

          {/* Director/Creator credit */}
          {director && mediaType === "movie" && (
            <p className="details-credit">
              <span className="credit-label">Directed by</span> {director.name}
            </p>
          )}
          {creator && mediaType === "tv" && (
            <p className="details-credit">
              <span className="credit-label">Created by</span> {creator}
            </p>
          )}

          {/* Trailer button — external link to YouTube */}
          {trailer && (
            <a
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="trailer-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch Trailer
            </a>
          )}
        </div>
      </div>

      {/* Cast section — top 8 actors */}
      {cast.length > 0 && (
        <section className="cast-section">
          <h2 className="cast-section__title">Cast</h2>
          <div className="cast-grid">
            {cast.map((actor) => (
              <div key={actor.id} className="cast-card">
                <div className="cast-card__img-wrap">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="cast-card__no-img">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="cast-card__name">{actor.name}</p>
                <small className="cast-card__char">{actor.character}</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default MovieDetailsPage;
