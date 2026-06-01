import { useState, useMemo } from 'react';
import { ArrowUpFromLine } from 'lucide-react';
import { SectionCard } from '../../components/cards/SectionCard';
import type { Column } from '../../components/tables/DataTable';
import { DataTable } from '../../components/tables/DataTable';
import { Badge, DeptBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { ApprovalModal } from '../../components/modals/ApprovalModal';
import { usePagination } from '../../hooks/usePagination';
import { useModal } from '../../hooks/useModal';
import { useToast } from '../../hooks/useToast';
import { payables, totalPayables } from '../../data/payables';
import { modalData } from '../../data/modals';
import type { Payable } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import clsx from 'clsx';

const keyMap: Record<string, string> = { '1': 'thp', '2': 'vegas', '3': 'vietmy' };

export default function Payables() {
  const [search, setSearch] = useState('');
  const modal = useModal<string>();
  const { showToast } = useToast();

  const filtered = useMemo(
    () => payables.filter((p) => p.supplier.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const { page, totalPages, paged, goTo } = usePagination(filtered, 10);

  const columns: Column<Payable>[] = [
    {
      key: 'supplier',
      header: 'Nhà cung cấp',
      render: (p) => <span className="text-ink-1 font-medium">{p.supplier}</span>,
    },
    {
      key: 'contract',
      header: 'Hợp đồng',
      render: (p) => <span className="font-mono text-[11px] text-ink-3">{p.contract}</span>,
    },
    {
      key: 'department',
      header: 'Phòng phụ trách',
      render: (p) => <DeptBadge color={p.departmentColor}>{p.department}</DeptBadge>,
    },
    {
      key: 'amount',
      header: 'Số tiền',
      headerClass: 'text-right',
      cellClass: 'text-right',
      render: (p) => (
        <span className={clsx('font-mono font-medium', p.status === 'overdue' ? 'text-red-400' : 'text-ink-3')}>
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (p) =>
        p.status === 'overdue' ? (
          <Badge variant="overdue">QUÁ HẠN</Badge>
        ) : (
          <Badge variant="waiting">CHỜ UPDATE</Badge>
        ),
    },
    {
      key: 'action',
      header: 'Hành động',
      render: (p) =>
        keyMap[p.id] ? (
          <Button variant="success" size="sm" onClick={() => modal.open(keyMap[p.id])}>
            Thanh toán
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => showToast('Chờ cập nhật số liệu', 'warning')}>
            Chờ update
          </Button>
        ),
    },
  ];

  return (
    <>
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink-1 mb-1">Công nợ phải trả — Mình nợ nhà cung cấp</h2>
          <p className="text-xs text-ink-3">
            Tổng phải trả:{' '}
            <strong className="text-red-400">{formatCurrency(totalPayables)} đ</strong> · {payables.length} khoản
          </p>
        </div>

        <SectionCard
          title={<><ArrowUpFromLine size={13} className="text-red-400" /> Danh sách công nợ phải trả</>}
          action={
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); goTo(1); }}
              placeholder="Tìm nhà cung cấp..."
              className="w-44"
            />
          }
          bodyClassName="p-0"
        >
          <div className="px-5 pt-4">
            <DataTable
              columns={columns}
              data={paged}
              keyExtractor={(p) => p.id}
              emptyMessage="Không tìm thấy nhà cung cấp"
            />
          </div>
          <div className="px-5 pb-4">
            <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={10} onPage={goTo} />
          </div>
        </SectionCard>
      </div>

      <ApprovalModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        data={modal.data ? (modalData[modal.data] ?? null) : null}
      />
    </>
  );
}
