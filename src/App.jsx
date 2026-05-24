import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import RouteLoading from "@/components/RouteLoading";

/** Home stays eager — first paint / SEO-critical route */
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/components/NotFoundPage";

/** Code-split secondary routes to reduce initial bundle size */
const LoginPage = lazy(() => import("@/components/LoginPage"));
const SignUpPage = lazy(() => import("@/components/SignUpPage"));
const MovieDetailsPage = lazy(() => import("@/components/MovieDetailsPage"));
const WatchlistPage = lazy(() => import("@/components/WatchlistPage"));

function App() {
  return (
    <Router>
      <Header />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignUpPage />
              </GuestRoute>
            }
          />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/tv/:id" element={<MovieDetailsPage />} />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            }
          />
          {/* 1. This MUST be the last route in the list */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
