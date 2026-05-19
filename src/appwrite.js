import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie, mediaType) => {
console.log(movie)
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
    [Query.limit(10), Query.orderDesc("count")] // queries (optional)
  );

  return result.documents;
};
