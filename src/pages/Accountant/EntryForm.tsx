import { useState, useMemo, useEffect, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  ChevronUp,
  Search,
} from "lucide-react";
import clsx from "clsx";
import { useStore } from "../../store/AppStore";
import { useToast } from "../../hooks/useToast";
import { usePagination } from "../../hooks/usePagination";
import { useDateFilter } from "../../hooks/useDateFilter";
import type { DatePreset } from "../../hooks/useDateFilter";
import { Badge } from "../../components/common/Badge";
import { Pagination } from "../../components/common/Pagination";
import { formatCurrency, formatShortCurrency } from "../../utils/formatters";
import type {
  Receivable,
  Payable,
  CashFlowTransaction,
  ExpenseProposal,
} from "../../types/finance";

// ─── Constants ────────────────────────────────────────────────────────────────

type Module = "cashflow" | "receivable" | "payable" | "proposal";

const MODULE_TABS: { id: Module; label: string }[] = [
  { id: "cashflow", label: "Dòng tiền" },
  { id: "receivable", label: "Phải thu" },
  { id: "payable", label: "Phải trả" },
  { id: "proposal", label: "Đề xuất chi phí" },
];

const DEPARTMENTS = [
  "XƯỞNG",
  "KHO",
  "KẾ TOÁN",
  "ĐIỆN",
  "ROBOT",
  "KỸ THUẬT",
  "KINH DOANH",
];
const DEPT_COLORS: Record<string, string> = {
  XƯỞNG: "amber",
  KHO: "blue",
  "KẾ TOÁN": "green",
  ĐIỆN: "indigo",
  ROBOT: "violet",
  "KỸ THUẬT": "rose",
  "KINH DOANH": "emerald",
};
const ACCOUNTS = ["ACB", "VCB", "MB", "EXIM", "CASH"];

const REC_STATUS_OPTIONS = [
  { value: "waiting_payment", label: "Chờ thanh toán" },
  { value: "waiting_contract", label: "Chờ hợp đồng" },
  { value: "overdue", label: "Quá hạn" },
  { value: "collected", label: "Đã thu" },
];
const PAY_STATUS_OPTIONS = [
  { value: "waiting_update", label: "Chờ cập nhật" },
  { value: "approved", label: "Đã duyệt" },
  { value: "overdue", label: "Quá hạn" },
  { value: "paid", label: "Đã thanh toán" },
];
const PROP_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "overdue", label: "Quá hạn" },
  { value: "rejected", label: "Từ chối" },
];

const DATE_FILTER_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Hôm nay" },
  { id: "thisweek", label: "Tuần này" },
  { id: "thismonth", label: "Tháng này" },
  { id: "quarter", label: "Quý này" },
  { id: "thisyear", label: "Năm này" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toInputDate(s: string | undefined): string {
  if (!s) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split("/");
    return `${y}-${m}-${d}`;
  }
  return s;
}

function toDisplayDate(s: string | undefined): string {
  if (!s) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
  }
  return s;
}

