import clsx from 'clsx';

interface ProgressBarProps {
  value: number;      // 0–100
  color?: string;     // tailwind bg color class
  height?: 'xs' | 'sm';
  className?: string;
}

const colorMap: Record<string, string> = {
  blue:   'bg-blue-500',
  green:  'bg-emerald-500',
  amber:  'bg-amber-500',
  red:    'bg-red-500',
  indigo: 'bg-indigo-500',
};

export function ProgressBar({ value, color = 'blue', height = 'xs', className }: ProgressBarProps) {
  const bg = colorMap[color] ?? colorMap.blue;
  const h  = height === 'xs' ? 'h-1' : 'h-1.5';
  return (
    <div className={clsx('w-full bg-surface-3 rounded-full overflow-hidden', h, className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-700 ease-out', bg)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
