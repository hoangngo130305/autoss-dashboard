import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Upload,
  LogOut,
  Download,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../store/AppStore";
import { exportAccountingReport } from "../../utils/exportAccountingReport";
import { DataSection } from "./DataSection";

export default function AccountantHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useStore();
  const [stats] = useState({ imported: 12, entries: 38, pending: 5 });
  const [exporting, setExporting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportAccountingReport(
        state.cashflows,
        state.proposals,
        state.taxes,
        state.reserves,
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Topbar */}
      <header className="h-14 border-b border-white/7 flex items-center justify-between px-5 bg-surface-2 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px] font-medium text-blue-400 tracking-wide">
            AUTOSS
          </span>
          <span className="text-ink-3 text-[11px]">/ Kế toán</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-[10px] font-bold text-emerald-400">
              {user?.avatar}
            </div>
            <div className="hidden sm:block">
              <p className="text-[12px] font-medium text-ink-1">{user?.name}</p>
              <p className="text-[10px] text-ink-3">{user?.title}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[11px] text-ink-2 hover:text-red-400 border border-white/8 px-3 py-1.5 rounded-lg hover:border-red-500/25 transition-all"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-ink-1 mb-1">
            Xin chào, {user?.name}
          </h1>
          <p className="text-[13px] text-ink-3">
            Quản lý nhập liệu và import dữ liệu vào hệ thống AUTOSS
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "File đã import",
              value: stats.imported,
              color: "text-blue-400",
            },
            {
              label: "Bản ghi đã nhập",
              value: stats.entries,
              color: "text-emerald-400",
            },
            {
              label: "Chờ xử lý",
              value: stats.pending,
              color: "text-amber-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface-2 border border-white/8 rounded-xl p-4 text-center"
            >
              <p className={`text-2xl font-bold font-mono ${s.color}`}>
                {s.value}
              </p>
              <p className="text-[11px] text-ink-3 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Link
            to="/ke-toan/import"
            className="flex items-center gap-4 bg-surface-2 border border-white/8 rounded-xl p-4 hover:bg-surface-3 hover:border-emerald-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
              <Upload size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink-1 group-hover:text-emerald-400 transition-colors">
                Import từ Excel
              </p>
              <p className="text-[11px] text-ink-3 mt-0.5">
                Tải file .xlsx để nhập hàng loạt
              </p>
            </div>
          </Link>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-4 bg-surface-2 border border-white/8 rounded-xl p-4 hover:bg-surface-3 hover:border-amber-500/20 transition-all group text-left disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/12 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
              {exporting ? (
                <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              ) : (
                <Download size={18} className="text-amber-400" />
              )}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink-1 group-hover:text-amber-400 transition-colors">
                {exporting ? "Đang xuất..." : "Xuất báo cáo Excel"}
              </p>
              <p className="text-[11px] text-ink-3 mt-0.5">
                5 sheet · Đúng format BAO CAO KE TOAN
              </p>
            </div>
          </button>
        </div>

        {/* Data table */}
        <div className="mt-4">
          <DataSection />
        </div>
      </main>
    </div>
  );
}
