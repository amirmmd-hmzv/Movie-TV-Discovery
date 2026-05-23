/**
 * WatchlistContext — single source of truth for saved titles.
 * Loads the user's watchlist once (avoids N+1 Appwrite calls per MovieCard).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addToWatchlist,
  getUserWatchlist,
  removeFromWatchlist,
} from "@/appwrite";
import { keysFromDocuments, watchlistKey } from "@/lib/watchlistKeys";
import { useAuth } from "@/context/AuthContext";

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const [savedKeys, setSavedKeys] = useState(() => new Set());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.$id) {
      setSavedKeys(new Set());
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const documents = await getUserWatchlist(user.$id);
      setItems(documents);
      setSavedKeys(keysFromDocuments(documents));
    } catch (err) {
      console.error("Failed to load watchlist:", err);
      setSavedKeys(new Set());
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSaved = useCallback(
    (movieId, mediaType) => savedKeys.has(watchlistKey(movieId, mediaType)),
    [savedKeys],
  );

  const add = useCallback(
    async (movieId, mediaType, movieData) => {
      if (!user?.$id) return { success: false, needsAuth: true };

      const result = await addToWatchlist(user.$id, movieId, mediaType, movieData);
      if (result.success) {
        const key = watchlistKey(movieId, mediaType);
        setSavedKeys((prev) => new Set(prev).add(key));
        if (result.document) {
          setItems((prev) => [result.document, ...prev]);
        } else {
          await refresh();
        }
      }
      return result;
    },
    [user?.$id, refresh],
  );

  const remove = useCallback(
    async (movieId, mediaType) => {
      if (!user?.$id) return { success: false };

      const result = await removeFromWatchlist(user.$id, movieId, mediaType);
      if (result.success) {
        const key = watchlistKey(movieId, mediaType);
        setSavedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        setItems((prev) =>
          prev.filter(
            (item) =>
              !(
                Number(item.movieId) === Number(movieId) &&
                item.mediaType === mediaType
              ),
          ),
        );
      }
      return result;
    },
    [user?.$id],
  );

  const toggle = useCallback(
    async (movieId, mediaType, movieData) => {
      if (isSaved(movieId, mediaType)) {
        return remove(movieId, mediaType);
      }
      return add(movieId, mediaType, movieData);
    },
    [isSaved, add, remove],
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      isSaved,
      add,
      remove,
      toggle,
      refresh,
    }),
    [items, loading, isSaved, add, remove, toggle, refresh],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return ctx;
}
