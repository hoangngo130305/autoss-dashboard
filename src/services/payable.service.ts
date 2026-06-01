import type { Payable, PayableStatus } from '../types/finance';
import { generateId, parseAmount } from '../utils/helpers';

export interface PayableFormData {
  supplier: string;
  contract: string;
  department: string;
  departmentColor: string;
  amount: string;
  status: PayableStatus;
  responsiblePerson: string;
  dueDate: string;
  note: string;
}

export function validatePayable(data: Partial<PayableFormData>): string | null {
  if (!data.supplier?.trim())   return 'Tên nhà cung cấp là bắt buộc';
  if (!data.department?.trim()) return 'Phòng phụ trách là bắt buộc';
  const amt = parseAmount(data.amount ?? '');
  if (amt <= 0)                 return 'Số tiền phải lớn hơn 0';
  return null;
}

export function buildPayable(data: PayableFormData, existingId?: string): Payable {
  return {
    id:                existingId ?? generateId(),
    supplier:          data.supplier.trim(),
    contract:          data.contract.trim() || '—',
    department:        data.department,
    departmentColor:   data.departmentColor || 'amber',
    amount:            parseAmount(data.amount),
    status:            data.status,
    responsiblePerson: data.responsiblePerson || undefined,
    dueDate:           data.dueDate || undefined,
    note:              data.note || undefined,
  };
}

export function getPayableTotals(payables: Payable[]) {
  const active = payables.filter((p) => p.status !== 'paid');
  return {
    total:         active.reduce((s, p) => s + p.amount, 0),
    count:         active.length,
    overdueCount:  payables.filter((p) => p.status === 'overdue').length,
    overdueAmount: payables.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0),
  };
}

export const PAYABLE_STATUS_OPTIONS = [
  { value: 'overdue',        label: 'Quá hạn' },
  { value: 'waiting_update', label: 'Chờ cập nhật' },
  { value: 'approved',       label: 'Đã duyệt TT' },
  { value: 'paid',           label: 'Đã thanh toán' },
];
