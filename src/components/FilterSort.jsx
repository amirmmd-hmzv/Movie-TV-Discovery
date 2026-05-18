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
  // ✅ fix: مقادیر درست TMDB — "rating" وجود نداره، باید "vote_average" باشه
  const sortOptions = [
    { value: "popularity.desc", label: "Popularity (High to Low)" },
    { value: "popularity.asc", label: "Popularity (Low to High)" },
    { value: "vote_average.desc", label: "Rating (High to Low)" },
    { value: "vote_average.asc", label: "Rating (Low to High)" },
    { value: "release_date.desc", label: "Release Date (Newest)" },
    { value: "release_date.asc", label: "Release Date (Oldest)" },
  ];

  const genreOptions = [
    { value: "", label: "All Genres" },
    { value: "28", label: "Action" },
    { value: "12", label: "Adventure" },
    { value: "16", label: "Animation" },
    { value: "35", label: "Comedy" },
    { value: "80", label: "Crime" },
    { value: "99", label: "Documentary" },
    { value: "18", label: "Drama" },
    { value: "10751", label: "Family" },
    { value: "14", label: "Fantasy" },
    { value: "36", label: "History" },
    { value: "27", label: "Horror" },
    { value: "10402", label: "Music" },
    { value: "9648", label: "Mystery" },
    { value: "10749", label: "Romance" },
    { value: "878", label: "Science Fiction" },
    { value: "10770", label: "TV Movie" },
    { value: "53", label: "Thriller" },
    { value: "10752", label: "War" },
    { value: "37", label: "Western" },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: "", label: "All Years" },
    ...Array.from({ length: 30 }, (_, i) => ({
      value: currentYear - i,
      label: currentYear - i,
    })),
  ];

  return (
    <div className="filter-sort-container">
      <div className="filter-sort-wrapper">
        {/* Media Type Toggle — همیشه فعال، حتی در سرچ */}
        <div className="filter-group">
          <label className="filter-label">Content Type</label>
          <div className="media-type-toggle">
            <button
              className={`toggle-btn ${mediaType === "movie" ? "active" : ""}`}
              onClick={() => setMediaType("movie")}
            >
              🎬 Movies
            </button>
            <button
              className={`toggle-btn ${mediaType === "tv" ? "active" : ""}`}
              onClick={() => setMediaType("tv")}
            >
              📺 Series
            </button>
          </div>
        </div>

        {/* Sort — در سرچ غیرفعاله */}
        <div className="filter-group" style={{ opacity: isSearchMode ? 0.4 : 1 }}>
          <label htmlFor="sort" className="filter-label">
            Sort By{isSearchMode && <span style={{ fontSize: "0.7rem", fontStyle: "italic", marginLeft: "6px" }}>(Explore only)</span>}
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

        {/* Genre — در سرچ غیرفعاله */}
        <div className="filter-group" style={{ opacity: isSearchMode ? 0.4 : 1 }}>
          <label htmlFor="genre" className="filter-label">
            Genre{isSearchMode && <span style={{ fontSize: "0.7rem", fontStyle: "italic", marginLeft: "6px" }}>(Explore only)</span>}
          </label>
          <select
            id="genre"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="filter-select"
            disabled={isSearchMode}
          >
            {genreOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year — در سرچ غیرفعاله */}
        <div className="filter-group" style={{ opacity: isSearchMode ? 0.4 : 1 }}>
          <label htmlFor="year" className="filter-label">
            Release Year{isSearchMode && <span style={{ fontSize: "0.7rem", fontStyle: "italic", marginLeft: "6px" }}>(Explore only)</span>}
          </label>
          <select
            id="year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="filter-select"
            disabled={isSearchMode}
          >
            {yearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <button
          className="reset-btn"
          onClick={() => {
            setSortBy("popularity.desc");
            setGenreFilter("");
            setYearFilter("");
            setMediaType("movie");
          }}
          title="Reset all filters"
        >
          ↻ Reset
        </button>
      </div>
    </div>
  );
}

export default FilterSort;