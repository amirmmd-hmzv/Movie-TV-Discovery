/**
 * SessionStorage Utility Functions
 * Manages persistence of filters, search, and pagination state
 */

const STORAGE_KEYS = {
  SEARCH_TERM: "movieApp_searchTerm",
  SORT_BY: "movieApp_sortBy",
  MEDIA_TYPE: "movieApp_mediaType",
  GENRE_FILTER: "movieApp_genreFilter",
  YEAR_FILTER: "movieApp_yearFilter",
  CURRENT_PAGE: "movieApp_currentPage",
};

/**
 * Save all filter states to sessionStorage
 */
export const saveFilterState = ({
  searchTerm,
  sortBy,
  mediaType,
  genreFilter,
  yearFilter,
  currentPage,
}) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SEARCH_TERM, searchTerm);
    sessionStorage.setItem(STORAGE_KEYS.SORT_BY, sortBy);
    sessionStorage.setItem(STORAGE_KEYS.MEDIA_TYPE, mediaType);
    sessionStorage.setItem(STORAGE_KEYS.GENRE_FILTER, genreFilter);
    sessionStorage.setItem(STORAGE_KEYS.YEAR_FILTER, yearFilter);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, String(currentPage));
  } catch (error) {
    console.error("Error saving filter state to sessionStorage:", error);
  }
};

/**
 * Load all filter states from sessionStorage
 */
export const loadFilterState = () => {
  try {
    return {
      searchTerm: sessionStorage.getItem(STORAGE_KEYS.SEARCH_TERM) || "",
      sortBy: sessionStorage.getItem(STORAGE_KEYS.SORT_BY) || "popularity.desc",
      mediaType: sessionStorage.getItem(STORAGE_KEYS.MEDIA_TYPE) || "movie",
      genreFilter: sessionStorage.getItem(STORAGE_KEYS.GENRE_FILTER) || "",
      yearFilter: sessionStorage.getItem(STORAGE_KEYS.YEAR_FILTER) || "",
      currentPage:
        parseInt(sessionStorage.getItem(STORAGE_KEYS.CURRENT_PAGE)) || 1,
    };
  } catch (error) {
    console.error("Error loading filter state from sessionStorage:", error);
    return {
      searchTerm: "",
      sortBy: "popularity.desc",
      mediaType: "movie",
      genreFilter: "",
      yearFilter: "",
      currentPage: 1,
    };
  }
};

/**
 * Clear all filter states from sessionStorage
 */
export const clearFilterState = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Error clearing filter state from sessionStorage:", error);
  }
};

/**
 * Update a specific filter state in sessionStorage
 */
export const updateFilterStateItem = (key, value) => {
  try {
    if (typeof value === "number") {
      sessionStorage.setItem(key, String(value));
    } else {
      sessionStorage.setItem(key, value);
    }
  } catch (error) {
    console.error("Error updating filter state item in sessionStorage:", error);
  }
};
