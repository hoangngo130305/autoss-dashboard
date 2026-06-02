import { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Receivable, Payable, ExpenseProposal,
  TaxRecord, RiskReserve, CashFlowTransaction, BankAccount,
} from '../types/finance';

// Initial data
import { receivables as initReceivables } from '../data/receivables';
import { payables    as initPayables    } from '../data/payables';
import { expenseProposals as initProposals } from '../data/expenseProposals';
import { taxRecords  as initTaxes       } from '../data/taxRecords';
import { riskReserves as initReserves   } from '../data/riskReserve';
import { cashFlowTransactions as initCashflows } from '../data/cashFlow';
import { bankAccounts as initBankAccounts } from '../data/bankAccounts';

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  receivables:  Receivable[];
  payables:     Payable[];
  proposals:    ExpenseProposal[];
  taxes:        TaxRecord[];
  reserves:     RiskReserve[];
  cashflows:    CashFlowTransaction[];
  bankAccounts: BankAccount[];
}

const staticInitial: AppState = {
  receivables:  initReceivables,
  payables:     initPayables,
  proposals:    initProposals,
  taxes:        initTaxes,
  reserves:     initReserves,
  cashflows:    initCashflows,
  bankAccounts: initBankAccounts,
};

// ─── localStorage persistence ─────────────────────────────────────────────────

