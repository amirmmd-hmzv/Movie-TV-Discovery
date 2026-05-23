// TMDB never returns more than 500 pages per endpoint
const TMDB_MAX_PAGE = 500;

function Pagination({ currentPage, setCurrentPage, totalPages, isLoading }) {
  // totalPages رو اینجا هم cap کن — defense in depth
  const safeTotal = Math.min(totalPages, TMDB_MAX_PAGE);

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(safeTotal, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePageChange = (page) => {
    // clamp بین 1 و safeTotal
    const target = Math.max(1, Math.min(page, safeTotal));
    if (!isLoading && target !== currentPage) {
      setCurrentPage(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (safeTotal <= 1) return null;

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn pagination-prev"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1 || isLoading}
        title="First page"
      >
        ⟨⟨
      </button>

      <button
        className="pagination-btn pagination-nav"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        title="Previous page"
      >
        ⟨
      </button>

      {startPage > 1 && (
        <>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(1)}
            disabled={isLoading}
          >
            1
          </button>
          {startPage > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`pagination-btn ${page === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(page)}
          disabled={isLoading}
        >
          {page}
        </button>
      ))}

      {endPage < safeTotal && (
        <>
          {endPage < safeTotal - 1 && (
            <span className="pagination-ellipsis">...</span>
          )}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(safeTotal)}
            disabled={isLoading}
          >
            {safeTotal}
          </button>
        </>
      )}

      <button
        className="pagination-btn pagination-nav"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === safeTotal || isLoading}
        title="Next page"
      >
        ⟩
      </button>

      <button
        className="pagination-btn pagination-next"
        onClick={() => handlePageChange(safeTotal)}
        disabled={currentPage === safeTotal || isLoading}
        title="Last page"
      >
        ⟩⟩
      </button>

      <span className="pagination-info">
        Page {currentPage} of {safeTotal}
      </span>
    </div>
  );
}

export default Pagination;