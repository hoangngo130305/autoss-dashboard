// ─── Status enums ───────────────────────────────────────────────────────────

export type ReceivableStatus = 'overdue' | 'waiting_payment' | 'waiting_contract' | 'collected';
export type PayableStatus    = 'overdue' | 'waiting_update' | 'paid' | 'approved';
export type ProposalStatus   = 'pending' | 'overdue' | 'approved' | 'rejected';
export type TaxStatus        = 'pending' | 'waiting' | 'overdue' | 'paid' | 'filed';
export type RiskStatus       = 'approaching' | 'safe' | 'withdrawn';
export type CashFlowType     = 'in' | 'out';
export type AccentColor      = 'blue' | 'green' | 'red' | 'amber' | 'indigo';

// ─── Bank accounts ──────────────────────────────────────────────────────────

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  balance: number;
  percentage: number;
  color: AccentColor;
}

// ─── Receivables ─────────────────────────────────────────────────────────────

export interface Receivable {
  id: string;
  customer: string;
  project: string;
  contact: string;
  department: string;
  departmentColor: string;
  amount: number;
  status: ReceivableStatus;
  dueDate?: string;
  note?: string;
}

// ─── Payables ────────────────────────────────────────────────────────────────

export interface Payable {
  id: string;
  supplier: string;
  contract: string;
  department: string;
  departmentColor: string;
  amount: number;
  status: PayableStatus;
  responsiblePerson?: string;
  dueDate?: string;
  note?: string;
}

// ─── Expense proposals ───────────────────────────────────────────────────────

export interface ExpenseProposal {
  id: string;
  department: string;
  departmentColor: string;
  description: string;
  plannedDate: string;
  isOverdue: boolean;
  status: ProposalStatus;
  amount?: number;
  modalKey?: string;
  note?: string;
}

// ─── Tax records ─────────────────────────────────────────────────────────────

export interface TaxRecord {
  id: string;
  company: string;
  period: string;
  taxType: string;
  required: number | null;
  paid: number | null;
  remaining: number | null;
  status: TaxStatus;
  dueDate?: string;
}

// ─── Cash-flow ───────────────────────────────────────────────────────────────

/** Aggregated daily summary (used for the chart) */
export interface CashFlowDay {
  date: string;
  income: number;
  expense: number;
}

/** Individual transaction record (used for the table) */
export interface CashFlowTransaction {
  id: string;
  date: string;        // 'YYYY-MM-DD'
  type: CashFlowType;
  amount: number;
  description: string;
  account: string;     // 'ACB', 'VCB', 'MB', 'EXIM', 'CASH'
  department: string;
}

// ─── Risk reserve ────────────────────────────────────────────────────────────

export interface RiskReserve {
  id: string;
  depositDate: string;
  amount: number;
  expiryDate: string;
  notes: string;
  status: RiskStatus;
}

// ─── Modal helper ────────────────────────────────────────────────────────────

export interface ModalData {
  title: string;
  subtitle: string;
  rows: Array<[string, string]>;
  showApprove: boolean;
}
