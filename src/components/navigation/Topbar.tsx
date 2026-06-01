import { RefreshCw, Menu } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import type { FilterPeriod } from '../../types/common';
import { useToast } from '../../hooks/useToast';
import { today } from '../../utils/formatters';

const PERIODS: { id: FilterPeriod; label: string }[] = [
  { id: 'today',   label: 'Hôm nay' },
  { id: 'week',    label: 'Tuần' },
  { id: 'month',   label: 'Tháng' },
  { id: 'quarter', label: 'Quý' },
];

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const [period, setPeriod] = useState<FilterPeriod>('today');
  const [spinning, setSpinning] = useState(false);
  const { showToast } = useToast();

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    showToast('Đã làm mới dữ liệu', 'success');
  };

  const handlePeriod = (p: FilterPeriod) => {
    setPeriod(p);
    const found = PERIODS.find((x) => x.id === p);
    showToast(`Lọc dữ liệu theo: ${found?.label}`, 'success');
  };

  return (
    <header className="h-14 border-b border-white/7 flex items-center justify-between px-5 bg-surface-2 sticky top-0 z-50 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-ink-2 hover:bg-surface-3 hover:text-ink-1 transition-colors"
        >
          <Menu size={17} />
        </button>
        <h1 className="text-[13px] font-medium text-ink-1 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center bg-surface-3 rounded-lg p-0.5 gap-0.5 border border-white/7">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePeriod(p.id)}
              className={clsx(
                'text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all duration-150',
                period === p.id
                  ? 'bg-surface-2 text-ink-1 shadow-card'
                  : 'text-ink-3 hover:text-ink-2',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <span className="hidden sm:block font-mono text-[11px] text-ink-3 bg-surface-3 border border-white/7 px-3 py-1.5 rounded-lg">
          {today()}
        </span>

        <button
          onClick={handleRefresh}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 bg-surface-3 text-ink-2 hover:text-ink-1 hover:border-white/15 transition-all duration-150"
          title="Làm mới"
        >
          <RefreshCw size={14} className={clsx('transition-transform duration-500', spinning && 'rotate-180')} />
        </button>
      </div>
    </header>
  );
}
