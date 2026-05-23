/**
 * Appwrite database operations — trending searches + per-user watchlist.
 * Collection permissions must restrict writes by authenticated user (see README).
 */
import { Databases, ID, Query } from "appwrite";
import {
  appwriteClient,
  APPWRITE_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_WATCHLIST_COLLECTION_ID,
} from "@/lib/appwriteClient";
import { getDisplayTitle, posterUrl } from "@/lib/tmdb";

const databases = new Databases(appwriteClient);

const toInt = (id) => Number(id);

export const updateSearchCount = async (searchTerm, movie, mediaType) => {
  try {
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      [Query.equal("searchTerm", searchTerm), Query.equal("mediaType", mediaType)],
    );

    const poster = posterUrl(movie.poster_path);
    const title = getDisplayTitle(movie) || searchTerm;

    if (result?.documents?.length > 0) {
      const doc = result.documents[0];
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        doc.$id,
        {
          count: doc.count + 1,
          poster_url: poster,
          title,
        },
      );
    } else {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        ID.unique(),
        {
          searchTerm,
          count: 1,
          poster_url: poster,
          mediaType,
          title,
        },
      );
    }
  } catch (error) {
    console.error("updateSearchCount error:", error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      [Query.limit(10), Query.orderDesc("count")],
    );
    return result.documents;
  } catch (error) {
    console.error("getTrendingMovies error:", error);
    return [];
  }
};

export const addToWatchlist = async (userId, movieId, mediaType, movieData) => {
  try {
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", toInt(movieId)),
        Query.equal("mediaType", mediaType),
      ],
    );

    if (existing?.documents?.length > 0) {
      return { success: false, message: "Already in watchlist" };
    }

    const title = getDisplayTitle(movieData) || "Unknown";
    const poster = posterUrl(movieData.poster_path);

    const document = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_WATCHLIST_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        movieId: toInt(movieId),
        mediaType,
        title,
        poster_url: poster,
        vote_average: String(movieData.vote_average || 0),
        overview: (movieData.overview || "").slice(0, 200),
        addedDate: new Date().toISOString(),
      },
    );

    return { success: true, document };
  } catch (error) {
    console.error("addToWatchlist error:", error);
    throw error;
  }
};

export const removeFromWatchlist = async (userId, movieId, mediaType) => {
  try {
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", toInt(movieId)),
        Query.equal("mediaType", mediaType),
      ],
    );

    if (existing?.documents?.length === 0) {
      return { success: false, message: "Not in watchlist" };
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_WATCHLIST_COLLECTION_ID,
      existing.documents[0].$id,
    );

    return { success: true };
  } catch (error) {
    console.error("removeFromWatchlist error:", error);
    throw error;
  }
};

export const getUserWatchlist = async (userId) => {
  try {
    const result = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_WATCHLIST_COLLECTION_ID,
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
