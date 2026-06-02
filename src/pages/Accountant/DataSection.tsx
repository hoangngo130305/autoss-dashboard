import { useState, useMemo, useEffect, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Eye, X, Save, Search } from "lucide-react";
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
  CashFlowTransaction,
  ExpenseProposal,
  TaxRecord,
  RiskReserve,
  BankAccount,
  AccentColor,
} from "../../types/finance";

// ─── Types ────────────────────────────────────────────────────────────────────
type Module = "cashflow" | "proposal" | "tax" | "reserve" | "opening";

const MODULE_TABS: { id: Module; label: string }[] = [
  { id: "cashflow", label: "Sổ chi tiền mặt" },
  { id: "proposal", label: "Bảng kê chi phí" },
  { id: "tax", label: "Bảng kê nộp thuế" },
  { id: "reserve", label: "Sổ dự phòng" },
  { id: "opening", label: "Dòng tiền đầu ngày" },
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

const PROP_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "overdue", label: "Quá hạn" },
  { value: "rejected", label: "Từ chối" },
];
const TAX_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ nộp" },
  { value: "waiting", label: "Đang xử lý" },
  { value: "overdue", label: "Quá hạn" },
  { value: "paid", label: "Đã nộp" },
  { value: "filed", label: "Đã khai" },
];
const RESERVE_STATUS_OPTIONS = [
  { value: "approaching", label: "Sắp đến hạn" },
  { value: "safe", label: "An toàn" },
  { value: "withdrawn", label: "Đã rút" },
];

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Hôm nay" },
  { id: "thisweek", label: "Tuần này" },
  { id: "thismonth", label: "Tháng này" },
  { id: "quarter", label: "Quý này" },
  { id: "thisyear", label: "Năm này" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
function fromInputDate(s: string): string {
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
    case "filed":
      return <Badge variant="ok">ĐÃ KHAI</Badge>;
    case "safe":
      return <Badge variant="ok">AN TOÀN</Badge>;
    case "pending":
    case "waiting_payment":
      return <Badge variant="waiting">CHỜ DUYỆT</Badge>;
    case "waiting":
      return <Badge variant="waiting">ĐANG XỬ LÝ</Badge>;
    case "approaching":
      return <Badge variant="waiting">SẮP HẠN</Badge>;
    case "withdrawn":
      return <Badge variant="neutral">ĐÃ RÚT</Badge>;
    case "rejected":
      return <Badge variant="overdue">TỪ CHỐI</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

// ─── Edit state types ─────────────────────────────────────────────────────────
type EditCf = {
  date: string;
  type: "in" | "out";
  amount: string;
  description: string;
  account: string;
  department: string;
};
type EditProp = {
  department: string;
  requestDept: string;
  description: string;
  plannedDate: string;
  amount: string;
  note: string;
  status: string;
  isOverdue: boolean;
};
type EditTax = {
  company: string;
  period: string;
  taxType: string;
  required: string;
  paid: string;
  status: string;
  dueDate: string;
};
type EditRes = {
  depositDate: string;
  amount: string;
  expiryDate: string;
  notes: string;
  status: string;
};
type EditBank = { name: string; bank: string; balance: string; color: AccentColor };

type AnyRecord =
  | CashFlowTransaction
  | ExpenseProposal
  | TaxRecord
  | RiskReserve
  | BankAccount;

// ─── UI helpers ───────────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-surface-3 border border-white/8 rounded-lg px-3 py-2 text-[12px] text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-blue-500/40 transition-all";
const selectCls = `${inputCls} cursor-pointer`;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-ink-3 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function ModalWrap({
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
      <div className="bg-surface-2 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 sticky top-0 bg-surface-2 z-10">
          <h3 className="text-[13px] font-semibold text-ink-1">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-3 hover:text-ink-1 hover:bg-surface-3 transition-all"
          >
            <X size={13} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DataSection() {
  const [module, setModule] = useState<Module>("cashflow");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "in" | "out">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const PAGE_SIZE = 10;

  const { state, dispatch } = useStore();
  const { showToast } = useToast();
  const { preset, setPreset, isInRange } = useDateFilter("thismonth");

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);

  const [editCf, setEditCf] = useState<EditCf>({
    date: "",
    type: "in",
    amount: "",
    description: "",
    account: "ACB",
    department: "KINH DOANH",
  });
  const [editProp, setEditProp] = useState<EditProp>({
    department: "XƯỞNG",
    requestDept: "",
    description: "",
    plannedDate: "",
    amount: "",
    note: "",
    status: "pending",
    isOverdue: false,
  });
  const [editTax, setEditTax] = useState<EditTax>({
    company: "",
    period: "",
    taxType: "GTGT",
    required: "",
    paid: "",
    status: "pending",
    dueDate: "",
  });
  const [editRes, setEditRes] = useState<EditRes>({
    depositDate: "",
    amount: "",
    expiryDate: "",
    notes: "",
    status: "safe",
  });
  const [editBank, setEditBank] = useState<EditBank>({ name: "", bank: "", balance: "", color: "blue" });

  useEffect(() => {
    setEditTarget(null);
    setDeleteTarget(null);
    setDetailTarget(null);
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  }, [module]);

  const statusOptions = useMemo(() => {
    const all = { value: "all", label: "Tất cả" };
    if (module === "proposal") return [all, ...PROP_STATUS_OPTIONS];
    if (module === "tax") return [all, ...TAX_STATUS_OPTIONS];
    if (module === "reserve") return [all, ...RESERVE_STATUS_OPTIONS];
    return [];
  }, [module]);

  const filtered = useMemo((): AnyRecord[] => {
    if (module === "opening") {
      const list = state.bankAccounts ?? [];
      if (!search) return list;
      const q = search.toLowerCase();
      return list.filter((b) => b.name.toLowerCase().includes(q) || b.bank.toLowerCase().includes(q));
    }
    let list: AnyRecord[] = [];
    switch (module) {
      case "cashflow":
        list = state.cashflows ?? [];
        break;
      case "proposal":
        list = state.proposals ?? [];
        break;
      case "tax":
        list = state.taxes ?? [];
        break;
      case "reserve":
        list = state.reserves ?? [];
        break;
    }

    list = list.filter((item) => {
      if (module === "cashflow")
        return isInRange((item as CashFlowTransaction).date);
      if (module === "proposal")
        return isInRange((item as ExpenseProposal).plannedDate);
      if (module === "tax") return isInRange((item as TaxRecord).dueDate);
      return isInRange((item as RiskReserve).depositDate);
    });

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((item) => {
        if (module === "cashflow") {
          const tx = item as CashFlowTransaction;
          return (
            tx.description.toLowerCase().includes(q) ||
            tx.department.toLowerCase().includes(q) ||
            tx.account.toLowerCase().includes(q)
          );
        }
        if (module === "proposal") {
          const p = item as ExpenseProposal;
          return (
            p.description.toLowerCase().includes(q) ||
            p.department.toLowerCase().includes(q)
          );
        }
        if (module === "tax") {
          const t = item as TaxRecord;
          return (
            t.company.toLowerCase().includes(q) ||
            t.period.toLowerCase().includes(q) ||
            t.taxType.toLowerCase().includes(q)
          );
        }
        const r = item as RiskReserve;
        return r.notes.toLowerCase().includes(q);
      });
    }

    if (module === "cashflow" && typeFilter !== "all")
      list = list.filter(
        (item) => (item as CashFlowTransaction).type === typeFilter,
      );
    if (statusFilter !== "all")
      list = list.filter((item) => {
        if (module === "proposal")
          return (item as ExpenseProposal).status === statusFilter;
        if (module === "tax")
          return (item as TaxRecord).status === statusFilter;
        if (module === "reserve")
          return (item as RiskReserve).status === statusFilter;
        return true;
      });

    return list;
  }, [module, state, isInRange, search, typeFilter, statusFilter]);

  const { page, totalPages, paged, goTo } = usePagination(filtered, PAGE_SIZE);

  const stats = useMemo(() => {
    if (module === "opening") {
      const accs = state.bankAccounts ?? [];
      const total = accs.reduce((s, a) => s + a.balance, 0);
      return [
        { label: "Tài khoản", value: `${accs.length}`, color: "text-blue-400" },
        { label: "Tổng số dư", value: formatShortCurrency(total), color: "text-emerald-400" },
      ];
    }
    if (module === "cashflow") {
      const txs = filtered as CashFlowTransaction[];
      const thu = txs
        .filter((t) => t.type === "in")
        .reduce((s, t) => s + t.amount, 0);
      const chi = txs
        .filter((t) => t.type === "out")
        .reduce((s, t) => s + t.amount, 0);
      return [
        { label: "Giao dịch", value: `${txs.length}`, color: "text-blue-400" },
        { label: "Tổng thu", value: formatShortCurrency(thu), color: "text-emerald-400" },
        { label: "Tổng chi", value: formatShortCurrency(chi), color: "text-red-400" },
        {
          label: "Ròng",
          value: `${thu - chi >= 0 ? "+" : ""}${formatShortCurrency(thu - chi)}`,
          color: thu - chi >= 0 ? "text-emerald-400" : "text-red-400",
        },
      ];
    }
    if (module === "proposal") {
      const props = filtered as ExpenseProposal[];
      const total = props.reduce((s, p) => s + (p.amount ?? 0), 0);
      const pending = props.filter((p) => p.status === "pending").length;
      const overdue = props.filter((p) => p.isOverdue).length;
      return [
        { label: "Đề xuất", value: `${props.length}`, color: "text-blue-400" },
        { label: "Tổng tiền", value: formatShortCurrency(total), color: "text-amber-400" },
        { label: "Chờ duyệt", value: `${pending}`, color: "text-amber-400" },
        { label: "Quá hạn", value: `${overdue}`, color: overdue > 0 ? "text-red-400" : "text-ink-3" },
      ];
    }
    if (module === "tax") {
      const taxes = filtered as TaxRecord[];
      const required = taxes.reduce((s, t) => s + (t.required ?? 0), 0);
      const paid = taxes.reduce((s, t) => s + (t.paid ?? 0), 0);
      const remaining = taxes.reduce((s, t) => s + (t.remaining ?? 0), 0);
      return [
        { label: "Khoản thuế", value: `${taxes.length}`, color: "text-blue-400" },
        { label: "Phải nộp", value: formatShortCurrency(required), color: "text-red-400" },
        { label: "Đã nộp", value: formatShortCurrency(paid), color: "text-emerald-400" },
        { label: "Còn nợ", value: formatShortCurrency(remaining), color: remaining > 0 ? "text-red-400" : "text-ink-3" },
      ];
    }
    // reserve
    const reserves = filtered as RiskReserve[];
    const total = reserves.reduce((s, r) => s + r.amount, 0);
    const approaching = reserves.filter((r) => r.status === "approaching").length;
    return [
      { label: "Khoản", value: `${reserves.length}`, color: "text-blue-400" },
      { label: "Tổng dự phòng", value: formatShortCurrency(total), color: "text-sky-400" },
      { label: "Sắp đến hạn", value: `${approaching}`, color: approaching > 0 ? "text-amber-400" : "text-ink-3" },
    ];
  }, [filtered, module, state.bankAccounts]);

  // ── Edit handler ──────────────────────────────────────────────────────────
  const handleOpenEdit = (id: string) => {
    setDetailTarget(null);
    setEditTarget(id);
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
          requestDept: p.requestDept ?? "",
          description: p.description,
          plannedDate: toInputDate(p.plannedDate),
          amount: p.amount ? String(p.amount / 1_000_000) : "",
          note: p.note ?? "",
          status: p.status,
          isOverdue: p.isOverdue,
        });
    }
    if (module === "tax") {
      const t = state.taxes.find((x) => x.id === id);
      if (t)
        setEditTax({
          company: t.company,
          period: t.period,
          taxType: t.taxType,
          required: String((t.required ?? 0) / 1_000_000),
          paid: String((t.paid ?? 0) / 1_000_000),
          status: t.status,
          dueDate: toInputDate(t.dueDate),
        });
    }
    if (module === "reserve") {
      const r = state.reserves.find((x) => x.id === id);
      if (r)
        setEditRes({
          depositDate: toInputDate(r.depositDate),
          amount: String(r.amount / 1_000_000),
          expiryDate: toInputDate(r.expiryDate),
          notes: r.notes,
          status: r.status,
        });
    }
    if (module === "opening") {
      const b = (state.bankAccounts ?? []).find((x) => x.id === id);
      if (b) setEditBank({ name: b.name, bank: b.bank, balance: String(b.balance / 1_000_000), color: b.color });
    }
  };

  const handleEditSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const isAdd = editTarget === "__add__";
    const newId = `${module}-${Date.now()}`;

    if (module === "cashflow") {
      const data = { date: editCf.date, type: editCf.type, amount: Number(editCf.amount) * 1_000_000, description: editCf.description, account: editCf.account, department: editCf.department };
      isAdd
        ? dispatch({ type: "CASHFLOW_ADD", payload: { id: newId, ...data } })
        : dispatch({ type: "CASHFLOW_UPDATE", payload: { id: editTarget, data } });
    }
    if (module === "proposal") {
      const data = { department: editProp.department, requestDept: editProp.requestDept, description: editProp.description, plannedDate: editProp.plannedDate, departmentColor: DEPT_COLORS[editProp.department] ?? "blue", amount: editProp.amount ? Number(editProp.amount) * 1_000_000 : undefined, note: editProp.note, status: editProp.status as ExpenseProposal["status"], isOverdue: editProp.isOverdue };
      isAdd
        ? dispatch({ type: "PROPOSAL_ADD", payload: { id: newId, ...data } })
        : dispatch({ type: "PROPOSAL_UPDATE", payload: { id: editTarget, data } });
    }
    if (module === "tax") {
      const req  = Number(editTax.required) * 1_000_000;
      const paid = Number(editTax.paid)     * 1_000_000;
      const data = { company: editTax.company, period: editTax.period, taxType: editTax.taxType, required: req, paid, remaining: req - paid, status: editTax.status as TaxRecord["status"], dueDate: fromInputDate(editTax.dueDate) };
      isAdd
        ? dispatch({ type: "TAX_ADD", payload: { id: newId, ...data } })
        : dispatch({ type: "TAX_UPDATE", payload: { id: editTarget, data } });
    }
    if (module === "reserve") {
      const data = { depositDate: fromInputDate(editRes.depositDate), amount: Number(editRes.amount) * 1_000_000, expiryDate: fromInputDate(editRes.expiryDate), notes: editRes.notes, status: editRes.status as RiskReserve["status"] };
      isAdd
        ? dispatch({ type: "RESERVE_ADD", payload: { id: newId, ...data } })
        : dispatch({ type: "RESERVE_UPDATE", payload: { id: editTarget, data } });
    }
    if (module === "opening") {
      const data = { name: editBank.name, bank: editBank.bank, balance: Number(editBank.balance) * 1_000_000, color: editBank.color, percentage: 0 };
      isAdd
        ? dispatch({ type: "BANKACCOUNT_ADD", payload: { id: newId, ...data } })
        : dispatch({ type: "BANKACCOUNT_UPDATE", payload: { id: editTarget, data } });
    }
    showToast(isAdd ? "Đã thêm bản ghi!" : "Đã cập nhật thành công!", "success");
    setEditTarget(null);
  };

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    switch (module) {
      case "cashflow": dispatch({ type: "CASHFLOW_DELETE",    payload: deleteTarget }); break;
      case "proposal": dispatch({ type: "PROPOSAL_DELETE",    payload: deleteTarget }); break;
      case "tax":      dispatch({ type: "TAX_DELETE",         payload: deleteTarget }); break;
      case "reserve":  dispatch({ type: "RESERVE_DELETE",     payload: deleteTarget }); break;
      case "opening":  dispatch({ type: "BANKACCOUNT_DELETE", payload: deleteTarget }); break;
    }
    showToast("Đã xóa bản ghi!", "success");
    setDeleteTarget(null);
  };

  const detailItem = useMemo(() => {
    if (!detailTarget) return null;
    switch (module) {
      case "cashflow": return state.cashflows.find((x) => x.id === detailTarget) ?? null;
      case "proposal": return state.proposals.find((x) => x.id === detailTarget) ?? null;
      case "tax":      return state.taxes.find((x) => x.id === detailTarget) ?? null;
      case "reserve":  return state.reserves.find((x) => x.id === detailTarget) ?? null;
      case "opening":  return (state.bankAccounts ?? []).find((x) => x.id === detailTarget) ?? null;
    }
  }, [detailTarget, module, state]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-surface-2 border border-white/8 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/7 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-ink-1">
          Dữ liệu đã nhập
        </span>
        <button
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            setEditCf({ date: today, type: "in", amount: "", description: "", account: "ACB", department: "KINH DOANH" });
            setEditProp({ department: "XƯỞNG", requestDept: "", description: "", plannedDate: today, amount: "", note: "", status: "pending", isOverdue: false });
            setEditTax({ company: "", period: "", taxType: "GTGT", required: "", paid: "", status: "pending", dueDate: today });
            setEditRes({ depositDate: today, amount: "", expiryDate: "", notes: "", status: "safe" });
            setEditBank({ name: "", bank: "", balance: "", color: "blue" });
            setEditTarget("__add__");
          }}
          className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-lg hover:bg-blue-500/8 transition-all"
        >
          <Plus size={11} /> Thêm mới
        </button>
      </div>

      {/* Module tabs */}
      <div className="flex gap-1 p-2 border-b border-white/7 bg-surface-1/30 overflow-x-auto">
        {MODULE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setModule(tab.id)}
            className={clsx(
              "flex-shrink-0 text-[11px] font-medium py-1.5 px-3 rounded-lg transition-all whitespace-nowrap",
              module === tab.id
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                : "text-ink-3 hover:text-ink-2 hover:bg-surface-3",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-white/7">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={clsx(
              "px-4 py-3",
              i < stats.length - 1 && "border-r border-white/7",
            )}
          >
            <p className="text-[10px] text-ink-3 font-medium mb-0.5">
              {s.label}
            </p>
            <p className={clsx("font-mono text-[14px] font-semibold", s.color)}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2.5 border-b border-white/7 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[150px] max-w-xs">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none">
            <Search size={11} />
          </span>
          <input
            className="w-full bg-surface-3 border border-white/8 rounded-lg pl-6 pr-3 py-1.5 text-[11px] text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-blue-500/40"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              goTo(1);
            }}
          />
        </div>
        {module !== "opening" && (
          <div className="flex gap-1 flex-wrap">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPreset(p.id);
                  goTo(1);
                }}
                className={clsx(
                  "text-[10px] px-2 py-1 rounded-md border transition-all font-medium",
                  preset === p.id
                    ? "bg-blue-500/15 text-blue-400 border-blue-500/25"
                    : "text-ink-3 border-white/8 hover:bg-surface-3 hover:text-ink-2",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
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
                  "text-[10px] px-2 py-1 rounded-md border transition-all font-medium",
                  typeFilter === t
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "text-ink-3 border-white/8 hover:bg-surface-3 hover:text-ink-2",
                )}
              >
                {t === "all" ? "Tất cả" : t === "in" ? "↓ Thu" : "↑ Chi"}
              </button>
            ))}
          </div>
        )}
        {statusOptions.length > 0 && (
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              goTo(1);
            }}
            className="bg-surface-3 border border-white/8 rounded-lg px-2 py-1 text-[10px] text-ink-2 focus:outline-none cursor-pointer"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        <span className="ml-auto text-[10px] text-ink-3">
          {filtered.length} kết quả
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-white/8 bg-surface-3">
              <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3 w-8">
                #
              </th>
              {module === "cashflow" && (
                <>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Ngày tháng
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Mục đích
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Diễn giải
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Thu
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Chi
                  </th>
                </>
              )}
              {module === "proposal" && (
                <>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    CHI PHÍ
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Diễn giải chi phí
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Thành tiền chi
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    KH chi tiền
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Phòng ban ĐX
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    TT
                  </th>
                </>
              )}
              {module === "tax" && (
                <>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Tên công ty
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Kỳ tính thuế
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Số thuế phải nộp
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Đã nộp
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Tổng tiền nợ NN
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Trạng thái
                  </th>
                </>
              )}
              {module === "reserve" && (
                <>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Ngày
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Số tiền
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Kỳ hạn sử dụng
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Ghi chú
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Trạng thái
                  </th>
                </>
              )}
              {module === "opening" && (
                <>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Diễn giải
                  </th>
                  <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-ink-3">
                    Nguồn tiền
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                    Số tồn hiện tại
                  </th>
                </>
              )}
              <th className="px-3 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-ink-3 whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-[11px] text-ink-3"
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
                  <td className="px-3 py-2 font-mono text-[10px] text-ink-3">
                    {String(idx).padStart(2, "0")}
                  </td>
                  {module === "cashflow" &&
                    (() => {
                      const tx = item as CashFlowTransaction;
                      return (
                        <>
                          <td className="px-3 py-2 font-mono text-[10px] text-ink-3 whitespace-nowrap">
                            {toDisplayDate(tx.date)}
                          </td>
                          <td className="px-3 py-2 text-[10px] text-ink-3 whitespace-nowrap">
                            {tx.department}
                          </td>
                          <td className="px-3 py-2 text-ink-2 max-w-[180px] truncate">
                            {tx.description}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[11px] font-medium text-emerald-400">
                            {tx.type === "in"
                              ? formatCurrency(tx.amount)
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[11px] font-medium text-red-400">
                            {tx.type === "out"
                              ? formatCurrency(tx.amount)
                              : "—"}
                          </td>
                        </>
                      );
                    })()}
                  {module === "proposal" &&
                    (() => {
                      const p = item as ExpenseProposal;
                      return (
                        <>
                          <td className="px-3 py-2 text-[10px] font-medium text-ink-2 whitespace-nowrap">
                            {p.department}
                          </td>
                          <td className="px-3 py-2 text-ink-2 max-w-[160px] truncate">
                            {p.description}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[11px] font-medium text-amber-300 whitespace-nowrap">
                            {p.amount ? formatCurrency(p.amount) : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-ink-3 whitespace-nowrap">
                            {toDisplayDate(p.plannedDate)}
                          </td>
                          <td className="px-3 py-2 text-[10px] text-ink-3 whitespace-nowrap">
                            {p.requestDept ?? "—"}
                          </td>
                          <td className="px-3 py-2">
                            <StatusBadge
                              status={p.status}
                              isOverdue={p.isOverdue}
                            />
                          </td>
                        </>
                      );
                    })()}
                  {module === "tax" &&
                    (() => {
                      const t = item as TaxRecord;
                      return (
                        <>
                          <td className="px-3 py-2 font-medium text-ink-1 whitespace-nowrap">
                            {t.company}
                          </td>
                          <td className="px-3 py-2 text-ink-2 whitespace-nowrap text-[10px]">
                            {t.period} · {t.taxType}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[11px] text-red-300 whitespace-nowrap">
                            {t.required ? formatCurrency(t.required) : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[11px] text-emerald-300 whitespace-nowrap">
                            {t.paid ? formatCurrency(t.paid) : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[11px] font-semibold text-amber-300 whitespace-nowrap">
                            {t.remaining
                              ? formatCurrency(t.remaining)
                              : "—"}
                          </td>
                          <td className="px-3 py-2">
                            <StatusBadge status={t.status} />
                          </td>
                        </>
                      );
                    })()}
                  {module === "reserve" &&
                    (() => {
                      const r = item as RiskReserve;
                      return (
                        <>
                          <td className="px-3 py-2 font-mono text-[10px] text-ink-3 whitespace-nowrap">
                            {r.depositDate}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[11px] font-medium text-sky-300 whitespace-nowrap">
                            {formatCurrency(r.amount)}
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-ink-3 whitespace-nowrap">
                            {r.expiryDate}
                          </td>
                          <td className="px-3 py-2 text-ink-2 max-w-[180px] truncate">
                            {r.notes || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <StatusBadge status={r.status} />
                          </td>
                        </>
                      );
                    })()}
                  {module === "opening" &&
                    (() => {
                      const b = item as BankAccount;
                      return (
                        <>
                          <td className="px-3 py-2 text-ink-2 font-medium">
                            {b.name}
                          </td>
                          <td className="px-3 py-2 text-ink-3 font-mono text-[10px]">
                            {b.bank}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[11px] font-medium text-blue-300 whitespace-nowrap">
                            {formatCurrency(b.balance)}
                          </td>
                        </>
                      );
                    })()}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => setDetailTarget(item.id)}
                        title="Chi tiết"
                        className="w-6 h-6 flex items-center justify-center rounded text-ink-3 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item.id)}
                        title="Sửa"
                        className="w-6 h-6 flex items-center justify-center rounded text-ink-3 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item.id)}
                        title="Xóa"
                        className="w-6 h-6 flex items-center justify-center rounded text-ink-3 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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

      {/* ── Delete confirm ────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-2 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink-1">
                  Xác nhận xóa
                </p>
                <p className="text-[10px] text-ink-3">
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
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[12px] font-semibold py-2 rounded-lg transition-all"
              >
                Xóa
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-surface-3 border border-white/8 text-ink-2 text-[12px] py-2 rounded-lg hover:bg-surface-2 transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail modal ──────────────────────────────────────────────────────── */}
      {detailTarget && detailItem && (
        <ModalWrap
          title="Chi tiết bản ghi"
          onClose={() => setDetailTarget(null)}
        >
          <div className="px-5 py-4 space-y-2.5">
            {(() => {
              let rows: [string, string][] = [];
              if (module === "cashflow") {
                const tx = detailItem as CashFlowTransaction;
                rows = [
                  ["ID", tx.id],
                  ["Ngày", toDisplayDate(tx.date)],
                  ["Loại", tx.type === "in" ? "↓ Thu vào" : "↑ Chi ra"],
                  ["Số tiền", formatCurrency(tx.amount)],
                  ["Diễn giải", tx.description],
                  ["Tài khoản", tx.account],
                  ["Mục đích", tx.department],
                ];
              } else if (module === "proposal") {
                const p = detailItem as ExpenseProposal;
                rows = [
                  ["ID", p.id],
                  ["CHI PHÍ", p.department],
                  ["Phòng ban ĐX", p.requestDept ?? "—"],
                  ["Diễn giải", p.description],
                  ["Thành tiền chi", p.amount ? formatCurrency(p.amount) : "—"],
                  ["KH chi tiền", toDisplayDate(p.plannedDate)],
                  ["Trạng thái", p.status],
                  ["Quá hạn", p.isOverdue ? "Có" : "Không"],
                  ["Ghi chú", p.note ?? "—"],
                ];
              } else if (module === "tax") {
                const t = detailItem as TaxRecord;
                rows = [
                  ["ID", t.id],
                  ["Công ty", t.company],
                  ["Kỳ tính thuế", `${t.period} (${t.taxType})`],
                  ["Số thuế phải nộp", formatCurrency(t.required ?? 0)],
                  ["Đã nộp", formatCurrency(t.paid ?? 0)],
                  ["Tổng tiền nợ nhà nước", formatCurrency(t.remaining ?? 0)],
                  ["Hạn nộp", toDisplayDate(t.dueDate)],
                  ["Trạng thái", t.status],
                ];
              } else if (module === "reserve") {
                const r = detailItem as RiskReserve;
                rows = [
                  ["ID", r.id],
                  ["Ngày gửi", r.depositDate],
                  ["Số tiền", formatCurrency(r.amount)],
                  ["Kỳ hạn sử dụng", r.expiryDate],
                  ["Ghi chú", r.notes || "—"],
                  ["Trạng thái", r.status],
                ];
              } else {
                const b = detailItem as BankAccount;
                rows = [
                  ["ID", b.id],
                  ["Diễn giải", b.name],
                  ["Nguồn tiền", b.bank],
                  ["Số tồn hiện tại", formatCurrency(b.balance)],
                ];
              }
              return rows.map(([k, v]) => (
                <div key={k} className="flex items-start gap-3">
                  <span className="text-[10px] text-ink-3 font-medium w-36 flex-shrink-0">
                    {k}
                  </span>
                  <span className="text-[11px] text-ink-1 break-all">{v}</span>
                </div>
              ));
            })()}
            <div className="pt-3 border-t border-white/7">
              <button
                onClick={() => handleOpenEdit(detailTarget!)}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <Pencil size={10} /> Chỉnh sửa bản ghi này
              </button>
            </div>
          </div>
        </ModalWrap>
      )}

      {/* ── Edit modal ────────────────────────────────────────────────────────── */}
      {editTarget && (
        <ModalWrap
          title={`${editTarget === "__add__" ? "Thêm mới" : "Chỉnh sửa"} — ${MODULE_TABS.find((t) => t.id === module)?.label}`}
          onClose={() => setEditTarget(null)}
        >
          <form onSubmit={handleEditSave} className="px-5 py-4 space-y-3">
            {/* Sổ chi tiền mặt */}
            {module === "cashflow" && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Ngày giao dịch">
                    <input
                      type="date"
                      className={inputCls}
                      required
                      value={editCf.date}
                      onChange={(e) =>
                        setEditCf({ ...editCf, date: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Loại">
                    <select
                      className={selectCls}
                      value={editCf.type}
                      onChange={(e) =>
                        setEditCf({
                          ...editCf,
                          type: e.target.value as "in" | "out",
                        })
                      }
                    >
                      <option value="in">↓ Thu vào</option>
                      <option value="out">↑ Chi ra</option>
                    </select>
                  </Field>
                  <Field label="Số tiền (triệu)">
                    <input
                      type="number"
                      min={0}
                      step="0.001"
                      className={inputCls}
                      required
                      value={editCf.amount}
                      onChange={(e) =>
                        setEditCf({ ...editCf, amount: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Diễn giải">
                    <input
                      className={inputCls}
                      required
                      value={editCf.description}
                      onChange={(e) =>
                        setEditCf({ ...editCf, description: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Tài khoản">
                    <select
                      className={selectCls}
                      value={editCf.account}
                      onChange={(e) =>
                        setEditCf({ ...editCf, account: e.target.value })
                      }
                    >
                      {ACCOUNTS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Mục đích (Phòng ban)">
                  <select
                    className={selectCls}
                    value={editCf.department}
                    onChange={(e) =>
                      setEditCf({ ...editCf, department: e.target.value })
                    }
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            {/* Bảng kê chi phí */}
            {module === "proposal" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="CHI PHÍ (loại chi phí)">
                    <input
                      className={inputCls}
                      required
                      value={editProp.department}
                      onChange={(e) =>
                        setEditProp({ ...editProp, department: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Phòng ban đề xuất">
                    <input
                      className={inputCls}
                      value={editProp.requestDept}
                      onChange={(e) =>
                        setEditProp({
                          ...editProp,
                          requestDept: e.target.value,
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Diễn giải chi phí">
                  <input
                    className={inputCls}
                    required
                    value={editProp.description}
                    onChange={(e) =>
                      setEditProp({ ...editProp, description: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Thành tiền chi (triệu)">
                    <input
                      type="number"
                      min={0}
                      step="0.001"
                      className={inputCls}
                      value={editProp.amount}
                      onChange={(e) =>
                        setEditProp({ ...editProp, amount: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Kế hoạch chi tiền">
                    <input
                      type="date"
                      className={inputCls}
                      required
                      value={editProp.plannedDate}
                      onChange={(e) =>
                        setEditProp({
                          ...editProp,
                          plannedDate: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field label="Trạng thái">
                    <select
                      className={selectCls}
                      value={editProp.status}
                      onChange={(e) =>
                        setEditProp({ ...editProp, status: e.target.value })
                      }
                    >
                      {PROP_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ghi chú">
                    <input
                      className={inputCls}
                      value={editProp.note}
                      onChange={(e) =>
                        setEditProp({ ...editProp, note: e.target.value })
                      }
                    />
                  </Field>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-red-400 w-3.5 h-3.5"
                        checked={editProp.isOverdue}
                        onChange={(e) =>
                          setEditProp({
                            ...editProp,
                            isOverdue: e.target.checked,
                          })
                        }
                      />
                      <span className="text-[11px] text-ink-2">
                        Đánh dấu quá hạn
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Bảng kê nộp thuế */}
            {module === "tax" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tên công ty">
                    <input
                      className={inputCls}
                      required
                      value={editTax.company}
                      onChange={(e) =>
                        setEditTax({ ...editTax, company: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Kỳ tính thuế">
                    <input
                      className={inputCls}
                      required
                      placeholder="VD: Tháng 3/2026"
                      value={editTax.period}
                      onChange={(e) =>
                        setEditTax({ ...editTax, period: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Loại thuế">
                    <input
                      className={inputCls}
                      required
                      placeholder="VD: GTGT, TNDN"
                      value={editTax.taxType}
                      onChange={(e) =>
                        setEditTax({ ...editTax, taxType: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Số thuế phải nộp (triệu)">
                    <input
                      type="number"
                      min={0}
                      step="0.001"
                      className={inputCls}
                      value={editTax.required}
                      onChange={(e) =>
                        setEditTax({ ...editTax, required: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Đã nộp (triệu)">
                    <input
                      type="number"
                      min={0}
                      step="0.001"
                      className={inputCls}
                      value={editTax.paid}
                      onChange={(e) =>
                        setEditTax({ ...editTax, paid: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Thời hạn nộp">
                    <input
                      type="date"
                      className={inputCls}
                      value={editTax.dueDate}
                      onChange={(e) =>
                        setEditTax({ ...editTax, dueDate: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Trạng thái">
                    <select
                      className={selectCls}
                      value={editTax.status}
                      onChange={(e) =>
                        setEditTax({ ...editTax, status: e.target.value })
                      }
                    >
                      {TAX_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tổng tiền nợ nhà nước (triệu)">
                    <input
                      type="number"
                      className={inputCls}
                      readOnly
                      value={Math.max(
                        0,
                        Number(editTax.required) - Number(editTax.paid),
                      ).toFixed(3)}
                      style={{ opacity: 0.6 }}
                      title="Tự tính = Phải nộp − Đã nộp"
                    />
                  </Field>
                </div>
              </>
            )}

            {/* Sổ dự phòng */}
            {module === "reserve" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ngày gửi">
                    <input
                      type="date"
                      className={inputCls}
                      required
                      value={editRes.depositDate}
                      onChange={(e) =>
                        setEditRes({ ...editRes, depositDate: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Số tiền (triệu)">
                    <input
                      type="number"
                      min={0}
                      step="0.001"
                      className={inputCls}
                      required
                      value={editRes.amount}
                      onChange={(e) =>
                        setEditRes({ ...editRes, amount: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Kỳ hạn sử dụng">
                    <input
                      type="date"
                      className={inputCls}
                      required
                      value={editRes.expiryDate}
                      onChange={(e) =>
                        setEditRes({ ...editRes, expiryDate: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Trạng thái">
                    <select
                      className={selectCls}
                      value={editRes.status}
                      onChange={(e) =>
                        setEditRes({ ...editRes, status: e.target.value })
                      }
                    >
                      {RESERVE_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Ghi chú">
                  <input
                    className={inputCls}
                    value={editRes.notes}
                    onChange={(e) =>
                      setEditRes({ ...editRes, notes: e.target.value })
                    }
                  />
                </Field>
              </>
            )}

            {/* Dòng tiền đầu ngày */}
            {module === "opening" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Diễn giải (Tên tài khoản)">
                    <input
                      className={inputCls}
                      required
                      placeholder="VD: Tiền mặt, TK ACB..."
                      value={editBank.name}
                      onChange={(e) =>
                        setEditBank({ ...editBank, name: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Nguồn tiền (Ngân hàng)">
                    <input
                      className={inputCls}
                      required
                      placeholder="VD: ACB, VCB, Tiền mặt..."
                      value={editBank.bank}
                      onChange={(e) =>
                        setEditBank({ ...editBank, bank: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field label="Số tồn hiện tại (triệu)">
                  <input
                    type="number"
                    min={0}
                    step="0.001"
                    className={inputCls}
                    required
                    value={editBank.balance}
                    onChange={(e) =>
                      setEditBank({ ...editBank, balance: e.target.value })
                    }
                  />
                </Field>
              </>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-all"
              >
                <Save size={13} /> {editTarget === "__add__" ? "Thêm mới" : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="text-[12px] text-ink-3 hover:text-ink-1 px-4 py-2 rounded-lg border border-white/8 hover:bg-surface-3 transition-all"
              >
                Hủy
              </button>
            </div>
          </form>
        </ModalWrap>
      )}
    </div>
  );
}
