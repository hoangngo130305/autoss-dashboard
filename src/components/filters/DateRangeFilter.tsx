import clsx from "clsx";
import { CalendarDays } from "lucide-react";
import type { DatePreset, DateRange } from "../../hooks/useDateFilter";

interface DateRangeFilterProps {
  preset: DatePreset;
  custom: DateRange;
  onPreset: (p: DatePreset) => void;
  onCustom: (r: DateRange) => void;
  /** When true, show all 13 presets grouped in 3 rows */
  full?: boolean;
}

const COMPACT_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Hôm nay" },
  { id: "7days", label: "7 ngày" },
  { id: "thismonth", label: "Tháng này" },
  { id: "30days", label: "30 ngày" },
  { id: "quarter", label: "Quý này" },
  { id: "custom", label: "Tùy chỉnh" },
];

const FULL_PRESET_GROUPS: { label: string; items: { id: DatePreset; label: string }[] }[] = [
  {
    label: "Nhanh",
    items: [
      { id: "today", label: "Hôm nay" },
      { id: "yesterday", label: "Hôm qua" },
      { id: "7days", label: "7 ngày" },
      { id: "30days", label: "30 ngày" },
    ],
  },
  {
    label: "Tuần / Tháng",
    items: [
      { id: "thisweek", label: "Tuần này" },
      { id: "lastweek", label: "Tuần trước" },
      { id: "thismonth", label: "Tháng này" },
      { id: "lastmonth", label: "Tháng trước" },
    ],
  },
  {
    label: "Quý / Năm",
    items: [
      { id: "quarter", label: "Quý này" },
      { id: "lastquarter", label: "Quý trước" },
      { id: "thisyear", label: "Năm này" },
      { id: "lastyear", label: "Năm ngoái" },
    ],
  },
];

// All presets flattened for mobile scroll row
const ALL_FULL_PRESETS = [
  ...FULL_PRESET_GROUPS.flatMap((g) => g.items),
  { id: "custom" as DatePreset, label: "Tùy chỉnh" },
];

function PresetBtn({
  id,
  label,
  active,
  onClick,
}: {
  id: DatePreset;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      key={id}
      onClick={onClick}
      className={clsx(
        "text-[11px] px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap",
        active
          ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
          : "text-ink-3 border border-white/8 hover:bg-surface-3 hover:text-ink-2",
      )}
    >
      {label}
    </button>
  );
}

export function DateRangeFilter({
  preset,
  custom,
  onPreset,
  onCustom,
  full = false,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      {full ? (
        <>
          {/* Mobile: single scrollable row */}
          <div className="sm:hidden overflow-x-auto pb-0.5 -mx-1 px-1">
            <div className="flex gap-1 w-max">
              {ALL_FULL_PRESETS.map((p) => (
                <PresetBtn
                  key={p.id}
                  id={p.id}
                  label={p.label}
                  active={preset === p.id}
                  onClick={() => onPreset(p.id)}
                />
              ))}
            </div>
          </div>

          {/* Desktop: grouped rows with labels */}
          <div className="hidden sm:flex flex-col gap-2">
            {FULL_PRESET_GROUPS.map((group) => (
              <div key={group.label} className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-3 w-14 flex-shrink-0">
                  {group.label}
                </span>
                <div className="flex gap-1 flex-wrap">
                  {group.items.map((p) => (
                    <PresetBtn
                      key={p.id}
                      id={p.id}
                      label={p.label}
                      active={preset === p.id}
                      onClick={() => onPreset(p.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-ink-3 w-14 flex-shrink-0" />
              <PresetBtn
                id="custom"
                label="Tùy chỉnh"
                active={preset === "custom"}
                onClick={() => onPreset("custom")}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays size={13} className="text-ink-3 flex-shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {COMPACT_PRESETS.map((p) => (
              <PresetBtn
                key={p.id}
                id={p.id}
                label={p.label}
                active={preset === p.id}
                onClick={() => onPreset(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {preset === "custom" && (
        <div className="flex items-center gap-1.5 sm:ml-16 flex-wrap">
          <input
            type="date"
            value={custom.start}
            onChange={(e) => onCustom({ ...custom, start: e.target.value })}
            className="bg-surface-3 border border-white/8 rounded-md px-2 py-1 text-[11px] text-ink-2 focus:outline-none focus:border-blue-500/40"
          />
          <span className="text-[11px] text-ink-3">→</span>
          <input
            type="date"
            value={custom.end}
            onChange={(e) => onCustom({ ...custom, end: e.target.value })}
            className="bg-surface-3 border border-white/8 rounded-md px-2 py-1 text-[11px] text-ink-2 focus:outline-none focus:border-blue-500/40"
          />
        </div>
      )}
    </div>
  );
}
