/**
 * App entry — providers wrap routing tree:
 *   AuthProvider → session/user
 *   WatchlistProvider → saved titles (depends on auth)
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "@/context/AuthContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { BrowserRouter as Router } from "react-router-dom"; // ✅ moved here

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router> {/* ✅ Router wraps everything */}
      <AuthProvider>
        <WatchlistProvider>
          <App />
        </WatchlistProvider>
      </AuthProvider>
    </Router>
  </StrictMode>,
);