import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const location  = useNavigate ? useLocation() : { pathname: "/" };
  const navigate  = useNavigate();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/");
  };

  // auth buttons — reused in desktop & mobile
  const AuthButtons = ({ mobile = false }) =>
    user ? (
      <>
        <Link
          to="/watchlist"
          className="nav-link watchlist-link"
          onClick={() => mobile && setMobileOpen(false)}
        >
          📌 Watchlist
        </Link>
        <button onClick={handleLogout} className="btn btn-logout">
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
    <navbar className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/zynema.svg" alt="Zynema Logo" className="logo-img" />
        </Link>

        {/* Desktop actions */}
        {!loading && (
          <div className="navbar-actions desktop-actions">
            <AuthButtons />
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {/* animated bars → X */}
          <span
            className="menu-icon"
            style={mobileOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}}
          />
          <span
            className="menu-icon"
            style={mobileOpen ? { opacity: 0 } : {}}
          />
          <span
            className="menu-icon"
            style={mobileOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}}
          />
        </button>

        {/* Mobile dropdown */}
        {mobileOpen && !loading && (
          <nav className="navbar-nav mobile-nav">
            <div className="navbar-actions mobile-actions">
              <AuthButtons mobile />
            </div>
          </nav>
        )}
      </div>
    </navbar>
  );
}