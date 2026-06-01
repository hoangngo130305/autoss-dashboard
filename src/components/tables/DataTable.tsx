import type { ReactNode } from 'react';
import clsx from 'clsx';
import { EmptyState } from '../common/EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T, index: number) => ReactNode;
  headerClass?: string;
  cellClass?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({ columns, data, keyExtractor, emptyMessage, className }: DataTableProps<T>) {
  return (
    <div className={clsx('table-scroll', className)}>
      <table className="w-full border-collapse" style={{ minWidth: 600 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'text-left px-3 py-2.5 text-[10px] font-semibold text-ink-3 uppercase tracking-widest',
                  'border-b border-white/8 bg-surface-3/40',
                  col.headerClass,
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={keyExtractor(row, i)}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx('px-3 py-3 text-ink-2 align-middle text-[13px]', col.cellClass)}
                  >
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
