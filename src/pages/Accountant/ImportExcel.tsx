import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileSpreadsheet, X, CheckCircle,
  AlertTriangle, Download, Info, RefreshCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../../store/AppStore';
import { useToast } from '../../hooks/useToast';
import { exportBlankTemplate } from '../../utils/exportAccountingReport';
import type { CashFlowTransaction, ExpenseProposal, TaxRecord, RiskReserve } from '../../types/finance';

// ─── Module definitions (5 sheets) ──────────────────────────────────────────

type Module = 'summary' | 'cashflow' | 'expense' | 'tax' | 'reserve';

interface ModuleDef {
  value: Module;
  sheetNum: string;
  label: string;
  sheetKeyword: string;
  columns: string[];
  color: string;
  bg: string;
  hint: string;
  importable: boolean;
}

const MODULE_DEFS: ModuleDef[] = [
  {
    value: 'summary',
    sheetNum: 'Sheet 1',
    label: 'Sổ báo cáo dòng tiền đầu ngày',
    sheetKeyword: 'đầu ngày',
    columns: ['Diễn giải', 'Số tồn hiện tại', 'Nguồn tiền'],
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    hint: 'Báo cáo tổng hợp số dư các TK ngân hàng theo ngày',
    importable: false,
  },
  {
    value: 'cashflow',
    sheetNum: 'Sheet 2',
    label: 'Sổ chi tiền mặt / TK cá nhân',
    sheetKeyword: 'tiền mặt',
    columns: ['Ngày tháng', 'Mục đích', 'Diễn giải', 'Thu', 'Chi', 'Tồn quỹ'],
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    hint: 'Thu > 0 → THU VÀO · Chi > 0 → CHI RA · Tồn quỹ tự tính',
    importable: true,
  },
  {
    value: 'expense',
    sheetNum: 'Sheet 3',
    label: 'Bảng kê chi phí hàng ngày',
    sheetKeyword: 'chi phí',
    columns: ['STT', 'CHI PHÍ', 'Diễn giải chi phí', 'Thành tiền chi', 'Kế hoạch chi tiền', 'PHÒNG BAN ĐỀ XUẤT'],
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    hint: 'PHÒNG BAN ĐỀ XUẤT dùng để phân loại · Kế hoạch chi tiền = ngày dự kiến',
    importable: true,
  },
  {
    value: 'tax',
    sheetNum: 'Sheet 4',
    label: 'Bảng kê nộp thuế',
    sheetKeyword: 'thuế',
    columns: ['TÊN CÔNG TY', 'KỲ TÍNH THUẾ', 'SỐ THUẾ PHẢI NỘP', 'ĐÃ NỘP', 'Tổng tiền nợ nhà nước'],
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    hint: 'Tổng tiền nợ = SỐ THUẾ PHẢI NỘP − ĐÃ NỘP · trạng thái tự động',
    importable: true,
  },
  {
    value: 'reserve',
    sheetNum: 'Sheet 5',
    label: 'Sổ theo dõi dòng tiền dự phòng',
    sheetKeyword: 'dự phòng',
    columns: ['NGÀY', 'SỐ TIỀN', 'KỲ HẠN SỬ DỤNG', 'GHI CHÚ'],
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    hint: 'SỐ TIỀN nhập bằng VNĐ · KỲ HẠN SỬ DỤNG = ngày đáo hạn (DD/MM/YYYY)',
    importable: true,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DEPT_COLORS: Record<string, string> = {
  'XƯỞNG': 'amber', 'KHO': 'blue', 'KẾ TOÁN': 'green', 'STOCK KHO': 'blue',
  'ĐIỆN': 'indigo', 'ROBOT': 'violet', 'KỸ THUẬT': 'rose', 'KINH DOANH': 'emerald',
  'MÃ DỰ ÁN': 'blue', 'GIÁM ĐỐC': 'violet',
};

function uid() { return `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

function parseDateVal(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${String(d.d).padStart(2, '0')}/${String(d.m).padStart(2, '0')}/${d.y}`;
  }
  return String(v);
}

function parseAmount(v: unknown): number {
  if (!v || v === '-' || v === '') return 0;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const [d, m, y] = dateStr.split('/');
    return new Date(`${y}-${m}-${d}`) < new Date();
  } catch { return false; }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ImportExcel() {
  const [module, setModule] = useState<Module>('cashflow');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useStore();
  const { showToast } = useToast();

  const currentDef = MODULE_DEFS.find((d) => d.value === module)!;

  const handleDownloadTemplate = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await exportBlankTemplate();
      showToast('Đã tải template 5 sheet thành công!', 'success');
    } catch {
      showToast('Không thể tạo file template', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const parseFile = (file: File) => {
    setError(''); setRows([]); setImported(false);
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Chỉ hỗ trợ file .xlsx, .xls hoặc .csv');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellDates: false });

        const sheetIdx = wb.SheetNames.findIndex((n) =>
          n.toLowerCase().includes(currentDef.sheetKeyword)
        );
        const ws = wb.Sheets[wb.SheetNames[sheetIdx >= 0 ? sheetIdx : 0]];
        const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

        const valid = parsed.filter((r) => {
          const vals = Object.values(r);
          const hasData = vals.some((v) => v !== '' && v !== null && v !== undefined && v !== '-');
          const firstVal = String(vals[0] ?? '').toLowerCase();
          const isSummary = ['tổng', 'tồn', 'số dư', 'ngày'].some((s) => firstVal === s);
          return hasData && !isSummary;
        });

        if (!valid.length) {
          setError('Không tìm thấy dữ liệu hợp lệ. Kiểm tra lại sheet hoặc chọn đúng loại.');
          return;
        }
        setRows(valid);
      } catch {
        setError('Không thể đọc file. Hãy dùng file Excel hợp lệ (.xlsx).');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  const handleImport = async () => {
    setImporting(true);
    await new Promise((r) => setTimeout(r, 400));
    let count = 0;

    if (module === 'cashflow') {
      rows.forEach((r) => {
        const thu = parseAmount(r['Thu']);
        const chi = parseAmount(r['Chi']);
        if (thu === 0 && chi === 0) return;
        const base = {
          id: uid(),
          date: parseDateVal(r['Ngày tháng']),
          description: String(r['Diễn giải'] ?? ''),
          account: 'CASH',
          department: String(r['Mục đích'] ?? 'KINH DOANH'),
        };
        if (thu > 0) { dispatch({ type: 'CASHFLOW_ADD', payload: { ...base, type: 'in', amount: thu } as CashFlowTransaction }); count++; }
        if (chi > 0) { dispatch({ type: 'CASHFLOW_ADD', payload: { ...base, type: 'out', amount: chi } as CashFlowTransaction }); count++; }
      });
    }

    if (module === 'expense') {
      rows.forEach((r) => {
        const desc = String(r['Diễn giải chi phí'] ?? '').trim();
        if (!desc) return;
        const dept = String(r['CHI PHÍ'] ?? 'XƯỞNG').trim();
        const reqDept = String(r['PHÒNG BAN ĐỀ XUẤT'] ?? '').trim();
        const plannedRaw = parseDateVal(r['Kế hoạch chi tiền']);
        const proposal: ExpenseProposal = {
          id: uid(),
          department: dept,
          departmentColor: DEPT_COLORS[dept] ?? 'blue',
          requestDept: reqDept || undefined,
          description: desc,
          plannedDate: plannedRaw,
          isOverdue: isOverdue(plannedRaw),
          status: isOverdue(plannedRaw) ? 'overdue' : 'pending',
          amount: parseAmount(r['Thành tiền chi']) || undefined,
        };
        dispatch({ type: 'PROPOSAL_ADD', payload: proposal });
        count++;
      });
    }

    if (module === 'tax') {
      rows.forEach((r) => {
        const company = String(r['TÊN CÔNG TY'] ?? '').trim();
        const period  = String(r['KỲ TÍNH THUẾ'] ?? '').trim();
        if (!company || !period) return;
        const required  = parseAmount(r['SỐ THUẾ PHẢI NỘP']) || null;
        const paid      = parseAmount(r['ĐÃ NỘP']) || null;
        const remaining = parseAmount(r['Tổng tiền nợ nhà nước']) || (required && paid !== null ? required - paid : null);
        let status: TaxRecord['status'] = 'pending';
        if (paid !== null && required !== null && paid >= required) status = 'paid';
        else if (!required && !paid) status = 'waiting';
        const tax: TaxRecord = {
          id: uid(), company, period,
          taxType: period.includes('GTGT') ? 'GTGT' : period.includes('TNCN') ? 'TNCN' : period.includes('TNDN') ? 'TNDN' : 'Khác',
          required, paid, remaining, status,
        };
        dispatch({ type: 'TAX_ADD', payload: tax });
        count++;
      });
    }

    if (module === 'reserve') {
      rows.forEach((r) => {
        const amount = parseAmount(r['SỐ TIỀN']);
        if (!amount) return;
        const expiry = parseDateVal(r['KỲ HẠN SỬ DỤNG']);
        const reserve: RiskReserve = {
          id: uid(),
          depositDate: parseDateVal(r['NGÀY']),
          amount,
          expiryDate: expiry,
          notes: String(r['GHI CHÚ'] ?? ''),
          status: isOverdue(expiry) ? 'approaching' : 'safe',
        };
        dispatch({ type: 'RESERVE_ADD', payload: reserve });
        count++;
      });
    }

    setImporting(false);
    setImportCount(count);
    setImported(true);
    showToast(`Đã lưu ${count} bản ghi vào ${currentDef.label}!`, 'success');
  };

  const reset = () => { setRows([]); setFileName(''); setError(''); setImported(false); setImportCount(0); };

  const headers = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div className="min-h-screen bg-surface-1 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/ke-toan" className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 text-ink-2 hover:text-ink-1 hover:bg-surface-3 transition-all">
            <ArrowLeft size={14} />
          </Link>
          <div className="flex-1">
            <h1 className="text-[15px] font-semibold text-ink-1">Import từ Excel — BAO CAO KE TOAN 2026</h1>
            <p className="text-[11px] text-ink-3">Chọn sheet → tải file lên → xem trước → lưu vào hệ thống</p>
          </div>
          {/* Template download */}
          <button
            onClick={handleDownloadTemplate}
            disabled={downloading}
            className="flex items-center gap-2 text-[12px] text-amber-400 border border-amber-500/25 bg-amber-500/8 px-4 py-2 rounded-xl hover:bg-amber-500/15 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {downloading
              ? <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              : <Download size={13} />
            }
            {downloading ? 'Đang tạo...' : 'Tải template (5 sheets)'}
          </button>
        </div>

        {/* Step 1: Sheet selector */}
        <div className="bg-surface-2 border border-white/8 rounded-2xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink-3 mb-3">
            Bước 1 — Chọn sheet cần import
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
            {MODULE_DEFS.map((d) => (
              <button
                key={d.value}
                onClick={() => { setModule(d.value); reset(); }}
                className={`text-left border rounded-xl px-3 py-3 transition-all relative ${
                  module === d.value
                    ? `${d.bg} border-opacity-100`
                    : 'border-white/8 bg-surface-3 hover:border-white/20'
                }`}
              >
                <p className="text-[9px] text-ink-3 mb-1">{d.sheetNum}</p>
                <p className={`text-[11px] font-semibold leading-snug ${module === d.value ? d.color : 'text-ink-2'}`}>
                  {d.label}
                </p>
                {!d.importable && (
                  <span className="absolute top-1.5 right-1.5 text-[8px] bg-ink-3/20 text-ink-3 px-1 rounded">
                    template
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Columns hint */}
          <div className={`border rounded-xl px-4 py-3 ${currentDef.bg}`}>
            <div className="flex items-start gap-2">
              <Info size={13} className={`${currentDef.color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-[11px] font-semibold ${currentDef.color} mb-1.5`}>
                  {currentDef.importable ? 'Cột cần có trong file:' : 'Cấu trúc sheet (chỉ dùng làm template):'}
                </p>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {currentDef.columns.map((col) => (
                    <span key={col} className="font-mono text-[10px] bg-black/20 text-ink-2 px-2 py-0.5 rounded">
                      {col}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-ink-3">{currentDef.hint}</p>
                {!currentDef.importable && (
                  <p className="text-[10px] text-amber-400 mt-1">
                    Sheet 1 là báo cáo tổng hợp — điền vào template và dùng để xuất, không cần import vào hệ thống.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Upload — only shown for importable modules */}
        {currentDef.importable && (
          <div className="bg-surface-2 border border-white/8 rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-3 mb-3">
              Bước 2 — Tải file Excel lên
            </p>

            {!rows.length && !error && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-blue-400/50 bg-blue-500/8' : 'border-white/12 hover:border-white/25 hover:bg-surface-3'
                }`}
              >
                <FileSpreadsheet size={36} className="mx-auto text-ink-3 mb-3" />
                <p className="text-[13px] font-medium text-ink-2 mb-1">Kéo & thả file Excel vào đây</p>
                <p className="text-[11px] text-ink-3">hoặc nhấn để chọn file · .xlsx, .xls, .csv</p>
                <p className="text-[10px] text-ink-3 mt-2 opacity-60">
                  Tự động tìm sheet chứa «{currentDef.sheetKeyword}»
                </p>
                <input
                  ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) parseFile(e.target.files[0]); }}
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-[13px] text-red-400 flex-1">{error}</p>
                <button onClick={reset} className="text-ink-3 hover:text-ink-1"><X size={14} /></button>
              </div>
            )}

            {rows.length > 0 && !imported && (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={16} className="text-emerald-400" />
                  <div>
                    <p className="text-[13px] font-medium text-emerald-400">{fileName}</p>
                    <p className="text-[11px] text-ink-3">{rows.length} dòng · {headers.length} cột</p>
                  </div>
                </div>
                <button onClick={reset} className="text-ink-3 hover:text-red-400 transition-colors"><X size={14} /></button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Preview + Import */}
        {rows.length > 0 && !imported && currentDef.importable && (
          <div className="bg-surface-2 border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/7 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-ink-3">
                Bước 3 — Xem trước · {currentDef.label}
              </p>
              <span className="text-[11px] text-ink-3">
                {Math.min(rows.length, 8)}/{rows.length} dòng
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-white/7 bg-surface-3">
                    {headers.map((h) => (
                      <th key={h} className={`text-left px-3 py-2 font-semibold whitespace-nowrap ${
                        currentDef.columns.includes(h) ? currentDef.color : 'text-ink-3 opacity-50'
                      }`}>
                        {h}
                        {!currentDef.columns.includes(h) && (
                          <span className="ml-1 text-[9px]">(bỏ qua)</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 8).map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-surface-3 transition-colors">
                      {headers.map((h) => (
                        <td key={h} className="px-3 py-2 text-ink-2 whitespace-nowrap max-w-[200px] truncate">
                          {String(row[h] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-4 border-t border-white/7 flex items-center gap-4">
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/40 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-all"
              >
                {importing
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Upload size={14} />
                }
                {importing ? `Đang lưu ${rows.length} dòng…` : `Lưu ${rows.length} dòng vào hệ thống`}
              </button>
              <p className="text-[11px] text-ink-3">Dòng trống và dòng "Tổng" sẽ bị bỏ qua</p>
            </div>
          </div>
        )}

        {/* Success */}
        {imported && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-8 text-center">
            <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-[16px] font-semibold text-emerald-400 mb-1">Đã lưu thành công!</p>
            <p className="text-[12px] text-ink-3 mb-1">
              <strong className="text-emerald-400">{importCount}</strong> bản ghi đã được lưu vào{' '}
              <strong className="text-ink-2">{currentDef.label}</strong>
            </p>
            <p className="text-[11px] text-ink-3 mb-5">Dữ liệu được lưu vào bộ nhớ · Kiểm tra tại Dashboard</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-[12px] text-blue-400 hover:text-blue-300 border border-blue-500/20 px-4 py-2 rounded-lg hover:bg-blue-500/8 transition-all"
              >
                <RefreshCw size={12} /> Import sheet khác
              </button>
              <Link
                to="/"
                className="text-[12px] text-ink-2 hover:text-ink-1 border border-white/8 px-4 py-2 rounded-lg hover:bg-surface-3 transition-all"
              >
                Về Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
