/**
 * NotFoundPage — 404 error page with beautiful gradient styling.
 * Displays when route doesn't match any defined routes.
 * Uses app's custom color palette (#ffd93d gold, #ff4c29 orange-red).
 */
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background radial gradient pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 217, 61, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 76, 41, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Main content container with fade-in animation */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: "600px",
          animation: "fadeIn 0.6s ease-out",
        }}
      >
        {/* 404 Error Number — gradient text effect */}
        <div
          style={{
            fontSize: "clamp(80px, 20vw, 180px)",
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #ffd93d 0%, #ff4c29 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-2px",
          }}
        >
          404
        </div>

        {/* Page Title */}
        <h1
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            fontWeight: 700,
            color: "#f3e9b8",
            marginBottom: "1rem",
            textShadow: "0 2px 8px rgba(255, 217, 61, 0.2)",
          }}
        >
          Page Not Found
        </h1>

        {/* Error Description */}
        <p
          style={{
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            color: "rgba(243, 233, 184, 0.8)",
            marginBottom: "2.5rem",
            lineHeight: 1.6,
            letterSpacing: "0.3px",
          }}
        >
          Oops! The page you're looking for seems to have gone missing.
          <br />
          It's like a movie that was left on the cutting room floor.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Home Button — Primary CTA */}
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "0.875rem 2.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#000000",
              background: "#ffd93d",
              border: "2px solid #ffd93d",
              borderRadius: "8px",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(255, 217, 61, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#ff4c29";
              e.target.style.borderColor = "#ff4c29";
              e.target.style.color = "#ffffff";
              e.target.style.boxShadow = "0 6px 20px rgba(255, 76, 41, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#ffd93d";
              e.target.style.borderColor = "#ffd93d";
              e.target.style.color = "#000000";
              e.target.style.boxShadow = "0 4px 15px rgba(255, 217, 61, 0.3)";
            }}
          >
            Back to Home
          </Link>

          {/* Watchlist Button — Secondary CTA */}
          <Link
            to="/watchlist"
            style={{
              display: "inline-block",
              padding: "0.875rem 2.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#f3e9b8",
              background: "transparent",
              border: "2px solid #ff4c29",
              borderRadius: "8px",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#ff4c29";
              e.target.style.color = "#ffffff";
              e.target.style.boxShadow = "0 6px 20px rgba(255, 76, 41, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#f3e9b8";
              e.target.style.boxShadow = "none";
            }}
          >
            My Watchlist
          </Link>
        </div>

        {/* Decorative movie emoji */}
        <div
          style={{
            marginTop: "3rem",
            fontSize: "3rem",
            opacity: 0.3,
          }}
        >
          🎬
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </main>
  );
};

export default NotFoundPage;
