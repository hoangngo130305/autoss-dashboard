import { useState, useMemo } from "react";

export type DatePreset =
  | "today"
  | "7days"
  | "month"
  | "30days"
  | "quarter"
  | "custom";

export const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Hôm nay" },
  { id: "7days", label: "7 ngày" },
  { id: "month", label: "Tháng này" },
  { id: "30days", label: "30 ngày" },
  { id: "quarter", label: "Quý này" },
  { id: "custom", label: "Tùy chỉnh" },
];

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function getPresetRange(
  preset: DatePreset,
  custom: DateRange,
): DateRange {
  const now = new Date();
  const today = toYMD(now);

  switch (preset) {
    case "today":
      return { start: today, end: today };

    case "7days": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { start: toYMD(s), end: today };
    }

    case "month": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toYMD(s), end: today };
    }

    case "30days": {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      return { start: toYMD(s), end: today };
    }

    case "quarter": {
      const q = Math.floor(now.getMonth() / 3);
      const s = new Date(now.getFullYear(), q * 3, 1);
      return { start: toYMD(s), end: today };
    }

    case "custom":
      return custom;
  }
}

export function useDateFilter(initialPreset: DatePreset = "7days") {
  const [preset, setPreset] = useState<DatePreset>(initialPreset);
  const [custom, setCustom] = useState<DateRange>({ start: "", end: "" });

  const range = useMemo(() => getPresetRange(preset, custom), [preset, custom]);

  const isInRange = (dateStr: string | undefined): boolean => {
    if (!dateStr) return true;
    if (!range.start || !range.end) return true;
    // Support both YYYY-MM-DD and DD/MM/YYYY
    let normalized = dateStr;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split("/");
      normalized = `${y}-${m}-${d}`;
    }
    return normalized >= range.start && normalized <= range.end;
  };

  return { preset, setPreset, custom, setCustom, range, isInRange };
}
