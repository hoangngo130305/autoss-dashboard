import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (n: number) => void;
}

export function Pagination({ page, totalPages, total, pageSize, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/7">
      <span className="text-[11px] text-ink-3 font-mono">
        {start}–{end} / {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className={clsx(
            'w-7 h-7 rounded-md flex items-center justify-center transition-colors',
            'border border-white/8 text-ink-2',
            page === 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-surface-3 hover:text-ink-1',
          )}
        >
          <ChevronLeft size={13} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onPage(n)}
            className={clsx(
              'w-7 h-7 rounded-md text-[11px] font-mono transition-all',
              n === page
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                : 'text-ink-3 hover:text-ink-1 hover:bg-surface-3 border border-transparent',
            )}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className={clsx(
            'w-7 h-7 rounded-md flex items-center justify-center transition-colors',
            'border border-white/8 text-ink-2',
            page === totalPages
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-surface-3 hover:text-ink-1',
          )}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
