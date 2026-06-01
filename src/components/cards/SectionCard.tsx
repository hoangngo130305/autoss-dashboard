import type { ReactNode } from 'react';
import clsx from 'clsx';

interface SectionCardProps {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, action, children, className, bodyClassName }: SectionCardProps) {
  return (
    <div className={clsx('bg-surface-2 border border-white/7 rounded-xl', className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/7">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-2 uppercase tracking-widest">
          {title}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={clsx('px-5 py-4', bodyClassName)}>{children}</div>
    </div>
  );
}
