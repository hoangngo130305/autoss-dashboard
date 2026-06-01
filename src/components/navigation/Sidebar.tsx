import { NavLink, useNavigate } from "react-router-dom";
import type { ReactElement } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Receipt,
  Shield,
  ChevronRight,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

interface NavItemDef {
  path: string;
  icon: ReactElement;
  label: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItemDef[];
}

const navGroups: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { path: "/", icon: <LayoutDashboard size={15} />, label: "Dashboard" },
      {
        path: "/dong-tien",
        icon: <TrendingUp size={15} />,
        label: "Dòng tiền",
      },
    ],
  },
  {
    label: "Công nợ",
    items: [
      {
        path: "/phai-thu",
        icon: <ArrowDownToLine size={15} />,
        label: "Phải thu (KH)",
        badge: 3,
      },
      {
        path: "/phai-tra",
        icon: <ArrowUpFromLine size={15} />,
        label: "Phải trả (NCC)",
        badge: 4,
      },
    ],
  },
  {
    label: "Chi phí",
    items: [
      {
        path: "/de-xuat",
        icon: <FileText size={15} />,
        label: "Đề xuất duyệt",
        badge: 25,
      },
      { path: "/thue", icon: <Receipt size={15} />, label: "Bảng kê thuế" },
      {
        path: "/du-phong",
        icon: <Shield size={15} />,
        label: "Dự phòng rủi ro",
      },
    ],
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const avatarColor =
    user?.role === "director"
      ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-400"
      : "bg-emerald-500/15 border-emerald-500/25 text-emerald-400";

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/7 flex-shrink-0">
        <div className="font-mono text-[13px] font-medium text-blue-400 tracking-wide mb-0.5">
          AUTOSS
        </div>
        <div className="text-[10px] text-ink-3">Quản lý tài chính nội bộ</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-ink-3 px-2.5 py-2">
              {group.label}
            </span>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-[13px] transition-all duration-150",
                    "border border-transparent group",
                    isActive
                      ? "bg-blue-500/12 text-blue-400 border-blue-500/20"
                      : "text-ink-2 hover:bg-surface-3 hover:text-ink-1",
                  )
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge != null && (
                  <span className="bg-red-500/15 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  size={12}
                  className="text-ink-3 opacity-0 group-hover:opacity-60 transition-opacity"
                />
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-3 border-t border-white/7 flex-shrink-0 space-y-1">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
          <div
            className={clsx(
              "w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0",
              avatarColor,
            )}
          >
            {user?.avatar ?? "GĐ"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-ink-1 truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-ink-3 truncate">{user?.title}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-ink-3 hover:text-red-400 hover:bg-red-500/8 transition-all"
        >
          <LogOut size={13} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
