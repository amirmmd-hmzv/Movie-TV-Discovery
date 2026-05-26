/**
 * HomePage — search, discover filters, trending searches, paginated grid.
 * Filter state persists in sessionStorage (see sessionStorageManager).
 */
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "react-use";
import Search from "@/components/Search";
import MovieCard from "@/components/MovieCard";
import FilterSort from "@/components/FilterSort";
import Pagination from "@/components/Pagination";
import SkeletonList from "@/components/SkeletonCard";
import ErrorView from "@/components/Errorview";
import HeroPosterStack from "@/components/HeroPosterStack";
import TrendingSearches from "@/components/TrendingSearches";
import { getTrendingMovies, updateSearchCount } from "@/appwrite";
import { fetchMoviesList } from "@/services/movieService";
import {
  loadFilterState,
  saveFilterState,
  registerRefreshDetector,
} from "@/utils/sessionStorageManager";
import { normalizeSortForMediaType, TMDB_MAX_PAGE } from "@/lib/tmdb";

export default function HomePage() {
  const initialState = useRef(loadFilterState()).current;
  const isMountedRef = useRef(false); 

  const [searchTerm, setSearchTerm] = useState(initialState.searchTerm);
  const [error, setError] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(initialState.searchTerm);
  const [currentPage, setCurrentPage] = useState(initialState.currentPage);
  const [totalPages, setTotalPages] = useState(0);
  const [mediaType, setMediaType] = useState(initialState.mediaType || "movie");
  const [sortBy, setSortBy] = useState(
    normalizeSortForMediaType(
      initialState.sortBy || "popularity.desc",
      initialState.mediaType || "movie",
    ),
  );
  const [genreFilter, setGenreFilter] = useState(
    initialState.genreFilter || "",
  );
  const [yearFilter, setYearFilter] = useState(initialState.yearFilter || "");
  const [hasNoResults, setHasNoResults] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const isSearching = debouncedValue.trim().length > 0;

  useDebounce(
    () => {
      /**
       * Optimization: Skip debounce on initial mount
       * This allows immediate search results without waiting 800ms
       * After first render, normal debouncing applies (800ms delay)
       */
      if (!isMountedRef.current) {
        isMountedRef.current = true;
        return;
      }
      setDebouncedValue(searchTerm);
      setCurrentPage(1);
    },
    800,
    [searchTerm],
  );
  const handleSetSortBy = (val) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleSetMediaType = (val) => {
    setMediaType(val);
    setSortBy((prev) => normalizeSortForMediaType(prev, val));
    setGenreFilter("");
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

  useEffect(() => {
    getTrendingMovies()
      .then(setTrendingSearches)
      .catch((err) => console.error("Error fetching trending searches:", err));
  }, []);

  useEffect(() => {
    const requestedPage = currentPage;
    const safePage = Math.max(1, Math.min(requestedPage, TMDB_MAX_PAGE));

    if (safePage !== requestedPage) {
      setCurrentPage(safePage);
      return;
    }

    const controller = new AbortController();

    async function loadMovies() {
      setIsLoading(true);
      setError("");
      setHasNoResults(false);

      try {
        const {
          results,
          totalPages: pages,
          pageEmpty,
        } = await fetchMoviesList({
          query: debouncedValue,
          page: safePage,
          mediaType,
          sortBy,
          genreFilter,
          yearFilter,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (pageEmpty) {
          setHasNoResults(true);
          setMoviesList([]);
          return;
        }

        setMoviesList(results);
        setTotalPages(pages);

        if (debouncedValue.trim() && results.length > 0) {
          updateSearchCount(debouncedValue.trim(), results[0], mediaType);
        }
      } catch (err) {
        if (controller.signal.aborted || err.code === "ERR_CANCELED") return;
        console.error("Error fetching movies:", err);
        setError("Failed to fetch movies. Please try again later.");
        setMoviesList([]);
        setTotalPages(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadMovies();
    return () => controller.abort();
  }, [
    debouncedValue,
    currentPage,
    sortBy,
    mediaType,
    genreFilter,
    yearFilter,
    retryKey,
  ]);

  const retryFetch = () => setRetryKey((k) => k + 1);

  useEffect(() => {
    const cleanup = registerRefreshDetector();
    return cleanup;
  }, []);

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

          <TrendingSearches trendingSearches={trendingSearches} />
        </header>

        <section className="all-movies">
          <h2>{isSearching ? `Results for "${debouncedValue}"` : "Explore"}</h2>

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
            <ErrorView message={error} onRetry={retryFetch} />
          ) : hasNoResults ? (
            <p className="no-results">
              No results found on this page. Try a different search or adjust
              your filters.
              <br />
              <button
                type="button"
                className="no-results-btn"
                onClick={() => setCurrentPage(1)}
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
