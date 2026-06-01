import type { ExpenseProposal, ProposalStatus } from '../types/finance';
import { generateId, parseAmount } from '../utils/helpers';

export interface ProposalFormData {
  department: string;
  departmentColor: string;
  description: string;
  plannedDate: string;
  amount: string;
  note: string;
}

export function validateProposal(data: Partial<ProposalFormData>): string | null {
  if (!data.department?.trim())  return 'Phòng ban là bắt buộc';
  if (!data.description?.trim()) return 'Diễn giải là bắt buộc';
  return null;
}

export function buildProposal(data: ProposalFormData, existingId?: string): ExpenseProposal {
  return {
    id:              existingId ?? generateId(),
    department:      data.department,
    departmentColor: data.departmentColor || 'blue',
    description:     data.description.trim(),
    plannedDate:     data.plannedDate || '—',
    isOverdue:       false,
    status:          'pending' as ProposalStatus,
    amount:          parseAmount(data.amount),
    note:            data.note || undefined,
  };
}

export const PROPOSAL_DEPT_OPTIONS = [
  { value: 'XƯỞNG',     label: 'XƯỞNG',     color: 'amber' },
  { value: 'KHO',       label: 'KHO',       color: 'amber' },
  { value: 'KẾ TOÁN',   label: 'KẾ TOÁN',   color: 'blue' },
  { value: 'ĐIỆN',      label: 'ĐIỆN',      color: 'indigo' },
  { value: 'ROBOT',     label: 'ROBOT',     color: 'red' },
  { value: 'MÃ DỰ ÁN',  label: 'MÃ DỰ ÁN', color: 'indigo' },
  { value: 'GIÁM ĐỐC',  label: 'GIÁM ĐỐC',  color: 'red' },
  { value: 'KINH DOANH', label: 'KINH DOANH', color: 'green' },
];