const STORAGE_KEY = 'autoss_app_state_v1';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return staticInitial;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Merge: keep static data as fallback for any missing key
    return {
      receivables:  parsed.receivables  ?? staticInitial.receivables,
      payables:     parsed.payables     ?? staticInitial.payables,
      proposals:    parsed.proposals    ?? staticInitial.proposals,
      taxes:        parsed.taxes        ?? staticInitial.taxes,
      reserves:     parsed.reserves     ?? staticInitial.reserves,
      cashflows:    parsed.cashflows    ?? staticInitial.cashflows,
      bankAccounts: parsed.bankAccounts ?? staticInitial.bankAccounts,
    };
  } catch {
    return staticInitial;
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded or private mode */ }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type AppAction =
  | { type: 'RECEIVABLE_ADD';    payload: Receivable }
  | { type: 'RECEIVABLE_UPDATE'; payload: { id: string; data: Partial<Receivable> } }
  | { type: 'RECEIVABLE_DELETE'; payload: string }

  | { type: 'PAYABLE_ADD';    payload: Payable }
  | { type: 'PAYABLE_UPDATE'; payload: { id: string; data: Partial<Payable> } }
  | { type: 'PAYABLE_DELETE'; payload: string }

  | { type: 'PROPOSAL_ADD';    payload: ExpenseProposal }
  | { type: 'PROPOSAL_UPDATE'; payload: { id: string; data: Partial<ExpenseProposal> } }
  | { type: 'PROPOSAL_DELETE'; payload: string }

  | { type: 'TAX_ADD';    payload: TaxRecord }
  | { type: 'TAX_UPDATE'; payload: { id: string; data: Partial<TaxRecord> } }
  | { type: 'TAX_DELETE'; payload: string }

  | { type: 'RESERVE_ADD';    payload: RiskReserve }
  | { type: 'RESERVE_UPDATE'; payload: { id: string; data: Partial<RiskReserve> } }
  | { type: 'RESERVE_DELETE'; payload: string }

  | { type: 'CASHFLOW_ADD';    payload: CashFlowTransaction }
  | { type: 'CASHFLOW_UPDATE'; payload: { id: string; data: Partial<CashFlowTransaction> } }
  | { type: 'CASHFLOW_DELETE'; payload: string }

  | { type: 'BANKACCOUNT_ADD';    payload: BankAccount }
  | { type: 'BANKACCOUNT_UPDATE'; payload: { id: string; data: Partial<BankAccount> } }
  | { type: 'BANKACCOUNT_DELETE'; payload: string }

  | { type: 'RESET_ALL' };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function upsert<T extends { id: string }>(arr: T[], id: string, data: Partial<T>): T[] {
  return arr.map((item) => (item.id === id ? { ...item, ...data } : item));
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'RECEIVABLE_ADD':    return { ...state, receivables: [...state.receivables, action.payload] };
    case 'RECEIVABLE_UPDATE': return { ...state, receivables: upsert(state.receivables, action.payload.id, action.payload.data) };
    case 'RECEIVABLE_DELETE': return { ...state, receivables: state.receivables.filter((r) => r.id !== action.payload) };

    case 'PAYABLE_ADD':    return { ...state, payables: [...state.payables, action.payload] };
    case 'PAYABLE_UPDATE': return { ...state, payables: upsert(state.payables, action.payload.id, action.payload.data) };
    case 'PAYABLE_DELETE': return { ...state, payables: state.payables.filter((p) => p.id !== action.payload) };

    case 'PROPOSAL_ADD':    return { ...state, proposals: [...state.proposals, action.payload] };
    case 'PROPOSAL_UPDATE': return { ...state, proposals: upsert(state.proposals, action.payload.id, action.payload.data) };
    case 'PROPOSAL_DELETE': return { ...state, proposals: state.proposals.filter((p) => p.id !== action.payload) };

    case 'TAX_ADD':    return { ...state, taxes: [...state.taxes, action.payload] };
    case 'TAX_UPDATE': return { ...state, taxes: upsert(state.taxes, action.payload.id, action.payload.data) };
    case 'TAX_DELETE': return { ...state, taxes: state.taxes.filter((t) => t.id !== action.payload) };

    case 'RESERVE_ADD':    return { ...state, reserves: [...state.reserves, action.payload] };
    case 'RESERVE_UPDATE': return { ...state, reserves: upsert(state.reserves, action.payload.id, action.payload.data) };
    case 'RESERVE_DELETE': return { ...state, reserves: state.reserves.filter((r) => r.id !== action.payload) };

    case 'CASHFLOW_ADD':    return { ...state, cashflows: [action.payload, ...state.cashflows] };
    case 'CASHFLOW_UPDATE': return { ...state, cashflows: upsert(state.cashflows, action.payload.id, action.payload.data) };
    case 'CASHFLOW_DELETE': return { ...state, cashflows: state.cashflows.filter((c) => c.id !== action.payload) };

    case 'BANKACCOUNT_ADD':    return { ...state, bankAccounts: [...state.bankAccounts, action.payload] };
    case 'BANKACCOUNT_UPDATE': return { ...state, bankAccounts: upsert(state.bankAccounts, action.payload.id, action.payload.data) };
    case 'BANKACCOUNT_DELETE': return { ...state, bankAccounts: state.bankAccounts.filter((b) => b.id !== action.payload) };

    case 'RESET_ALL': return staticInitial;

    default: return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppStoreValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  totalReceivable:    number;
  totalPayable:       number;
  pendingProposals:   number;
  totalTaxDebt:       number;
  totalReserve:       number;
  overdueReceivables: number;
  overduePayables:    number;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);

  // Persist every state change to localStorage
  useEffect(() => { saveState(state); }, [state]);

  const computed = useMemo(() => ({
    totalReceivable: state.receivables
      .filter((r) => r.status !== 'collected')
      .reduce((s, r) => s + r.amount, 0),

    totalPayable: state.payables
      .filter((p) => p.status !== 'paid')
      .reduce((s, p) => s + p.amount, 0),

    pendingProposals: state.proposals
      .filter((p) => p.status === 'pending' || p.status === 'overdue')
      .length,

    totalTaxDebt: state.taxes
      .filter((t) => t.status !== 'paid')
      .reduce((s, t) => s + (t.remaining ?? 0), 0),

    totalReserve: state.reserves
      .filter((r) => r.status !== 'withdrawn')
      .reduce((s, r) => s + r.amount, 0),

    overdueReceivables: state.receivables.filter((r) => r.status === 'overdue').length,
    overduePayables:    state.payables.filter((p) => p.status === 'overdue').length,
  }), [state]);

  return (
    <AppStoreContext.Provider value={{ state, dispatch, ...computed }}>
      {children}
    </AppStoreContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useStore must be inside AppStoreProvider');
  return ctx;
}

export type { AppState, AppAction };
