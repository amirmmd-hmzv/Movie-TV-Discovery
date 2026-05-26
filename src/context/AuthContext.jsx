/**
 * AuthContext — global Appwrite session state (user, login, logout).
 */
import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, signOut } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check if user session is still valid on component mount
   * Fetch current user from Appwrite and update state
   * Always sets loading to false after check (success or failure)
   */
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
