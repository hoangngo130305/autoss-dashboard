import { ArrowDownToLine, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../../components/cards/SectionCard';
import { Badge, DeptBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { receivables } from '../../data/receivables';
import { formatCurrency } from '../../utils/formatters';
import clsx from 'clsx';

const statusMap = {
  overdue:          { variant: 'overdue' as const, label: 'QUÁ HẠN' },
  waiting_payment:  { variant: 'pending' as const, label: 'CHỜ KH TT' },
  waiting_contract: { variant: 'waiting' as const, label: 'CHỜ CHỐT' },
};

const amountColor = {
  overdue:          'text-red-400',
  waiting_payment:  'text-amber-400',
  waiting_contract: 'text-ink-3',
};

export function ReceivablesSummaryCard() {
  return (
    <SectionCard
      title={<><ArrowDownToLine size={13} className="text-emerald-400" /> Công nợ phải thu — KH nợ mình</>}
      action={
        <Link to="/phai-thu">
          <Button variant="primary" size="sm">
            Xem tất cả <ArrowRight size={11} />
          </Button>
        </Link>
      }
    >
      <p className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest mb-2">
        Quá hạn / Chờ xử lý
      </p>
      {receivables.map((r) => {
        const s = statusMap[r.status];
        return (
          <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink-1 truncate">{r.customer}</p>
              <p className="text-[10px] text-ink-3 mt-0.5">
                {r.project} · {r.contact} · <DeptBadge color={r.departmentColor}>{r.department}</DeptBadge>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={s.variant}>{s.label}</Badge>
              <span className={clsx('font-mono text-[12px] font-medium', amountColor[r.status])}>
                {formatCurrency(r.amount)}
              </span>
            </div>
          </div>
        );
      })}
    </SectionCard>
  );
}
