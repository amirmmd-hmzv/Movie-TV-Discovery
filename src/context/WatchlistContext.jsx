/**
 * WatchlistContext — Single source of truth for user's saved titles.
 *
 * Performance Optimization:
 * - Loads user's watchlist once (avoids N+1 Appwrite queries per MovieCard)
 * - Uses Set data structure for O(1) lookup time (isSaved checks)
 * - Memoizes functions to prevent unnecessary re-renders
 * - Syncs items array in parallel with savedKeys Set
 *
 * Data Structure:
 * - savedKeys: Set<string> for fast O(1) lookups using "movieId_mediaType" keys
 * - items: Array of full watchlist documents for display/sorting
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

/**
 * WatchlistProvider — Manages user's watchlist state and operations
 */
export function WatchlistProvider({ children }) {
  const { user } = useAuth();

  // ─────── State ───────
  // savedKeys: Set for O(1) lookup, prevents "isSaved" N+1 queries
  const [savedKeys, setSavedKeys] = useState(() => new Set());
  // items: Full documents for display, filtering, sorting
  const [items, setItems] = useState([]);
  // loading: True while fetching from Appwrite
  const [loading, setLoading] = useState(false);

  /**
   * refresh — Fetch latest watchlist from Appwrite database
   * Called on user change and after add/remove operations
   */
  const refresh = useCallback(async () => {
    // Clear if no user (logged out)
    if (!user?.$id) {
      setSavedKeys(new Set());
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const documents = await getUserWatchlist(user.$id);
      setItems(documents);
      // Build Set from documents for fast lookup
      setSavedKeys(keysFromDocuments(documents));
    } catch (err) {
      console.error("Failed to load watchlist:", err);
      setSavedKeys(new Set());
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  /**
   * Initial load: fetch watchlist when user changes
   */
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * isSaved — Check if title is in watchlist (O(1) operation)
   * Uses Set lookup instead of array find (O(n))
   */
  const isSaved = useCallback(
    (movieId, mediaType) => savedKeys.has(watchlistKey(movieId, mediaType)),
    [savedKeys],
  );

  /**
   * add — Add title to watchlist
   * Updates both savedKeys Set and items array
   */
  const add = useCallback(
    async (movieId, mediaType, movieData) => {
      if (!user?.$id) return { success: false, needsAuth: true };

      const result = await addToWatchlist(
        user.$id,
        movieId,
        mediaType,
        movieData,
      );
      if (result.success) {
        const key = watchlistKey(movieId, mediaType);
        // Update Set for fast lookup
        setSavedKeys((prev) => new Set(prev).add(key));
        // Update items array for display
        if (result.document) {
          setItems((prev) => [result.document, ...prev]);
        } else {
          // Fallback: refresh if document not returned
          await refresh();
        }
      }
      return result;
    },
    [user?.$id, refresh],
  );

  /**
   * remove — Remove title from watchlist
   * Updates both savedKeys Set and items array
   */
  const remove = useCallback(
    async (movieId, mediaType) => {
      if (!user?.$id) return { success: false };

      const result = await removeFromWatchlist(user.$id, movieId, mediaType);
      if (result.success) {
        const key = watchlistKey(movieId, mediaType);
        // Update Set for fast lookup
        setSavedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        // Update items array for display
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

  /**
   * toggle — Add or remove based on current state
   * Simplified API for MovieCard favorite button
   */
  const toggle = useCallback(
    async (movieId, mediaType, movieData) => {
      if (isSaved(movieId, mediaType)) {
        return remove(movieId, mediaType);
      }
      return add(movieId, mediaType, movieData);
    },
    [isSaved, add, remove],
  );

  /**
   * value — Memoized context object to prevent unnecessary re-renders
   */
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

/**
 * useWatchlist — Hook to access watchlist context
 * Throws error if used outside WatchlistProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return ctx;
}
