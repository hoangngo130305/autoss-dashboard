import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'success' | 'danger' | 'ghost' | 'outline';
type Size    = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-blue-500/15   text-blue-400   border border-blue-500/25   hover:bg-blue-500/25',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25',
  danger:  'bg-red-500/10    text-red-400    border border-red-500/20    hover:bg-red-500/20',
  ghost:   'bg-transparent   text-ink-2      border border-white/10      hover:bg-white/5 hover:text-ink-1',
  outline: 'bg-transparent   text-ink-2      border border-white/12      hover:bg-surface-3 hover:text-ink-1',
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-[11px] px-2.5 py-1.5 rounded-md',
  md: 'text-xs     px-4   py-2   rounded-lg',
};

export function Button({ variant = 'ghost', size = 'sm', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
