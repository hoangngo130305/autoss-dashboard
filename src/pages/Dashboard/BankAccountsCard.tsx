import { Landmark } from 'lucide-react';
import { SectionCard } from '../../components/cards/SectionCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { riskReserveAmt } from '../../data/bankAccounts';
import { useStore } from '../../store/AppStore';
import { formatCurrency } from '../../utils/formatters';
import { today } from '../../utils/formatters';

export function BankAccountsCard() {
  const { state } = useStore();
  const accounts = state.bankAccounts ?? [];
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <SectionCard
      title={<><Landmark size={13} /> Số dư tài khoản ngân hàng</>}
      action={<span className="font-mono text-[10px] text-ink-3">{today()}</span>}
    >
      <div className="space-y-1">
        {accounts.map((acc) => (
          <div key={acc.id}>
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-ink-2">{acc.name}</span>
              <span className="font-mono text-[12px] font-medium text-ink-1">
                {formatCurrency(acc.balance)}
              </span>
            </div>
            {acc.percentage > 0 && acc.id !== '6' && acc.id !== '7' && (
              <ProgressBar value={acc.percentage} color={acc.color} className="mb-1" />
            )}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-4 pt-3 border-t border-white/8 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-ink-1">Tổng tồn quỹ</span>
          <span className="font-mono text-[15px] font-semibold text-blue-400">
            {formatCurrency(totalBalance)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ink-3">Dự phòng rủi ro</span>
          <span className="font-mono text-[11px] text-ink-3">
            − {formatCurrency(riskReserveAmt)}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
