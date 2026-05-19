import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* TODO: Replace with actual auth state from context/store */
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const isHomePage = location.pathname === "/";

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    /* TODO: Add logout logic here */
  };

  const handleLogin = () => {
    /* TODO: Add login logic here */
    setIsMobileMenuOpen(false);
  };

  const handleSignUp = () => {
    /* TODO: Add sign-up logic here */
    setIsMobileMenuOpen(false);
  };

  return (
    <navbar className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/zynema.svg" alt="Zynema Logo" className="logo-img" />
        </Link>

        {/* Desktop Navigation */}
        {/* <nav className="navbar-nav desktop-nav">
          <Link to="/" className={`nav-link ${isHomePage ? "active" : ""}`}>
            Home
          </Link>
          <a href="#trending" className="nav-link">
            Trending
          </a>
          <a href="#explore" className="nav-link">
            Explore
          </a>
        </nav> */}

        {/* Auth & Actions Section */}
        <div className="navbar-actions desktop-actions">
          {isLoggedIn ? (
            <>
              <Link to="/watchlist" className="nav-link watchlist-link">
                📌 Watchlist
              </Link>
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={handleLogin} className="btn btn-login">
                Login
              </button>
              <button onClick={handleSignUp} className="btn btn-signup">
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="menu-icon"></span>
          <span className="menu-icon"></span>
          <span className="menu-icon"></span>
        </button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="navbar-nav mobile-nav">
       
    
            {/* Mobile Auth Section */}
            <div className="navbar-actions mobile-actions">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/watchlist"
                    className="nav-link watchlist-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📌 Watchlist
                  </Link>
                  <button onClick={handleLogout} className="btn btn-logout">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleLogin} className="btn btn-login">
                    Login
                  </button>
                  <button onClick={handleSignUp} className="btn btn-signup">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </navbar>
  );
}
