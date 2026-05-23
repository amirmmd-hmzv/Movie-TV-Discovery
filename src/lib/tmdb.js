/**
 * TMDB helpers — image URLs, routes, sort options per media type.
 */
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path, size = "w500") {
  if (!path) return "/no-movie.svg";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${normalized}`;
}

export function getDisplayTitle(item) {
  if (!item) return "";
  return item.title || item.name || item.original_title || item.original_name || "";
}

export function getDetailPath(mediaType, id) {
  return mediaType === "tv" ? `/tv/${id}` : `/movie/${id}`;
}

export function getMediaTypeFromPath(pathname) {
  return pathname.includes("/tv/") ? "tv" : "movie";
}

export const TMDB_MAX_PAGE = 500;
export const SEARCH_MAX_PAGE = 50;

export const MOVIE_SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity (High to Low)" },
  { value: "popularity.asc", label: "Popularity (Low to High)" },
  { value: "vote_average.desc", label: "Rating (High to Low)" },
  { value: "vote_average.asc", label: "Rating (Low to High)" },
  { value: "release_date.desc", label: "Release Date (Newest)" },
  { value: "release_date.asc", label: "Release Date (Oldest)" },
];

export const TV_SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity (High to Low)" },
  { value: "popularity.asc", label: "Popularity (Low to High)" },
  { value: "vote_average.desc", label: "Rating (High to Low)" },
  { value: "vote_average.asc", label: "Rating (Low to High)" },
  { value: "first_air_date.desc", label: "First Air Date (Newest)" },
  { value: "first_air_date.asc", label: "First Air Date (Oldest)" },
];

export function getSortOptions(mediaType) {
  return mediaType === "tv" ? TV_SORT_OPTIONS : MOVIE_SORT_OPTIONS;
}

export function normalizeSortForMediaType(sortBy, mediaType) {
  const valid = getSortOptions(mediaType).map((o) => o.value);
  return valid.includes(sortBy) ? sortBy : "popularity.desc";
}
