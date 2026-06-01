export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  path: string;
  group: string;
}

export type FilterPeriod = 'today' | 'week' | 'month' | 'quarter';

// ─── Table / form utilities ──────────────────────────────────────────────────

export interface SortConfig<T> {
  key: keyof T;
  dir: 'asc' | 'desc';
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
}
