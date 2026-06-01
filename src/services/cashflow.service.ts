import type {
  CashFlowTransaction,
  CashFlowDay,
  CashFlowType,
} from "../types/finance";
import { generateId, parseAmount } from "../utils/helpers";

export interface CashFlowFormData {
  date: string;
  type: CashFlowType;
  amount: string;
  description: string;
  account: string;
  department: string;
}

export function validateCashFlow(
  data: Partial<CashFlowFormData>,
): string | null {
  if (!data.date) return "Ngày là bắt buộc";
  if (!data.description?.trim()) return "Diễn giải là bắt buộc";
  if (!data.account?.trim()) return "Tài khoản là bắt buộc";
  if (!data.department?.trim()) return "Phòng ban là bắt buộc";
  const amt = parseAmount(data.amount ?? "");
  if (amt <= 0) return "Số tiền phải lớn hơn 0";
  return null;
}

export function buildCashFlowTransaction(
  data: CashFlowFormData,
  existingId?: string,
): CashFlowTransaction {
  return {
    id: existingId ?? generateId(),
    date: data.date,
    type: data.type,
    amount: parseAmount(data.amount),
    description: data.description.trim(),
    account: data.account,
    department: data.department,
  };
}

/** Aggregate individual transactions into daily summaries for the chart */
export function aggregateToDays(
  transactions: CashFlowTransaction[],
): CashFlowDay[] {
  const map = new Map<string, { income: number; expense: number }>();

  for (const tx of transactions) {
    const [, m, d] = tx.date.split("-");
    const label = `${d}/${m}`;
    const cur = map.get(label) ?? { income: 0, expense: 0 };
    if (tx.type === "in") cur.income += tx.amount;
    else cur.expense += tx.amount;
    map.set(label, cur);
  }

  // Return sorted chronologically by the original date key
  return [...map.entries()]
    .sort(([a], [b]) => {
      const [da, ma] = a.split("/").map(Number);
      const [db, mb] = b.split("/").map(Number);
      return ma !== mb ? ma - mb : da - db;
    })
    .map(([date, { income, expense }]) => ({ date, income, expense }));
}

export const ACCOUNT_OPTIONS = [
  { value: "ACB", label: "ACB – AUTOSS" },
  { value: "VCB", label: "VCB – AUTOSS" },
  { value: "EXIM", label: "EXIMBANK" },
  { value: "MB", label: "MB BANK" },
  { value: "SX", label: "SX AUTOSS" },
  { value: "CASH", label: "Tiền mặt" },
];
