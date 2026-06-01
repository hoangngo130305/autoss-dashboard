import { useState } from "react";
import { Shield, Download } from "lucide-react";
import { SectionCard } from "../../components/cards/SectionCard";
import type { Column } from "../../components/tables/DataTable";
import { DataTable } from "../../components/tables/DataTable";
import { Badge } from "../../components/common/Badge";
import { MetricCard } from "../../components/cards/MetricCard";
import {
  riskReserves,
  totalRiskReserve,
  nearestExpiry,
} from "../../data/riskReserve";
import type { RiskReserve } from "../../types/finance";
import { formatCurrency } from "../../utils/formatters";
import { exportStyledExcel } from "../../utils/exportExcel";
import clsx from "clsx";

const statusConfig = {
  approaching: {
    badge: <Badge variant="approaching">SẮP ĐẾN HẠN</Badge>,
    dateClass: "text-amber-400",
  },
  safe: {
    badge: <Badge variant="ok">AN TOÀN</Badge>,
    dateClass: "text-emerald-400",
  },
  withdrawn: {
    badge: <Badge variant="neutral">ĐÃ RÚT</Badge>,
    dateClass: "text-ink-3",
  },
};

const columns: Column<RiskReserve>[] = [
  {
    key: "depositDate",
    header: "NGÀY",
    render: (r) => (
      <span className="font-mono text-[12px] text-ink-2">{r.depositDate}</span>
    ),
  },
  {
    key: "amount",
    header: "SỐ TIỀN",
    headerClass: "text-right",
    cellClass: "text-right",
    render: (r) => (
      <span className="font-mono text-[13px] font-medium text-ink-1">
        {formatCurrency(r.amount)}
      </span>
    ),
  },
  {
    key: "expiryDate",
    header: "KỲ HẠN SỬ DỤNG",
    render: (r) => (
      <span
        className={clsx(
          "font-mono text-[12px]",
          statusConfig[r.status].dateClass,
        )}
      >
        {r.expiryDate}
      </span>
    ),
  },
  {
    key: "notes",
    header: "GHI CHÚ",
    render: (r) => <span className="text-ink-2 text-[12px]">{r.notes}</span>,
  },
  {
    key: "status",
    header: "TRẠNG THÁI",
    render: (r) => statusConfig[r.status].badge,
  },
];

const statusLabels = {
  approaching: "SẮP ĐẾN HẠN",
  safe: "AN TOÀN",
  withdrawn: "ĐÃ RÚT",
};

export default function RiskReservePage() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const rows = riskReserves.map((r) => ({
        NGÀY: r.depositDate,
        "SỐ TIỀN": r.amount,
        "KỲ HẠN SỬ DỤNG": r.expiryDate,
        "GHI CHÚ": r.notes,
        "TRẠNG THÁI": statusLabels[r.status],
      }));
      await exportStyledExcel(
        rows,
        "du_phong_rui_ro",
        "SỔ THEO DÕI DÒNG TIỀN DỰ PHÒNG — AUTOSS",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink-1 mb-1">
            Sổ theo dõi dòng tiền dự phòng
          </h2>
          <p className="text-xs text-ink-3">
            Nguồn: Sheet "Theo dõi STK" → file chỗ Chi
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-emerald-500/20 px-3 py-1.5 rounded-md hover:bg-emerald-500/8"
        >
          <Download size={12} /> {exporting ? "Đang xuất..." : "Xuất Excel"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          icon={<Shield size={17} />}
          label="Tổng dự phòng"
          value={formatCurrency(totalRiskReserve)}
          subtext="2 khoản tiền gửi"
          color="blue"
        />
        <MetricCard
          icon={<Shield size={17} />}
          label="Kỳ hạn gần nhất"
          value={nearestExpiry}
          subtext="Quý 2/2026"
          color="amber"
        />
        <MetricCard
          icon={<Shield size={17} />}
          label="Trạng thái"
          value="An toàn"
          subtext="Trong mức kiểm soát"
          color="green"
        />
      </div>

      <SectionCard
        title={
          <>
            <Shield size={13} /> Chi tiết dự phòng rủi ro
          </>
        }
        bodyClassName="p-0"
      >
        <div className="px-5 py-4">
          <DataTable
            columns={columns}
            data={riskReserves}
            keyExtractor={(r) => r.id}
          />
        </div>
        <div className="mx-5 mb-4 p-3 bg-surface-3 rounded-lg border border-white/7">
          <p className="text-[10px] text-ink-3 mb-0.5 font-semibold uppercase tracking-widest">
            Nguồn dữ liệu
          </p>
          <p className="text-[11px] text-ink-2">
            Sheet "Theo dõi STK" → chỗ Chi · Cập nhật thủ công
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
