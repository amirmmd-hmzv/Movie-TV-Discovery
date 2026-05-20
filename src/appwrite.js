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

export const updateSearchCount = async (searchTerm, movie, mediaType) => {
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
      Query.equal("mediaType", mediaType),
    ]);

    // ✅ poster_path exists for BOTH movie and tv in TMDB
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";

    // ✅ title field is different for tv vs movie
    const title =
      mediaType === "tv"
        ? movie.name || movie.original_name || searchTerm
        : movie.title || movie.original_title || searchTerm;

    if (result?.documents?.length > 0) {
      const doc = result.documents[0];
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
        poster_url: posterUrl, // ✅ refreshed every time
        title, // ✅ update title too
      });
    } else {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        poster_url: posterUrl, // ✅ correct poster for tv or movie
        mediaType, // ✅ "tv" or "movie"
        title, // ✅ correct title for tv or movie
      });
    }
  } catch (error) {
    console.error("updateSearchCount error:", error);
  }
};

export const getTrendingMovies = async () => {
  const result = await databases.listDocuments(
    DATABASE_ID, // databaseId
    COLLECTION_ID, // collectionId
    [Query.limit(10), Query.orderDesc("count")], // queries (optional)
  );

  return result.documents;
};

/* ════════════════════════════════════════════════════════════════
   WATCHLIST FUNCTIONS — Add to/Remove from Watchlist
════════════════════════════════════════════════════════════════ */

/**
 * Add movie/tv to watchlist
 * @param {string} userId - Current user ID
 * @param {number} movieId - TMDB Movie or TV ID
 * @param {string} mediaType - "movie" or "tv"
 * @param {object} movieData - Movie/TV data from TMDB
 */
export const addToWatchlist = async (userId, movieId, mediaType, movieData) => {
  try {
    // Check if already in watchlist
    const existing = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", movieId),
        Query.equal("mediaType", mediaType),
      ],
    );

    if (existing?.documents?.length > 0) {
      // Already in watchlist
      return { success: false, message: "Already in watchlist" };
    }

    // Add to watchlist
    const title =
      mediaType === "tv"
        ? movieData.name || movieData.original_name || "Unknown"
        : movieData.title || movieData.original_title || "Unknown";

    const posterUrl = movieData.poster_path
      ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
      : "";

    const document = await databases.createDocument(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        movieId,
        mediaType,
        title,
        poster_url: posterUrl,
        vote_average: movieData.vote_average || 0,
        overview: movieData.overview || "",
        addedDate: new Date().toISOString(),
      },
    );

    return { success: true, message: "Added to watchlist", document };
  } catch (error) {
    console.error("addToWatchlist error:", error);
    throw error;
  }
};

/**
 * Remove from watchlist
 * @param {string} userId - Current user ID
 * @param {number} movieId - TMDB Movie or TV ID
 * @param {string} mediaType - "movie" or "tv"
 */
export const removeFromWatchlist = async (userId, movieId, mediaType) => {
  try {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", movieId),
        Query.equal("mediaType", mediaType),
      ],
    );

    if (existing?.documents?.length === 0) {
      return { success: false, message: "Not in watchlist" };
    }

    const docId = existing.documents[0].$id;
    await databases.deleteDocument(DATABASE_ID, WATCHLIST_COLLECTION_ID, docId);

    return { success: true, message: "Removed from watchlist" };
  } catch (error) {
    console.error("removeFromWatchlist error:", error);
    throw error;
  }
};

/**
 * Check if movie is in watchlist
 * @param {string} userId - Current user ID
 * @param {number} movieId - TMDB Movie or TV ID
 * @param {string} mediaType - "movie" or "tv"
 */
export const isInWatchlist = async (userId, movieId, mediaType) => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", movieId),
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
 * Get user's entire watchlist
 * @param {string} userId - Current user ID
 */
export const getUserWatchlist = async (userId) => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [Query.equal("userId", userId), Query.orderDesc("addedDate")],
    );

    return result?.documents || [];
  } catch (error) {
    console.error("getUserWatchlist error:", error);
    return [];
  }
};

/**
 * Clear entire watchlist
 * @param {string} userId - Current user ID
 */
export const clearWatchlist = async (userId) => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [Query.equal("userId", userId)],
    );

    for (const doc of result?.documents || []) {
      await databases.deleteDocument(
        DATABASE_ID,
        WATCHLIST_COLLECTION_ID,
        doc.$id,
      );
    }

    return { success: true, message: "Watchlist cleared" };
  } catch (error) {
    console.error("clearWatchlist error:", error);
    throw error;
  }
};
