import ExcelJS from 'exceljs';
import type { CashFlowTransaction, ExpenseProposal, TaxRecord, RiskReserve } from '../types/finance';

// ── Palette (ARGB) ────────────────────────────────────────────────────────────
const C = {
  black:    'FF000000',
  white:    'FFFFFFFF',
  red:      'FFCC0000',   // title / tổng labels
  hdrBlue:  'FF9DC3E6',   // Sheet 1/2/4 header bg (Excel "Blue, Accent 1, Lighter 40%")
  hdrGreen: 'FF375623',   // Sheet 3 header bg (dark forest green)
  hdrGold:  'FFFFC000',   // Sheet 5 header bg (amber/gold)
  rowBlue:  'FFBDD7EE',   // alternating row bg (light blue)
  rowWhite: 'FFFFFFFF',
  dpYellow: 'FFFFFF00',   // DỰ PHÒNG row bg
  green:    'FF00B050',   // "Số dư đầu kỳ" italic
  totalBg:  'FFDCE6F1',   // tổng row bg
};

type ARGB = string;

function fill(argb: ARGB): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function thin(color = 'FF000000'): ExcelJS.Border {
  return { style: 'thin', color: { argb: color } };
}

function allBorder(color = 'FF000000'): Partial<ExcelJS.Borders> {
  const b = thin(color);
  return { top: b, bottom: b, left: b, right: b };
}

