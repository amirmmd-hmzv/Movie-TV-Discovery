import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
 * GuestRoute — فقط کاربر لاگین‌نشده میتونه ببینه
 * اگه لاگین باشه redirect به / میشه
 * استفاده: صفحات /login و /signup
 */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
}
