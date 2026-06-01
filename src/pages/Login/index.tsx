import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const ok = login(username, password);
    setLoading(false);
    if (ok) {
      const u = username.trim().toLowerCase();
      navigate(u === "ketoan" ? "/ke-toan" : "/", { replace: true });
    } else {
      setError("Sai tên đăng nhập hoặc mật khẩu");
    }
  };

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 mb-4">
            <span className="font-mono text-[11px] font-bold text-blue-400 tracking-widest">
              AT
            </span>
          </div>
          <h1 className="font-mono text-xl font-semibold text-blue-400 tracking-wide mb-1">
            AUTOSS
          </h1>
          <p className="text-[12px] text-ink-3">
            Hệ thống quản lý tài chính nội bộ
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-2 border border-white/8 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-[15px] font-semibold text-ink-1 mb-1">
            Đăng nhập
          </h2>
          <p className="text-[12px] text-ink-3 mb-6">
            Chọn tài khoản phù hợp để truy cập hệ thống
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="giamdoc hoặc ketoan"
                  autoComplete="username"
                  className="w-full bg-surface-3 border border-white/8 rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-surface-3 border border-white/8 rounded-lg pl-9 pr-10 py-2.5 text-[13px] text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-2 transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/30 disabled:cursor-not-allowed text-white text-[13px] font-semibold py-2.5 rounded-lg transition-all duration-150"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={14} />
              )}
              {loading ? "Đang xác thực…" : "Đăng nhập"}
            </button>
          </form>

          {/* Hints */}
          <div className="mt-6 pt-5 border-t border-white/7 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3 mb-2">
              Tài khoản demo
            </p>
            {[
              {
                user: "giamdoc",
                pw: "autoss2024",
                role: "Giám Đốc",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10 border-indigo-500/20",
                desc: "Xem toàn bộ · Duyệt đề xuất · Xuất báo cáo",
              },
              {
                user: "ketoan",
                pw: "autoss2024",
                role: "Kế Toán",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
                desc: "Nhập liệu · Import Excel",
              },
            ].map((h) => (
              <button
                key={h.user}
                type="button"
                onClick={() => {
                  setUsername(h.user);
                  setPassword(h.pw);
                  setError("");
                }}
                className={`w-full text-left border rounded-lg px-3 py-2.5 transition-all hover:brightness-110 ${h.bg}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] font-semibold ${h.color}`}>
                    {h.role}
                  </span>
                  <span className="font-mono text-[10px] text-ink-3">
                    {h.user}
                  </span>
                </div>
                <p className="text-[10px] text-ink-3 mt-0.5">{h.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-ink-3 mt-5">
          AUTOSS © 2026 · Phiên bản demo nội bộ
        </p>
      </div>
    </div>
  );
}
