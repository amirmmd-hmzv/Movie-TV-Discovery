import "../styles/Pagination.css";

function Pagination({ currentPage, setCurrentPage, totalPages, isLoading }) {
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePageChange = (page) => {
    if (!isLoading && page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (totalPages <= 1) return null;

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

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="pagination-ellipsis">...</span>
          )}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(totalPages)}
            disabled={isLoading}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="pagination-btn pagination-nav"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        title="Next page"
      >
        ⟩
      </button>

      <button
        className="pagination-btn pagination-next"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages || isLoading}
        title="Last page"
      >
        ⟩⟩
      </button>

      <span className="pagination-info">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}

export default Pagination;
