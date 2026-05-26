/**
 * RouteLoading — Fallback UI while lazy-loaded route chunks download.
 * Shown during code splitting transition between pages.
 */
export default function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="route-loading__spinner" aria-hidden="true" />
      <p>Loading…</p>
    </div>
  );
}
