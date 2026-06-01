import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MainLayout } from '../layouts/MainLayout';

const Dashboard        = lazy(() => import('../pages/Dashboard'));
const CashFlow         = lazy(() => import('../pages/CashFlow'));
const Receivables      = lazy(() => import('../pages/Receivables'));
const Payables         = lazy(() => import('../pages/Payables'));
const ExpenseProposals = lazy(() => import('../pages/ExpenseProposals'));
const Tax              = lazy(() => import('../pages/Tax'));
const RiskReserve      = lazy(() => import('../pages/RiskReserve'));

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,          element: withSuspense(Dashboard) },
      { path: 'dong-tien',   element: withSuspense(CashFlow) },
      { path: 'phai-thu',    element: withSuspense(Receivables) },
      { path: 'phai-tra',    element: withSuspense(Payables) },
      { path: 'de-xuat',     element: withSuspense(ExpenseProposals) },
      { path: 'thue',        element: withSuspense(Tax) },
      { path: 'du-phong',    element: withSuspense(RiskReserve) },
    ],
  },
]);
