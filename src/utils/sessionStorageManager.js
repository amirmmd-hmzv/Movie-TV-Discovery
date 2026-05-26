const KEYS = {
  SEARCH_TERM: "movieApp_searchTerm",
  SORT_BY:     "movieApp_sortBy",
  MEDIA_TYPE:  "movieApp_mediaType",
  GENRE_FILTER:"movieApp_genreFilter",
  YEAR_FILTER: "movieApp_yearFilter",
  CURRENT_PAGE:"movieApp_currentPage",
  WIPE_ON_LOAD:"movieApp_wipeOnLoad",   // ← فلگ رفرش
};

const DEFAULT_STATE = {
  searchTerm:  "",
  sortBy:      "popularity.desc",
  mediaType:   "movie",
  genreFilter: "",
  yearFilter:  "",
  currentPage: 1,
};

/**
 * در HomePage یه بار صدا بزن تا listener رجیستر بشه.
 * وقتی کاربر F5/Ctrl+R میزنه beforeunload فایر میشه
 * و فلگ رو ست میکنه. Navigation معمولی این فلگ رو ست نمیکنه.
 */
export const registerRefreshDetector = () => {
  const handler = () => {
    sessionStorage.setItem(KEYS.WIPE_ON_LOAD, "true");
  };
  window.addEventListener("beforeunload", handler);
  // cleanup برمیگردونه تا useEffect بتونه remove کنه
  return () => window.removeEventListener("beforeunload", handler);
};

export const saveFilterState = ({
  searchTerm,
  sortBy,
  mediaType,
  genreFilter,
  yearFilter,
  currentPage,
}) => {
  try {
    sessionStorage.setItem(KEYS.SEARCH_TERM,  searchTerm);
    sessionStorage.setItem(KEYS.SORT_BY,      sortBy);
    sessionStorage.setItem(KEYS.MEDIA_TYPE,   mediaType);
    sessionStorage.setItem(KEYS.GENRE_FILTER, genreFilter);
    sessionStorage.setItem(KEYS.YEAR_FILTER,  yearFilter);
    sessionStorage.setItem(KEYS.CURRENT_PAGE, String(currentPage));
  } catch (e) {
    console.error("saveFilterState:", e);
  }
};

export const loadFilterState = () => {
  try {
    const shouldWipe = sessionStorage.getItem(KEYS.WIPE_ON_LOAD) === "true";

    // فلگ رو بلافاصله پاک کن — فقط یه بار اثر داره
    sessionStorage.removeItem(KEYS.WIPE_ON_LOAD);

    if (shouldWipe) {
      // رفرش بوده → همه فیلترها رو پاک کن و default برگردون
      Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k));
      return { ...DEFAULT_STATE };
    }

    return {
      searchTerm:  sessionStorage.getItem(KEYS.SEARCH_TERM)  || "",
      sortBy:      sessionStorage.getItem(KEYS.SORT_BY)      || "popularity.desc",
      mediaType:   sessionStorage.getItem(KEYS.MEDIA_TYPE)   || "movie",
      genreFilter: sessionStorage.getItem(KEYS.GENRE_FILTER) || "",
      yearFilter:  sessionStorage.getItem(KEYS.YEAR_FILTER)  || "",
      currentPage: parseInt(sessionStorage.getItem(KEYS.CURRENT_PAGE)) || 1,
    };
  } catch (e) {
    console.error("loadFilterState:", e);
    return { ...DEFAULT_STATE };
  }
};

export const clearFilterState = () => {
  try {
    Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k));
  } catch (e) {
    console.error("clearFilterState:", e);
  }
};

export const updateFilterStateItem = (key, value) => {
  try {
    sessionStorage.setItem(key, typeof value === "number" ? String(value) : value);
  } catch (e) {
    console.error("updateFilterStateItem:", e);
  }
};