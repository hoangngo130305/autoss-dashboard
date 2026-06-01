import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MainLayout } from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";

// Director pages
const Dashboard = lazy(() => import("../pages/Dashboard"));
const CashFlow = lazy(() => import("../pages/CashFlow"));
const Receivables = lazy(() => import("../pages/Receivables"));
const Payables = lazy(() => import("../pages/Payables"));
const ExpenseProposals = lazy(() => import("../pages/ExpenseProposals"));
const Tax = lazy(() => import("../pages/Tax"));
const RiskReserve = lazy(() => import("../pages/RiskReserve"));

// Auth & Accountant pages
const Login = lazy(() => import("../pages/Login"));
const AccountantHome = lazy(() => import("../pages/Accountant"));
const EntryForm = lazy(() => import("../pages/Accountant/EntryForm"));
const ImportExcel = lazy(() => import("../pages/Accountant/ImportExcel"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// ─── Guards ─────────────────────────────────────────────────────────────────

function RequireDirector() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "accountant") return <Navigate to="/ke-toan" replace />;
  return <Outlet />;
}

function RequireAccountant() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "director") return <Navigate to="/" replace />;
  return <Outlet />;
}

function RedirectIfAuthed() {
  const { user } = useAuth();
  if (user?.role === "director") return <Navigate to="/" replace />;
  if (user?.role === "accountant") return <Navigate to="/ke-toan" replace />;
  return withSuspense(Login);
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  // Login
  { path: "/login", element: <RedirectIfAuthed /> },

  // Director routes
  {
    element: <RequireDirector />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: withSuspense(Dashboard) },
          { path: "dong-tien", element: withSuspense(CashFlow) },
          { path: "phai-thu", element: withSuspense(Receivables) },
          { path: "phai-tra", element: withSuspense(Payables) },
          { path: "de-xuat", element: withSuspense(ExpenseProposals) },
          { path: "thue", element: withSuspense(Tax) },
          { path: "du-phong", element: withSuspense(RiskReserve) },
        ],
      },
    ],
  },

  // Accountant routes
  {
    element: <RequireAccountant />,
    children: [
      { path: "/ke-toan", element: withSuspense(AccountantHome) },
      { path: "/ke-toan/nhap-lieu", element: withSuspense(EntryForm) },
      { path: "/ke-toan/import", element: withSuspense(ImportExcel) },
    ],
  },

  // Catch-all
  { path: "*", element: <Navigate to="/login" replace /> },
]);
