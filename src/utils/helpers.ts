/** Generate a short unique id */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Safely parse a Vietnamese-format number string (e.g. "1.200.000" or "1200000") */
export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9]/g, '');
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

/** Generic array sort — handles numbers and strings */
export function sortBy<T>(arr: T[], key: keyof T, dir: 'asc' | 'desc'): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') {
      return dir === 'asc' ? av - bv : bv - av;
    }
    const as = String(av ?? '');
    const bs = String(bv ?? '');
    const cmp = as.localeCompare(bs, 'vi');
    return dir === 'asc' ? cmp : -cmp;
  });
}

/** Return items on the requested page */
export function paginate<T>(arr: T[], page: number, size: number): T[] {
  const start = (page - 1) * size;
  return arr.slice(start, start + size);
}

/** Total pages */
export function totalPages(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}
