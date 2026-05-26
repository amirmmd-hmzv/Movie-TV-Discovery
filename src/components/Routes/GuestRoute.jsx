/**
 * GuestRoute — Route guard for unauthenticated users only.
 * Redirects authenticated users to home (/).
 * Shows loading screen during auth state check.
 * Used for: /login and /signup pages
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * AuthLoadingScreen — Loading UI shown while checking auth status
 * Simple spinner with app's gold color (#ffd93d)
 */
function AuthLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
      }}
    >
      {/* Spinning loader ring */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid rgba(255,217,61,0.1)",
          borderTopColor: "#ffd93d",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * GuestRoute Component
 * Only unauthenticated users can access this route
 * Authenticated users are redirected to home (/)
 * Prevents authenticated users from seeing login/signup pages
 */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Show loading screen while checking authentication status
  if (loading) return <AuthLoadingScreen />;
  
  // Redirect to home if already authenticated
  if (user) return <Navigate to="/" replace />;
  
  // Render guest content (login/signup)
  return children;
}
