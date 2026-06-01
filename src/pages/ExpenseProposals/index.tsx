import { useState, useMemo } from 'react';
import { FileText } from 'lucide-react';
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
import { expenseProposals } from '../../data/expenseProposals';
import { modalData } from '../../data/modals';
import type { ExpenseProposal } from '../../types/finance';
import clsx from 'clsx';

const DEPT_FILTERS = ['Tất cả', 'XƯỞNG', 'KHO', 'KẾ TOÁN', 'ĐIỆN', 'ROBOT', 'MÃ DỰ ÁN'];

export default function ExpenseProposals() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('Tất cả');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const modal = useModal<string>();
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    let list = expenseProposals;
    if (search) list = list.filter((p) => p.description.toLowerCase().includes(search.toLowerCase()));
    if (deptFilter !== 'Tất cả') list = list.filter((p) => p.department === deptFilter);
    if (overdueOnly) list = list.filter((p) => p.isOverdue);
    return list;
  }, [search, deptFilter, overdueOnly]);

  const { page, totalPages, paged, goTo } = usePagination(filtered, 10);

  const columns: Column<ExpenseProposal>[] = [
    {
      key: 'id',
      header: '#',
      width: '44px',
      render: (_, i) => (
        <span className="font-mono text-[11px] text-ink-3">
          {String(i + 1 + (page - 1) * 10).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban',
      render: (p) => <DeptBadge color={p.departmentColor}>{p.department}</DeptBadge>,
    },
    {
      key: 'description',
      header: 'Diễn giải',
      render: (p) => <span className="text-ink-1">{p.description}</span>,
    },
    {
      key: 'plannedDate',
      header: 'Kế hoạch chi',
      render: (p) => (
        <span className={clsx('font-mono text-[11px]', p.isOverdue ? 'text-red-400 font-semibold' : 'text-ink-3')}>
          {p.plannedDate}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (p) =>
        p.isOverdue ? (
          <Badge variant="overdue">QUÁ HẠN</Badge>
        ) : (
          <Badge variant="waiting">CHỜ DUYỆT</Badge>
        ),
    },
    {
      key: 'action',
      header: 'Hành động',
      render: (p) =>
        p.modalKey ? (
          <Button
            variant={p.isOverdue ? 'ghost' : 'success'}
            size="sm"
            onClick={() => modal.open(p.modalKey!)}
          >
            Xem & duyệt
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => showToast('Chức năng đang cập nhật', 'warning')}>
            Xem
          </Button>
        ),
    },
  ];

  return (
    <>
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink-1 mb-1">Đề xuất chi phí — Chờ duyệt</h2>
          <p className="text-xs text-ink-3">Bảng kê được cập nhật hàng ngày từ các phòng ban</p>
        </div>

        <SectionCard
          title={<><FileText size={13} /> Toàn bộ đề xuất</>}
          action={<span className="text-[11px] text-ink-3">{filtered.length} khoản</span>}
          bodyClassName="p-0"
        >
          {/* Filters */}
          <div className="px-5 pt-4 pb-3 border-b border-white/7 flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); goTo(1); }}
              placeholder="Tìm đề xuất..."
              className="w-48"
            />
            <div className="flex gap-1 flex-wrap">
              {DEPT_FILTERS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => { setDeptFilter(dept); goTo(1); }}
                  className={clsx(
                    'text-[11px] px-2.5 py-1 rounded-md transition-all font-medium',
                    deptFilter === dept
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                      : 'text-ink-3 border border-white/8 hover:bg-surface-3 hover:text-ink-2',
                  )}
                >
                  {dept}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-[11px] text-ink-2 cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => { setOverdueOnly(e.target.checked); goTo(1); }}
                className="accent-red-400 w-3 h-3"
              />
              Chỉ quá hạn
            </label>
          </div>

          <div className="px-5 pt-4">
            <DataTable
              columns={columns}
              data={paged}
              keyExtractor={(p) => p.id}
              emptyMessage="Không tìm thấy đề xuất phù hợp"
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
