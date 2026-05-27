import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom"; // ✅ removed BrowserRouter
import Header from "@/components/Header";
import ProtectedRoute from "@/components/Routes/ProtectedRoute";
import GuestRoute from "@/components/Routes/GuestRoute";
import RouteLoading from "@/components/Routes/RouteLoading";
import { useScrollRestoration } from "./hooks/useScrollRestoration"; // ✅

import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";

const LoginPage = lazy(() => import("@/pages/Auth/LoginPage"));
const SignUpPage = lazy(() => import("@/pages/Auth/SignUpPage"));
const MovieDetailsPage = lazy(() => import("@/pages/Details/MovieDetailsPage"));
const WatchlistPage = lazy(() => import("@/pages/Watchlist/WatchlistPage"));

function App() {
  useScrollRestoration(); // ✅ now inside Router — no error

  return (
    <>
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;