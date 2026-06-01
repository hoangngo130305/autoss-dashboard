import { Shield } from 'lucide-react';
import { SectionCard } from '../../components/cards/SectionCard';
import { Badge } from '../../components/common/Badge';
import { totalRiskReserve, nearestExpiry } from '../../data/riskReserve';
import { formatCurrency } from '../../utils/formatters';

export function RiskReserveCard() {
  return (
    <SectionCard title={<><Shield size={13} /> Dự phòng rủi ro</>}>
      <div className="space-y-0">
        <div className="flex justify-between py-2.5 border-b border-white/5">
          <span className="text-[12px] text-ink-2">Tổng dự phòng</span>
          <span className="font-mono text-[12px] font-medium text-ink-1">{formatCurrency(totalRiskReserve)}</span>
        </div>
        <div className="flex justify-between py-2.5 border-b border-white/5">
          <span className="text-[12px] text-ink-2">Kỳ hạn gần nhất</span>
          <span className="font-mono text-[12px] text-amber-400">{nearestExpiry}</span>
        </div>
        <div className="flex justify-between items-center py-2.5">
          <span className="text-[12px] text-ink-2">Trạng thái</span>
          <Badge variant="ok">AN TOÀN</Badge>
        </div>
      </div>

      <div className="mt-4 p-3 bg-surface-3 rounded-lg border border-white/7">
        <p className="text-[10px] text-ink-3 mb-1">Nguồn dữ liệu</p>
        <p className="text-[11px] text-ink-2">Sheet "Theo dõi STK" → chỗ Chi</p>
      </div>
    </SectionCard>
  );
}
