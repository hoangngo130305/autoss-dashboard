import type { Payable } from '../types/finance';

export const payables: Payable[] = [
  {
    id: '1',
    supplier: 'NCC THP',
    contract: '0000065',
    department: 'KHO',
    departmentColor: 'amber',
    amount: 980_000_000,
    status: 'overdue',
    dueDate: '01/04/2026',
    note: '',
  },
  {
    id: '2',
    supplier: 'NCC Vegas',
    contract: '00000597',
    department: 'KHO',
    departmentColor: 'amber',
    amount: 1_420_000_000,
    status: 'overdue',
    dueDate: '15/04/2026',
    note: '',
  },
  {
    id: '3',
    supplier: 'NCC Việt Mỹ',
    contract: '0000038+44',
    department: 'KHO',
    departmentColor: 'amber',
    amount: 1_650_000_000,
    status: 'overdue',
    dueDate: '01/05/2026',
    note: '',
  },
  {
    id: '4',
    supplier: 'Anh Nhân – Robot Đợt 2',
    contract: '—',
    department: 'GIÁM ĐỐC',
    departmentColor: 'red',
    amount: 750_000_000,
    status: 'waiting_update',
    responsiblePerson: 'Giám đốc',
    dueDate: '',
    note: 'Chờ cập nhật số liệu xác nhận',
  },
];

export const totalPayables = payables
  .filter((p) => p.status !== 'paid')
  .reduce((s, p) => s + p.amount, 0);
