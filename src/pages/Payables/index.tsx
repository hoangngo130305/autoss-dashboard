import { useState, useMemo } from "react";
import { ArrowUpFromLine } from "lucide-react";
import { SectionCard } from "../../components/cards/SectionCard";
import type { Column } from "../../components/tables/DataTable";
import { DataTable } from "../../components/tables/DataTable";
import { Badge, DeptBadge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { ApprovalModal } from "../../components/modals/ApprovalModal";
import { DateRangeFilter } from "../../components/filters/DateRangeFilter";
import {
  AdvancedFilters,
  EMPTY_FILTERS,
} from "../../components/filters/AdvancedFilters";
import type { AdvancedFilterState } from "../../components/filters/AdvancedFilters";
import { useDateFilter } from "../../hooks/useDateFilter";
import { usePagination } from "../../hooks/usePagination";
import { useModal } from "../../hooks/useModal";
import { useToast } from "../../hooks/useToast";
import { useStore } from "../../store/AppStore";
import { modalData } from "../../data/modals";
import type { Payable } from "../../types/finance";
import { formatCurrency } from "../../utils/formatters";
import clsx from "clsx";

const keyMap: Record<string, string> = {
  "1": "thp",
  "2": "vegas",
  "3": "vietmy",
};

const ALL_DEPTS = [
  "KHO",
  "KỸ THUẬT",
  "ĐIỆN",
  "KẾ TOÁN",
  "XƯỞNG",
  "ROBOT",
  "KINH DOANH",
];
const ALL_STATUSES = [
  { value: "overdue", label: "Quá hạn" },
  { value: "waiting_update", label: "Chờ update" },
  { value: "approved", label: "Đã duyệt" },
  { value: "paid", label: "Đã trả" },
];

export default function Payables() {
  const { state } = useStore();
  const [search, setSearch] = useState("");
  const [adv, setAdv] = useState<AdvancedFilterState>(EMPTY_FILTERS);
  const { preset, setPreset, custom, setCustom, isInRange } =
    useDateFilter("thisyear");
  const modal = useModal<string>();
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    return state.payables.filter((p) => {
      if (search && !p.supplier.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (!isInRange(p.dueDate || undefined)) return false;
      if (adv.departments.length > 0 && !adv.departments.includes(p.department))
        return false;
      if (adv.statuses.length > 0 && !adv.statuses.includes(p.status))
        return false;
      if (adv.overdueOnly && p.status !== "overdue") return false;
      if (adv.amountMin !== "" && p.amount < Number(adv.amountMin) * 1_000_000)
        return false;
      if (adv.amountMax !== "" && p.amount > Number(adv.amountMax) * 1_000_000)
        return false;
      return true;
    });
  }, [state.payables, search, isInRange, adv]);

  const totalFiltered = filtered
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + p.amount, 0);
  const { page, totalPages, paged, goTo } = usePagination(filtered, 10);

  const exportRows = filtered.map((p) => ({
    "Nhà cung cấp": p.supplier,
    "Hợp đồng": p.contract,
    "Phòng ban": p.department,
    "Số tiền": p.amount,
    "Trạng thái": p.status,
    "Người phụ trách": p.responsiblePerson ?? "",
    "Ngày đến hạn": p.dueDate ?? "",
  }));

  const columns: Column<Payable>[] = [
    {
      key: "supplier",
      header: "Nhà cung cấp",
      render: (p) => (
        <span className="text-ink-1 font-medium">{p.supplier}</span>
      ),
    },
    {
      key: "contract",
      header: "Hợp đồng",
      render: (p) => (
        <span className="font-mono text-[11px] text-ink-3">{p.contract}</span>
      ),
    },
    {
      key: "department",
      header: "Phòng phụ trách",
      render: (p) => (
        <DeptBadge color={p.departmentColor}>{p.department}</DeptBadge>
      ),
    },
    {
      key: "dueDate",
      header: "Đến hạn",
      render: (p) => (
        <span
          className={clsx(
            "font-mono text-[11px]",
            p.status === "overdue" ? "text-red-400" : "text-ink-3",
          )}
        >
          {p.dueDate || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      headerClass: "text-right",
      cellClass: "text-right",
      render: (p) => (
        <span
          className={clsx(
            "font-mono font-medium",
            p.status === "overdue" ? "text-red-400" : "text-ink-3",
          )}
        >
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (p) =>
        p.status === "overdue" ? (
          <Badge variant="overdue">QUÁ HẠN</Badge>
        ) : (
          <Badge variant="waiting">CHỜ UPDATE</Badge>
        ),
    },
    {
      key: "action",
      header: "Hành động",
      render: (p) =>
        keyMap[p.id] ? (
          <Button
            variant="success"
            size="sm"
            onClick={() => modal.open(keyMap[p.id])}
          >
            Thanh toán
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showToast("Chờ cập nhật số liệu", "warning")}
          >
            Chờ update
          </Button>
        ),
    },
  ];

  return (
    <>
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink-1 mb-1">
            Công nợ phải trả — Mình nợ nhà cung cấp
          </h2>
          <p className="text-xs text-ink-3">
            Tổng phải trả (lọc):{" "}
            <strong className="text-red-400">
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
          exportFileName="phai_tra"
          exportTitle="BẢNG KÊ CÔNG NỢ PHẢI TRẢ — AUTOSS"
          resultCount={filtered.length}
        />

        <SectionCard
          title={
            <>
              <ArrowUpFromLine size={13} className="text-red-400" /> Danh sách
              công nợ phải trả
            </>
          }
          action={
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                goTo(1);
              }}
              placeholder="Tìm nhà cung cấp..."
              className="w-44"
            />
          }
          bodyClassName="p-0"
        >
          <div className="px-5 pt-4">
            <DataTable
              columns={columns}
              data={paged}
              keyExtractor={(p) => p.id}
              emptyMessage="Không tìm thấy nhà cung cấp"
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

      <ApprovalModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        data={modal.data ? (modalData[modal.data] ?? null) : null}
      />
    </>
  );
}
