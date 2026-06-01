import { RefreshCw, Menu } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";
import { today } from "../../utils/formatters";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const [spinning, setSpinning] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    showToast("Đã làm mới dữ liệu", "success");
  };

  const avatarColor =
    user?.role === "director"
      ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-400"
      : "bg-emerald-500/15 border-emerald-500/25 text-emerald-400";

  return (
    <header className="h-14 border-b border-white/7 flex items-center justify-between px-5 bg-surface-2 sticky top-0 z-50 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-ink-2 hover:bg-surface-3 hover:text-ink-1 transition-colors"
        >
          <Menu size={17} />
        </button>
        <h1 className="text-[13px] font-medium text-ink-1 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:block font-mono text-[11px] text-ink-3 bg-surface-3 border border-white/7 px-3 py-1.5 rounded-lg">
          {today()}
        </span>

        <button
          onClick={handleRefresh}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 bg-surface-3 text-ink-2 hover:text-ink-1 hover:border-white/15 transition-all duration-150"
          title="Làm mới"
        >
          <RefreshCw
            size={14}
            className={clsx(
              "transition-transform duration-500",
              spinning && "rotate-180",
            )}
          />
        </button>

        {/* User chip */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 bg-surface-3 border border-white/7 rounded-lg px-2.5 py-1.5">
            <div
              className={clsx(
                "w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold flex-shrink-0",
                avatarColor,
              )}
            >
              {user.avatar}
            </div>
            <span className="text-[11px] font-medium text-ink-2">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
