import { useMemo } from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Scale,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
} from "lucide-react";
import clsx from "clsx";
import { MetricCard } from "../../components/cards/MetricCard";
import { SectionCard } from "../../components/cards/SectionCard";
import { Badge } from "../../components/common/Badge";
import { DateRangeFilter } from "../../components/filters/DateRangeFilter";
import { BankAccountsCard } from "./BankAccountsCard";
import { PendingApprovalsCard } from "./PendingApprovalsCard";
import { ReceivablesSummaryCard } from "./ReceivablesSummaryCard";
import { PayablesSummaryCard } from "./PayablesSummaryCard";
import { TaxSummaryCard } from "./TaxSummaryCard";
import { RiskReserveCard } from "./RiskReserveCard";
import { ExpenseDistributionCard } from "./ExpenseDistributionCard";
import { useDateFilter } from "../../hooks/useDateFilter";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useStore } from "../../store/AppStore";
import { formatShortCurrency } from "../../utils/formatters";

function PctBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span
      className={clsx(
        "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
        up
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400",
      )}
    >
      {up ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

export default function Dashboard() {
  const { state } = useStore();
  const { preset, setPreset, custom, setCustom, range } =
    useDateFilter("thismonth");
  const analytics = useAnalytics(state, preset, range);

  const rangeLabel = useMemo(() => {
    if (!range.start || !range.end) return "";
    const fmt = (s: string) => {
      const [y, m, d] = s.split("-");
      return `${d}/${m}/${y}`;
    };
    if (range.start === range.end) return fmt(range.start);
    return `${fmt(range.start)} – ${fmt(range.end)}`;
  }, [range]);

  const warningItems = [
    ...analytics.overdueReceivables.map((r) => ({
      label: `Phải thu quá hạn: ${r.customer}`,
      value: formatShortCurrency(r.amount),
      type: "danger" as const,
    })),
    ...analytics.overduePayables.map((p) => ({
      label: `Phải trả quá hạn: ${p.supplier}`,
      value: formatShortCurrency(p.amount),
      type: "danger" as const,
    })),
    ...analytics.overdueTaxes.map((t) => ({
      label: `Thuế quá hạn: ${t.company} · ${t.period}`,
      value: formatShortCurrency(t.remaining ?? 0),
      type: "danger" as const,
    })),
    ...analytics.overdueProposals.map((p) => ({
      label: `Đề xuất quá hạn: ${p.description.slice(0, 40)}`,
      value: p.amount ? formatShortCurrency(p.amount) : "",
      type: "warn" as const,
    })),
    analytics.pendingProposals.length > 0
      ? {
          label: `${analytics.pendingProposals.length} đề xuất chờ duyệt`,
          value: formatShortCurrency(
            analytics.pendingProposals.reduce((s, p) => s + (p.amount ?? 0), 0),
          ),
          type: "warn" as const,
        }
      : null,
  ].filter(Boolean) as {
    label: string;
    value: string;
    type: "danger" | "warn";
  }[];

  return (
    <div className="space-y-5">
      {/* Date filter */}
      <div className="bg-surface-2 border border-white/8 rounded-xl px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <CalendarDays size={12} className="text-blue-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-ink-2">Kỳ phân tích</span>
          {rangeLabel && (
            <span className="text-[10px] text-ink-3 font-mono bg-surface-3 px-2 py-0.5 rounded ml-auto sm:ml-0">
              {rangeLabel}
            </span>
          )}
        </div>
        <DateRangeFilter
          preset={preset}
          custom={custom}
          onPreset={setPreset}
          onCustom={setCustom}
          full
        />
      </div>

      {/* KPI cards — period-based */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">
          Dòng tiền trong kỳ
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-surface-2 border border-white/7 rounded-xl p-4 hover:border-white/12 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-400">
                <ArrowDownToLine size={17} />
              </span>
              <PctBadge pct={analytics.income.pct} />
            </div>
            <p className="text-[11px] text-ink-3 mb-1.5 font-medium">
              Tổng thu vào
            </p>
            <p className="font-mono text-lg font-semibold leading-tight text-emerald-300">
              {formatShortCurrency(analytics.income.curr)}
            </p>
            <p className="text-[10px] text-ink-3 mt-1.5">
              {analytics.income.count} giao dịch
            </p>
          </div>

          <div className="bg-surface-2 border border-white/7 rounded-xl p-4 hover:border-white/12 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-3">
              <span className="text-red-400">
                <ArrowUpFromLine size={17} />
              </span>
              <PctBadge pct={analytics.expense.pct} />
            </div>
            <p className="text-[11px] text-ink-3 mb-1.5 font-medium">
              Tổng chi ra
            </p>
            <p className="font-mono text-lg font-semibold leading-tight text-red-300">
              {formatShortCurrency(analytics.expense.curr)}
            </p>
            <p className="text-[10px] text-ink-3 mt-1.5">
              {analytics.expense.count} giao dịch
            </p>
          </div>

          <div className="bg-surface-2 border border-white/7 rounded-xl p-4 hover:border-white/12 hover:-translate-y-0.5 transition-all duration-150 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span
                className={
                  analytics.net.curr >= 0 ? "text-blue-400" : "text-red-400"
                }
              >
                <TrendingUp size={17} />
              </span>
              <PctBadge pct={analytics.net.pct} />
            </div>
            <p className="text-[11px] text-ink-3 mb-1.5 font-medium">
              Dòng tiền ròng
            </p>
            <p
              className={clsx(
                "font-mono text-lg font-semibold leading-tight",
                analytics.net.curr >= 0 ? "text-blue-300" : "text-red-300",
              )}
            >
              {analytics.net.curr >= 0 ? "+" : ""}
              {formatShortCurrency(analytics.net.curr)}
            </p>
            <p className="text-[10px] text-ink-3 mt-1.5">Thu − Chi</p>
          </div>
        </div>
      </div>

      {/* KPI cards — balance sheet */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">
          Tổng quan tài chính
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            icon={<TrendingDown size={17} />}
            label="Phải thu (Khách hàng)"
            value={formatShortCurrency(analytics.totalReceivable)}
            subtext={`${analytics.topDebtors.length} khoản còn lại`}
            trend={
              analytics.overdueReceivables.length > 0
                ? `${analytics.overdueReceivables.length} quá hạn`
                : "Đúng hạn"
            }
            trendType={
              analytics.overdueReceivables.length > 0 ? "down" : "neutral"
            }
            color="green"
          />
          <MetricCard
            icon={<TrendingUp size={17} />}
            label="Phải trả (NCC)"
            value={formatShortCurrency(analytics.totalPayable)}
            subtext={`${state.payables.filter((p) => p.status !== "paid").length} nhà cung cấp`}
            trend={
              analytics.overduePayables.length > 0
                ? `${analytics.overduePayables.length} quá hạn`
                : "Đúng hạn"
            }
            trendType={
              analytics.overduePayables.length > 0 ? "down" : "neutral"
            }
            color="red"
          />
          <MetricCard
            icon={<Scale size={17} />}
            label="Cân đối ròng"
            value={`${analytics.netBalance >= 0 ? "+" : ""}${formatShortCurrency(analytics.netBalance)}`}
            subtext="Phải thu − Phải trả"
            trend={analytics.netBalance >= 0 ? "Dương" : "Âm"}
            trendType={analytics.netBalance >= 0 ? "neutral" : "down"}
            color={analytics.netBalance >= 0 ? "amber" : "red"}
          />
          <MetricCard
            icon={<Wallet size={17} />}
            label="Nợ thuế còn lại"
            value={formatShortCurrency(analytics.totalTaxDebt)}
            subtext={`${analytics.overdueTaxes.length > 0 ? `${analytics.overdueTaxes.length} khoản quá hạn` : "Trong kiểm soát"}`}
            trend={
              analytics.overdueTaxes.length > 0
                ? `${analytics.overdueTaxes.length} quá hạn`
                : "Bình thường"
            }
            trendType={analytics.overdueTaxes.length > 0 ? "down" : "neutral"}
            color="amber"
          />
        </div>
      </div>

      {/* Warnings + Top debtors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Warning widget */}
        <SectionCard
          title={
            <>
              <AlertTriangle size={13} className="text-amber-400" /> Cảnh báo
              tài chính
            </>
          }
          action={
            warningItems.length > 0 ? (
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                {warningItems.length} cảnh báo
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400">Tốt</span>
            )
          }
          bodyClassName="p-0"
        >
          {warningItems.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-emerald-400 text-sm font-medium">
                Không có cảnh báo
              </p>
              <p className="text-[11px] text-ink-3 mt-1">
                Tất cả các khoản đang trong kiểm soát
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {warningItems.slice(0, 6).map((w, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-3 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={clsx(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        w.type === "danger" ? "bg-red-400" : "bg-amber-400",
                      )}
                    />
                    <span className="text-[11px] text-ink-2 truncate">
                      {w.label}
                    </span>
                  </div>
                  {w.value && (
                    <span className="text-[11px] font-mono font-medium text-ink-1 ml-2 flex-shrink-0">
                      {w.value}
                    </span>
                  )}
                </div>
              ))}
              {warningItems.length > 6 && (
                <p className="px-4 py-2 text-[10px] text-ink-3">
                  +{warningItems.length - 6} cảnh báo khác
                </p>
              )}
            </div>
          )}
        </SectionCard>

        {/* Top debtors */}
        <SectionCard
          title={
            <>
              <TrendingDown size={13} className="text-emerald-400" /> Top khách
              hàng còn nợ
            </>
          }
          action={
            <span className="text-[11px] text-ink-3">
              {formatShortCurrency(analytics.totalReceivable)} tổng
            </span>
          }
          bodyClassName="p-0"
        >
          {analytics.topDebtors.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12px] text-ink-3">
              Không có khoản phải thu
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {analytics.topDebtors.map((r, i) => {
                const share =
                  analytics.totalReceivable > 0
                    ? (r.amount / analytics.totalReceivable) * 100
                    : 0;
                return (
                  <div
                    key={r.id}
                    className="px-4 py-2.5 hover:bg-surface-3 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-ink-3 w-4 flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-[12px] font-medium text-ink-1 truncate">
                          {r.customer}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-[11px] font-mono font-medium text-emerald-300">
                          {formatShortCurrency(r.amount)}
                        </span>
                        {r.status === "overdue" && (
                          <Badge variant="overdue">QUÁ HẠN</Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-1 bg-surface-3 rounded-full overflow-hidden ml-6">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all",
                          r.status === "overdue"
                            ? "bg-red-400"
                            : "bg-emerald-500/60",
                        )}
                        style={{ width: `${Math.min(share, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-ink-3 mt-1 ml-6">
                      {r.project} · {share.toFixed(0)}% tổng phải thu
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Bank accounts + Pending approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <BankAccountsCard />
        <PendingApprovalsCard />
      </div>

      {/* Receivables + Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReceivablesSummaryCard />
        <PayablesSummaryCard />
      </div>

      {/* Tax + Risk Reserve + Expense Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TaxSummaryCard />
        <RiskReserveCard />
        <ExpenseDistributionCard />
      </div>
    </div>
  );
}
