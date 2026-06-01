import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  subtext?: string;
}

export function EmptyState({ message = 'Không có dữ liệu', subtext }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-10 h-10 rounded-xl bg-surface-3 border border-white/8 flex items-center justify-center">
        <SearchX size={18} className="text-ink-3" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-2">{message}</p>
        {subtext && <p className="text-xs text-ink-3 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
