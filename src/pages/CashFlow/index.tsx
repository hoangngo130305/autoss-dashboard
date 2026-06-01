import { TrendingUp, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { SectionCard } from '../../components/cards/SectionCard';
import { MetricCard } from '../../components/cards/MetricCard';
import { CashFlowChart } from '../../components/charts/CashFlowChart';
import { cashFlowData, totalIncome, totalExpense } from '../../data/cashFlow';
import { formatCurrency, formatShortCurrency } from '../../utils/formatters';

export default function CashFlow() {
  const net = totalIncome - totalExpense;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-ink-1 mb-1">Dòng tiền — 7 ngày gần nhất</h2>
        <p className="text-xs text-ink-3">Thu vào và chi ra theo ngày. Dữ liệu minh hoạ cho demo.</p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          icon={<TrendingUp size={17} />}
          label="Tổng thu vào (7 ngày)"
          value={formatShortCurrency(totalIncome)}
          subtext="26/05 — 01/06"
          color="green"
        />
        <MetricCard
          icon={<ArrowUpFromLine size={17} />}
          label="Tổng chi ra (7 ngày)"
          value={formatShortCurrency(totalExpense)}
          subtext="26/05 — 01/06"
          color="red"
        />
        <MetricCard
          icon={<ArrowDownToLine size={17} />}
          label="Ròng (Thu – Chi)"
          value={`${net > 0 ? '+' : ''}${formatShortCurrency(net)}`}
          subtext="Dương → dư tiền"
          color={net >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Chart */}
      <SectionCard title={<><TrendingUp size={13} /> Biểu đồ Thu / Chi</>}>
        <div style={{ height: 240 }}>
          <CashFlowChart data={cashFlowData} />
        </div>
      </SectionCard>

      {/* Daily tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title={<><ArrowDownToLine size={13} className="text-emerald-400" /> Thu vào 7 ngày</>}>
          <div className="space-y-0">
            {cashFlowData.map((d) => (
              <div key={d.date + 'in'} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                <span className="font-mono text-[12px] text-ink-3">{d.date}</span>
                <span className="font-mono text-[13px] font-medium text-emerald-400">
                  {formatCurrency(d.income)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-white/10 mt-1">
              <span className="text-[12px] font-medium text-ink-1">Tổng cộng</span>
              <span className="font-mono text-[13px] font-semibold text-emerald-400">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={<><ArrowUpFromLine size={13} className="text-red-400" /> Chi ra 7 ngày</>}>
          <div className="space-y-0">
            {cashFlowData.map((d) => (
              <div key={d.date + 'out'} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                <span className="font-mono text-[12px] text-ink-3">{d.date}</span>
                <span className="font-mono text-[13px] font-medium text-red-400">
                  {formatCurrency(d.expense)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-white/10 mt-1">
              <span className="text-[12px] font-medium text-ink-1">Tổng cộng</span>
              <span className="font-mono text-[13px] font-semibold text-red-400">
                {formatCurrency(totalExpense)}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
