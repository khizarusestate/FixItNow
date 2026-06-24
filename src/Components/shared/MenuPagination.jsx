import { ChevronLeft, ChevronRight } from "lucide-react";

export const MENU_PAGE_SIZE = 4;

export default function MenuPagination({
  page,
  totalPages,
  onPageChange,
  totalItems = 0,
  pageSize = MENU_PAGE_SIZE,
}) {
  if (totalPages <= 1 || totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <nav
      className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6"
      aria-label="Pagination"
    >
      <p className="text-xs font-medium text-slate-500">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 hover:bg-orange-50 hover:ring-orange-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          Prev
        </button>
        <span className="min-w-[4rem] text-center text-xs font-bold text-slate-700">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 hover:bg-orange-50 hover:ring-orange-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
