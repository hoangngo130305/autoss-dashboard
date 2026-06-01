import { Receipt, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionCard } from "../../components/cards/SectionCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { taxRecords, totalTaxDebt } from "../../data/taxRecords";
import { formatCurrency } from "../../utils/formatters";
import clsx from "clsx";

const statusConfig = {
  pending: {
    badge: <Badge variant="pending">CHỜ NỘP</Badge>,
    amountClass: "text-amber-400",
  },
  waiting: {
    badge: <Badge variant="waiting">CHỜ KHAI</Badge>,
    amountClass: "text-ink-3",
  },
  overdue: {
    badge: <Badge variant="overdue">QUÁ HẠN</Badge>,
    amountClass: "text-red-400",
  },
  paid: {
    badge: <Badge variant="ok">ĐÃ NỘP</Badge>,
    amountClass: "text-emerald-400",
  },
  filed: {
    badge: <Badge variant="ok">ĐÃ KHAI</Badge>,
    amountClass: "text-emerald-400",
  },
};

export function TaxSummaryCard() {
  return (
    <SectionCard
      title={
        <>
          <Receipt size={13} /> Nợ thuế nhà nước
        </>
      }
      action={
        <Link to="/thue">
          <Button variant="primary" size="sm">
            Chi tiết <ArrowRight size={11} />
          </Button>
        </Link>
      }
    >
      <div className="space-y-0">
        {taxRecords.map((r) => {
          const s = statusConfig[r.status];
          return (
            <div
              key={r.id}
              className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
            >
              <div>
                <p className="text-[12px] text-ink-2">{r.company}</p>
                <p className="text-[10px] text-ink-3">{r.period}</p>
              </div>
              <div className="flex items-center gap-2">
                {r.remaining != null ? (
                  <span
                    className={clsx(
                      "font-mono text-[11px] font-medium",
                      s.amountClass,
                    )}
                  >
                    {formatCurrency(r.remaining)}
                  </span>
                ) : (
                  s.badge
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-white/8 flex justify-between">
        <span className="text-[12px] font-medium text-ink-1">Tổng nợ thuế</span>
        <span className="font-mono text-[13px] font-semibold text-amber-400">
          {formatCurrency(totalTaxDebt)}
        </span>
      </div>
    </SectionCard>
  );
}
