import type { BankAccount } from '../types/finance';

export const bankAccounts: BankAccount[] = [
  { id: '1', name: 'ACB – AUTOSS',   bank: 'ACB',         balance: 5_230_000_000, percentage: 85, color: 'blue' },
  { id: '2', name: 'VCB – AUTOSS',   bank: 'Vietcombank', balance: 4_810_000_000, percentage: 78, color: 'green' },
  { id: '3', name: 'EXIMBANK',        bank: 'Eximbank',    balance: 2_150_000_000, percentage: 35, color: 'indigo' },
  { id: '4', name: 'MB BANK',         bank: 'MB Bank',     balance: 3_480_000_000, percentage: 56, color: 'amber' },
  { id: '5', name: 'SX AUTOSS',       bank: 'Nội bộ',      balance: 1_920_000_000, percentage: 31, color: 'blue' },
  { id: '6', name: 'TK USD (~)',       bank: 'USD',         balance:   312_000_000, percentage:  5, color: 'green' },
  { id: '7', name: 'Tiền mặt',        bank: 'Cash',        balance:   498_000_000, percentage:  8, color: 'amber' },
];

export const totalBalance   = 18_400_000_000;
export const riskReserveAmt = 2_000_000_000;
