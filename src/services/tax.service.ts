import type { TaxRecord, TaxStatus } from '../types/finance';
import { generateId, parseAmount } from '../utils/helpers';

export interface TaxFormData {
  company: string;
  period: string;
  taxType: string;
  required: string;
  paid: string;
  status: TaxStatus;
  dueDate: string;
}

export function validateTax(data: Partial<TaxFormData>): string | null {
  if (!data.company?.trim()) return 'Tên công ty là bắt buộc';
  if (!data.period?.trim())  return 'Kỳ tính thuế là bắt buộc';
  if (!data.taxType?.trim()) return 'Loại thuế là bắt buộc';
  return null;
}

export function buildTaxRecord(data: TaxFormData, existingId?: string): TaxRecord {
  const required = data.required ? parseAmount(data.required) : null;
  const paid     = data.paid     ? parseAmount(data.paid)     : null;
  const remaining = required !== null && paid !== null ? Math.max(0, required - paid) : null;

  return {
    id:        existingId ?? generateId(),
    company:   data.company.trim(),
    period:    data.period.trim(),
    taxType:   data.taxType.trim(),
    required,
    paid,
    remaining,
    status:    data.status,
    dueDate:   data.dueDate || undefined,
  };
}

export const COMPANY_OPTIONS = [
  { value: 'AUTOSS',     label: 'AUTOSS' },
  { value: 'SX AUTOSS',  label: 'SX AUTOSS' },
  { value: 'THANH LUẬN', label: 'THANH LUẬN' },
];

export const TAX_TYPE_OPTIONS = [
  { value: 'TNDN', label: 'TNDN – Thu nhập doanh nghiệp' },
  { value: 'GTGT', label: 'GTGT – Giá trị gia tăng' },
  { value: 'TNCN', label: 'TNCN – Thu nhập cá nhân' },
  { value: 'MÔNT', label: 'Môn bài' },
];

export const TAX_STATUS_OPTIONS = [
  { value: 'waiting', label: 'Chờ khai' },
  { value: 'pending', label: 'Chờ nộp' },
  { value: 'overdue', label: 'Quá hạn' },
  { value: 'filed',   label: 'Đã khai' },
  { value: 'paid',    label: 'Đã nộp' },
];
