import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const WATCHLIST_COLLECTION_ID = import.meta.env
  .VITE_APPWRITE_WATCHLIST_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const databases = new Databases(client);

/**
 * toInt — Convert string ID to integer
 * useParams() returns strings, but Appwrite collections use integers
 * Ensures type consistency for database queries
 */
const toInt = (id) => Number(id);

/* ════════════════════════════════════
   SEARCH / TRENDING
════════════════════════════════════ */

/**
 * updateSearchCount — Track search terms and update trending list
 * Creates new record or increments count for existing search term
 *
 * @param {string} searchTerm - User's search query
 * @param {object} movie - TMDB movie/TV data object
 * @param {string} mediaType - "movie" or "tv"
 *
 * Note: Only searchTerm is used as unique key (not mediaType)
 * This allows "spider" searches for both movies and TV to count together
 */
export const updateSearchCount = async (searchTerm, movie, mediaType) => {
  try {
    // Check if search term already exists (count-based, not mediaType-specific)
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";

    // Get best title based on media type (name for TV, title for movies)
    const title =
      mediaType === "tv"
        ? movie.name || movie.original_name || searchTerm
        : movie.title || movie.original_title || searchTerm;

    if (result?.documents?.length > 0) {
      // Existing search term: increment count and update metadata
      const doc = result.documents[0];
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
        // Update with latest search result (poster, title, mediaType)
        poster_url: posterUrl,
        title,
        mediaType,
        tmdb_id: toInt(movie.id),
      });
    } else {
      // New search term: create record
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        poster_url: posterUrl,
        mediaType,
        title,
        tmdb_id: toInt(movie.id),
      });
    }
  } catch (error) {
    console.error("updateSearchCount error:", error);
  }
};

/**
 * getTrendingMovies — Get most searched titles
 * Deduplicates by title name (case-insensitive) and returns top 10
 *
 * @returns {Promise<Array>} Array of trending search documents sorted by count
 *
 * Deduplication Logic:
 * If same title searched multiple times with different search terms,
 * only show once and sum all counts
 * Example: "spider + tv" and "spider-man + tv" → one entry with combined count
 */
export const getTrendingMovies = async () => {
  try {
    // Fetch 50 (more than needed) for deduplication
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(50),
      Query.orderDesc("count"),
    ]);

    // Deduplicate by title (case-insensitive and trimmed)
    const titleMap = new Map();
    for (const doc of result.documents) {
      const key = (doc.title || "").toLowerCase().trim();
      if (!key) continue;

      if (titleMap.has(key)) {
        // Seen before: add count to existing entry
        const existing = titleMap.get(key);
        titleMap.set(key, {
          ...existing,
          count: existing.count + (doc.count || 0),
        });
      } else {
        // New title: add entry
        titleMap.set(key, { ...doc });
      }
    }

    // Sort by total count and return top 10
    return Array.from(titleMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  } catch (error) {
    console.error("getTrendingMovies error:", error);
    return [];
  }
};

/* ════════════════════════════════════
   WATCHLIST
════════════════════════════════════ */

/**
 * addToWatchlist — Add movie/TV series to user's watchlist
 * Prevents duplicates by checking existing entry
 *
 * @param {string} userId - Appwrite user ID
 * @param {number|string} movieId - TMDB movie/TV ID
 * @param {string} mediaType - "movie" or "tv"
 * @param {object} movieData - TMDB media data object
 * @returns {Promise<object>} {success, document} or {success: false, message}
 */
export const addToWatchlist = async (userId, movieId, mediaType, movieData) => {
  try {
    // Check if already in watchlist to prevent duplicates
    const existing = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", toInt(movieId)), // Convert to integer
        Query.equal("mediaType", mediaType),
      ],
    );

    if (existing?.documents?.length > 0) {
      return { success: false, message: "Already in watchlist" };
    }

    // Extract title (handle both movie and TV naming conventions)
    const title =
      mediaType === "tv"
        ? movieData.name || movieData.original_name || "Unknown"
        : movieData.title || movieData.original_title || "Unknown";

    // Build poster URL from TMDB image path
    const posterUrl = movieData.poster_path
      ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
      : "";

    const document = await databases.createDocument(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        movieId: toInt(movieId), // Convert to integer
        mediaType,
        title,
        poster_url: posterUrl,
        vote_average: String(movieData.vote_average || 0),
        overview: (movieData.overview || "").slice(0, 200), // Limit to 200 chars
        addedDate: new Date().toISOString(),
      },
    );

    return { success: true, document };
  } catch (error) {
    console.error("addToWatchlist error:", error);
    throw error;
  }
};

/**
 * removeFromWatchlist — Remove movie/TV series from user's watchlist
 *
 * @param {string} userId - Appwrite user ID
 * @param {number|string} movieId - TMDB movie/TV ID
 * @param {string} mediaType - "movie" or "tv"
 * @returns {Promise<object>} {success} or {success: false, message}
 */
export const removeFromWatchlist = async (userId, movieId, mediaType) => {
  try {
    // Find document matching user, movieId, and mediaType
    const existing = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", toInt(movieId)), // Convert to integer
        Query.equal("mediaType", mediaType),
      ],
    );

    if (existing?.documents?.length === 0) {
      return { success: false, message: "Not in watchlist" };
    }

    await databases.deleteDocument(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      existing.documents[0].$id,
    );

    return { success: true };
  } catch (error) {
    console.error("removeFromWatchlist error:", error);
    throw error;
  }
};

/**
 * isInWatchlist — Check if title is in user's watchlist
 * Used by WatchlistContext for O(1) lookup (via Set)
 *
 * @param {string} userId - Appwrite user ID
 * @param {number|string} movieId - TMDB movie/TV ID
 * @param {string} mediaType - "movie" or "tv"
 * @returns {Promise<boolean>} True if in watchlist, false otherwise
 */
export const isInWatchlist = async (userId, movieId, mediaType) => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", toInt(movieId)), // Convert useParams string to integer
        Query.equal("mediaType", mediaType),
      ],
    );
    return result?.documents?.length > 0;
  } catch (error) {
    console.error("isInWatchlist error:", error);
    return false;
  }
};

/**
 * getUserWatchlist — Fetch all titles in user's watchlist
 * Returns sorted by most recently added (descending)
 *
 * @param {string} userId - Appwrite user ID
 * @returns {Promise<Array>} Array of watchlist documents (max 100)
 */
export const getUserWatchlist = async (userId) => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("addedDate"),
        Query.limit(100),
      ],
    );
    return result?.documents || [];
  } catch (error) {
    console.error("getUserWatchlist error:", error);
    return [];
  }
};

/**
 * clearWatchlist — Remove all items from user's watchlist
 * Deletes all documents where userId matches
 *
 * @param {string} userId - Appwrite user ID
 * @returns {Promise<object>} {success} on completion
 */
export const clearWatchlist = async (userId) => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [Query.equal("userId", userId)],
    );
    // Delete each document individually (Appwrite limitation)
    for (const doc of result?.documents || []) {
      await databases.deleteDocument(
        DATABASE_ID,
        WATCHLIST_COLLECTION_ID,
        doc.$id,
      );
    }
    return { success: true };
  } catch (error) {
    console.error("clearWatchlist error:", error);
    throw error;
  }
};