function todayVN(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function toVN(yyyymmdd: string): string {
  const parts = yyyymmdd.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return yyyymmdd;
}

function addDays(ddmmyyyy: string, n: number): string {
  if (!ddmmyyyy || ddmmyyyy === '—') return '—';
  const [d, m, y] = ddmmyyyy.split('/').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function styleHeader(
  row: ExcelJS.Row,
  labels: string[],
  bgArgb: ARGB,
  textArgb: ARGB = C.black,
  height = 24,
) {
  row.height = height;
  labels.forEach((label, i) => {
    const cell = row.getCell(i + 1);
    cell.value = label;
    cell.font = { bold: true, size: 11, color: { argb: textArgb }, name: 'Arial' };
    cell.fill = fill(bgArgb);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = allBorder();
  });
}

function styleDataRow(row: ExcelJS.Row, values: unknown[], isAlt: boolean, moneyIdxSet: Set<number>) {
  row.height = 18;
  values.forEach((val, i) => {
    const cell = row.getCell(i + 1);
    if (isAlt) cell.fill = fill(C.rowBlue);
    cell.border = allBorder('FFB0B0B0');
    cell.font = { size: 11, name: 'Arial' };

    if (moneyIdxSet.has(i) && typeof val === 'number' && val !== 0) {
      cell.value = val;
      cell.numFmt = '#,##0';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    } else if (moneyIdxSet.has(i) && (!val || val === 0 || val === '')) {
      cell.value = '-';
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { size: 11, color: { argb: C.black } };
    } else {
      cell.value = val as ExcelJS.CellValue;
      cell.alignment = { vertical: 'middle' };
    }
  });
}

// ── Sheet 1: Sổ báo cáo dòng tiền đầu ngày ───────────────────────────────────
function buildSheet1(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet('Dòng tiền đầu ngày');
  ws.columns = [{ width: 38 }, { width: 22 }, { width: 28 }];

  // R1: Title
  ws.mergeCells('A1:C1');
  const t = ws.getCell('A1');
  t.value = 'SỔ BÁO CÁO DÒNG TIỀN ĐẦU NGÀY';
  t.font = { bold: true, size: 16, name: 'Arial', color: { argb: C.black } };
  t.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 34;

  // R2: blank
  ws.getRow(2).height = 6;

  // R3: Ngày / Date
  ws.getCell('A3').value = 'Ngày';
  ws.getCell('A3').font = { bold: true, size: 12, color: { argb: C.red }, name: 'Arial' };
  ws.getCell('C3').value = todayVN();
  ws.getCell('C3').font = { bold: true, size: 12, name: 'Arial' };
  ws.getCell('C3').alignment = { horizontal: 'right' };
  ws.getRow(3).height = 22;

  // R4: blank
  ws.getRow(4).height = 6;

  // R5: Headers
  styleHeader(ws.getRow(5), ['Diễn giải', 'Số tồn hiện tại', 'Nguồn tiền'], C.hdrBlue);

  // R6-14: Account rows
  const accounts = [
    'TK Kế toán- CHI', 'tk AUTOSS- ACB', 'TK AUTOSS- VCB',
    'TK AUTOSS- EXIMBANK', 'TK AUTOSS- MB BANK', 'TK SX AUTOSS',
    'TK USD', 'TK khác', 'TIỀN MẶT',
  ];
  accounts.forEach((name, i) => {
    const row = ws.getRow(6 + i);
    row.height = 18;
    const isAlt = i % 2 === 0;
    (['A', 'B', 'C'] as const).forEach((col) => {
      const cell = row.getCell(col === 'A' ? 1 : col === 'B' ? 2 : 3);
      if (isAlt) cell.fill = fill(C.rowBlue);
      cell.border = allBorder('FFB0B0B0');
      cell.font = { size: 11, name: 'Arial' };
    });
    row.getCell(1).value = name;
    row.getCell(2).value = '-';
    row.getCell(2).alignment = { horizontal: 'center' };
  });

  const nextR = 6 + accounts.length;

  // Tổng tiền tồn quỹ
  const totRow = ws.getRow(nextR);
  totRow.height = 20;
  [1, 2, 3].forEach((c) => {
    const cell = totRow.getCell(c);
    cell.font = { bold: true, size: 11, color: { argb: C.red }, name: 'Arial' };
    cell.border = allBorder();
  });
  totRow.getCell(1).value = 'Tổng tiền tồn quỹ';
  totRow.getCell(2).value = '-';
  totRow.getCell(2).alignment = { horizontal: 'center' };

  // DỰ PHÒNG RỦI RO
  const dpRow = ws.getRow(nextR + 1);
  dpRow.height = 22;
  [1, 2, 3].forEach((c) => {
    const cell = dpRow.getCell(c);
    cell.fill = fill(C.dpYellow);
    cell.font = { bold: true, italic: true, size: 11, color: { argb: C.black }, name: 'Arial' };
    cell.border = allBorder();
  });
  dpRow.getCell(1).value = 'DỰ PHÒNG RỦI RO';
  dpRow.getCell(2).value = '-';
  dpRow.getCell(2).alignment = { horizontal: 'center' };
}

// ── Sheet 2: Sổ chi tiền mặt ─────────────────────────────────────────────────
function buildSheet2(wb: ExcelJS.Workbook, txs: CashFlowTransaction[]) {
  const ws = wb.addWorksheet('Sổ chi tiền mặt');
  ws.columns = [
    { width: 14 }, { width: 16 }, { width: 52 },
    { width: 18 }, { width: 18 }, { width: 18 },
  ];

  // R1: Title
  ws.mergeCells('A1:F1');
  const t = ws.getCell('A1');
  t.value = 'SỔ CHI TIỀN MẶT- TK CÁ NHÂN 2026';
  t.font = { bold: true, size: 14, color: { argb: C.red }, name: 'Arial' };
  t.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // R2: blank
  ws.getRow(2).height = 6;

  // R3: Headers
  styleHeader(ws.getRow(3), ['Ngày tháng', 'Mục đích', 'Diễn giải', 'Thu', 'Chi', 'Tồn quỹ'], C.hdrBlue);

  // R4: Số dư đầu kỳ
  const soDuRow = ws.getRow(4);
  soDuRow.height = 18;
  for (let c = 1; c <= 6; c++) {
    const cell = soDuRow.getCell(c);
    cell.fill = fill(C.rowBlue);
    cell.border = allBorder('FFB0B0B0');
    if (c >= 4) { cell.value = '-'; cell.alignment = { horizontal: 'center' }; }
    cell.font = { size: 11, name: 'Arial' };
  }
  soDuRow.getCell(3).value = 'Sổ dư đầu kỳ';
  soDuRow.getCell(3).font = { italic: true, size: 11, color: { argb: C.green }, name: 'Arial' };

  // Data rows
  const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));
  let balance = 0;
  const moneyIdx = new Set([3, 4, 5]);

  sorted.forEach((tx, i) => {
    const thu = tx.type === 'in' ? tx.amount : 0;
    const chi = tx.type === 'out' ? tx.amount : 0;
    balance += thu - chi;
    const row = ws.getRow(5 + i);
    styleDataRow(row, [toVN(tx.date), tx.department, tx.description, thu || 0, chi || 0, balance], i % 2 === 0, moneyIdx);
  });

  // Extra empty rows for manual entry
  const startEmpty = 5 + sorted.length;
  for (let i = 0; i < 8; i++) {
    const row = ws.getRow(startEmpty + i);
    row.height = 18;
    for (let c = 1; c <= 6; c++) {
      const cell = row.getCell(c);
      if ((startEmpty + i) % 2 === 0) cell.fill = fill(C.rowBlue);
      cell.border = allBorder('FFB0B0B0');
    }
  }

  // Tổng footer
  const footR = startEmpty + 8;
  const footRow = ws.getRow(footR);
  footRow.height = 22;
  const totalThu = sorted.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalChi = sorted.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);

  footRow.getCell(1).value = 'Tổng';
  footRow.getCell(1).font = { bold: true, size: 11, color: { argb: C.red }, name: 'Arial' };
  [4, 5].forEach((c, idx) => {
    const cell = footRow.getCell(c);
    cell.value = idx === 0 ? totalThu : totalChi;
    cell.numFmt = '#,##0';
    cell.alignment = { horizontal: 'right' };
    cell.font = { bold: true, size: 11, name: 'Arial' };
  });
  footRow.getCell(6).value = '-';
  footRow.getCell(6).alignment = { horizontal: 'center' };
  footRow.getCell(6).font = { bold: true, size: 11 };
  for (let c = 1; c <= 6; c++) footRow.getCell(c).border = allBorder();
}

