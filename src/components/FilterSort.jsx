import { useEffect, useState } from "react";
import axiosInstance from "@/axiosConfig";
import { getSortOptions } from "@/lib/tmdb";
import "../styles/FilterSort.css";

function FilterSort({
  sortBy,
  setSortBy,
  mediaType,
  setMediaType,
  genreFilter,
  setGenreFilter,
  yearFilter,
  setYearFilter,
  isSearchMode = false,
}) {
  const sortOptions = getSortOptions(mediaType);
  const [genreOptions, setGenreOptions] = useState([
    { value: "", label: "All Genres" },
  ]);

  useEffect(() => {
    const controller = new AbortController();

    axiosInstance
      .get(`/genre/${mediaType}/list`, { signal: controller.signal })
      .then((res) => {
        const genres = (res.data.genres || [])
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((g) => ({ value: String(g.id), label: g.name }));
        setGenreOptions([{ value: "", label: "All Genres" }, ...genres]);
      })
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") {
          console.error("Failed to load genres:", err);
        }
      });

    return () => controller.abort();
  }, [mediaType]);

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: "", label: "All Years" },
    ...Array.from({ length: 30 }, (_, i) => ({
      value: String(currentYear - i),
      label: currentYear - i,
    })),
  ];

  const exploreOnly = isSearchMode ? (
    <span className="filter-hint">(Explore only)</span>
  ) : null;

  return (
    <div className="filter-sort-container">
      <div className="filter-sort-wrapper">
        <div className="filter-group">
          <span className="filter-label">Content Type</span>
          <div className="media-type-toggle">
            <button
              type="button"
              className={`toggle-btn ${mediaType === "movie" ? "active" : ""}`}
              onClick={() => setMediaType("movie")}
            >
              Movies
            </button>
            <button
              type="button"
              className={`toggle-btn ${mediaType === "tv" ? "active" : ""}`}
              onClick={() => setMediaType("tv")}
            >
              Series
            </button>
          </div>
        </div>

        <div className={`filter-group ${isSearchMode ? "filter-group--disabled" : ""}`}>
          <label htmlFor="sort" className="filter-label">
            Sort By {exploreOnly}
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
            disabled={isSearchMode}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={`filter-group ${isSearchMode ? "filter-group--disabled" : ""}`}>
          <label htmlFor="genre" className="filter-label">
            Genre {exploreOnly}
          </label>
          <select
            id="genre"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="filter-select"
            disabled={isSearchMode}
          >
            {genreOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={`filter-group ${isSearchMode ? "filter-group--disabled" : ""}`}>
          <label htmlFor="year" className="filter-label">
            {mediaType === "tv" ? "First Air Year" : "Release Year"} {exploreOnly}
          </label>
          <select
            id="year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="filter-select"
            disabled={isSearchMode}
          >
            {yearOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="reset-btn"
          onClick={() => {
            setSortBy("popularity.desc");
            setGenreFilter("");
            setYearFilter("");
            setMediaType("movie");
          }}
          title="Reset all filters"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default FilterSort;
