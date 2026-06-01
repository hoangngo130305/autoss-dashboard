import {
  Wallet, TrendingDown, TrendingUp, Scale, AlertTriangle,
} from 'lucide-react';
import { MetricCard } from '../../components/cards/MetricCard';
import { BankAccountsCard } from './BankAccountsCard';
import { PendingApprovalsCard } from './PendingApprovalsCard';
import { ReceivablesSummaryCard } from './ReceivablesSummaryCard';
import { PayablesSummaryCard } from './PayablesSummaryCard';
import { TaxSummaryCard } from './TaxSummaryCard';
import { RiskReserveCard } from './RiskReserveCard';
import { ExpenseDistributionCard } from './ExpenseDistributionCard';

const metrics = [
  {
    icon: <Wallet size={17} />,
    label: 'Tổng tiền hiện có',
    value: '18.4 tỷ',
    subtext: 'ACB + VCB + MB + tiền mặt',
    trend: '+2.1%',
    trendType: 'up' as const,
    color: 'blue' as const,
  },
  {
    icon: <TrendingDown size={17} />,
    label: 'Khách hàng nợ mình',
    value: '6.2 tỷ',
    subtext: '3 khách hàng đang nợ',
    trend: 'Phải thu',
    trendType: 'neutral' as const,
    color: 'green' as const,
  },
  {
    icon: <TrendingUp size={17} />,
    label: 'Mình nợ nhà cung cấp',
    value: '4.8 tỷ',
    subtext: 'THP · Vegas · Việt Mỹ',
    trend: 'Phải trả',
    trendType: 'down' as const,
    color: 'red' as const,
  },
  {
    icon: <Scale size={17} />,
    label: 'Cân đối Thu – Trả',
    value: '+1.4 tỷ',
    subtext: 'Khả năng chi trả tốt',
    trend: 'Ròng',
    trendType: 'neutral' as const,
    color: 'amber' as const,
  },
  {
    icon: <AlertTriangle size={17} />,
    label: 'Nợ quá hạn',
    value: '3 khoản',
    subtext: 'THP · Vegas · Việt Mỹ',
    trend: 'Cần duyệt',
    trendType: 'down' as const,
    color: 'red' as const,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Bank accounts + Pending approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <BankAccountsCard />
        <PendingApprovalsCard />
      </div>

      {/* Receivables + Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReceivablesSummaryCard />
        <PayablesSummaryCard />
      </div>

      {/* Tax + Risk Reserve + Expense Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TaxSummaryCard />
        <RiskReserveCard />
        <ExpenseDistributionCard />
      </div>
    </div>
  );
}
