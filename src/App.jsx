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
import ErrorView from "./components/Errorview";
import HeroPosterStack from "./components/HeroPosterStack";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import WatchlistPage from "./components/WatchlistPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function HomePage() {
  const initialState = loadFilterState();

  const [searchTerm, setSearchTerm] = useState(initialState.searchTerm);
  const [error, setError] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [trendsMovies, settrendsMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(initialState.searchTerm);
  const [currentPage, setCurrentPage] = useState(initialState.currentPage);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState(
    initialState.sortBy || "popularity.desc",
  );
  // "movie" | "tv"
  const [mediaType, setMediaType] = useState(initialState.mediaType || "movie");
  const [genreFilter, setGenreFilter] = useState(
    initialState.genreFilter || "",
  );
  const [yearFilter, setYearFilter] = useState(initialState.yearFilter || "");
  const [hasNoResults, setHasNoResults] = useState(false);

  const isSearching = debouncedValue.trim().length > 0;

  useDebounce(
    () => {
      setDebouncedValue(searchTerm);
      setCurrentPage(1);
    },
    800,
    [searchTerm],
  );

  // وقتی فیلترها عوض میشن page رو ریست کن
  // ولی نه اگه currentPage خودش داره عوض میشه (جلوگیری از loop)
  const handleSetSortBy = (val) => {
    setSortBy(val);
    setCurrentPage(1);
  };
  const handleSetMediaType = (val) => {
    setMediaType(val);
    setCurrentPage(1);
  };
  const handleSetGenreFilter = (val) => {
    setGenreFilter(val);
    setCurrentPage(1);
  };
  const handleSetYearFilter = (val) => {
    setYearFilter(val);
    setCurrentPage(1);
  };

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

  // TMDB hard limit — بیشتر از 500 قبول نمیکنه
  const TMDB_MAX_PAGE = 500;

  const fetchMovies = async (query = "", page = 1) => {
    const safePage = Math.max(1, Math.min(page, TMDB_MAX_PAGE));
    if (safePage !== page) {
      setCurrentPage(safePage);
      return;
    }

    setIsLoading(true);
    setError("");
    setHasNoResults(false);

    try {
      let results = [];
      let apiTotalPages = 0;

      if (query) {
        // ── Search mode ──
        // همیشه در نوع انتخاب‌شده سرچ کن (movie یا tv)
        const endpoint = `/search/${mediaType}?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
        const res = await axiosInstance.get(endpoint);
        apiTotalPages = res.data.total_pages || 0;
        results = (res.data.results || []).map((item) => ({
          ...item,
          media_type: mediaType,
        }));

        if (results.length === 0 && page > 1) {
          setHasNoResults(true);
          setMoviesList([]);
          return;
        }

        setTotalPages(Math.min(apiTotalPages, 50));
      } else {
        // ── Discover mode ──
        const params = new URLSearchParams({
          sort_by: sortBy,
          page: safePage,
          include_adult: false,
        });

        if (genreFilter) params.append("with_genres", genreFilter);

        if (yearFilter) {
          const year = parseInt(yearFilter);
          if (mediaType === "movie") {
            params.append("primary_release_year", year);
          } else {
            params.append("first_air_date.gte", `${year}-01-01`);
            params.append("first_air_date.lte", `${year}-12-31`);
          }
        }

        const res = await axiosInstance.get(
          `/discover/${mediaType}?${params.toString()}`,
        );
        results = (res.data.results || []).map((item) => ({
          ...item,
          media_type: mediaType,
        }));
        // TMDB max page = 500
        setTotalPages(Math.min(res.data.total_pages || 0, TMDB_MAX_PAGE));
      }

      setMoviesList(results);

      if (query && results.length > 0) {
        console.log(results);
        updateSearchCount(query, results[0], mediaType);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue, currentPage, sortBy, mediaType, genreFilter, yearFilter]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  console.log(trendsMovies);
  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <HeroPosterStack />
          <h1 className="mt-10">
            Discover Movies You'll Love{" "}
            <span className="text-gradient ">Instantly!</span>
          </h1>
          <Search setSearchTerm={setSearchTerm} searchTerm={searchTerm} />

          {trendsMovies.length > 0 && (
            <section className="trending">
              <div className="trending-header">
                <div className="trending-bar" />
                <h2>Trending Searches</h2>
                <span className="trending-badge">Live</span>
              </div>
              <ul>
                {trendsMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <span className="rank">{index + 1}</span>
                    <div className="poster-wrap">
                      <img src={movie.poster_url} alt={movie.title} />
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
          )}
        </header>

        <section className="all-movies">
          <h2>{isSearching ? `Results for "${debouncedValue}"` : "Explore"}</h2>

          {/* FilterSort همیشه نشون داده میشه، ولی در حالت سرچ فقط media type فعاله */}
          <FilterSort
            sortBy={sortBy}
            setSortBy={handleSetSortBy}
            mediaType={mediaType}
            setMediaType={handleSetMediaType}
            genreFilter={genreFilter}
            setGenreFilter={handleSetGenreFilter}
            yearFilter={yearFilter}
            setYearFilter={handleSetYearFilter}
            isSearchMode={isSearching}
          />

          {isLoading ? (
            <SkeletonList count={5} />
          ) : error ? (
            <ErrorView
              message={error}
              onRetry={() => fetchMovies(debouncedValue, currentPage)}
            />
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
              <div className="movies-list mt-20">
                <ul>
                  {moviesList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
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
  const { user ,$id} = useAuth();
  
  console.log($id)
  console.log(user)
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/tv/:id" element={<MovieDetailsPage />} />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
