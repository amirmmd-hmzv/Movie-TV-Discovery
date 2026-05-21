export function watchlistKey(movieId, mediaType) {
  return `${movieId}-${mediaType}`;
}

export function keysFromDocuments(documents) {
  return new Set(
    (documents || []).map((doc) => watchlistKey(doc.movieId, doc.mediaType)),
  );
}
