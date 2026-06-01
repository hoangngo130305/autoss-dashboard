import ExcelJS from "exceljs";

const HEADER_BG = "FF1F4E79"; // dark navy blue
const HEADER_FG = "FFFFFFFF";
const TITLE_BG = "FF2E75B6";
const ALT_ROW_BG = "FFF0F7FF";
const TOTAL_BG = "FFDCE6F1";
const BORDER_CLR = "FFBBBBBB";

const MONEY_COLS = [
  "thu",
  "chi",
  "tồn quỹ",
  "thành tiền",
  "tiền",
  "phải nộp",
  "đã nộp",
  "còn nợ",
  "số tiền",
  "amount",
];

function isMoneyHeader(header: string) {
  const h = header.toLowerCase();
  return MONEY_COLS.some((k) => h.includes(k));
}

function hairBorder(): Partial<ExcelJS.Borders> {
  const s: ExcelJS.Border = { style: "hair", color: { argb: BORDER_CLR } };
  return { top: s, bottom: s, left: s, right: s };
}

function thinBorder(): Partial<ExcelJS.Borders> {
  const s: ExcelJS.Border = { style: "thin", color: { argb: BORDER_CLR } };
  return { top: s, bottom: s, left: s, right: s };
}

export async function exportStyledExcel(
  data: Record<string, unknown>[],
  fileName: string,
  reportTitle: string,
  subtitle?: string,
) {
  if (!data.length) return;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AUTOSS";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Dữ liệu", {
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
    },
  });

  const headers = Object.keys(data[0]);
  const colCount = headers.length;
  const moneyFlags = headers.map(isMoneyHeader);

  // ── Row 1: Report title ─────────────────────────────────────────────────────
  ws.mergeCells(1, 1, 1, colCount);
  const titleCell = ws.getCell("A1");
  titleCell.value = reportTitle;
  titleCell.font = {
    bold: true,
    size: 14,
    color: { argb: HEADER_FG },
    name: "Arial",
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: TITLE_BG },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 30;

  // ── Row 2: Subtitle / date ──────────────────────────────────────────────────
  ws.mergeCells(2, 1, 2, colCount);
  const subCell = ws.getCell("A2");
  subCell.value =
    subtitle ?? `Xuất ngày: ${new Date().toLocaleDateString("vi-VN")}`;
  subCell.font = {
    italic: true,
    size: 10,
    color: { argb: "FF555555" },
    name: "Arial",
  };
  subCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF5F9FF" },
  };
  subCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(2).height = 18;

  // ── Row 3: Headers ──────────────────────────────────────────────────────────
  const headerRow = ws.addRow(headers);
  headerRow.height = 22;
  headerRow.eachCell((cell, colIdx) => {
    cell.font = {
      bold: true,
      color: { argb: HEADER_FG },
      size: 10,
      name: "Arial",
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_BG },
    };
    cell.alignment = {
      horizontal: moneyFlags[colIdx - 1] ? "right" : "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = thinBorder();
  });

  // ── Data rows ───────────────────────────────────────────────────────────────
  data.forEach((rowData, i) => {
    const values = headers.map((h) => rowData[h]);
    const row = ws.addRow(values);
    row.height = 18;
    row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      const isMoney = moneyFlags[colIdx - 1];

      if (i % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: ALT_ROW_BG },
        };
      }

      if (isMoney) {
        if (typeof cell.value === "number" && cell.value !== 0) {
          cell.numFmt = "#,##0";
          cell.font = {
            name: "Courier New",
            size: 10,
            color: { argb: cell.value < 0 ? "FFCC0000" : "FF1A6B1A" },
          };
        } else if (cell.value === "" || cell.value === 0) {
          cell.value = null;
          cell.font = { color: { argb: "FF999999" }, size: 10 };
        }
        cell.alignment = { horizontal: "right", vertical: "middle" };
      } else {
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = { vertical: "middle" };
      }

      cell.border = hairBorder();
    });
  });

  // ── Totals row ──────────────────────────────────────────────────────────────
  const totals: (string | number | null)[] = headers.map((h, idx) => {
    if (idx === 0) return "TỔNG CỘNG";
    if (!moneyFlags[idx]) return null;
    return data.reduce((sum, row) => {
      const v = row[h];
      return typeof v === "number" ? sum + v : sum;
    }, 0);
  });

  const totalRow = ws.addRow(totals);
  totalRow.height = 20;
  totalRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
    cell.font = { bold: true, name: "Arial", size: 10 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TOTAL_BG },
    };
    cell.border = thinBorder();
    if (moneyFlags[colIdx - 1] && typeof cell.value === "number") {
      cell.numFmt = "#,##0";
      cell.alignment = { horizontal: "right", vertical: "middle" };
      cell.font = {
        bold: true,
        name: "Courier New",
        size: 10,
        color: { argb: (cell.value as number) < 0 ? "FFCC0000" : "FF1A6B1A" },
      };
    }
  });

  // ── Column widths (auto) ────────────────────────────────────────────────────
  ws.columns.forEach((col, idx) => {
    let maxLen = headers[idx]?.length ?? 10;
    data.forEach((row) => {
      const val = String(row[headers[idx]] ?? "");
      if (val.length > maxLen) maxLen = val.length;
    });
    col.width = Math.min(Math.max(maxLen + 3, 12), 45);
  });

  // Freeze rows 1-3
  ws.views = [{ state: "frozen", ySplit: 3, xSplit: 0 }];

  // ── Download ────────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
