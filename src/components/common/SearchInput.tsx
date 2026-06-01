import { Search, X } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Tìm kiếm...', className }: SearchInputProps) {
  return (
    <div className={clsx('relative', className)}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          'w-full bg-surface-3 border border-white/8 rounded-lg',
          'pl-8 pr-8 py-2 text-[13px] text-ink-1 placeholder-ink-3',
          'focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20',
          'transition-all duration-150',
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
