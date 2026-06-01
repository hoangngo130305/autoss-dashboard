import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import type { ReactElement } from 'react';
import clsx from 'clsx';
import { useToastContext } from '../../context/ToastContext';
import type { ToastType } from '../../types/common';

interface ToastStyle {
  wrapper: string;
  icon: ReactElement;
}

const toastStyles: Record<ToastType, ToastStyle> = {
  success: {
    wrapper: 'border-emerald-500/30 bg-surface-3',
    icon: <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />,
  },
  warning: {
    wrapper: 'border-amber-500/30 bg-surface-3',
    icon: <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />,
  },
  error: {
    wrapper: 'border-red-500/30 bg-surface-3',
    icon: <XCircle size={15} className="text-red-400 flex-shrink-0" />,
  },
  info: {
    wrapper: 'border-blue-500/30 bg-surface-3',
    icon: <Info size={15} className="text-blue-400 flex-shrink-0" />,
  },
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 max-w-xs w-full">
      {toasts.map((t) => {
        const s = toastStyles[t.type];
        return (
          <div
            key={t.id}
            className={clsx(
              'flex items-start gap-2.5 p-3.5 rounded-xl border shadow-modal',
              'animate-toast-in text-sm text-ink-1',
              s.wrapper,
            )}
          >
            {s.icon}
            <span className="flex-1 text-[13px] leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-ink-3 hover:text-ink-1 transition-colors flex-shrink-0 mt-0.5"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
