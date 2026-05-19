import { useNavigate } from "react-router-dom";
import '@/styles/Errorview.css'
/**
 * ErrorView — نمایش خطا با UI بهتر
 * Props:
 *   message: string  — پیام خطا
 *   onRetry: fn      — اختیاری، دکمه Try Again
 */
function ErrorView({ message, onRetry }) {
  const navigate = useNavigate();

  return (
    <div className="error-view">
      {/* Icon */}
      <div className="error-view__icon" aria-hidden="true">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </div>

      <h2 className="error-view__title">Something went wrong</h2>
      <p className="error-view__msg">{message || "An unexpected error occurred."}</p>

      <div className="error-view__actions">
        {onRetry && (
          <button className="error-view__btn error-view__btn--primary" onClick={onRetry}>
            ↻ Try Again
          </button>
        )}
        {/* <button className="error-view__btn error-view__btn--ghost" onClick={() => navigate("/")}>
          ← Back to Home
        </button> */}
      </div>
    </div>
  );
}

export default ErrorView;