import type { Receivable, ReceivableStatus } from '../types/finance';
import { generateId, parseAmount } from '../utils/helpers';

export interface ReceivableFormData {
  customer: string;
  project: string;
  contact: string;
  department: string;
  departmentColor: string;
  amount: string;
  status: ReceivableStatus;
  dueDate: string;
  note: string;
}

export function validateReceivable(data: Partial<ReceivableFormData>): string | null {
  if (!data.customer?.trim())        return 'Tên khách hàng là bắt buộc';
  if (!data.project?.trim())         return 'Dự án / lý do là bắt buộc';
  if (!data.department?.trim())      return 'Phòng phụ trách là bắt buộc';
  const amt = parseAmount(data.amount ?? '');
  if (amt <= 0)                      return 'Số tiền phải lớn hơn 0';
  return null;
}

export function buildReceivable(data: ReceivableFormData, existingId?: string): Receivable {
  return {
    id:              existingId ?? generateId(),
    customer:        data.customer.trim(),
    project:         data.project.trim(),
    contact:         data.contact.trim(),
    department:      data.department,
    departmentColor: data.departmentColor || 'blue',
    amount:          parseAmount(data.amount),
    status:          data.status,
    dueDate:         data.dueDate || undefined,
    note:            data.note || undefined,
  };
}

export function getReceivableTotals(receivables: Receivable[]) {
  const active = receivables.filter((r) => r.status !== 'collected');
  return {
    total:         active.reduce((s, r) => s + r.amount, 0),
    count:         active.length,
    overdueCount:  receivables.filter((r) => r.status === 'overdue').length,
    overdueAmount: receivables.filter((r) => r.status === 'overdue').reduce((s, r) => s + r.amount, 0),
  };
}

export const DEPT_OPTIONS = [
  { value: 'KỸ THUẬT',  label: 'KỸ THUẬT',  color: 'indigo' },
  { value: 'KINH DOANH', label: 'KINH DOANH', color: 'green' },
  { value: 'KHO',        label: 'KHO',        color: 'amber' },
  { value: 'ĐIỆN',       label: 'ĐIỆN',       color: 'indigo' },
  { value: 'XƯỞNG',      label: 'XƯỞNG',      color: 'amber' },
  { value: 'KẾ TOÁN',    label: 'KẾ TOÁN',    color: 'blue' },
  { value: 'GIÁM ĐỐC',   label: 'GIÁM ĐỐC',   color: 'red' },
];

export const RECEIVABLE_STATUS_OPTIONS = [
  { value: 'overdue',           label: 'Quá hạn' },
  { value: 'waiting_payment',   label: 'Chờ KH thanh toán' },
  { value: 'waiting_contract',  label: 'Chờ chốt HĐ' },
  { value: 'collected',         label: 'Đã thu' },
];
