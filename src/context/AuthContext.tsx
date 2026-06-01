import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

export type UserRole = "director" | "accountant";

export interface AuthUser {
  username: string;
  name: string;
  role: UserRole;
  avatar: string;
  title: string;
}

const USERS: Record<string, { password: string; user: AuthUser }> = {
  giamdoc: {
    password: "autoss2024",
    user: {
      username: "giamdoc",
      name: "Giám Đốc",
      role: "director",
      avatar: "GĐ",
      title: "Toàn quyền xem & duyệt",
    },
  },
  ketoan: {
    password: "autoss2024",
    user: {
      username: "ketoan",
      name: "Kế Toán",
      role: "accountant",
      avatar: "KT",
      title: "Nhập liệu & Import dữ liệu",
    },
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem("autoss_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = useCallback((username: string, password: string): boolean => {
    const entry = USERS[username.trim().toLowerCase()];
    if (!entry || entry.password !== password) return false;
    setUser(entry.user);
    sessionStorage.setItem("autoss_user", JSON.stringify(entry.user));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("autoss_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
