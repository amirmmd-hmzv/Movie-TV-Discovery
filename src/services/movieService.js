/**
 * TMDB discover + search API layer (via axiosConfig → api.themoviedb.org).
 */
import axiosInstance from "@/axiosConfig";
import { SEARCH_MAX_PAGE, TMDB_MAX_PAGE } from "@/lib/tmdb";

export async function fetchMoviesList({
  query = "",
  page = 1,
  mediaType = "movie",
  sortBy = "popularity.desc",
  genreFilter = "",
  yearFilter = "",
  signal,
}) {
  const safePage = Math.max(1, Math.min(page, TMDB_MAX_PAGE));

  if (query.trim()) {
    const endpoint = `/search/${mediaType}?query=${encodeURIComponent(query.trim())}&page=${safePage}&include_adult=false`;
    const res = await axiosInstance.get(endpoint, { signal });
    const results = (res.data.results || []).map((item) => ({
      ...item,
      media_type: mediaType,
    }));

    return {
      results,
      totalPages: Math.min(res.data.total_pages || 0, SEARCH_MAX_PAGE),
      pageEmpty: results.length === 0 && safePage > 1,
      page: safePage,
    };
  }

  const params = new URLSearchParams({
    sort_by: sortBy,
    page: String(safePage),
    include_adult: "false",
  });

  if (genreFilter) params.append("with_genres", genreFilter);

  if (yearFilter) {
    const year = parseInt(yearFilter, 10);
    if (mediaType === "movie") {
      params.append("primary_release_year", String(year));
    } else {
      params.append("first_air_date.gte", `${year}-01-01`);
      params.append("first_air_date.lte", `${year}-12-31`);
    }
  }

  const res = await axiosInstance.get(`/discover/${mediaType}?${params}`, {
    signal,
  });
  const results = (res.data.results || []).map((item) => ({
    ...item,
    media_type: mediaType,
  }));

  return {
    results,
    totalPages: Math.min(res.data.total_pages || 0, TMDB_MAX_PAGE),
    pageEmpty: false,
    page: safePage,
  };
}
