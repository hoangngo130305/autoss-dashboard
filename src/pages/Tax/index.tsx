import { useState } from "react";
import { Receipt, Download } from "lucide-react";
import { SectionCard } from "../../components/cards/SectionCard";
import { Badge } from "../../components/common/Badge";
import { taxRecords, totalTaxDebt } from "../../data/taxRecords";
import { formatCurrency } from "../../utils/formatters";
import { exportStyledExcel } from "../../utils/exportExcel";
import clsx from "clsx";
import type { TaxRecord } from "../../types/finance";

const statusConfig = {
  pending: {
    badge: <Badge variant="pending">CHỜ NỘP</Badge>,
    label: "CHỜ NỘP",
  },
  waiting: {
    badge: <Badge variant="waiting">CHỜ KHAI</Badge>,
    label: "CHỜ KHAI",
  },
  overdue: {
    badge: <Badge variant="overdue">QUÁ HẠN</Badge>,
    label: "QUÁ HẠN",
  },
  paid: { badge: <Badge variant="ok">ĐÃ NỘP</Badge>, label: "ĐÃ NỘP" },
  filed: { badge: <Badge variant="ok">ĐÃ KHAI</Badge>, label: "ĐÃ KHAI" },
};

function addDays(ddmmyyyy: string, days: number): string {
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
}

function CurrencyCell({
  value,
  status,
}: {
  value: number | null;
  status: TaxRecord["status"];
}) {
  if (value === null) return <span className="text-ink-3">—</span>;
  return (
    <span
      className={clsx(
        "font-mono font-medium text-[12px]",
        status === "overdue"
          ? "text-red-400"
          : status === "pending"
            ? "text-amber-400"
            : "text-ink-2",
      )}
    >
      {formatCurrency(value)}
    </span>
  );
}

function DeadlineCell({
  dueDate,
  extraDays,
  status,
}: {
  dueDate?: string;
  extraDays: number;
  status: TaxRecord["status"];
}) {
  if (!dueDate || dueDate === "—") return <span className="text-ink-3">—</span>;
  const deadline = addDays(dueDate, extraDays);
  const isOverdue = status === "overdue";
  return (
    <span
      className={clsx(
        "font-mono text-[11px]",
        isOverdue ? "text-red-400 font-semibold" : "text-amber-300",
      )}
    >
      {deadline}
    </span>
  );
}

export default function Tax() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const rows = taxRecords.map((r) => ({
        "TÊN CÔNG TY": r.company,
        "KỲ TÍNH THUẾ": `${r.period} (${r.taxType})`,
        "SỐ THUẾ PHẢI NỘP": r.required ?? 0,
        "ĐÃ NỘP": r.paid ?? 0,
        "Tổng tiền nợ nhà nước": r.remaining ?? 0,
        "CƯỠNG CHẾ NGÂN HÀNG (+90 ngày)": r.dueDate
          ? addDays(r.dueDate, 90)
          : "—",
        "CƯỠNG CHẾ HÓA ĐƠN (+120 ngày)": r.dueDate
          ? addDays(r.dueDate, 120)
          : "—",
        "Trạng thái": statusConfig[r.status].label,
      }));
      await exportStyledExcel(
        rows,
        "bang_ke_thue",
        "BẢNG KÊ NỘP THUẾ — AUTOSS",
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
            Bảng kê nộp thuế
          </h2>
          <p className="text-xs text-ink-3">
            Tổng nợ thuế:{" "}
            <strong className="text-amber-400">
              {formatCurrency(totalTaxDebt)} đ
            </strong>
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

      <SectionCard
        title={
          <>
            <Receipt size={13} /> Chi tiết theo công ty
          </>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/10 bg-surface-3">
                {[
                  { label: "TÊN CÔNG TY", align: "left" },
                  { label: "KỲ TÍNH THUẾ", align: "left" },
                  { label: "SỐ THUẾ PHẢI NỘP", align: "right" },
                  { label: "ĐÃ NỘP", align: "right" },
                  { label: "Tổng tiền nợ nhà nước", align: "right" },
                  { label: "CƯỠNG CHẾ NGÂN HÀNG", align: "left" },
                  { label: "CƯỠNG CHẾ HÓA ĐƠN", align: "left" },
                  { label: "TRẠNG THÁI", align: "left" },
                ].map(({ label, align }) => (
                  <th
                    key={label}
                    className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap text-${align}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {taxRecords.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/5 hover:bg-surface-3 transition-colors"
                >
                  <td className="px-3 py-2.5 text-ink-1 font-medium whitespace-nowrap">
                    {r.company}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-ink-2">{r.period}</span>
                    <span className="ml-1.5 text-[10px] font-mono text-ink-3 bg-surface-3 px-1.5 py-0.5 rounded">
                      {r.taxType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <CurrencyCell value={r.required} status={r.status} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <CurrencyCell value={r.paid} status={r.status} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <CurrencyCell value={r.remaining} status={r.status} />
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <DeadlineCell
                      dueDate={r.dueDate}
                      extraDays={90}
                      status={r.status}
                    />
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <DeadlineCell
                      dueDate={r.dueDate}
                      extraDays={120}
                      status={r.status}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    {statusConfig[r.status].badge}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/15 bg-surface-3">
                <td
                  colSpan={2}
                  className="px-3 py-2.5 text-[11px] font-bold text-ink-1"
                >
                  TỔNG CỘNG
                </td>
                <td colSpan={2} />
                <td className="px-3 py-2.5 font-mono text-right font-bold text-amber-400 text-[12px]">
                  {formatCurrency(totalTaxDebt)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
