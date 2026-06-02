import { useMemo } from "react";
import type { AppState } from "../store/AppStore";
import type { DateRange, DatePreset } from "./useDateFilter";
import { getPreviousRange } from "./useDateFilter";

function filterByRange(cashflows: AppState["cashflows"], range: DateRange) {
  if (!range.start || !range.end) return cashflows;
  return cashflows.filter(
    (tx) => tx.date >= range.start && tx.date <= range.end,
  );
}

function sumType(txs: AppState["cashflows"], type: "in" | "out") {
  return txs.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
}

function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

export function useAnalytics(
  state: AppState,
  preset: DatePreset,
  range: DateRange,
) {
  return useMemo(() => {
    const prevRange = getPreviousRange(preset, range);
    const currTxs = filterByRange(state.cashflows, range);
    const prevTxs = filterByRange(state.cashflows, prevRange);

    const currIncome = sumType(currTxs, "in");
    const prevIncome = sumType(prevTxs, "in");
    const currExpense = sumType(currTxs, "out");
    const prevExpense = sumType(prevTxs, "out");
    const currNet = currIncome - currExpense;
    const prevNet = prevIncome - prevExpense;

    const totalReceivable = state.receivables
      .filter((r) => r.status !== "collected")
      .reduce((s, r) => s + r.amount, 0);

    const totalPayable = state.payables
      .filter((p) => p.status !== "paid")
      .reduce((s, p) => s + p.amount, 0);

    const totalTaxDebt = state.taxes
      .filter((t) => t.status !== "paid" && t.status !== "filed")
      .reduce((s, t) => s + (t.remaining ?? 0), 0);

    const overdueReceivables = state.receivables.filter(
      (r) => r.status === "overdue",
    );
    const overduePayables = state.payables.filter(
      (p) => p.status === "overdue",
    );
    const overdueProposals = state.proposals.filter(
      (p) => p.isOverdue || p.status === "overdue",
    );
    const pendingProposals = state.proposals.filter(
      (p) => p.status === "pending",
    );
    const overdueTaxes = state.taxes.filter((t) => t.status === "overdue");

    const topDebtors = [...state.receivables]
      .filter((r) => r.status !== "collected")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const netBalance =
      state.receivables
        .filter((r) => r.status !== "collected")
        .reduce((s, r) => s + r.amount, 0) -
      state.payables
        .filter((p) => p.status !== "paid")
        .reduce((s, p) => s + p.amount, 0);

    return {
      income: {
        curr: currIncome,
        prev: prevIncome,
        pct: pctChange(currIncome, prevIncome),
        count: currTxs.filter((t) => t.type === "in").length,
      },
      expense: {
        curr: currExpense,
        prev: prevExpense,
        pct: pctChange(currExpense, prevExpense),
        count: currTxs.filter((t) => t.type === "out").length,
      },
      net: {
        curr: currNet,
        prev: prevNet,
        pct: pctChange(Math.abs(currNet), Math.abs(prevNet)),
      },
      totalReceivable,
      totalPayable,
      totalTaxDebt,
      netBalance,
      overdueReceivables,
      overduePayables,
      overdueProposals,
      pendingProposals,
      overdueTaxes,
      topDebtors,
      prevRange,
    };
  }, [state, preset, range]);
}
