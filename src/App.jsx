import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Search from "@/components/Search";
import MovieCard from "@/components/MovieCard";
import FilterSort from "@/components/FilterSort";
import Pagination from "@/components/Pagination";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import axiosInstance from "./axiosConfig";
import SkeletonList from "./components/SkeletonCard ";
import MovieDetailsPage from "./components/MovieDetailsPage";
import {
  saveFilterState,
  loadFilterState,
} from "./utils/sessionStorageManager";

function HomePage() {
  // Load initial state from sessionStorage
  const initialState = loadFilterState();

  const [searchTerm, setSearchTerm] = useState(initialState.searchTerm);
  const [error, setError] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [trendsMovies, settrendsMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(initialState.searchTerm);
  const [currentPage, setCurrentPage] = useState(initialState.currentPage);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState(initialState.sortBy);
  const [mediaType, setMediaType] = useState(initialState.mediaType);
  const [genreFilter, setGenreFilter] = useState(initialState.genreFilter);
  const [yearFilter, setYearFilter] = useState(initialState.yearFilter);
  const [hasNoResults, setHasNoResults] = useState(false);
  useDebounce(
    () => {
      setDebouncedValue(searchTerm);
      setCurrentPage(1);
    },
    800,
    [searchTerm],
  );

  // Save filter state to sessionStorage whenever it changes
  useEffect(() => {
    saveFilterState({
      searchTerm,
      sortBy,
      mediaType,
      genreFilter,
      yearFilter,
      currentPage,
    });
  }, [searchTerm, sortBy, mediaType, genreFilter, yearFilter, currentPage]);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      settrendsMovies(movies);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    }
  };

  const fetchMovies = async (query = "", page = 1) => {
    setIsLoading(true);
    setError("");
    setHasNoResults(false);

    try {
      let endpoint;
      let results = [];
      let apiTotalPages = 0;

      if (query) {
        // Search endpoint - searches across movies AND tv series
        endpoint = `/search/multi?query=${encodeURIComponent(query)}&page=${page}`;
        const res = await axiosInstance.get(endpoint);
        const apiResults = res.data.results || [];
        apiTotalPages = res.data.total_pages || 0;

        // Filter results: only valid media types (movie or tv)
        // Remove persons, companies, etc
  results = apiResults.filter((item) => {
  const isValidMedia =
    item.media_type === "movie" || item.media_type === "tv";
  if (!isValidMedia) return false;

  // فقط وقتی کاربر به‌صراحت media type رو توی فیلتر انتخاب کرده اعمال کن
  // اما چون در حالت سرچ FilterSort مخفیه، این فیلتر رو نادیده بگیر
  return true; // همه فیلم‌ها و سریال‌ها رو نشون بده
});

        // Handle pagination for filtered search results
        // If this page has no valid results, set flag
        if (results.length === 0 && page > 1) {
          setHasNoResults(true);
          // Try previous page automatically
          setCurrentPage(page - 1);
          return;
        }

        // For search with filters, pages might be sparse
        // Show user current page but limit pagination to reasonable max
        setTotalPages(Math.min(apiTotalPages, 50)); // Cap at 50 pages to avoid too many empty pages
      } else {
        // Discover endpoint with filters and sort
        const endpoint_base = `/discover/${mediaType}`;
        const params = new URLSearchParams({
          sort_by: sortBy,
          page: page,
        });

        if (genreFilter) {
          params.append("with_genres", genreFilter);
        }

        if (yearFilter) {
          const year = parseInt(yearFilter);
          if (mediaType === "movie") {
            params.append("primary_release_year", year);
          } else {
            params.append("first_air_date.gte", `${year}-01-01`);
            params.append("first_air_date.lte", `${year}-12-31`);
          }
        }

        endpoint = `${endpoint_base}?${params.toString()}`;
        const res = await axiosInstance.get(endpoint);
        results = res.data.results || [];

        // Add media_type to discover results
        results = results.map((item) => ({
          ...item,
          media_type: mediaType,
        }));

        setTotalPages(res.data.total_pages || 0);
      }

      setMoviesList(results);

      // Track search if searching
      if (query && results.length > 0) {
        updateSearchCount(debouncedValue, results[0]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Failed to fetch movies. Please try again later.");
      setMoviesList([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedValue, currentPage);
  }, [debouncedValue, currentPage, sortBy, mediaType, genreFilter, yearFilter]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <h1>
            <img src="./hero.png" alt="hero images" />
            Discover Movies You’ll Love{" "}
            <span className="text-gradient">Instantly!</span>
          </h1>
          <Search setSearchTerm={setSearchTerm} searchTerm={searchTerm} />

          {trendsMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>

              <ul>
                {trendsMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <img src={movie.poster_url} alt={movie.title} />
                    <p>{index + 1}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </header>

        <section className="all-movies">
          <h2>{searchTerm ? "Search Results" : "Explore"}</h2>

          {!searchTerm && (
            <FilterSort
              sortBy={sortBy}
              setSortBy={setSortBy}
              mediaType={mediaType}
              setMediaType={setMediaType}
              genreFilter={genreFilter}
              setGenreFilter={setGenreFilter}
              yearFilter={yearFilter}
              setYearFilter={setYearFilter}
            />
          )}

          {isLoading ? (
            <SkeletonList count={5} />
          ) : error ? (
            <p className="error">{error}</p>
          ) : hasNoResults ? (
            <p className="no-results">
              No results found on this page. Try a different search or adjust
              your filters.
              <br />
              <button
                onClick={() => setCurrentPage(1)}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  background: "#ffd93d",
                  color: "#000",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Back to First Page
              </button>
            </p>
          ) : moviesList.length > 0 ? (
            <>
              <div className="movies-list">
                <ul>
                  {moviesList.map((movie) => {
                    return <MovieCard key={movie.id} movie={movie} />;
                  })}
                </ul>
              </div>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                  isLoading={isLoading}
                />
              )}
            </>
          ) : (
            <p className="no-results">
              No {mediaType === "tv" ? "series" : "movies"} found. Try a
              different search.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/tv/:id" element={<MovieDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
