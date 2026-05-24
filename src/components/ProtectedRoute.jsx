import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthLoadingScreen() {
  const shimmer = {
    background: "linear-gradient(90deg,rgba(255,217,61,0.04) 0%,rgba(255,217,61,0.12) 40%,rgba(255,217,61,0.04) 80%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.6s infinite linear",
    borderRadius: 8,
  };
  return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1.5rem" }}>
      {/* Logo placeholder */}
      <div style={{ ...shimmer, width:120, height:36, borderRadius:10 }} />
      {/* Spinner ring */}
      <div style={{
        width:40, height:40, borderRadius:"50%",
        border:"3px solid rgba(255,217,61,0.1)",
        borderTopColor:"#ffd93d",
        animation:"shimmer-spin 0.8s linear infinite",
      }} />
      <style>{`
        @keyframes shimmer-spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0%{background-position:-600px 0}
          100%{background-position:600px 0}
        }
      `}</style>
    </div>
  );
}

/**
 * ProtectedRoute — فقط کاربر لاگین‌شده میتونه ببینه
 * در غیر این صورت redirect به /login
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}