function StatusBadge({
  status,
  isOverdue,
}: {
  status: string;
  isOverdue?: boolean;
}) {
  if (isOverdue || status === "overdue")
    return <Badge variant="overdue">QUÁ HẠN</Badge>;
  switch (status) {
    case "collected":
    case "paid":
      return <Badge variant="ok">ĐÃ XONG</Badge>;
    case "approved":
      return <Badge variant="ok">ĐÃ DUYỆT</Badge>;
    case "pending":
    case "waiting_payment":
      return <Badge variant="waiting">CHỜ DUYỆT</Badge>;
    case "waiting_contract":
      return <Badge variant="neutral">CHỜ HĐ</Badge>;
    case "waiting_update":
      return <Badge variant="neutral">CHỜ CẬP NHẬT</Badge>;
    case "rejected":
      return <Badge variant="overdue">TỪ CHỐI</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

// ─── UI primitives ────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-surface-3 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 transition-all";
const selectCls = `${inputCls} cursor-pointer`;

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-ink-2 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-2 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 sticky top-0 bg-surface-2 z-10">
          <h3 className="text-[14px] font-semibold text-ink-1">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-3 hover:text-ink-1 hover:bg-surface-3 transition-all"
          >
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Shared form fields ───────────────────────────────────────────────────────

type RecForm = {
  customer: string;
  project: string;
  contact: string;
  department: string;
  amount: string;
  dueDate: string;
  note: string;
  status: string;
};
type PayForm = {
  supplier: string;
  contract: string;
  department: string;
  amount: string;
  responsiblePerson: string;
  dueDate: string;
  note: string;
  status: string;
};
type CfForm = {
  date: string;
  type: "in" | "out";
  amount: string;
  description: string;
  account: string;
  department: string;
};
type PropForm = {
  department: string;
  description: string;
  plannedDate: string;
  amount: string;
  note: string;
  status: string;
  isOverdue: boolean;
};

function RecFields({
  form,
  set,
  withStatus,
}: {
  form: RecForm;
  set: (f: RecForm) => void;
  withStatus?: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Tên khách hàng" required>
          <input
            className={inputCls}
            required
            placeholder="Tên KH"
            value={form.customer}
            onChange={(e) => set({ ...form, customer: e.target.value })}
          />
        </Field>
        <Field label="Dự án / Lý do" required>
          <input
            className={inputCls}
            required
            placeholder="Dự án"
            value={form.project}
            onChange={(e) => set({ ...form, project: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Người liên hệ">
          <input
            className={inputCls}
            placeholder="Anh/Chị..."
            value={form.contact}
            onChange={(e) => set({ ...form, contact: e.target.value })}
          />
        </Field>
        <Field label="Phòng phụ trách" required>
          <select
            className={selectCls}
            value={form.department}
            onChange={(e) => set({ ...form, department: e.target.value })}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Số tiền (triệu đồng)" required>
          <input
            type="number"
            min={0}
            className={inputCls}
            required
            placeholder="0"
            value={form.amount}
            onChange={(e) => set({ ...form, amount: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ngày đến hạn">
          <input
            type="date"
            className={inputCls}
            value={form.dueDate}
            onChange={(e) => set({ ...form, dueDate: e.target.value })}
          />
        </Field>
        {withStatus ? (
          <Field label="Trạng thái">
            <select
              className={selectCls}
              value={form.status}
              onChange={(e) => set({ ...form, status: e.target.value })}
            >
              {REC_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Ghi chú">
            <input
              className={inputCls}
              placeholder="Ghi chú..."
              value={form.note}
              onChange={(e) => set({ ...form, note: e.target.value })}
            />
          </Field>
        )}
      </div>
      {withStatus && (
        <Field label="Ghi chú">
          <input
            className={inputCls}
            placeholder="Ghi chú..."
            value={form.note}
            onChange={(e) => set({ ...form, note: e.target.value })}
          />
        </Field>
      )}
    </>
  );
}

function PayFields({
  form,
  set,
  withStatus,
}: {
  form: PayForm;
  set: (f: PayForm) => void;
  withStatus?: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nhà cung cấp" required>
          <input
            className={inputCls}
            required
            placeholder="Tên NCC"
            value={form.supplier}
            onChange={(e) => set({ ...form, supplier: e.target.value })}
          />
        </Field>
        <Field label="Mã hợp đồng">
          <input
            className={inputCls}
            placeholder="HĐ-2026-..."
            value={form.contract}
            onChange={(e) => set({ ...form, contract: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Phòng phụ trách" required>
          <select
            className={selectCls}
            value={form.department}
            onChange={(e) => set({ ...form, department: e.target.value })}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Người phụ trách">
          <input
            className={inputCls}
            placeholder="Anh/Chị..."
            value={form.responsiblePerson}
            onChange={(e) =>
              set({ ...form, responsiblePerson: e.target.value })
            }
          />
        </Field>
        <Field label="Số tiền (triệu đồng)" required>
          <input
            type="number"
            min={0}
            className={inputCls}
            required
            placeholder="0"
            value={form.amount}
            onChange={(e) => set({ ...form, amount: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ngày đến hạn">
          <input
            type="date"
            className={inputCls}
            value={form.dueDate}
            onChange={(e) => set({ ...form, dueDate: e.target.value })}
          />
        </Field>
        {withStatus ? (
          <Field label="Trạng thái">
            <select
              className={selectCls}
              value={form.status}
              onChange={(e) => set({ ...form, status: e.target.value })}
            >
              {PAY_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Ghi chú">
            <input
              className={inputCls}
              placeholder="Ghi chú..."
              value={form.note}
              onChange={(e) => set({ ...form, note: e.target.value })}
            />
          </Field>
        )}
      </div>
      {withStatus && (
        <Field label="Ghi chú">
          <input
            className={inputCls}
            placeholder="Ghi chú..."
            value={form.note}
            onChange={(e) => set({ ...form, note: e.target.value })}
          />
        </Field>
      )}
    </>
  );
}

function CfFields({
  form,
  set,
}: {
  form: CfForm;
  set: (f: CfForm) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Ngày giao dịch" required>
          <input
            type="date"
            className={inputCls}
            required
            value={form.date}
            onChange={(e) => set({ ...form, date: e.target.value })}
          />
        </Field>
        <Field label="Loại" required>
          <select
            className={selectCls}
            value={form.type}
            onChange={(e) =>
              set({ ...form, type: e.target.value as "in" | "out" })
            }
          >
            <option value="in">Thu vào</option>
            <option value="out">Chi ra</option>
          </select>
        </Field>
        <Field label="Số tiền (triệu đồng)" required>
          <input
            type="number"
            min={0}
            className={inputCls}
            required
            placeholder="0"
            value={form.amount}
            onChange={(e) => set({ ...form, amount: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Diễn giải" required>
          <input
            className={inputCls}
            required
            placeholder="Mô tả giao dịch..."
            value={form.description}
            onChange={(e) => set({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Tài khoản" required>
          <select
            className={selectCls}
            value={form.account}
            onChange={(e) => set({ ...form, account: e.target.value })}
          >
            {ACCOUNTS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Phòng ban">
        <select
          className={selectCls}
          value={form.department}
          onChange={(e) => set({ ...form, department: e.target.value })}
        >
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
    </>
  );
}

function PropFields({
  form,
  set,
  withStatus,
}: {
  form: PropForm;
  set: (f: PropForm) => void;
  withStatus?: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phòng ban" required>
          <select
            className={selectCls}
            value={form.department}
            onChange={(e) => set({ ...form, department: e.target.value })}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Ngày dự kiến chi" required>
          <input
            type="date"
            className={inputCls}
            required
            value={form.plannedDate}
            onChange={(e) => set({ ...form, plannedDate: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Diễn giải nội dung" required>
        <input
          className={inputCls}
          required
          placeholder="Mô tả đề xuất..."
          value={form.description}
          onChange={(e) => set({ ...form, description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Số tiền dự kiến (triệu)">
          <input
            type="number"
            min={0}
            className={inputCls}
            placeholder="0"
            value={form.amount}
            onChange={(e) => set({ ...form, amount: e.target.value })}
          />
        </Field>
        <Field label="Ghi chú">
          <input
            className={inputCls}
            placeholder="Ghi chú..."
            value={form.note}
            onChange={(e) => set({ ...form, note: e.target.value })}
          />
        </Field>
      </div>
      {withStatus && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Trạng thái">
            <select
              className={selectCls}
              value={form.status}
              onChange={(e) => set({ ...form, status: e.target.value })}
            >
              {PROP_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Đánh dấu quá hạn">
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-red-400 w-4 h-4"
                checked={form.isOverdue}
                onChange={(e) => set({ ...form, isOverdue: e.target.checked })}
              />
              <span className="text-[12px] text-ink-2">Quá hạn</span>
            </label>
          </Field>
        </div>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const REC_DEFAULTS: RecForm = {
  customer: "",
  project: "",
  contact: "",
  department: "KỸ THUẬT",
  amount: "",
  dueDate: "",
  note: "",
  status: "waiting_payment",
};
const PAY_DEFAULTS: PayForm = {
  supplier: "",
  contract: "",
  department: "KHO",
  amount: "",
  responsiblePerson: "",
  dueDate: "",
  note: "",
  status: "waiting_update",
};
const CF_DEFAULTS: CfForm = {
  date: "",
  type: "in",
  amount: "",
  description: "",
  account: "ACB",
  department: "KINH DOANH",
};
const PROP_DEFAULTS: PropForm = {
  department: "XƯỞNG",
  description: "",
  plannedDate: "",
  amount: "",
  note: "",
  status: "pending",
  isOverdue: false,
};

export default function EntryForm() {
  const [searchParams] = useSearchParams();
  const [module, setModule] = useState<Module>(
    (searchParams.get("module") as Module) ?? "cashflow",
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "in" | "out">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const PAGE_SIZE = 10;

  const { state, dispatch } = useStore();
  const { showToast } = useToast();
  const { preset, setPreset, isInRange } = useDateFilter("thismonth");

  // Modal state
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);

  // Add form state
  const [recForm, setRecForm] = useState<RecForm>(REC_DEFAULTS);
  const [payForm, setPayForm] = useState<PayForm>(PAY_DEFAULTS);
  const [cfForm, setCfForm] = useState<CfForm>(CF_DEFAULTS);
  const [propForm, setPropForm] = useState<PropForm>(PROP_DEFAULTS);

  // Edit form state
  const [editRec, setEditRec] = useState<RecForm>(REC_DEFAULTS);
  const [editPay, setEditPay] = useState<PayForm>(PAY_DEFAULTS);
  const [editCf, setEditCf] = useState<CfForm>(CF_DEFAULTS);
  const [editProp, setEditProp] = useState<PropForm>(PROP_DEFAULTS);

  // Close modals on module switch
  useEffect(() => {
    setEditTarget(null);
    setDeleteTarget(null);
    setDetailTarget(null);
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  }, [module]);

  // ── Status options per module ─────────────────────────────────────────────
  const statusOptions = useMemo(() => {
    const all = { value: "all", label: "Tất cả" };
    if (module === "receivable") return [all, ...REC_STATUS_OPTIONS];
    if (module === "payable") return [all, ...PAY_STATUS_OPTIONS];
    if (module === "proposal") return [all, ...PROP_STATUS_OPTIONS];
    return [];
  }, [module]);

  // ── Filtered data ─────────────────────────────────────────────────────────
  type AnyRecord =
    | CashFlowTransaction
    | Receivable
    | Payable
    | ExpenseProposal;

  const filtered = useMemo((): AnyRecord[] => {
    let list: AnyRecord[] = [];
    switch (module) {
      case "cashflow":
        list = state.cashflows ?? [];
        break;
      case "receivable":
        list = state.receivables ?? [];
        break;
      case "payable":
        list = state.payables ?? [];
        break;
      case "proposal":
        list = state.proposals ?? [];
        break;
    }

    // Date filter
    list = list.filter((item) => {
      if (module === "cashflow")
        return isInRange((item as CashFlowTransaction).date);
      if (module === "receivable")
        return isInRange((item as Receivable).dueDate);
      if (module === "payable") return isInRange((item as Payable).dueDate);
      if (module === "proposal")
        return isInRange((item as ExpenseProposal).plannedDate);
      return true;
    });

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((item) => {
        if (module === "cashflow") {
          const tx = item as CashFlowTransaction;
          return (
            tx.description.toLowerCase().includes(q) ||
            tx.account.toLowerCase().includes(q) ||
            tx.department.toLowerCase().includes(q)
          );
        }
        if (module === "receivable") {
          const r = item as Receivable;
          return (
            r.customer.toLowerCase().includes(q) ||
            r.project.toLowerCase().includes(q) ||
            (r.note?.toLowerCase().includes(q) ?? false)
          );
        }
        if (module === "payable") {
          const p = item as Payable;
          return (
            p.supplier.toLowerCase().includes(q) ||
            (p.contract?.toLowerCase().includes(q) ?? false)
          );
        }
        if (module === "proposal") {
          const p = item as ExpenseProposal;
          return (
            p.description.toLowerCase().includes(q) ||
            p.department.toLowerCase().includes(q)
          );
        }
        return true;
      });
    }

    // Type filter (cashflow only)
    if (module === "cashflow" && typeFilter !== "all") {
      list = list.filter(
        (item) => (item as CashFlowTransaction).type === typeFilter,
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((item) => {
        const rec = item as Receivable | Payable | ExpenseProposal;
        return rec.status === statusFilter;
      });
    }

    return list;
  }, [module, state, isInRange, search, typeFilter, statusFilter]);

  const { page, totalPages, paged, goTo } = usePagination(
    filtered,
    PAGE_SIZE,
  );

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (module === "cashflow") {
      const txs = filtered as CashFlowTransaction[];
      const thu = txs
        .filter((t) => t.type === "in")
        .reduce((s, t) => s + t.amount, 0);
      const chi = txs
        .filter((t) => t.type === "out")
        .reduce((s, t) => s + t.amount, 0);
      return [
        {
          label: "Giao dịch",
          value: `${txs.length}`,
          color: "text-blue-400",
        },
        {
          label: "Tổng thu",
          value: formatShortCurrency(thu),
          color: "text-emerald-400",
        },
        {
          label: "Tổng chi",
          value: formatShortCurrency(chi),
          color: "text-red-400",
        },
        {
          label: "Ròng",
          value: `${thu - chi >= 0 ? "+" : ""}${formatShortCurrency(thu - chi)}`,
          color: thu - chi >= 0 ? "text-emerald-400" : "text-red-400",
        },
      ];
    }
    if (module === "receivable") {
      const recs = filtered as Receivable[];
      const total = recs.reduce((s, r) => s + r.amount, 0);
      const overdue = recs.filter((r) => r.status === "overdue").length;
      return [
        { label: "Khoản", value: `${recs.length}`, color: "text-blue-400" },
        {
          label: "Tổng phải thu",
          value: formatShortCurrency(total),
          color: "text-emerald-400",
        },
        {
          label: "Quá hạn",
          value: `${overdue}`,
          color: overdue > 0 ? "text-red-400" : "text-ink-3",
        },
      ];
    }
    if (module === "payable") {
      const pays = filtered as Payable[];
      const total = pays.reduce((s, p) => s + p.amount, 0);
      const overdue = pays.filter((p) => p.status === "overdue").length;
      return [
        { label: "Khoản", value: `${pays.length}`, color: "text-blue-400" },
        {
          label: "Tổng phải trả",
          value: formatShortCurrency(total),
          color: "text-red-400",
        },
        {
          label: "Quá hạn",
          value: `${overdue}`,
          color: overdue > 0 ? "text-red-400" : "text-ink-3",
        },
      ];
    }
    // proposal
    const props = filtered as ExpenseProposal[];
    const total = props.reduce((s, p) => s + (p.amount ?? 0), 0);
    const pending = props.filter((p) => p.status === "pending").length;
    const overdue = props.filter((p) => p.isOverdue).length;
    return [
      { label: "Đề xuất", value: `${props.length}`, color: "text-blue-400" },
      {
        label: "Tổng tiền",
        value: formatShortCurrency(total),
        color: "text-amber-400",
      },
      {
        label: "Chờ duyệt",
        value: `${pending}`,
        color: "text-amber-400",
      },
      {
        label: "Quá hạn",
        value: `${overdue}`,
        color: overdue > 0 ? "text-red-400" : "text-ink-3",
      },
    ];
  }, [filtered, module]);

  // ── Handlers: Add ─────────────────────────────────────────────────────────
  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (module === "receivable") {
      dispatch({
        type: "RECEIVABLE_ADD",
        payload: {
          id: uid(),
          customer: recForm.customer,
          project: recForm.project,
          contact: recForm.contact,
          department: recForm.department,
          departmentColor: DEPT_COLORS[recForm.department] ?? "blue",
          amount: Number(recForm.amount) * 1_000_000,
          status: "waiting_payment",
          dueDate: recForm.dueDate,
          note: recForm.note,
        },
      });
      setRecForm(REC_DEFAULTS);
    }
    if (module === "payable") {
      dispatch({
        type: "PAYABLE_ADD",
        payload: {
          id: uid(),
          supplier: payForm.supplier,
          contract: payForm.contract,
          department: payForm.department,
          departmentColor: DEPT_COLORS[payForm.department] ?? "blue",
          amount: Number(payForm.amount) * 1_000_000,
          status: "waiting_update",
          responsiblePerson: payForm.responsiblePerson,
          dueDate: payForm.dueDate,
          note: payForm.note,
        },
      });
      setPayForm(PAY_DEFAULTS);
    }
    if (module === "cashflow") {
      dispatch({
        type: "CASHFLOW_ADD",
        payload: {
          id: uid(),
          date: cfForm.date,
          type: cfForm.type,
          amount: Number(cfForm.amount) * 1_000_000,
          description: cfForm.description,
          account: cfForm.account,
          department: cfForm.department,
        },
      });
      setCfForm(CF_DEFAULTS);
    }
    if (module === "proposal") {
      dispatch({
        type: "PROPOSAL_ADD",
        payload: {
          id: uid(),
          department: propForm.department,
          departmentColor: DEPT_COLORS[propForm.department] ?? "blue",
          description: propForm.description,
          plannedDate: propForm.plannedDate,
          isOverdue: false,
          status: "pending",
          amount: propForm.amount
            ? Number(propForm.amount) * 1_000_000
            : undefined,
          note: propForm.note,
        },
      });
      setPropForm(PROP_DEFAULTS);
    }
    showToast("Đã lưu bản ghi thành công!", "success");
    setShowAddForm(false);
  };

  // ── Handlers: Edit ────────────────────────────────────────────────────────
  const handleOpenEdit = (id: string) => {
    setDetailTarget(null);
    setEditTarget(id);
    if (module === "receivable") {
      const r = state.receivables.find((x) => x.id === id);
      if (r)
        setEditRec({
          customer: r.customer,
          project: r.project,
          contact: r.contact ?? "",
          department: r.department,
          amount: String(r.amount / 1_000_000),
          dueDate: toInputDate(r.dueDate),
          note: r.note ?? "",
          status: r.status,
        });
    }
    if (module === "payable") {
      const p = state.payables.find((x) => x.id === id);
      if (p)
        setEditPay({
          supplier: p.supplier,
          contract: p.contract ?? "",
          department: p.department,
          amount: String(p.amount / 1_000_000),
          responsiblePerson: p.responsiblePerson ?? "",
          dueDate: toInputDate(p.dueDate),
          note: p.note ?? "",
          status: p.status,
        });
    }
    if (module === "cashflow") {
      const tx = state.cashflows.find((x) => x.id === id);
      if (tx)
        setEditCf({
          date: tx.date,
          type: tx.type,
          amount: String(tx.amount / 1_000_000),
          description: tx.description,
          account: tx.account,
          department: tx.department,
        });
    }
    if (module === "proposal") {
      const p = state.proposals.find((x) => x.id === id);
      if (p)
        setEditProp({
          department: p.department,
          description: p.description,
          plannedDate: toInputDate(p.plannedDate),
          amount: p.amount ? String(p.amount / 1_000_000) : "",
          note: p.note ?? "",
          status: p.status,
          isOverdue: p.isOverdue,
        });
    }
  };

  const handleEditSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (module === "receivable") {
      dispatch({
        type: "RECEIVABLE_UPDATE",
        payload: {
          id: editTarget,
          data: {
            customer: editRec.customer,
            project: editRec.project,
            contact: editRec.contact,
            department: editRec.department,
            departmentColor: DEPT_COLORS[editRec.department] ?? "blue",
            amount: Number(editRec.amount) * 1_000_000,
            dueDate: editRec.dueDate,
            note: editRec.note,
            status: editRec.status as Receivable["status"],
          },
        },
      });
    }
    if (module === "payable") {
      dispatch({
        type: "PAYABLE_UPDATE",
        payload: {
          id: editTarget,
          data: {
            supplier: editPay.supplier,
            contract: editPay.contract,
            department: editPay.department,
            departmentColor: DEPT_COLORS[editPay.department] ?? "blue",
            amount: Number(editPay.amount) * 1_000_000,
            responsiblePerson: editPay.responsiblePerson,
            dueDate: editPay.dueDate,
            note: editPay.note,
            status: editPay.status as Payable["status"],
          },
        },
      });
    }
    if (module === "cashflow") {
      dispatch({
        type: "CASHFLOW_UPDATE",
        payload: {
          id: editTarget,
          data: {
            date: editCf.date,
            type: editCf.type,
            amount: Number(editCf.amount) * 1_000_000,
            description: editCf.description,
            account: editCf.account,
            department: editCf.department,
          },
        },
      });
    }
    if (module === "proposal") {
      dispatch({
        type: "PROPOSAL_UPDATE",
        payload: {
          id: editTarget,
          data: {
            department: editProp.department,
            description: editProp.description,
            plannedDate: editProp.plannedDate,
            departmentColor: DEPT_COLORS[editProp.department] ?? "blue",
            amount: editProp.amount
              ? Number(editProp.amount) * 1_000_000
              : undefined,
            note: editProp.note,
            status: editProp.status as ExpenseProposal["status"],
            isOverdue: editProp.isOverdue,
          },
        },
      });
    }
    showToast("Đã cập nhật thành công!", "success");
    setEditTarget(null);
  };

  // ── Handlers: Delete ──────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    switch (module) {
      case "receivable":
        dispatch({ type: "RECEIVABLE_DELETE", payload: deleteTarget });
        break;
      case "payable":
        dispatch({ type: "PAYABLE_DELETE", payload: deleteTarget });
        break;
      case "cashflow":
        dispatch({ type: "CASHFLOW_DELETE", payload: deleteTarget });
        break;
      case "proposal":
        dispatch({ type: "PROPOSAL_DELETE", payload: deleteTarget });
        break;
    }
    showToast("Đã xóa bản ghi!", "success");
    setDeleteTarget(null);
  };

  // ── Detail item ───────────────────────────────────────────────────────────
  const detailItem = useMemo(() => {
    if (!detailTarget) return null;
    switch (module) {
      case "cashflow":
        return state.cashflows.find((x) => x.id === detailTarget) ?? null;
      case "receivable":
        return state.receivables.find((x) => x.id === detailTarget) ?? null;
      case "payable":
        return state.payables.find((x) => x.id === detailTarget) ?? null;
      case "proposal":
        return state.proposals.find((x) => x.id === detailTarget) ?? null;
    }
  }, [detailTarget, module, state]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface-1 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/ke-toan"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 text-ink-2 hover:text-ink-1 hover:bg-surface-3 transition-all"
          >
            <ArrowLeft size={14} />
          </Link>
          <div>
            <h1 className="text-[15px] font-semibold text-ink-1">
              Quản lý dữ liệu
            </h1>
            <p className="text-[11px] text-ink-3">
              Nhập liệu · Xem · Sửa · Xóa · Lưu localStorage
            </p>
          </div>
        </div>

        {/* Module tabs */}
        <div className="flex gap-1 bg-surface-2 border border-white/8 rounded-xl p-1">
          {MODULE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setModule(tab.id)}
              className={clsx(
                "flex-1 text-[11px] sm:text-[12px] font-medium py-2 px-2 rounded-lg transition-all",
                module === tab.id
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-ink-3 hover:text-ink-2 hover:bg-surface-3",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add form toggle + button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={clsx(
            "flex items-center gap-2 text-[12px] font-medium px-4 py-2.5 rounded-xl border transition-all",
            showAddForm
              ? "bg-surface-3 border-white/10 text-ink-2"
              : "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/15",
          )}
        >
          {showAddForm ? <ChevronUp size={13} /> : <Plus size={13} />}
          {showAddForm ? "Đóng form nhập" : "Thêm bản ghi mới"}
        </button>

        {/* Add form */}
        {showAddForm && (
          <div className="bg-surface-2 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/7">
              <p className="text-[12px] font-semibold text-ink-1">
                Thêm mới —{" "}
                {MODULE_TABS.find((t) => t.id === module)?.label}
              </p>
            </div>
            <form onSubmit={handleAdd} className="px-5 py-5 space-y-4">
              {module === "receivable" && (
                <RecFields form={recForm} set={setRecForm} />
              )}
              {module === "payable" && (
                <PayFields form={payForm} set={setPayForm} />
              )}
              {module === "cashflow" && (
                <CfFields form={cfForm} set={setCfForm} />
              )}
              {module === "proposal" && (
                <PropFields form={propForm} set={setPropForm} />
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-all"
                >
                  <Save size={14} /> Lưu bản ghi
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-[13px] text-ink-3 hover:text-ink-1 px-4 py-2.5 rounded-lg border border-white/8 hover:bg-surface-3 transition-all"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-surface-2 border border-white/7 rounded-xl px-4 py-3"
            >
              <p className="text-[10px] text-ink-3 font-medium mb-1">
                {s.label}
              </p>
              <p className={clsx("font-mono text-[15px] font-semibold", s.color)}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[180px] max-w-xs">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none">
              <Search size={12} />
            </span>
            <input
              className="w-full bg-surface-2 border border-white/8 rounded-lg pl-7 pr-3 py-2 text-[12px] text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-blue-500/40"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                goTo(1);
              }}
            />
          </div>

          {/* Date presets */}
          <div className="flex gap-1 flex-wrap">
            {DATE_FILTER_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPreset(p.id);
                  goTo(1);
                }}
                className={clsx(
                  "text-[11px] px-2.5 py-1.5 rounded-lg border transition-all font-medium",
                  preset === p.id
                    ? "bg-blue-500/15 text-blue-400 border-blue-500/25"
                    : "text-ink-3 border-white/8 hover:bg-surface-3 hover:text-ink-2",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Type filter (cashflow) */}
          {module === "cashflow" && (
            <div className="flex gap-1">
              {(["all", "in", "out"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTypeFilter(t);
                    goTo(1);
                  }}
                  className={clsx(
                    "text-[11px] px-2.5 py-1.5 rounded-lg border transition-all font-medium",
                    typeFilter === t
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                      : "text-ink-3 border-white/8 hover:bg-surface-3 hover:text-ink-2",
                  )}
                >
                  {t === "all" ? "Tất cả" : t === "in" ? "Thu" : "Chi"}
                </button>
              ))}
            </div>
          )}

          {/* Status filter */}
          {statusOptions.length > 0 && (
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                goTo(1);
              }}
              className="bg-surface-2 border border-white/8 rounded-lg px-2.5 py-1.5 text-[11px] text-ink-2 focus:outline-none focus:border-blue-500/40 cursor-pointer"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}

          <span className="ml-auto text-[11px] text-ink-3">
            {filtered.length} kết quả
          </span>
        </div>

        {/* Data table */}
        <div className="bg-surface-2 border border-white/8 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-white/10 bg-surface-3">
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 w-9">
                    #
                  </th>
                  {module === "cashflow" && (
                    <>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Ngày
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3">
                        Loại
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Số tiền
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3">
                        Diễn giải
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3">
                        TK
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Phòng ban
                      </th>
                    </>
                  )}
                  {module === "receivable" && (
                    <>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Khách hàng
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3">
                        Dự án
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Phòng ban
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Số tiền
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Hạn TT
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3">
                        Trạng thái
                      </th>
                    </>
                  )}
                  {module === "payable" && (
                    <>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Nhà cung cấp
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3">
                        Hợp đồng
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Phòng ban
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Số tiền
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Hạn TT
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3">
                        Trạng thái
                      </th>
                    </>
                  )}
                  {module === "proposal" && (
                    <>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Phòng ban
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3">
                        Diễn giải
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Số tiền
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                        Ngày KH
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-3">
                        Trạng thái
                      </th>
                    </>
                  )}
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-[12px] text-ink-3"
                    >
                      Không có dữ liệu trong kỳ đã chọn
                    </td>
                  </tr>
                )}
                {paged.map((item, i) => {
                  const idx = (page - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 hover:bg-surface-3 transition-colors"
                    >
                      <td className="px-3 py-2.5 font-mono text-[11px] text-ink-3">
                        {String(idx).padStart(2, "0")}
                      </td>

                      {module === "cashflow" &&
                        (() => {
                          const tx = item as CashFlowTransaction;
                          return (
                            <>
                              <td className="px-3 py-2.5 font-mono text-[11px] text-ink-3 whitespace-nowrap">
                                {toDisplayDate(tx.date)}
                              </td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={clsx(
                                    "text-[11px] font-semibold",
                                    tx.type === "in"
                                      ? "text-emerald-400"
                                      : "text-red-400",
                                  )}
                                >
                                  {tx.type === "in" ? "↓ Thu" : "↑ Chi"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <span
                                  className={clsx(
                                    "font-mono text-[12px] font-medium",
                                    tx.type === "in"
                                      ? "text-emerald-400"
                                      : "text-red-400",
                                  )}
                                >
                                  {formatCurrency(tx.amount)}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-ink-2 max-w-[200px] truncate">
                                {tx.description}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-[10px] text-ink-3">
                                {tx.account}
                              </td>
                              <td className="px-3 py-2.5 text-[11px] text-ink-2 whitespace-nowrap">
                                {tx.department}
                              </td>
                            </>
                          );
                        })()}

                      {module === "receivable" &&
                        (() => {
                          const r = item as Receivable;
                          return (
                            <>
                              <td className="px-3 py-2.5 font-medium text-ink-1 whitespace-nowrap">
                                {r.customer}
                              </td>
                              <td className="px-3 py-2.5 text-ink-2 max-w-[160px] truncate">
                                {r.project}
                              </td>
                              <td className="px-3 py-2.5 text-[11px] text-ink-2 whitespace-nowrap">
                                {r.department}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-[12px] font-medium text-emerald-300 whitespace-nowrap">
                                {formatCurrency(r.amount)}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-[11px] text-ink-3 whitespace-nowrap">
                                {toDisplayDate(r.dueDate)}
                              </td>
                              <td className="px-3 py-2.5">
                                <StatusBadge status={r.status} />
                              </td>
                            </>
                          );
                        })()}

                      {module === "payable" &&
                        (() => {
                          const p = item as Payable;
                          return (
                            <>
                              <td className="px-3 py-2.5 font-medium text-ink-1 whitespace-nowrap">
                                {p.supplier}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-[11px] text-ink-3">
                                {p.contract ?? "—"}
                              </td>
                              <td className="px-3 py-2.5 text-[11px] text-ink-2 whitespace-nowrap">
                                {p.department}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-[12px] font-medium text-red-300 whitespace-nowrap">
                                {formatCurrency(p.amount)}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-[11px] text-ink-3 whitespace-nowrap">
                                {toDisplayDate(p.dueDate)}
                              </td>
                              <td className="px-3 py-2.5">
                                <StatusBadge status={p.status} />
                              </td>
                            </>
                          );
                        })()}

                      {module === "proposal" &&
                        (() => {
                          const p = item as ExpenseProposal;
                          return (
                            <>
                              <td className="px-3 py-2.5 text-[11px] font-medium text-ink-2 whitespace-nowrap">
                                {p.department}
                              </td>
                              <td className="px-3 py-2.5 text-ink-2 max-w-[200px] truncate">
                                {p.description}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-[12px] font-medium text-amber-300 whitespace-nowrap">
                                {p.amount ? formatCurrency(p.amount) : "—"}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-[11px] text-ink-3 whitespace-nowrap">
                                {toDisplayDate(p.plannedDate)}
                              </td>
                              <td className="px-3 py-2.5">
                                <StatusBadge
                                  status={p.status}
                                  isOverdue={p.isOverdue}
                                />
                              </td>
                            </>
                          );
                        })()}

                      {/* Actions */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => setDetailTarget(item.id)}
                            title="Chi tiết"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item.id)}
                            title="Sửa"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item.id)}
                            title="Xóa"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-white/7">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={filtered.length}
                pageSize={PAGE_SIZE}
                onPage={goTo}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Delete confirm modal ───────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-2 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-ink-1">
                  Xác nhận xóa
                </p>
                <p className="text-[11px] text-ink-3">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>
            <p className="text-[12px] text-ink-2 mb-5">
              Bạn có chắc muốn xóa bản ghi này không?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold py-2.5 rounded-lg transition-all"
              >
                Xóa
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-surface-3 border border-white/8 text-ink-2 text-[13px] py-2.5 rounded-lg hover:bg-surface-2 transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail modal ───────────────────────────────────────────────────── */}
      {detailTarget && detailItem && (
        <Modal
          title="Chi tiết bản ghi"
          onClose={() => setDetailTarget(null)}
        >
          <div className="px-5 py-5 space-y-2.5">
            {(() => {
              let rows: [string, string][] = [];
              if (module === "cashflow") {
                const tx = detailItem as CashFlowTransaction;
                rows = [
                  ["ID", tx.id],
                  ["Ngày", toDisplayDate(tx.date)],
                  ["Loại", tx.type === "in" ? "Thu vào" : "Chi ra"],
                  ["Số tiền", formatCurrency(tx.amount)],
                  ["Diễn giải", tx.description],
                  ["Tài khoản", tx.account],
                  ["Phòng ban", tx.department],
                ];
              } else if (module === "receivable") {
                const r = detailItem as Receivable;
                rows = [
                  ["ID", r.id],
                  ["Khách hàng", r.customer],
                  ["Dự án", r.project],
                  ["Liên hệ", r.contact ?? "—"],
                  ["Phòng ban", r.department],
                  ["Số tiền", formatCurrency(r.amount)],
                  ["Hạn thanh toán", toDisplayDate(r.dueDate)],
                  ["Trạng thái", r.status],
                  ["Ghi chú", r.note ?? "—"],
                ];
              } else if (module === "payable") {
                const p = detailItem as Payable;
                rows = [
                  ["ID", p.id],
                  ["Nhà cung cấp", p.supplier],
                  ["Hợp đồng", p.contract ?? "—"],
                  ["Phòng ban", p.department],
                  ["Người phụ trách", p.responsiblePerson ?? "—"],
                  ["Số tiền", formatCurrency(p.amount)],
                  ["Hạn thanh toán", toDisplayDate(p.dueDate)],
                  ["Trạng thái", p.status],
                  ["Ghi chú", p.note ?? "—"],
                ];
              } else {
                const p = detailItem as ExpenseProposal;
                rows = [
                  ["ID", p.id],
                  ["Phòng ban", p.department],
                  ["Diễn giải", p.description],
                  ["Ngày kế hoạch", toDisplayDate(p.plannedDate)],
                  ["Số tiền", p.amount ? formatCurrency(p.amount) : "—"],
                  ["Trạng thái", p.status],
                  ["Quá hạn", p.isOverdue ? "Có" : "Không"],
                  ["Ghi chú", p.note ?? "—"],
                ];
              }
              return rows.map(([k, v]) => (
                <div key={k} className="flex items-start gap-3">
                  <span className="text-[11px] text-ink-3 font-medium w-32 flex-shrink-0">
                    {k}
                  </span>
                  <span className="text-[12px] text-ink-1 break-all">{v}</span>
                </div>
              ));
            })()}
            <div className="pt-3 border-t border-white/7">
              <button
                onClick={() => handleOpenEdit(detailTarget!)}
                className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <Pencil size={11} /> Chỉnh sửa bản ghi này
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit modal ─────────────────────────────────────────────────────── */}
      {editTarget && (
        <Modal
          title={`Chỉnh sửa — ${MODULE_TABS.find((t) => t.id === module)?.label}`}
          onClose={() => setEditTarget(null)}
        >
          <form onSubmit={handleEditSave} className="px-5 py-5 space-y-4">
            {module === "receivable" && (
              <RecFields form={editRec} set={setEditRec} withStatus />
            )}
            {module === "payable" && (
              <PayFields form={editPay} set={setEditPay} withStatus />
            )}
            {module === "cashflow" && (
              <CfFields form={editCf} set={setEditCf} />
            )}
            {module === "proposal" && (
              <PropFields form={editProp} set={setEditProp} withStatus />
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-all"
              >
                <Save size={14} /> Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="text-[13px] text-ink-3 hover:text-ink-1 px-4 py-2.5 rounded-lg border border-white/8 hover:bg-surface-3 transition-all"
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
