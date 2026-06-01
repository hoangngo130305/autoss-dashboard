import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../../components/cards/SectionCard';
import { DeptBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ApprovalModal } from '../../components/modals/ApprovalModal';
import { useModal } from '../../hooks/useModal';
import { useToast } from '../../hooks/useToast';
import { expenseProposals } from '../../data/expenseProposals';
import { modalData } from '../../data/modals';
import clsx from 'clsx';

const PREVIEW_COUNT = 7;

export function PendingApprovalsCard() {
  const modal = useModal<string>();
  const { showToast } = useToast();
  const preview = expenseProposals.slice(0, PREVIEW_COUNT);

  return (
    <>
      <SectionCard
        title={<><Clock size={13} /> Đề xuất chờ duyệt</>}
        action={
          <Link to="/de-xuat">
            <Button variant="primary" size="sm" className="gap-1">
              Xem tất cả <ArrowRight size={11} />
            </Button>
          </Link>
        }
      >
        <div className="space-y-0 -mx-1">
          {preview.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 px-1 py-2.5 border-b border-white/5 last:border-0"
            >
              <DeptBadge color={item.departmentColor}>{item.department}</DeptBadge>
              <span className="flex-1 text-[12px] text-ink-1 truncate min-w-0">{item.description}</span>
              <span
                className={clsx(
                  'font-mono text-[10px] flex-shrink-0',
                  item.isOverdue ? 'text-red-400 font-semibold' : 'text-ink-3',
                )}
              >
                {item.plannedDate}
              </span>
              {item.modalKey ? (
                <Button
                  variant={item.isOverdue ? 'ghost' : 'success'}
                  size="sm"
                  className="flex-shrink-0 text-[10px] px-2 py-1"
                  onClick={() => modal.open(item.modalKey!)}
                >
                  {item.isOverdue ? 'Xem' : 'Duyệt'}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 text-[10px] px-2 py-1"
                  onClick={() => showToast('Chức năng đang cập nhật', 'warning')}
                >
                  Xem
                </Button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <ApprovalModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        data={modal.data ? modalData[modal.data] ?? null : null}
      />
    </>
  );
}
