import { useState, useMemo } from "react";

export type DatePreset =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "thisweek"
  | "lastweek"
  | "month"        // kept for backward compat (= thismonth)
  | "thismonth"
  | "lastmonth"
  | "quarter"      // kept for backward compat (= thisquarter)
  | "lastquarter"
  | "thisyear"
  | "lastyear"
  | "custom";

export const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Hôm nay" },
  { id: "yesterday", label: "Hôm qua" },
  { id: "7days", label: "7 ngày" },
  { id: "30days", label: "30 ngày" },
  { id: "thisweek", label: "Tuần này" },
  { id: "lastweek", label: "Tuần trước" },
  { id: "thismonth", label: "Tháng này" },
  { id: "lastmonth", label: "Tháng trước" },
  { id: "quarter", label: "Quý này" },
  { id: "lastquarter", label: "Quý trước" },
  { id: "thisyear", label: "Năm này" },
  { id: "lastyear", label: "Năm ngoái" },
  { id: "custom", label: "Tùy chỉnh" },
];

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
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

    case "yesterday": {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      const y = toYMD(d);
      return { start: y, end: y };
    }

    case "7days": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { start: toYMD(s), end: today };
    }

    case "30days": {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      return { start: toYMD(s), end: today };
    }

    case "thisweek": {
      const dow = now.getDay();
      const diffToMon = dow === 0 ? 6 : dow - 1;
      const mon = new Date(now);
      mon.setDate(now.getDate() - diffToMon);
      return { start: toYMD(mon), end: today };
    }

    case "lastweek": {
      const dow = now.getDay();
      const diffToMon = dow === 0 ? 6 : dow - 1;
      const thisMon = new Date(now);
      thisMon.setDate(now.getDate() - diffToMon);
      const lastMon = new Date(thisMon);
      lastMon.setDate(thisMon.getDate() - 7);
      const lastSun = new Date(thisMon);
      lastSun.setDate(thisMon.getDate() - 1);
      return { start: toYMD(lastMon), end: toYMD(lastSun) };
    }

    case "month":
    case "thismonth": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toYMD(s), end: today };
    }

    case "lastmonth": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toYMD(s), end: toYMD(e) };
    }

    case "quarter": {
      const q = Math.floor(now.getMonth() / 3);
      const s = new Date(now.getFullYear(), q * 3, 1);
      return { start: toYMD(s), end: today };
    }

    case "lastquarter": {
      const q = Math.floor(now.getMonth() / 3);
      const prevQ = q === 0 ? 3 : q - 1;
      const year = q === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const s = new Date(year, prevQ * 3, 1);
      const e = new Date(year, prevQ * 3 + 3, 0);
      return { start: toYMD(s), end: toYMD(e) };
    }

    case "thisyear": {
      const s = new Date(now.getFullYear(), 0, 1);
      return { start: toYMD(s), end: today };
    }

    case "lastyear": {
      const y = now.getFullYear() - 1;
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    }

    case "custom":
      return custom;
  }
}

export function getPreviousRange(
  preset: DatePreset,
  range: DateRange,
): DateRange {
  const now = new Date();

  switch (preset) {
    case "today": {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      const y = toYMD(d);
      return { start: y, end: y };
    }

    case "yesterday": {
      const d = new Date(now);
      d.setDate(d.getDate() - 2);
      const y = toYMD(d);
      return { start: y, end: y };
    }

    case "7days": {
      const s = new Date(now);
      s.setDate(s.getDate() - 13);
      const e = new Date(now);
      e.setDate(e.getDate() - 7);
      return { start: toYMD(s), end: toYMD(e) };
    }

    case "30days": {
      const s = new Date(now);
      s.setDate(s.getDate() - 59);
      const e = new Date(now);
      e.setDate(e.getDate() - 30);
      return { start: toYMD(s), end: toYMD(e) };
    }

    case "thisweek": {
      const dow = now.getDay();
      const diffToMon = dow === 0 ? 6 : dow - 1;
      const thisMon = new Date(now);
      thisMon.setDate(now.getDate() - diffToMon);
      const lastMon = new Date(thisMon);
      lastMon.setDate(thisMon.getDate() - 7);
      const lastSun = new Date(thisMon);
      lastSun.setDate(thisMon.getDate() - 1);
      return { start: toYMD(lastMon), end: toYMD(lastSun) };
    }

    case "lastweek": {
      const dow = now.getDay();
      const diffToMon = dow === 0 ? 6 : dow - 1;
      const thisMon = new Date(now);
      thisMon.setDate(now.getDate() - diffToMon);
      const twoWeeksAgoMon = new Date(thisMon);
      twoWeeksAgoMon.setDate(thisMon.getDate() - 14);
      const twoWeeksAgoSun = new Date(thisMon);
      twoWeeksAgoSun.setDate(thisMon.getDate() - 8);
      return { start: toYMD(twoWeeksAgoMon), end: toYMD(twoWeeksAgoSun) };
    }

    case "month":
    case "thismonth": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toYMD(s), end: toYMD(e) };
    }

    case "lastmonth": {
      const s = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const e = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      return { start: toYMD(s), end: toYMD(e) };
    }

    case "quarter": {
      const q = Math.floor(now.getMonth() / 3);
      const prevQ = q === 0 ? 3 : q - 1;
      const year = q === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const s = new Date(year, prevQ * 3, 1);
      const e = new Date(year, prevQ * 3 + 3, 0);
      return { start: toYMD(s), end: toYMD(e) };
    }

    case "lastquarter": {
      const q = Math.floor(now.getMonth() / 3);
      // 2 quarters back
      const twoBack = ((q - 2) + 4) % 4;
      const year = q < 2 ? now.getFullYear() - 1 : now.getFullYear();
      const s = new Date(year, twoBack * 3, 1);
      const e = new Date(year, twoBack * 3 + 3, 0);
      return { start: toYMD(s), end: toYMD(e) };
    }

    case "thisyear": {
      const y = now.getFullYear() - 1;
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    }

    case "lastyear": {
      const y = now.getFullYear() - 2;
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    }

    case "custom": {
      if (!range.start || !range.end) return range;
      const ms =
        new Date(range.end).getTime() - new Date(range.start).getTime();
      const days = Math.round(ms / 86_400_000) + 1;
      const s = new Date(range.start);
      s.setDate(s.getDate() - days);
      const e = new Date(range.start);
      e.setDate(e.getDate() - 1);
      return { start: toYMD(s), end: toYMD(e) };
    }
  }
}

export function useDateFilter(initialPreset: DatePreset = "7days") {
  const [preset, setPreset] = useState<DatePreset>(initialPreset);
  const [custom, setCustom] = useState<DateRange>({ start: "", end: "" });

  const range = useMemo(() => getPresetRange(preset, custom), [preset, custom]);

  const isInRange = (dateStr: string | undefined): boolean => {
    if (!dateStr) return true;
    if (!range.start || !range.end) return true;
    let normalized = dateStr;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split("/");
      normalized = `${y}-${m}-${d}`;
    }
    return normalized >= range.start && normalized <= range.end;
  };

  return { preset, setPreset, custom, setCustom, range, isInRange };
}
