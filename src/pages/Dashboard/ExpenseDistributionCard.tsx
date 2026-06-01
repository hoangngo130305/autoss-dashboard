import { BarChart3 } from 'lucide-react';
import { SectionCard } from '../../components/cards/SectionCard';
import { ProgressBar } from '../../components/common/ProgressBar';

const categories = [
  { name: 'XƯỞNG / Vận hành', count: 8, total: 25, color: 'blue' },
  { name: 'STOCK KHO',         count: 5, total: 25, color: 'amber' },
  { name: 'KẾ TOÁN',          count: 5, total: 25, color: 'green' },
  { name: 'MÃ DỰ ÁN',        count: 4, total: 25, color: 'red' },
  { name: 'ĐIỆN / ROBOT',      count: 3, total: 25, color: 'indigo' },
];

export function ExpenseDistributionCard() {
  return (
    <SectionCard
      title={<><BarChart3 size={13} /> Phân bổ đề xuất chi</>}
      action={<span className="text-[10px] text-ink-3">25 khoản</span>}
    >
      <div className="space-y-4">
        {categories.map((cat) => {
          const pct = Math.round((cat.count / cat.total) * 100);
          return (
            <div key={cat.name}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] text-ink-2">{cat.name}</span>
                <span className="font-mono text-[11px] text-ink-3">{cat.count} khoản</span>
              </div>
              <ProgressBar value={pct} color={cat.color} height="sm" />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
