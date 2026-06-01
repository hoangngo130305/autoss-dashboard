import clsx from "clsx";
import { CalendarDays } from "lucide-react";
import { DATE_PRESETS } from "../../hooks/useDateFilter";
import type { DatePreset, DateRange } from "../../hooks/useDateFilter";

interface DateRangeFilterProps {
  preset: DatePreset;
  custom: DateRange;
  onPreset: (p: DatePreset) => void;
  onCustom: (r: DateRange) => void;
}

export function DateRangeFilter({
  preset,
  custom,
  onPreset,
  onCustom,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CalendarDays size={13} className="text-ink-3 flex-shrink-0" />
      <div className="flex gap-1 flex-wrap">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPreset(p.id)}
            className={clsx(
              "text-[11px] px-2.5 py-1 rounded-md transition-all font-medium",
              preset === p.id
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                : "text-ink-3 border border-white/8 hover:bg-surface-3 hover:text-ink-2",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-1.5">
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
