import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function ModalBase({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }: ModalBaseProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={clsx(
          'relative w-full bg-surface-2 border border-white/12 rounded-2xl shadow-modal',
          'animate-slide-up',
          sizeClass[size],
        )}
      >
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-ink-1">{title}</h3>
            {subtitle && <p className="text-xs text-ink-3 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink-1 transition-colors ml-4 flex-shrink-0 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-4">{children}</div>
        {footer && (
          <div className="px-6 pb-6 pt-2 flex items-center gap-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
