import { useState, useMemo } from "react";
import { ArrowDownToLine } from "lucide-react";
import { SectionCard } from "../../components/cards/SectionCard";
import type { Column } from "../../components/tables/DataTable";
import { DataTable } from "../../components/tables/DataTable";
import { Badge, DeptBadge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { DateRangeFilter } from "../../components/filters/DateRangeFilter";
import {
  AdvancedFilters,
  EMPTY_FILTERS,
} from "../../components/filters/AdvancedFilters";
import type { AdvancedFilterState } from "../../components/filters/AdvancedFilters";
import { useDateFilter } from "../../hooks/useDateFilter";
import { usePagination } from "../../hooks/usePagination";
import { useToast } from "../../hooks/useToast";
import { useStore } from "../../store/AppStore";
import type { Receivable } from "../../types/finance";
import { formatCurrency } from "../../utils/formatters";
import clsx from "clsx";

const statusMap = {
  overdue: {
    variant: "overdue" as const,
    label: "QUÁ HẠN",
    amountClass: "text-red-400",
  },
  waiting_payment: {
    variant: "pending" as const,
    label: "CHỜ KH TT",
    amountClass: "text-amber-400",
  },
  waiting_contract: {
    variant: "waiting" as const,
    label: "CHỜ CHỐT",
    amountClass: "text-ink-3",
  },
  collected: {
    variant: "ok" as const,
    label: "ĐÃ THU",
    amountClass: "text-emerald-400",
  },
};

const ALL_DEPTS = [
  "KỸ THUẬT",
  "KINH DOANH",
  "ĐIỆN",
  "KẾ TOÁN",
  "XƯỞNG",
  "KHO",
  "ROBOT",
];
const ALL_STATUSES = [
  { value: "overdue", label: "Quá hạn" },
  { value: "waiting_payment", label: "Chờ thanh toán" },
  { value: "waiting_contract", label: "Chờ chốt" },
  { value: "collected", label: "Đã thu" },
];

export default function Receivables() {
  const { state } = useStore();
  const [search, setSearch] = useState("");
  const [adv, setAdv] = useState<AdvancedFilterState>(EMPTY_FILTERS);
  const { preset, setPreset, custom, setCustom, isInRange } =
    useDateFilter("30days");
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    return state.receivables.filter((r) => {
      if (
        search &&
        !r.customer.toLowerCase().includes(search.toLowerCase()) &&
        !r.project.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (!isInRange(r.dueDate || undefined)) return false;
      if (adv.departments.length > 0 && !adv.departments.includes(r.department))
        return false;
      if (adv.statuses.length > 0 && !adv.statuses.includes(r.status))
        return false;
      if (adv.overdueOnly && r.status !== "overdue") return false;
      if (adv.amountMin !== "" && r.amount < Number(adv.amountMin) * 1_000_000)
        return false;
      if (adv.amountMax !== "" && r.amount > Number(adv.amountMax) * 1_000_000)
        return false;
      return true;
    });
  }, [state.receivables, search, isInRange, adv]);

  const totalFiltered = filtered
    .filter((r) => r.status !== "collected")
    .reduce((s, r) => s + r.amount, 0);
  const { page, totalPages, paged, goTo } = usePagination(filtered, 10);

  const exportRows = filtered.map((r) => ({
    "Khách hàng": r.customer,
    "Dự án": r.project,
    "Liên hệ": r.contact,
    "Phòng ban": r.department,
    "Số tiền": r.amount,
    "Trạng thái": statusMap[r.status]?.label ?? r.status,
    "Ngày đến hạn": r.dueDate ?? "",
    "Ghi chú": r.note ?? "",
  }));

  const columns: Column<Receivable>[] = [
    {
      key: "customer",
      header: "Khách hàng",
      render: (r) => (
        <span className="text-ink-1 font-medium">{r.customer}</span>
      ),
    },
    {
      key: "project",
      header: "Dự án / Lý do",
      render: (r) => (
        <div>
          <p className="text-ink-2">{r.project}</p>
          <p className="text-[10px] text-ink-3 mt-0.5">{r.contact}</p>
        </div>
      ),
    },
    {
      key: "department",
      header: "Phòng phụ trách",
      render: (r) => (
        <DeptBadge color={r.departmentColor}>{r.department}</DeptBadge>
      ),
    },
    {
      key: "dueDate",
      header: "Đến hạn",
      render: (r) => (
        <span
          className={clsx(
            "font-mono text-[11px]",
            r.status === "overdue" ? "text-red-400" : "text-ink-3",
          )}
        >
          {r.dueDate || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      headerClass: "text-right",
      cellClass: "text-right",
      render: (r) => {
        const s = statusMap[r.status] ?? statusMap.waiting_contract;
        return (
          <span className={clsx("font-mono font-medium", s.amountClass)}>
            {formatCurrency(r.amount)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (r) => {
        const s = statusMap[r.status] ?? statusMap.waiting_contract;
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: "action",
      header: "Hành động",
      render: (r) => {
        const label =
          r.status === "overdue"
            ? "Đôn đốc"
            : r.status === "waiting_payment"
              ? "Theo dõi"
              : "Chờ chốt";
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              showToast(`Đã ghi nhận: ${label} — ${r.customer}`, "warning")
            }
          >
            {label}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-ink-1 mb-1">
          Công nợ phải thu — Khách hàng nợ mình
        </h2>
        <p className="text-xs text-ink-3">
          Tổng phải thu (lọc):{" "}
          <strong className="text-emerald-400">
            {formatCurrency(totalFiltered)} đ
          </strong>{" "}
          · {filtered.length} khoản
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
        exportData={exportRows}
        exportFileName="phai_thu"
        exportTitle="BẢNG KÊ CÔNG NỢ PHẢI THU — AUTOSS"
        resultCount={filtered.length}
      />

      <SectionCard
        title={
          <>
            <ArrowDownToLine size={13} className="text-emerald-400" /> Danh sách
            công nợ phải thu
          </>
        }
        action={
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              goTo(1);
            }}
            placeholder="Tìm khách hàng..."
            className="w-44"
          />
        }
        bodyClassName="p-0"
      >
        <div className="px-5 pt-4">
          <DataTable
            columns={columns}
            data={paged}
            keyExtractor={(r) => r.id}
            emptyMessage="Không tìm thấy khách hàng"
          />
        </div>
        <div className="px-5 pb-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={10}
            onPage={goTo}
          />
        </div>
      </SectionCard>
    </div>
  );
}
