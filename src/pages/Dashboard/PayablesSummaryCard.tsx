import { ArrowUpFromLine, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../../components/cards/SectionCard';
import { Badge, DeptBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ApprovalModal } from '../../components/modals/ApprovalModal';
import { useModal } from '../../hooks/useModal';
import { payables } from '../../data/payables';
import { modalData } from '../../data/modals';
import { formatCurrency } from '../../utils/formatters';
import clsx from 'clsx';

const keyMap: Record<string, string> = { '1': 'thp', '2': 'vegas', '3': 'vietmy' };

export function PayablesSummaryCard() {
  const modal = useModal<string>();

  return (
    <>
      <SectionCard
        title={<><ArrowUpFromLine size={13} className="text-red-400" /> Công nợ phải trả — mình nợ NCC</>}
        action={
          <Link to="/phai-tra">
            <Button variant="primary" size="sm">
              Xem tất cả <ArrowRight size={11} />
            </Button>
          </Link>
        }
      >
        <p className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest mb-2">Quá hạn</p>
        {payables.map((p) => (
          <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink-1 truncate">{p.supplier}</p>
              <p className="text-[10px] text-ink-3 mt-0.5">
                {p.contract !== '—' && `Hợp đồng: ${p.contract} · `}
                <DeptBadge color={p.departmentColor}>{p.department}</DeptBadge>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {p.status === 'overdue'
                ? <Badge variant="overdue">QUÁ HẠN</Badge>
                : <Badge variant="waiting">CHỜ UPDATE</Badge>
              }
              <span className={clsx(
                'font-mono text-[12px] font-medium',
                p.status === 'overdue' ? 'text-red-400' : 'text-ink-3',
              )}>
                {formatCurrency(p.amount)}
              </span>
            </div>
            {keyMap[p.id] && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] flex-shrink-0"
                onClick={() => modal.open(keyMap[p.id])}
              >
                Xem
              </Button>
            )}
          </div>
        ))}
      </SectionCard>

      <ApprovalModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        data={modal.data ? modalData[modal.data] ?? null : null}
      />
    </>
  );
}
