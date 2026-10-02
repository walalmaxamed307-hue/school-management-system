
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
// columns: [{ key, label, render?(row), sortable? (default: true if no render) }]
// data: array of row objects (each needs a unique `id`)

function Table({ columns, data, emptyMessage = 'Wax lama helin' }) {
  const [sort, setSort] = useState(null) // { key, dir: 'asc' | 'desc' }
 

  function toggleSort(col) {
    if (col.render && !col.sortable) return
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: 'asc' }
      if (prev.dir === 'asc') return { key: col.key, dir: 'desc' }
      return null
    })
   
  }

  const sorted = useMemo(() => {
    if (!sort) return data
    return [...data].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av === bv) return 0
      const result = av > bv ? 1 : -1
      return sort.dir === 'asc' ? result : -result
    })
  }, [data, sort])

 const pageRows = sorted
  return (
    <>
    <div className="print:hidden">
      {/* Desktop/tablet: table caadiga ah */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas text-left">
              {columns.map((col) => {
                const canSort = !col.render || col.sortable
                return (
                  <th
                    key={col.key}
                    onClick={() => canSort && toggleSort(col)}
                    className={`px-4 py-3 font-medium text-ink-muted ${canSort ? 'cursor-pointer select-none hover:text-ink' : ''}`}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sort?.key === col.key &&
                        (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-ink-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-ink">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: hal xariiq compact ah = hal arday/row — ma aha card dherer
          ah oo column kasta hal xariiq u leh (sidii hore). */}
      <div className="flex flex-col gap-2 md:hidden">
        {pageRows.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-ink-muted">
            {emptyMessage}
          </div>
        ) : (
          pageRows.map((row) => {
            const [primaryCol, ...rest] = columns
            const actionsCol = rest.find((c) => !c.label)
            const secondaryCols = rest.filter((c) => c.label)
            return (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-snug text-ink">
                    {primaryCol.render ? primaryCol.render(row) : row[primaryCol.key]}
                  </p>
                  {secondaryCols.length > 0 && (
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-snug text-ink-muted">
                      {secondaryCols.map((col, i) => (
                        <span key={col.key} className="inline-flex items-center gap-1.5">
                          {i > 0 && <span className="text-border">·</span>}
                          {col.render ? col.render(row) : row[col.key]}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                {actionsCol && (
                  <div className="shrink-0">
                    {actionsCol.render ? actionsCol.render(row) : row[actionsCol.key]}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      
      </div>

      {/* Print: DHAMMAAN sorted rows (ma aha kuwa bogga hadda) — pagination-ku
          waa mid screen-ka kaliya, print-ku wuu ka gudbayaa. */}
      <div className="hidden print:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink text-left">
              {columns.filter((c) => c.label).map((col) => (
                <th key={col.key} className="px-2 py-2 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className="border-b border-ink">
                {columns.filter((c) => c.label).map((col) => (
                  <td key={col.key} className="px-2 py-1">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Table
