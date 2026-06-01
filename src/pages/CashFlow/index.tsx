import { useMemo, useState } from "react";
import { TrendingUp, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { SectionCard } from "../../components/cards/SectionCard";
import { MetricCard } from "../../components/cards/MetricCard";
import { CashFlowChart } from "../../components/charts/CashFlowChart";
import { DateRangeFilter } from "../../components/filters/DateRangeFilter";
import {
  AdvancedFilters,
  EMPTY_FILTERS,
} from "../../components/filters/AdvancedFilters";
import type { AdvancedFilterState } from "../../components/filters/AdvancedFilters";
import { useDateFilter } from "../../hooks/useDateFilter";
import { cashFlowTransactions } from "../../data/cashFlow";
import type { CashFlowDay } from "../../types/finance";
import { formatCurrency, formatShortCurrency } from "../../utils/formatters";

const ALL_DEPTS = [
  "KỸ THUẬT",
  "KHO",
  "KẾ TOÁN",
  "XƯỞNG",
  "ĐIỆN",
  "ROBOT",
  "KINH DOANH",
];
const ALL_ACCOUNTS = ["ACB", "VCB", "MB", "EXIM", "CASH"];
const ALL_STATUSES = [
  { value: "in", label: "Thu vào" },
  { value: "out", label: "Chi ra" },
];

export default function CashFlow() {
  const { preset, setPreset, custom, setCustom, isInRange } =
    useDateFilter("7days");
  const [adv, setAdv] = useState<AdvancedFilterState>(EMPTY_FILTERS);

  const filtered = useMemo(() => {
    return cashFlowTransactions.filter((tx) => {
      if (!isInRange(tx.date)) return false;
      if (
        adv.departments.length > 0 &&
        !adv.departments.includes(tx.department)
      )
        return false;
      if (adv.accounts.length > 0 && !adv.accounts.includes(tx.account))
        return false;
      if (adv.statuses.length > 0 && !adv.statuses.includes(tx.type))
        return false;
      if (adv.amountMin !== "" && tx.amount < Number(adv.amountMin) * 1_000_000)
        return false;
      if (adv.amountMax !== "" && tx.amount > Number(adv.amountMax) * 1_000_000)
        return false;
      return true;
    });
  }, [isInRange, adv]);

  // Gom theo ngày cho chart
  const chartData: CashFlowDay[] = useMemo(() => {
    const map = new Map<string, CashFlowDay>();
    filtered.forEach((tx) => {
      const [, m, d] = tx.date.split("-");
      const label = `${d}/${m}`;
      if (!map.has(label))
        map.set(label, { date: label, income: 0, expense: 0 });
      const e = map.get(label)!;
      if (tx.type === "in") e.income += tx.amount;
      else e.expense += tx.amount;
    });
    return Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }, [filtered]);

  // Gom theo ngày cho bảng kê (Thu / Chi / Tồn quỹ)
  const ledgerRows = useMemo(() => {
    type Row = {
      date: string;
      department: string;
      description: string;
      thu: number;
      chi: number;
      account: string;
    };
    const rows: Row[] = filtered.map((tx) => ({
      date: tx.date,
      department: tx.department,
      description: tx.description,
      thu: tx.type === "in" ? tx.amount : 0,
      chi: tx.type === "out" ? tx.amount : 0,
      account: tx.account,
    }));

    // Tính tồn quỹ lũy kế
    let running = 0;
    return rows.map((r) => {
      running += r.thu - r.chi;
      return { ...r, tonQuy: running };
    });
  }, [filtered]);

  const totalThu = filtered
    .filter((t) => t.type === "in")
    .reduce((s, t) => s + t.amount, 0);
  const totalChi = filtered
    .filter((t) => t.type === "out")
    .reduce((s, t) => s + t.amount, 0);
  const net = totalThu - totalChi;

  const exportRows = ledgerRows.map((r) => ({
    "Ngày tháng": r.date,
    "Mục đích": r.department,
    "Diễn giải": r.description,
    Thu: r.thu || "",
    Chi: r.chi || "",
    "Tồn quỹ": r.tonQuy,
    "Tài khoản": r.account,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-ink-1 mb-1">
          Sổ Chi Tiền Mặt / Dòng Tiền
        </h2>
        <p className="text-xs text-ink-3">
          Thu vào và chi ra theo kỳ lọc — khớp với «Sổ chi tiền mặt - TK Cá
          Nhân»
        </p>
      </div>

      {/* Date filter */}
      <div className="bg-surface-2 border border-white/8 rounded-xl px-4 py-3">
        <DateRangeFilter
          preset={preset}
          custom={custom}
          onPreset={setPreset}
          onCustom={setCustom}
        />
      </div>

      {/* Advanced filters */}
      <AdvancedFilters
        filters={adv}
        onChange={setAdv}
        availableDepts={ALL_DEPTS}
        availableStatuses={ALL_STATUSES}
        availableAccounts={ALL_ACCOUNTS}
        exportData={exportRows}
        exportFileName="so_chi_tien_mat"
        exportTitle="SỔ CHI TIỀN MẶT / DÒNG TIỀN — AUTOSS"
        resultCount={ledgerRows.length}
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          icon={<TrendingUp size={17} />}
          label="Tổng thu vào"
          value={formatShortCurrency(totalThu)}
          subtext={`${filtered.filter((t) => t.type === "in").length} giao dịch`}
          color="green"
        />
        <MetricCard
          icon={<ArrowUpFromLine size={17} />}
          label="Tổng chi ra"
          value={formatShortCurrency(totalChi)}
          subtext={`${filtered.filter((t) => t.type === "out").length} giao dịch`}
          color="red"
        />
        <MetricCard
          icon={<ArrowDownToLine size={17} />}
          label="Tồn quỹ cuối kỳ"
          value={`${net > 0 ? "+" : ""}${formatShortCurrency(net)}`}
          subtext="Thu − Chi"
          color={net >= 0 ? "green" : "red"}
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <SectionCard
          title={
            <>
              <TrendingUp size={13} /> Biểu đồ Thu / Chi
            </>
          }
        >
          <div style={{ height: 240 }}>
            <CashFlowChart data={chartData} />
          </div>
        </SectionCard>
      )}

      {/* Bảng kê — format khớp Sheet 2 */}
      <SectionCard
        title={
          <>
            <ArrowDownToLine size={13} className="text-blue-400" /> Bảng kê dòng
            tiền
          </>
        }
        action={
          <span className="text-[11px] text-ink-3">
            {ledgerRows.length} giao dịch
          </span>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/10 bg-surface-3">
                {[
                  "Ngày tháng",
                  "Mục đích",
                  "Diễn giải",
                  "Thu",
                  "Chi",
                  "Tồn quỹ",
                  "TK",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap ${["Thu", "Chi", "Tồn quỹ"].includes(h) ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledgerRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-[12px] text-ink-3"
                  >
                    Không có dữ liệu trong kỳ đã chọn
                  </td>
                </tr>
              )}
              {ledgerRows.slice(0, 30).map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-surface-3 transition-colors"
                >
                  <td className="px-3 py-2.5 font-mono text-[11px] text-ink-3 whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-3 py-2.5 text-ink-2 text-[11px] whitespace-nowrap">
                    {r.department}
                  </td>
                  <td className="px-3 py-2.5 text-ink-2 max-w-[220px] truncate">
                    {r.description}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-right text-emerald-400 font-medium whitespace-nowrap">
                    {r.thu > 0 ? (
                      formatCurrency(r.thu)
                    ) : (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-right text-red-400 font-medium whitespace-nowrap">
                    {r.chi > 0 ? (
                      formatCurrency(r.chi)
                    ) : (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>
                  <td
                    className={`px-3 py-2.5 font-mono text-right font-semibold whitespace-nowrap ${r.tonQuy >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {formatCurrency(r.tonQuy)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-ink-3">
                    {r.account}
                  </td>
                </tr>
              ))}
            </tbody>
            {ledgerRows.length > 0 && (
              <tfoot>
                <tr className="border-t border-white/15 bg-surface-3">
                  <td
                    colSpan={3}
                    className="px-3 py-2.5 text-[11px] font-bold text-ink-1"
                  >
                    TỔNG CỘNG
                  </td>
                  <td className="px-3 py-2.5 font-mono text-right font-bold text-emerald-400 text-[12px]">
                    {formatCurrency(totalThu)}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-right font-bold text-red-400 text-[12px]">
                    {formatCurrency(totalChi)}
                  </td>
                  <td
                    className={`px-3 py-2.5 font-mono text-right font-bold text-[12px] ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {formatCurrency(net)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
          {ledgerRows.length > 30 && (
            <p className="px-4 py-2.5 text-[11px] text-ink-3 border-t border-white/5">
              Hiển thị 30/{ledgerRows.length} · Xuất Excel để xem toàn bộ
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
