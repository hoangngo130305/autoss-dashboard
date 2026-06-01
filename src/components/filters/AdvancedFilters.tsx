import { useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Download,
} from "lucide-react";
import clsx from "clsx";
import { exportStyledExcel } from "../../utils/exportExcel";

export interface AdvancedFilterState {
  departments: string[];
  statuses: string[];
  amountMin: string;
  amountMax: string;
  overdueOnly: boolean;
  accounts: string[];
}

export const EMPTY_FILTERS: AdvancedFilterState = {
  departments: [],
  statuses: [],
  amountMin: "",
  amountMax: "",
  overdueOnly: false,
  accounts: [],
};

interface AdvancedFiltersProps {
  filters: AdvancedFilterState;
  onChange: (f: AdvancedFilterState) => void;
  availableDepts?: string[];
  availableStatuses?: { value: string; label: string }[];
  availableAccounts?: string[];
  exportData?: object[];
  exportFileName?: string;
  exportTitle?: string;
  resultCount?: number;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function AdvancedFilters({
  filters,
  onChange,
  availableDepts = [],
  availableStatuses = [],
  availableAccounts = [],
  exportData,
  exportFileName = "export",
  exportTitle = "BÁO CÁO KẾ TOÁN — AUTOSS",
  resultCount,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const activeCount = [
    filters.departments.length > 0,
    filters.statuses.length > 0,
    filters.amountMin !== "",
    filters.amountMax !== "",
    filters.overdueOnly,
    filters.accounts.length > 0,
  ].filter(Boolean).length;

  const handleExport = async () => {
    if (!exportData?.length || exporting) return;
    setExporting(true);
    try {
      await exportStyledExcel(
        exportData as Record<string, unknown>[],
        exportFileName,
        exportTitle,
        `Xuất ngày: ${new Date().toLocaleDateString("vi-VN")} · ${resultCount ?? exportData.length} dòng`,
      );
    } finally {
      setExporting(false);
    }
  };

  const ChipGroup = ({
    items,
    selected,
    onToggle,
    colorMap,
  }: {
    items: string[];
    selected: string[];
    onToggle: (v: string) => void;
    colorMap?: Record<string, string>;
  }) => (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onToggle(item)}
          className={clsx(
            "text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all",
            selected.includes(item)
              ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
              : colorMap?.[item]
                ? `${colorMap[item]} border-white/10`
                : "text-ink-3 border-white/8 hover:bg-surface-3 hover:text-ink-2",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div className="border border-white/8 rounded-xl bg-surface-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-[12px] text-ink-2 hover:text-ink-1 transition-colors"
        >
          <SlidersHorizontal size={13} />
          <span className="font-medium">Bộ lọc nâng cao</span>
          {activeCount > 0 && (
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
          {open ? (
            <ChevronUp size={12} className="text-ink-3" />
          ) : (
            <ChevronDown size={12} className="text-ink-3" />
          )}
        </button>

        <div className="flex items-center gap-2">
          {resultCount !== undefined && (
            <span className="text-[11px] text-ink-3">
              {resultCount} kết quả
            </span>
          )}
          {activeCount > 0 && (
            <button
              onClick={() => onChange(EMPTY_FILTERS)}
              className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors"
            >
              <X size={10} /> Xóa lọc
            </button>
          )}
          {exportData && (
            <button
              onClick={handleExport}
              disabled={!exportData.length || exporting}
              className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-emerald-500/20 px-2.5 py-1 rounded-md hover:bg-emerald-500/8"
            >
              <Download size={11} /> {exporting ? "Đang xuất..." : "Xuất Excel"}
            </button>
          )}
        </div>
      </div>

      {/* Panel */}
      {open && (
        <div className="border-t border-white/8 px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Departments */}
          {availableDepts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">
                Phòng ban
              </p>
              <ChipGroup
                items={availableDepts}
                selected={filters.departments}
                onToggle={(v) =>
                  onChange({
                    ...filters,
                    departments: toggleItem(filters.departments, v),
                  })
                }
              />
            </div>
          )}

          {/* Statuses */}
          {availableStatuses.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">
                Trạng thái
              </p>
              <ChipGroup
                items={availableStatuses.map((s) => s.label)}
                selected={availableStatuses
                  .filter((s) => filters.statuses.includes(s.value))
                  .map((s) => s.label)}
                onToggle={(label) => {
                  const s = availableStatuses.find((x) => x.label === label);
                  if (s)
                    onChange({
                      ...filters,
                      statuses: toggleItem(filters.statuses, s.value),
                    });
                }}
              />
            </div>
          )}

          {/* Amount range */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">
              Khoảng tiền (triệu)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={filters.amountMin}
                onChange={(e) =>
                  onChange({ ...filters, amountMin: e.target.value })
                }
                className="w-full bg-surface-3 border border-white/8 rounded-md px-2 py-1 text-[11px] text-ink-2 placeholder:text-ink-3 focus:outline-none focus:border-blue-500/40"
              />
              <span className="text-ink-3 text-[11px]">–</span>
              <input
                type="number"
                placeholder="Đến"
                value={filters.amountMax}
                onChange={(e) =>
                  onChange({ ...filters, amountMax: e.target.value })
                }
                className="w-full bg-surface-3 border border-white/8 rounded-md px-2 py-1 text-[11px] text-ink-2 placeholder:text-ink-3 focus:outline-none focus:border-blue-500/40"
              />
            </div>
          </div>

          {/* Accounts + Overdue */}
          <div className="space-y-3">
            {availableAccounts.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">
                  Ngân hàng
                </p>
                <ChipGroup
                  items={availableAccounts}
                  selected={filters.accounts}
                  onToggle={(v) =>
                    onChange({
                      ...filters,
                      accounts: toggleItem(filters.accounts, v),
                    })
                  }
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-[11px] text-ink-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.overdueOnly}
                onChange={(e) =>
                  onChange({ ...filters, overdueOnly: e.target.checked })
                }
                className="accent-red-400 w-3.5 h-3.5"
              />
              <span>Chỉ hiện quá hạn</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
