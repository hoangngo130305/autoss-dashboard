import clsx from 'clsx';
import type { ReactNode } from 'react';

type Color = 'blue' | 'green' | 'red' | 'amber' | 'indigo';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtext: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color: Color;
}

const colorMap: Record<Color, { icon: string; value: string; trend: Record<string, string> }> = {
  blue:   { icon: 'text-blue-400',    value: 'text-blue-300',    trend: { up: 'bg-blue-500/10 text-blue-400',    down: 'bg-red-500/10 text-red-400',   neutral: 'bg-white/5 text-ink-3' } },
  green:  { icon: 'text-emerald-400', value: 'text-emerald-300', trend: { up: 'bg-emerald-500/10 text-emerald-400', down: 'bg-red-500/10 text-red-400', neutral: 'bg-white/5 text-ink-3' } },
  red:    { icon: 'text-red-400',     value: 'text-red-300',     trend: { up: 'bg-emerald-500/10 text-emerald-400', down: 'bg-red-500/10 text-red-400', neutral: 'bg-white/5 text-ink-3' } },
  amber:  { icon: 'text-amber-400',   value: 'text-amber-300',   trend: { up: 'bg-emerald-500/10 text-emerald-400', down: 'bg-red-500/10 text-red-400', neutral: 'bg-amber-500/10 text-amber-400' } },
  indigo: { icon: 'text-indigo-400',  value: 'text-indigo-300',  trend: { up: 'bg-emerald-500/10 text-emerald-400', down: 'bg-red-500/10 text-red-400', neutral: 'bg-white/5 text-ink-3' } },
};

export function MetricCard({ icon, label, value, subtext, trend, trendType = 'neutral', color }: MetricCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-surface-2 border border-white/7 rounded-xl p-4 hover:border-white/12 hover:-translate-y-0.5 transition-all duration-150 cursor-default">
      <div className="flex items-center justify-between mb-3">
        <span className={clsx('text-base', c.icon)}>{icon}</span>
        {trend && (
          <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', c.trend[trendType])}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-[11px] text-ink-3 mb-1.5 font-medium">{label}</p>
      <p className={clsx('font-mono text-lg font-semibold leading-tight', c.value)}>{value}</p>
      <p className="text-[10px] text-ink-3 mt-1.5">{subtext}</p>
    </div>
  );
}
