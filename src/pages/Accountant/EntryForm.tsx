import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useStore } from "../../store/AppStore";
import { useToast } from "../../hooks/useToast";

type Module = "receivable" | "payable" | "cashflow" | "proposal";

const MODULE_OPTIONS: { value: Module; label: string }[] = [
  { value: "receivable", label: "Công nợ phải thu" },
  { value: "payable", label: "Công nợ phải trả" },
  { value: "cashflow", label: "Dòng tiền" },
  { value: "proposal", label: "Đề xuất chi phí" },
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

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function InputField({
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

const inputCls =
  "w-full bg-surface-3 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15 transition-all";
const selectCls = `${inputCls} cursor-pointer`;

export default function EntryForm() {
  const [searchParams] = useSearchParams();
  const [module, setModule] = useState<Module>(
    (searchParams.get("module") as Module) ?? "receivable",
  );
  const { dispatch } = useStore();
  const { showToast } = useToast();
  const [success, setSuccess] = useState(false);

  // ── Receivable fields ──────────────────────────────────────────────────────
  const [recForm, setRecForm] = useState({
    customer: "",
    project: "",
    contact: "",
    department: "KỸ THUẬT",
    amount: "",
    dueDate: "",
    note: "",
  });

  // ── Payable fields ─────────────────────────────────────────────────────────
  const [payForm, setPayForm] = useState({
    supplier: "",
    contract: "",
    department: "KHO",
    amount: "",
    responsiblePerson: "",
    dueDate: "",
    note: "",
  });

  // ── CashFlow fields ────────────────────────────────────────────────────────
  const [cfForm, setCfForm] = useState({
    date: "",
    type: "in" as "in" | "out",
    amount: "",
    description: "",
    account: "ACB",
    department: "KINH DOANH",
  });

  // ── Proposal fields ────────────────────────────────────────────────────────
  const [propForm, setPropForm] = useState({
    department: "XƯỞNG",
    description: "",
    plannedDate: "",
    amount: "",
    note: "",
  });

  const handleSubmit = (e: FormEvent) => {
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
      setRecForm({
        customer: "",
        project: "",
        contact: "",
        department: "KỸ THUẬT",
        amount: "",
        dueDate: "",
        note: "",
      });
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
      setPayForm({
        supplier: "",
        contract: "",
        department: "KHO",
        amount: "",
        responsiblePerson: "",
        dueDate: "",
        note: "",
      });
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
      setCfForm({
        date: "",
        type: "in",
        amount: "",
        description: "",
        account: "ACB",
        department: "KINH DOANH",
      });
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
      setPropForm({
        department: "XƯỞNG",
        description: "",
        plannedDate: "",
        amount: "",
        note: "",
      });
    }

    setSuccess(true);
    showToast("Đã lưu bản ghi thành công!", "success");
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface-1 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/ke-toan"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 text-ink-2 hover:text-ink-1 hover:bg-surface-3 transition-all"
          >
            <ArrowLeft size={14} />
          </Link>
          <div>
            <h1 className="text-[15px] font-semibold text-ink-1">
              Nhập liệu thủ công
            </h1>
            <p className="text-[11px] text-ink-3">
              Thêm bản ghi mới vào hệ thống
            </p>
          </div>
        </div>

        <div className="bg-surface-2 border border-white/8 rounded-2xl overflow-hidden">
          {/* Module select */}
          <div className="px-5 py-4 border-b border-white/7">
            <label className="block text-[11px] font-medium text-ink-2 mb-1.5">
              Module
            </label>
            <select
              value={module}
              onChange={(e) => setModule(e.target.value as Module)}
              className={selectCls}
            >
              {MODULE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
            {/* Receivable */}
            {module === "receivable" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Tên khách hàng" required>
                    <input
                      className={inputCls}
                      required
                      placeholder="Tên KH"
                      value={recForm.customer}
                      onChange={(e) =>
                        setRecForm({ ...recForm, customer: e.target.value })
                      }
                    />
                  </InputField>
                  <InputField label="Dự án / Lý do" required>
                    <input
                      className={inputCls}
                      required
                      placeholder="Dự án"
                      value={recForm.project}
                      onChange={(e) =>
                        setRecForm({ ...recForm, project: e.target.value })
                      }
                    />
                  </InputField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Người liên hệ">
                    <input
                      className={inputCls}
                      placeholder="Anh/Chị..."
                      value={recForm.contact}
                      onChange={(e) =>
                        setRecForm({ ...recForm, contact: e.target.value })
                      }
                    />
                  </InputField>
                  <InputField label="Phòng phụ trách" required>
                    <select
                      className={selectCls}
                      value={recForm.department}
                      onChange={(e) =>
                        setRecForm({ ...recForm, department: e.target.value })
                      }
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </InputField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Số tiền (triệu đồng)" required>
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      required
                      placeholder="0"
                      value={recForm.amount}
                      onChange={(e) =>
                        setRecForm({ ...recForm, amount: e.target.value })
                      }
                    />
                  </InputField>
                  <InputField label="Ngày đến hạn">
                    <input
                      type="date"
                      className={inputCls}
                      value={recForm.dueDate}
                      onChange={(e) =>
                        setRecForm({ ...recForm, dueDate: e.target.value })
                      }
                    />
                  </InputField>
                </div>
                <InputField label="Ghi chú">
                  <input
                    className={inputCls}
                    placeholder="Ghi chú thêm..."
                    value={recForm.note}
                    onChange={(e) =>
                      setRecForm({ ...recForm, note: e.target.value })
                    }
                  />
                </InputField>
              </>
            )}

            {/* Payable */}
            {module === "payable" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Nhà cung cấp" required>
                    <input
                      className={inputCls}
                      required
                      placeholder="Tên NCC"
                      value={payForm.supplier}
                      onChange={(e) =>
                        setPayForm({ ...payForm, supplier: e.target.value })
                      }
                    />
                  </InputField>
                  <InputField label="Mã hợp đồng">
                    <input
                      className={inputCls}
                      placeholder="HĐ-2026-..."
                      value={payForm.contract}
                      onChange={(e) =>
                        setPayForm({ ...payForm, contract: e.target.value })
                      }
                    />
                  </InputField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Phòng phụ trách" required>
                    <select
                      className={selectCls}
                      value={payForm.department}
                      onChange={(e) =>
                        setPayForm({ ...payForm, department: e.target.value })
                      }
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </InputField>
                  <InputField label="Người phụ trách">
                    <input
                      className={inputCls}
                      placeholder="Anh/Chị..."
                      value={payForm.responsiblePerson}
                      onChange={(e) =>
                        setPayForm({
                          ...payForm,
                          responsiblePerson: e.target.value,
                        })
                      }
                    />
                  </InputField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Số tiền (triệu đồng)" required>
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      required
                      placeholder="0"
                      value={payForm.amount}
                      onChange={(e) =>
                        setPayForm({ ...payForm, amount: e.target.value })
                      }
                    />
                  </InputField>
                  <InputField label="Ngày đến hạn">
                    <input
                      type="date"
                      className={inputCls}
                      value={payForm.dueDate}
                      onChange={(e) =>
                        setPayForm({ ...payForm, dueDate: e.target.value })
                      }
                    />
                  </InputField>
                </div>
                <InputField label="Ghi chú">
                  <input
                    className={inputCls}
                    placeholder="Ghi chú thêm..."
                    value={payForm.note}
                    onChange={(e) =>
                      setPayForm({ ...payForm, note: e.target.value })
                    }
                  />
                </InputField>
              </>
            )}

            {/* CashFlow */}
            {module === "cashflow" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Ngày giao dịch" required>
                    <input
                      type="date"
                      className={inputCls}
                      required
                      value={cfForm.date}
                      onChange={(e) =>
                        setCfForm({ ...cfForm, date: e.target.value })
                      }
                    />
                  </InputField>
                  <InputField label="Loại" required>
                    <select
                      className={selectCls}
                      value={cfForm.type}
                      onChange={(e) =>
                        setCfForm({
                          ...cfForm,
                          type: e.target.value as "in" | "out",
                        })
                      }
                    >
                      <option value="in">Thu vào</option>
                      <option value="out">Chi ra</option>
                    </select>
                  </InputField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Số tiền (triệu đồng)" required>
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      required
                      placeholder="0"
                      value={cfForm.amount}
                      onChange={(e) =>
                        setCfForm({ ...cfForm, amount: e.target.value })
                      }
                    />
                  </InputField>
                  <InputField label="Tài khoản" required>
                    <select
                      className={selectCls}
                      value={cfForm.account}
                      onChange={(e) =>
                        setCfForm({ ...cfForm, account: e.target.value })
                      }
                    >
                      {ACCOUNTS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </InputField>
                </div>
                <InputField label="Diễn giải" required>
                  <input
                    className={inputCls}
                    required
                    placeholder="Mô tả giao dịch..."
                    value={cfForm.description}
                    onChange={(e) =>
                      setCfForm({ ...cfForm, description: e.target.value })
                    }
                  />
                </InputField>
                <InputField label="Phòng ban">
                  <select
                    className={selectCls}
                    value={cfForm.department}
                    onChange={(e) =>
                      setCfForm({ ...cfForm, department: e.target.value })
                    }
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </InputField>
              </>
            )}

            {/* Proposal */}
            {module === "proposal" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Phòng ban" required>
                    <select
                      className={selectCls}
                      value={propForm.department}
                      onChange={(e) =>
                        setPropForm({ ...propForm, department: e.target.value })
                      }
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </InputField>
                  <InputField label="Ngày dự kiến chi" required>
                    <input
                      type="date"
                      className={inputCls}
                      required
                      value={propForm.plannedDate}
                      onChange={(e) =>
                        setPropForm({
                          ...propForm,
                          plannedDate: e.target.value,
                        })
                      }
                    />
                  </InputField>
                </div>
                <InputField label="Diễn giải nội dung" required>
                  <input
                    className={inputCls}
                    required
                    placeholder="Mô tả đề xuất..."
                    value={propForm.description}
                    onChange={(e) =>
                      setPropForm({ ...propForm, description: e.target.value })
                    }
                  />
                </InputField>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Số tiền dự kiến (triệu)">
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      placeholder="0"
                      value={propForm.amount}
                      onChange={(e) =>
                        setPropForm({ ...propForm, amount: e.target.value })
                      }
                    />
                  </InputField>
                  <InputField label="Ghi chú">
                    <input
                      className={inputCls}
                      placeholder="Ghi chú..."
                      value={propForm.note}
                      onChange={(e) =>
                        setPropForm({ ...propForm, note: e.target.value })
                      }
                    />
                  </InputField>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-all"
              >
                <Save size={14} />
                Lưu bản ghi
              </button>
              {success && (
                <button
                  type="button"
                  className="flex items-center gap-2 bg-surface-3 border border-white/8 text-ink-2 text-[13px] px-4 py-2.5 rounded-lg transition-all hover:bg-surface-2"
                  onClick={() => setSuccess(false)}
                >
                  <Plus size={14} />
                  Nhập tiếp
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
