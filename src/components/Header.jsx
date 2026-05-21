import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/");
  };

  const AuthButtons = ({ mobile = false }) =>
    user ? (
      <>
        <Link
          to="/watchlist"
          className="nav-link watchlist-link"
          onClick={() => mobile && setMobileOpen(false)}
        >
          Watchlist
        </Link>
        <button type="button" onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </>
    ) : (
      <>
        <Link
          to="/login"
          className="btn btn-login"
          onClick={() => mobile && setMobileOpen(false)}
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="btn btn-signup"
          onClick={() => mobile && setMobileOpen(false)}
        >
          Sign Up
        </Link>
      </>
    );

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/zynema.svg" alt="Zynema Logo" className="logo-img" />
        </Link>

        {!loading && (
          <div className="navbar-actions desktop-actions">
            <AuthButtons />
          </div>
        )}

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span
            className="menu-icon"
            style={
              mobileOpen
                ? { transform: "rotate(45deg) translate(5px,5px)" }
                : undefined
            }
          />
          <span
            className="menu-icon"
            style={mobileOpen ? { opacity: 0 } : undefined}
          />
          <span
            className="menu-icon"
            style={
              mobileOpen
                ? { transform: "rotate(-45deg) translate(5px,-5px)" }
                : undefined
            }
          />
        </button>

        {mobileOpen && !loading && (
          <div className="navbar-nav mobile-nav">
            <div className="navbar-actions mobile-actions">
              <AuthButtons mobile />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
