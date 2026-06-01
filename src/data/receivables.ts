import type { Receivable } from '../types/finance';

export const receivables: Receivable[] = [
  {
    id: '1',
    customer: 'Lò Hùng Nghĩa',
    project: 'Sau bảo hành',
    contact: 'Anh Chấn',
    department: 'KỸ THUẬT',
    departmentColor: 'indigo',
    amount: 1_850_000_000,
    status: 'overdue',
    dueDate: '15/04/2026',
    note: 'Đã liên hệ nhiều lần, chưa phản hồi',
  },
  {
    id: '2',
    customer: 'Lò Phùng Kim Diệu',
    project: 'Sau bảo hành',
    contact: 'Anh Chấn',
    department: 'KỸ THUẬT',
    departmentColor: 'indigo',
    amount: 2_100_000_000,
    status: 'waiting_payment',
    dueDate: '30/06/2026',
    note: '',
  },
  {
    id: '3',
    customer: 'Phan Gia',
    project: 'Dự án điêu khắc · Hoàn cọc',
    contact: '—',
    department: 'KINH DOANH',
    departmentColor: 'green',
    amount: 2_250_000_000,
    status: 'waiting_contract',
    dueDate: '',
    note: 'Chờ chốt hợp đồng, đã cọc 50%',
  },
];

export const totalReceivables = receivables
  .filter((r) => r.status !== 'collected')
  .reduce((s, r) => s + r.amount, 0);
