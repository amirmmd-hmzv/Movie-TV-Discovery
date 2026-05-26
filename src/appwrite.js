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

// ── helper: همیشه integer برگردون ──────────────
// useParams() رشته میده، ولی collection نوع integer داره
const toInt = (id) => Number(id);

/* ════════════════════════════════════
   SEARCH / TRENDING
════════════════════════════════════ */

export const updateSearchCount = async (searchTerm, movie, mediaType) => {
  try {
    // ✅ فقط searchTerm ملاک — mediaType رو از query حذف کردیم
    // تا "spider + movie" و "spider + tv" یکی شمرده بشن
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";

    // بهترین عنوان و نوع رو بگیر — اولویت با نتیجه پراشاره‌تر
    const title =
      mediaType === "tv"
        ? movie.name || movie.original_name || searchTerm
        : movie.title || movie.original_title || searchTerm;

    if (result?.documents?.length > 0) {
      const doc = result.documents[0];
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
        // poster و title رو با نتیجه جدید آپدیت کن
        poster_url: posterUrl,
        title,
        mediaType, // آخرین mediaType رو ذخیره کن
        tmdb_id: toInt(movie.id), // ← اضافه کن
      });
    } else {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        poster_url: posterUrl,
        mediaType,
        title,
        tmdb_id: toInt(movie.id), // ← اضافه کن
      });
    }
  } catch (error) {
    console.error("updateSearchCount error:", error);
  }
};

export const getTrendingMovies = async () => {
  try {
    // بیشتر بگیر تا بعد از dedup حداقل 10 تا داشته باشیم
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(50),
      Query.orderDesc("count"),
    ]);

    // dedup بر اساس title — اگه یه سریال/فیلم با searchTerm های مختلف سرچ شده
    // فقط یه بار نشون بده و count ها رو جمع کن
    const titleMap = new Map();
    for (const doc of result.documents) {
      const key = (doc.title || "").toLowerCase().trim();
      if (!key) continue;

      if (titleMap.has(key)) {
        // قبلاً دیدیم — count رو جمع کن
        const existing = titleMap.get(key);
        titleMap.set(key, {
          ...existing,
          count: existing.count + (doc.count || 0),
        });
      } else {
        titleMap.set(key, { ...doc });
      }
    }

    // مرتب کن بر اساس count نهایی و 10 تا اول رو برگردون
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

export const addToWatchlist = async (userId, movieId, mediaType, movieData) => {
  try {
    // چک کن قبلاً اضافه نشده باشه
    const existing = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", toInt(movieId)), // ✅ integer
        Query.equal("mediaType", mediaType),
      ],
    );

    if (existing?.documents?.length > 0) {
      return { success: false, message: "Already in watchlist" };
    }

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
        movieId: toInt(movieId), // ✅ integer
        mediaType,
        title,
        poster_url: posterUrl,
        vote_average: String(movieData.vote_average || 0), // collection = String
        overview: (movieData.overview || "").slice(0, 200), // max 200 chars
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
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", toInt(movieId)), // ✅ integer
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

export const isInWatchlist = async (userId, movieId, mediaType) => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("movieId", toInt(movieId)), // ✅ integer — useParams string'i fix eder
        Query.equal("mediaType", mediaType),
      ],
    );
    return result?.documents?.length > 0;
  } catch (error) {
    console.error("isInWatchlist error:", error);
    return false;
  }
};

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
    return { success: true };
  } catch (error) {
    console.error("clearWatchlist error:", error);
    throw error;
  }
};
