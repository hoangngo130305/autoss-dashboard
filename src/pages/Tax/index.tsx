import { Receipt } from 'lucide-react';
import { SectionCard } from '../../components/cards/SectionCard';
import type { Column } from '../../components/tables/DataTable';
import { DataTable } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { taxRecords, totalTaxDebt } from '../../data/taxRecords';
import type { TaxRecord } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import clsx from 'clsx';

const statusConfig = {
  pending: { badge: <Badge variant="pending">CHỜ NỘP</Badge> },
  waiting: { badge: <Badge variant="waiting">CHỜ KHAI</Badge> },
  overdue: { badge: <Badge variant="overdue">QUÁ HẠN</Badge> },
};

function CurrencyCell({ value, status }: { value: number | null; status: TaxRecord['status'] }) {
  if (value === null) return <span className="text-ink-3">—</span>;
  return (
    <span className={clsx(
      'font-mono font-medium',
      status === 'overdue' ? 'text-red-400' : status === 'pending' ? 'text-amber-400' : 'text-ink-2',
    )}>
      {formatCurrency(value)}
    </span>
  );
}

const columns: Column<TaxRecord>[] = [
  {
    key: 'company',
    header: 'Công ty',
    render: (r) => <span className="text-ink-1 font-medium">{r.company}</span>,
  },
  {
    key: 'period',
    header: 'Kỳ tính thuế',
    render: (r) => <span className="text-ink-2">{r.period}</span>,
  },
  {
    key: 'taxType',
    header: 'Loại thuế',
    render: (r) => <span className="font-mono text-[11px] text-ink-3">{r.taxType}</span>,
  },
  {
    key: 'required',
    header: 'Phải nộp',
    headerClass: 'text-right',
    cellClass: 'text-right',
    render: (r) => <CurrencyCell value={r.required} status={r.status} />,
  },
  {
    key: 'paid',
    header: 'Đã nộp',
    headerClass: 'text-right',
    cellClass: 'text-right',
    render: (r) => <CurrencyCell value={r.paid} status={r.status} />,
  },
  {
    key: 'remaining',
    header: 'Còn nợ',
    headerClass: 'text-right',
    cellClass: 'text-right',
    render: (r) => <CurrencyCell value={r.remaining} status={r.status} />,
  },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (r) => statusConfig[r.status].badge,
  },
];

export default function Tax() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-ink-1 mb-1">Bảng kê nộp thuế</h2>
        <p className="text-xs text-ink-3">
          Tổng nợ thuế:{' '}
          <strong className="text-amber-400">{formatCurrency(totalTaxDebt)} đ</strong>
        </p>
      </div>

      <SectionCard
        title={<><Receipt size={13} /> Chi tiết theo công ty</>}
        bodyClassName="p-0"
      >
        <div className="px-5 py-4">
          <DataTable
            columns={columns}
            data={taxRecords}
            keyExtractor={(r) => r.id}
          />
        </div>
        <div className="px-5 py-3 border-t border-white/10 flex justify-between items-center">
          <span className="text-[13px] font-semibold text-ink-1">Tổng nợ thuế</span>
          <span className="font-mono text-[14px] font-bold text-amber-400">
            {formatCurrency(totalTaxDebt)} đ
          </span>
        </div>
      </SectionCard>
    </div>
  );
}
