import { X } from 'lucide-react';
import clsx from 'clsx';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-200',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-[110] w-56 bg-surface-2 border-r border-white/7 lg:hidden',
          'transition-transform duration-250 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-ink-3 hover:text-ink-1 hover:bg-surface-3 transition-colors"
        >
          <X size={15} />
        </button>
        <Sidebar onNavigate={onClose} />
      </div>
    </>
  );
}
