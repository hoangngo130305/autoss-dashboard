import type { CashFlowDay, CashFlowTransaction } from '../types/finance';

/** Aggregated daily data — used by the chart */
export const cashFlowData: CashFlowDay[] = [
  { date: '26/05', income: 1_200_000_000, expense:   780_000_000 },
  { date: '27/05', income:   850_000_000, expense: 1_200_000_000 },
  { date: '28/05', income: 2_100_000_000, expense:   650_000_000 },
  { date: '29/05', income:   430_000_000, expense:   990_000_000 },
  { date: '30/05', income: 1_670_000_000, expense: 1_100_000_000 },
  { date: '31/05', income:   920_000_000, expense:   430_000_000 },
  { date: '01/06', income: 1_340_000_000, expense:   870_000_000 },
];

export const totalIncome  = cashFlowData.reduce((s, d) => s + d.income,  0);
export const totalExpense = cashFlowData.reduce((s, d) => s + d.expense, 0);

/** Detailed transaction records — used by the table */
export const cashFlowTransactions: CashFlowTransaction[] = [
  { id: 'cf-01', date: '2026-05-26', type: 'in',  amount: 1_200_000_000, description: 'Thu bảo hành Lò Hùng Nghĩa',        account: 'ACB',  department: 'KỸ THUẬT' },
  { id: 'cf-02', date: '2026-05-26', type: 'out', amount:   780_000_000, description: 'Trả NCC THP — đợt 1',               account: 'VCB',  department: 'KHO' },
  { id: 'cf-03', date: '2026-05-27', type: 'in',  amount:   850_000_000, description: 'Thu dự án điêu khắc Phan Gia',       account: 'ACB',  department: 'KINH DOANH' },
  { id: 'cf-04', date: '2026-05-27', type: 'out', amount: 1_200_000_000, description: 'Lương nhân viên tháng 4',            account: 'MB',   department: 'KẾ TOÁN' },
  { id: 'cf-05', date: '2026-05-28', type: 'in',  amount: 2_100_000_000, description: 'Thu bảo hành Lò Phùng Kim Diệu',    account: 'VCB',  department: 'KỸ THUẬT' },
  { id: 'cf-06', date: '2026-05-28', type: 'out', amount:   650_000_000, description: 'Chi phí vật tư xưởng T5',            account: 'ACB',  department: 'XƯỞNG' },
  { id: 'cf-07', date: '2026-05-29', type: 'in',  amount:   430_000_000, description: 'Thu phí bảo hành thiết bị',          account: 'ACB',  department: 'KỸ THUẬT' },
  { id: 'cf-08', date: '2026-05-29', type: 'out', amount:   990_000_000, description: 'Trả NCC Vegas — đợt 1',              account: 'VCB',  department: 'KHO' },
  { id: 'cf-09', date: '2026-05-30', type: 'in',  amount: 1_670_000_000, description: 'Thu hợp đồng robot AT-007-25',       account: 'ACB',  department: 'ĐIỆN' },
  { id: 'cf-10', date: '2026-05-30', type: 'out', amount: 1_100_000_000, description: 'Điện nước + mặt bằng tháng 5',       account: 'MB',   department: 'XƯỞNG' },
  { id: 'cf-11', date: '2026-05-31', type: 'in',  amount:   920_000_000, description: 'Thu dự án AT-006-25',                account: 'VCB',  department: 'ĐIỆN' },
  { id: 'cf-12', date: '2026-05-31', type: 'out', amount:   430_000_000, description: 'Đồ nghề lắp đặt phòng điện',         account: 'ACB',  department: 'ĐIỆN' },
  { id: 'cf-13', date: '2026-06-01', type: 'in',  amount: 1_340_000_000, description: 'Thu từ khách hàng mới Q2',           account: 'ACB',  department: 'KINH DOANH' },
  { id: 'cf-14', date: '2026-06-01', type: 'out', amount:   870_000_000, description: 'BHXH tháng 4/2026',                  account: 'MB',   department: 'KẾ TOÁN' },
];
