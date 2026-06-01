import type { RiskReserve, RiskStatus } from '../types/finance';
import { generateId, parseAmount } from '../utils/helpers';

export interface ReserveFormData {
  depositDate: string;
  amount: string;
  expiryDate: string;
  notes: string;
  status: RiskStatus;
}

export function validateReserve(data: Partial<ReserveFormData>): string | null {
  if (!data.depositDate) return 'Ngày gửi là bắt buộc';
  if (!data.expiryDate)  return 'Kỳ hạn là bắt buộc';
  const amt = parseAmount(data.amount ?? '');
  if (amt <= 0)          return 'Số tiền phải lớn hơn 0';
  return null;
}

export function buildReserve(data: ReserveFormData, existingId?: string): RiskReserve {
  return {
    id:          existingId ?? generateId(),
    depositDate: data.depositDate,
    amount:      parseAmount(data.amount),
    expiryDate:  data.expiryDate,
    notes:       data.notes.trim(),
    status:      data.status,
  };
}

/** Compute status from expiry date */
export function computeReserveStatus(expiryDate: string): RiskStatus {
  const [d, m, y] = expiryDate.split('/').map(Number);
  if (!d || !m || !y) return 'safe';
  const expiry = new Date(y, m - 1, d);
  const now    = new Date();
  const daysLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysLeft < 0)   return 'withdrawn';
  if (daysLeft <= 60) return 'approaching';
  return 'safe';
}

export const RESERVE_STATUS_OPTIONS = [
  { value: 'safe',       label: 'An toàn' },
  { value: 'approaching', label: 'Sắp đến hạn' },
  { value: 'withdrawn',  label: 'Đã rút' },
];
