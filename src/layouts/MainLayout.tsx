import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { Topbar } from '../components/navigation/Topbar';
import { MobileNav } from '../components/navigation/MobileNav';
import { ToastContainer } from '../components/common/Toast';

const PAGE_TITLES: Record<string, string> = {
  '/':          'Dashboard — Dòng tiền & Công nợ',
  '/dong-tien': 'Dòng tiền — 7 ngày gần nhất',
  '/phai-thu':  'Công nợ phải thu',
  '/phai-tra':  'Công nợ phải trả',
  '/de-xuat':   'Đề xuất chi phí — Chờ duyệt',
  '/thue':      'Bảng kê nộp thuế',
  '/du-phong':  'Dự phòng rủi ro',
};

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'AUTOSS';

  return (
    <div className="flex min-h-screen bg-surface-1">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-surface-2 border-r border-white/7 sticky top-0 h-screen overflow-hidden">
        <Sidebar />
      </aside>

      {/* Mobile nav drawer */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
