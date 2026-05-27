import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { clearSavedScroll } from "@/hooks/useScrollRestoration";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const initials = getInitials(user?.name);
  const firstName = user?.name?.split(" ")[0] || "";

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    clearSavedScroll("/"); // ✅ prevents hook from restoring old scroll position
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setDropdown(false);
    setMobileOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: "rgba(255,217,61,0.15)",
        boxShadow: "0 4px 20px rgba(255,217,61,0.07)",
        background: "rgba(0,0,0,0.85)",
      }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6 relative">
        {/* ── Logo ── */}
        <Link
          onClick={handleLogoClick}
          to="/"
          className="flex-shrink-0 transition-transform hover:-translate-y-0.5"
        >
          <img src="/zynema.svg" alt="Zynema Logo" className="h-10 w-auto" />
        </Link>

        {/* ── Desktop actions ── */}
        {!loading && (
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3" ref={dropdownRef}>
                {/* Watchlist link */}
                <Link
                  to="/watchlist"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  style={{ color: "#d8c774" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,217,61,0.08)";
                    e.currentTarget.style.color = "#ffd93d";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#d8c774";
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  Watchlist
                </Link>

                {/* Avatar dropdown button */}
                <div className="relative">
                  <button
                    onClick={() => setDropdown((o) => !o)}
                    aria-label="User menu"
                    aria-expanded={dropdownOpen}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all"
                    style={{
                      background: "rgba(255,217,61,0.07)",
                      borderColor: "rgba(255,217,61,0.18)",
                      color: "#f3e9b8",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,217,61,0.13)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,217,61,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,217,61,0.07)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,217,61,0.18)";
                    }}
                  >
                    {/* avatar circle */}
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-black flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg,#ffd93d 0%,#ff4c29 100%)",
                      }}
                    >
                      {initials}
                    </span>
                    <span className="text-sm font-semibold">{firstName}</span>
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{
                        transition: "transform 0.2s",
                        transform: dropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  {dropdownOpen && (
                    <div
                      className="absolute top-full right-0 mt-2.5 min-w-52 rounded-2xl overflow-hidden z-50"
                      style={{
                        background: "#111016",
                        border: "1px solid rgba(255,217,61,0.12)",
                        boxShadow: "0 20px 48px rgba(0,0,0,0.6)",
                        animation: "ddIn 0.16s ease",
                      }}
                    >
                      <style>{`@keyframes ddIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

                      {/* user info */}
                      <div className="px-4 pt-3 pb-2.5">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "#f3e9b8" }}
                        >
                          {user.name}
                        </p>
                        <p
                          className="text-xs truncate mt-0.5"
                          style={{ color: "rgba(216,199,116,0.45)" }}
                        >
                          {user.email}
                        </p>
                      </div>

                      <div
                        style={{
                          height: 1,
                          background: "rgba(255,217,61,0.08)",
                          margin: "2px 0",
                        }}
                      />

                      <div className="p-1.5 flex flex-col gap-0.5">
                        <Link
                          to="/watchlist"
                          onClick={() => setDropdown(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium no-underline transition-colors"
                          style={{ color: "#d8c774" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255,217,61,0.07)";
                            e.currentTarget.style.color = "#f3e9b8";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#d8c774";
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                          My Watchlist
                        </Link>

                        <div
                          style={{
                            height: 1,
                            background: "rgba(255,217,61,0.08)",
                            margin: "2px 0",
                          }}
                        />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium w-full text-left transition-colors cursor-pointer"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "rgba(255,76,41,0.7)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255,76,41,0.08)";
                            e.currentTarget.style.color = "#ff4c29";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "rgba(255,76,41,0.7)";
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn btn-login">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-signup">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}

     <button
  type="button"
  onClick={() => setMobileOpen((o) => !o)}
  aria-label="Toggle menu"
  aria-expanded={mobileOpen}
  className="relative flex md:hidden h-10 w-10 items-center justify-center cursor-pointer bg-transparent border-none"
>
  <span
    className={`absolute block h-[2px] w-6 rounded-sm bg-[#ffd93d] transition-all duration-300 ${
      mobileOpen ? "rotate-45" : "-translate-y-2"
    }`}
  />
  <span
    className={`absolute block h-[2px] w-6 rounded-sm bg-[#ffd93d] transition-all duration-300 ${
      mobileOpen ? "opacity-0" : "opacity-100"
    }`}
  />
  <span
    className={`absolute block h-[2px] w-6 rounded-sm bg-[#ffd93d] transition-all duration-300 ${
      mobileOpen ? "-rotate-45" : "translate-y-2"
    }`}
  />
</button>

        {/* ── Mobile nav ── */}
        {mobileOpen && !loading && (
          <div
            className="absolute top-full left-0 right-0 flex flex-col md:hidden"
            style={{
              background: "rgba(6,4,12,0.98)",
              borderBottom: "1px solid rgba(255,217,61,0.1)",
              backdropFilter: "blur(12px)",
              padding: "0.75rem 1rem 1rem",
              gap: 4,
              animation: "slideDown 0.2s ease",
            }}
          >
            <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {user ? (
              <>
                {/* user info row */}
                <div className="flex items-center gap-3 px-1 pt-1 pb-3">
                  <span
                    className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-black flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg,#ffd93d 0%,#ff4c29 100%)",
                    }}
                  >
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "#f3e9b8" }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "rgba(216,199,116,0.4)" }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                <div
                  style={{ height: 1, background: "rgba(255,217,61,0.08)" }}
                />

                <Link
                  to="/watchlist"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-colors"
                  style={{ color: "#d8c774" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,217,61,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  My Watchlist
                </Link>

                <div
                  style={{ height: 1, background: "rgba(255,217,61,0.08)" }}
                />

                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left cursor-pointer transition-colors"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,76,41,0.7)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ff4c29";
                    e.currentTarget.style.background = "rgba(255,76,41,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,76,41,0.7)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login" className="btn btn-login text-center">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-signup text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
