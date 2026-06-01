import { useState, useMemo } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { SectionCard } from '../../components/cards/SectionCard';
import type { Column } from '../../components/tables/DataTable';
import { DataTable } from '../../components/tables/DataTable';
import { Badge, DeptBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../hooks/useToast';
import { receivables, totalReceivables } from '../../data/receivables';
import type { Receivable } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import clsx from 'clsx';

const statusMap = {
  overdue:          { variant: 'overdue' as const,  label: 'QUÁ HẠN',   amountClass: 'text-red-400' },
  waiting_payment:  { variant: 'pending' as const,  label: 'CHỜ KH TT', amountClass: 'text-amber-400' },
  waiting_contract: { variant: 'waiting' as const,  label: 'CHỜ CHỐT',  amountClass: 'text-ink-3' },
};

export default function Receivables() {
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const filtered = useMemo(
    () =>
      receivables.filter(
        (r) =>
          r.customer.toLowerCase().includes(search.toLowerCase()) ||
          r.project.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const { page, totalPages, paged, goTo } = usePagination(filtered, 10);

  const columns: Column<Receivable>[] = [
    {
      key: 'customer',
      header: 'Khách hàng',
      render: (r) => <span className="text-ink-1 font-medium">{r.customer}</span>,
    },
    {
      key: 'project',
      header: 'Dự án / Lý do',
      render: (r) => (
        <div>
          <p className="text-ink-2">{r.project}</p>
          <p className="text-[10px] text-ink-3 mt-0.5">{r.contact}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Phòng phụ trách',
      render: (r) => <DeptBadge color={r.departmentColor}>{r.department}</DeptBadge>,
    },
    {
      key: 'amount',
      header: 'Số tiền',
      headerClass: 'text-right',
      cellClass: 'text-right',
      render: (r) => {
        const s = statusMap[r.status];
        return <span className={clsx('font-mono font-medium', s.amountClass)}>{formatCurrency(r.amount)}</span>;
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (r) => {
        const s = statusMap[r.status];
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: 'action',
      header: 'Hành động',
      render: (r) => {
        const label =
          r.status === 'overdue' ? 'Đôn đốc' :
          r.status === 'waiting_payment' ? 'Theo dõi' : 'Chờ chốt';
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showToast(`Đã ghi nhận: ${label} — ${r.customer}`, 'warning')}
          >
            {label}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-ink-1 mb-1">Công nợ phải thu — Khách hàng nợ mình</h2>
        <p className="text-xs text-ink-3">
          Tổng phải thu:{' '}
          <strong className="text-emerald-400">{formatCurrency(totalReceivables)} đ</strong> · {receivables.length} khách hàng
        </p>
      </div>

      <SectionCard
        title={<><ArrowDownToLine size={13} className="text-emerald-400" /> Danh sách công nợ phải thu</>}
        action={
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); goTo(1); }}
            placeholder="Tìm khách hàng..."
            className="w-44"
          />
        }
        bodyClassName="p-0"
      >
        <div className="px-5 pt-4">
          <DataTable
            columns={columns}
            data={paged}
            keyExtractor={(r) => r.id}
            emptyMessage="Không tìm thấy khách hàng"
          />
        </div>
        <div className="px-5 pb-4">
          <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={10} onPage={goTo} />
        </div>
      </SectionCard>
    </div>
  );
}
