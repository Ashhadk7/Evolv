import { ChevronLeft, ChevronRight } from "lucide-react";

import styles from "@/features/developer-dashboard/components/discover.module.css";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;

  const firstShown = page * pageSize + 1;
  const lastShown = Math.min(total, (page + 1) * pageSize);

  return (
    <nav className={styles.pagination} aria-label="Blueprint pages">
      <p className={styles.paginationRange}>
        {firstShown}–{lastShown} of {total}
      </p>
      <div className={styles.paginationControls}>
        <button
          type="button"
          className={styles.btnGhostSm}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft size={14} aria-hidden="true" /> Previous
        </button>
        <p className={styles.paginationPage} aria-live="polite">
          Page {page + 1} of {pageCount}
        </p>
        <button
          type="button"
          className={styles.btnGhostSm}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount - 1}
        >
          Next <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
