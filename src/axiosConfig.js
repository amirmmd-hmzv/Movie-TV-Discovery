/**
 * TMDB HTTP client — talks to The Movie Database API directly.
 * Key comes from .env / .env.local as VITE_TMDB_API_KEY (Vite exposes VITE_* vars).
 */
import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  console.warn(
    "[TMDB] VITE_TMDB_API_KEY is missing. Add it to .env — see .env.example.",
  );
}

const axiosInstance = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

export default axiosInstance;
