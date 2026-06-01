import type { TaxRecord } from '../types/finance';

export const taxRecords: TaxRecord[] = [
  { id: '1', company: 'AUTOSS',     period: 'TNDN năm 2025',   taxType: 'TNDN', required: 320_000_000, paid: 0, remaining: 320_000_000, status: 'pending', dueDate: '31/03/2026' },
  { id: '2', company: 'AUTOSS',     period: 'GTGT Quý 1/2026', taxType: 'GTGT', required: null, paid: null, remaining: null, status: 'waiting', dueDate: '30/04/2026' },
  { id: '3', company: 'AUTOSS',     period: 'TNCN Quý 1/2026', taxType: 'TNCN', required: null, paid: null, remaining: null, status: 'waiting', dueDate: '30/04/2026' },
  { id: '4', company: 'SX AUTOSS',  period: 'GTGT Quý 2/2026', taxType: 'GTGT', required: null, paid: null, remaining: null, status: 'waiting', dueDate: '31/07/2026' },
  { id: '5', company: 'THANH LUẬN', period: 'GTGT Quý 4/2025', taxType: 'GTGT', required: 145_000_000, paid: 0, remaining: 145_000_000, status: 'overdue', dueDate: '31/01/2026' },
];

export const totalTaxDebt = taxRecords
  .filter((t) => t.status !== 'paid')
  .reduce((s, t) => s + (t.remaining ?? 0), 0);
