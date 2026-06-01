import type { ModalData } from '../types/finance';

export const modalData: Record<string, ModalData> = {
  bhxh: {
    title: 'BHXH tháng 5/2026',
    subtitle: 'Đề xuất từ phòng KẾ TOÁN',
    rows: [
      ['Phòng ban', 'KẾ TOÁN'],
      ['Số tiền', '185,000,000 đ'],
      ['Kế hoạch chi', '03/06/2026'],
      ['Nguồn', 'Bảng theo dõi – Trang'],
      ['Dư quỹ hiện tại', '18,400,000,000 đ'],
    ],
    showApprove: true,
  },
  thp: {
    title: 'Thanh toán NCC THP',
    subtitle: 'Hợp đồng 0000065 — ĐÃ QUÁ HẠN · KHO phụ trách',
    rows: [
      ['NCC', 'THP'],
      ['Hợp đồng', '0000065'],
      ['Số tiền nợ', '980,000,000 đ'],
      ['Trạng thái', 'Quá hạn'],
      ['Phòng phụ trách', 'KHO'],
      ['Dư quỹ hiện tại', '18,400,000,000 đ'],
    ],
    showApprove: true,
  },
  vegas: {
    title: 'Thanh toán NCC Vegas',
    subtitle: 'Hợp đồng 00000597 — ĐÃ QUÁ HẠN · KHO phụ trách',
    rows: [
      ['NCC', 'Vegas'],
      ['Hợp đồng', '00000597'],
      ['Số tiền nợ', '1,420,000,000 đ'],
      ['Trạng thái', 'Quá hạn'],
      ['Phòng phụ trách', 'KHO'],
      ['Dư quỹ hiện tại', '18,400,000,000 đ'],
    ],
    showApprove: true,
  },
  vietmy: {
    title: 'Thanh toán NCC Việt Mỹ',
    subtitle: 'Hợp đồng 0000038+44 — ĐÃ QUÁ HẠN · KHO phụ trách',
    rows: [
      ['NCC', 'Việt Mỹ'],
      ['Hợp đồng', '0000038+44'],
      ['Số tiền nợ', '1,650,000,000 đ'],
      ['Trạng thái', 'Quá hạn'],
      ['Phòng phụ trách', 'KHO'],
      ['Dư quỹ hiện tại', '18,400,000,000 đ'],
    ],
    showApprove: true,
  },
  robot: {
    title: 'AT-008-25 Robot mài bàn đá',
    subtitle: 'Đề xuất từ phòng ĐIỆN',
    rows: [
      ['Mã dự án', 'AT-008-25'],
      ['Diễn giải', 'Thay thế motor fanuc'],
      ['Số tiền', '—'],
      ['Kế hoạch chi', '07/06/2026'],
      ['Phòng đề xuất', 'ĐIỆN'],
    ],
    showApprove: true,
  },
  luong: {
    title: 'Lương nhân viên tháng 5/2026',
    subtitle: 'Đề xuất từ phòng KẾ TOÁN',
    rows: [
      ['Loại', 'Lương tháng 5'],
      ['Kế hoạch chi', '12/06/2026'],
      ['Nguồn', 'Bảng lương'],
      ['Phòng duyệt', 'KẾ TOÁN'],
    ],
    showApprove: true,
  },
  cd: {
    title: 'Kinh phí công đoàn Q1–5/2026',
    subtitle: 'Đề xuất từ phòng KẾ TOÁN',
    rows: [
      ['Kỳ', 'Q1–5/2026 · 2 Cty'],
      ['Tỷ lệ', '2% Quỹ lương'],
      ['Kế hoạch chi', '04/06/2026'],
      ['Nguồn', 'Trang – phụ trách BHXH'],
    ],
    showApprove: true,
  },
};
