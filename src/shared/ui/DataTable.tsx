import type { ReactNode } from 'react'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  rows: readonly T[]
  columns: readonly Column<T>[]
  rowKey: (row: T) => string | number
  caption?: string
}

export function DataTable<T>({ rows, columns, rowKey, caption }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
          <tr>
            {columns.map((column) => (
              <th key={column.header} scope="col" className="px-2 py-2 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              {columns.map((column) => (
                <td key={column.header} className={column.className ?? 'px-2 py-2'}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