// ── Sheet 3: Bảng kê chi phí ──────────────────────────────────────────────────
function buildSheet3(wb: ExcelJS.Workbook, proposals: ExpenseProposal[]) {
  const ws = wb.addWorksheet('Bảng kê chi phí');
  ws.columns = [
    { width: 6 }, { width: 14 }, { width: 52 },
    { width: 18 }, { width: 20 }, { width: 20 },
  ];

  // R1: Title
  ws.mergeCells('A1:F1');
  const t = ws.getCell('A1');
  t.value = 'BẢNG KÊ CHI PHÍ ĐƯỢC UPDATE HÀNG NGÀY';
  t.font = { bold: true, size: 14, name: 'Arial', color: { argb: C.black } };
  t.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // R2: Ngày
  ws.getCell('A2').value = 'Ngày';
  ws.getCell('A2').font = { bold: true, size: 11, color: { argb: C.red } };
  ws.getCell('B2').value = todayVN();
  ws.getCell('B2').font = { bold: true, size: 11 };
  ws.getRow(2).height = 20;

  // R3: blank
  ws.getRow(3).height = 6;

  // R4: Headers (dark green bg, white text)
  styleHeader(
    ws.getRow(4),
    ['STT', 'CHI PHÍ', 'Diễn giải chi phí', 'Thành tiền chi', 'Kế hoạch chi tiền', 'PHÒNG BAN ĐỀ XUẤT'],
    C.hdrGreen, C.white,
  );

  const moneyIdx = new Set([3]);
  proposals.forEach((p, i) => {
    const row = ws.getRow(5 + i);
    styleDataRow(
      row,
      [i + 1, p.department, p.description, p.amount ?? 0, p.plannedDate, p.requestDept ?? ''],
      i % 2 === 0,
      moneyIdx,
    );
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Extra blank rows
  const startEmpty = 5 + proposals.length;
  for (let i = 0; i < 5; i++) {
    const row = ws.getRow(startEmpty + i);
    row.height = 18;
    for (let c = 1; c <= 6; c++) row.getCell(c).border = allBorder('FFD0D0D0');
  }

  // Total row
  const totRow = ws.getRow(startEmpty + 5);
  totRow.height = 20;
  totRow.getCell(4).value = proposals.reduce((s, p) => s + (p.amount ?? 0), 0);
  totRow.getCell(4).numFmt = '#,##0';
  totRow.getCell(4).alignment = { horizontal: 'right' };
  totRow.getCell(4).font = { bold: true, size: 11 };
  for (let c = 1; c <= 6; c++) totRow.getCell(c).border = allBorder();
}

// ── Sheet 4: Bảng kê nộp thuế ────────────────────────────────────────────────
function buildSheet4(wb: ExcelJS.Workbook, taxes: TaxRecord[]) {
  const ws = wb.addWorksheet('Bảng kê nộp thuế');
  ws.columns = [
    { width: 16 }, { width: 28 }, { width: 18 },
    { width: 14 }, { width: 22 }, { width: 24 }, { width: 24 },
  ];

  // R1: Title
  ws.mergeCells('A1:G1');
  const t = ws.getCell('A1');
  t.value = 'BẢNG KÊ NỘP THUẾ';
  t.font = { bold: true, size: 14, name: 'Arial', color: { argb: C.black } };
  t.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;
  ws.getRow(2).height = 8;
  ws.getRow(3).height = 8;

  // R4: Headers
  styleHeader(ws.getRow(4), [
    'TÊN CÔNG TY', 'KỲ TÍNH THUẾ', 'SỐ THUẾ PHẢI NỘP', 'ĐÃ NỘP',
    'Tổng tiền nợ nhà nước', 'THỜI HẠN CƯỠNG CHẾ\nNGÂN HÀNG (90 NGÀY)', 'THỜI HẠN CƯỠNG CHẾ\nHÓA ĐƠN (120 NGÀY)',
  ], C.hdrBlue, C.black, 36);

  const moneyIdx = new Set([2, 3, 4]);
  taxes.forEach((r, i) => {
    const nh = r.dueDate ? addDays(r.dueDate, 90) : '—';
    const hd = r.dueDate ? addDays(r.dueDate, 120) : '—';
    const row = ws.getRow(5 + i);
    styleDataRow(row, [
      r.company, `${r.period} (${r.taxType})`,
      r.required ?? 0, r.paid ?? 0, r.remaining ?? 0, nh, hd,
    ], i % 2 === 0, moneyIdx);
  });

  // Tổng cộng nợ thuế footer
  const footR = 5 + taxes.length;
  const footRow = ws.getRow(footR);
  footRow.height = 22;
  const totalDebt = taxes.reduce((s, r) => s + (r.remaining ?? 0), 0);

  footRow.getCell(2).value = 'Tổng cộng nợ thuế';
  footRow.getCell(2).font = { bold: true, size: 11, color: { argb: C.red }, name: 'Arial' };
  footRow.getCell(2).alignment = { horizontal: 'center' };

  [2, 3].forEach((c) => {
    const cell = footRow.getCell(c + 1);
    cell.value = '-';
    cell.alignment = { horizontal: 'center' };
    cell.font = { bold: true, color: { argb: C.red } };
  });

  footRow.getCell(5).value = totalDebt;
  footRow.getCell(5).numFmt = '#,##0';
  footRow.getCell(5).alignment = { horizontal: 'right' };
  footRow.getCell(5).font = { bold: true, size: 11, color: { argb: C.red }, name: 'Arial' };

  for (let c = 1; c <= 7; c++) footRow.getCell(c).border = allBorder();
}

// ── Sheet 5: Sổ theo dõi dòng tiền dự phòng ─────────────────────────────────
function buildSheet5(wb: ExcelJS.Workbook, reserves: RiskReserve[]) {
  const ws = wb.addWorksheet('Sổ dự phòng');
  ws.columns = [{ width: 16 }, { width: 20 }, { width: 20 }, { width: 40 }];

  // R1: Title
  ws.mergeCells('A1:D1');
  const t = ws.getCell('A1');
  t.value = 'SỔ THEO DÕI DÒNG TIỀN DỰ PHÒNG';
  t.font = { bold: true, size: 14, color: { argb: C.red }, name: 'Arial' };
  t.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // R2: blank
  ws.getRow(2).height = 8;

  // R3: Headers (gold/amber bg)
  styleHeader(ws.getRow(3), ['NGÀY', 'SỐ TIỀN', 'KỲ HẠN SỬ DỤNG', 'GHI CHÚ'], C.hdrGold, C.black);

  const moneyIdx = new Set([1]);

  // Data rows
  reserves.forEach((r, i) => {
    const row = ws.getRow(4 + i);
    styleDataRow(row, [r.depositDate, r.amount, r.expiryDate, r.notes], i % 2 === 0, moneyIdx);
  });

  // Extra blank rows
  const startEmpty = 4 + reserves.length;
  for (let i = 0; i < 6; i++) {
    const row = ws.getRow(startEmpty + i);
    row.height = 18;
    for (let c = 1; c <= 4; c++) {
      const cell = row.getCell(c);
      if ((startEmpty + i) % 2 === 0) cell.fill = fill(C.rowBlue);
      cell.border = allBorder('FFB0B0B0');
    }
  }

  // TỔNG footer
  const footR = startEmpty + 6;
  const footRow = ws.getRow(footR);
  footRow.height = 22;
  footRow.getCell(1).value = 'TỔNG';
  footRow.getCell(1).font = { bold: true, size: 11, color: { argb: C.red }, name: 'Arial' };
  footRow.getCell(2).value = reserves.reduce((s, r) => s + r.amount, 0);
  footRow.getCell(2).numFmt = '#,##0';
  footRow.getCell(2).alignment = { horizontal: 'right' };
  footRow.getCell(2).font = { bold: true, size: 11 };
  for (let c = 1; c <= 4; c++) footRow.getCell(c).border = allBorder();
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function exportAccountingReport(
  txs: CashFlowTransaction[],
  proposals: ExpenseProposal[],
  taxes: TaxRecord[],
  reserves: RiskReserve[],
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AUTOSS';
  wb.created = new Date();

  buildSheet1(wb);
  buildSheet2(wb, txs);
  buildSheet3(wb, proposals);
  buildSheet4(wb, taxes);
  buildSheet5(wb, reserves);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BAO_CAO_KE_TOAN_AUTOSS_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Blank template — same 5-sheet structure, no data rows
export async function exportBlankTemplate() {
  await exportAccountingReport([], [], [], []);
}
