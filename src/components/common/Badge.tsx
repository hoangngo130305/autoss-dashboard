import clsx from 'clsx';

type BadgeVariant = 'overdue' | 'pending' | 'waiting' | 'ok' | 'approaching' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  overdue:    'bg-red-500/10   text-red-400   border border-red-500/20',
  pending:    'bg-amber-500/10 text-amber-400  border border-amber-500/20',
  waiting:    'bg-white/5      text-ink-3      border border-white/10',
  ok:         'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  approaching:'bg-amber-500/10 text-amber-400  border border-amber-500/20',
  neutral:    'bg-white/5      text-ink-2      border border-white/10',
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide whitespace-nowrap',
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Department pill — uses a color name string */
const deptStyles: Record<string, string> = {
  blue:   'bg-blue-500/10   text-blue-400',
  green:  'bg-emerald-500/10 text-emerald-400',
  amber:  'bg-amber-500/10  text-amber-400',
  indigo: 'bg-indigo-500/10 text-indigo-400',
  red:    'bg-red-500/10    text-red-400',
};

export function DeptBadge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide whitespace-nowrap',
        deptStyles[color] ?? deptStyles.blue,
      )}
    >
      {children}
    </span>
  );
}
