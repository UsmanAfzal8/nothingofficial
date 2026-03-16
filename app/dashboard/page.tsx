'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type DashboardResponse = {
  table?: string
  rows: Array<Record<string, unknown>>
  columns: string[]
  count: number
  error?: string
}

export default function Dashboard() {
  const [payload, setPayload] = useState<DashboardResponse>({
    rows: [],
    columns: [],
    count: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTablePreview() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/items')
        const data = (await response.json()) as DashboardResponse
        setPayload(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load table preview.'
        setPayload({
          rows: [],
          columns: [],
          count: 0,
          error: message,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTablePreview()
  }, [])

  return (
    <div className="min-h-screen bg-[#f4f4f1] px-4 py-12 text-[#111] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-6 inline-block text-sm uppercase tracking-[0.2em] text-black/55 transition-opacity hover:opacity-70">
          Back to Home
        </Link>

        <div className="rounded-[32px] border border-black/10 bg-white/75 p-8 shadow-[0_20px_60px_rgba(17,17,17,0.08)]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/45">Supabase Preview</p>
          <h1 className="collection-product-name mt-3 text-4xl leading-tight">Configured table browser</h1>
          <p className="mt-4 max-w-2xl text-sm text-black/65">
            This screen now reads the live table configured in `SUPABASE_TABLE` instead of using hardcoded `title` and `description` fields.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-[#f7f7f4] p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/45">Table</p>
              <p className="mt-2 text-lg font-medium">{payload.table || 'Unknown'}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#f7f7f4] p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/45">Rows Loaded</p>
              <p className="mt-2 text-lg font-medium">{payload.count}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#f7f7f4] p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/45">Columns</p>
              <p className="mt-2 text-lg font-medium">{payload.columns.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-black/10 bg-white/75 p-8 shadow-[0_20px_60px_rgba(17,17,17,0.08)]">
          <h2 className="text-xl font-semibold">Table Data</h2>

          {isLoading ? (
            <p className="mt-4 text-black/60">Loading live data...</p>
          ) : payload.error ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
              {payload.error}
            </div>
          ) : payload.rows.length === 0 ? (
            <p className="mt-4 text-black/60">No rows found in the configured table.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {payload.rows.map((row, index) => (
                <article key={`${payload.table}-${index}`} className="rounded-2xl border border-black/10 bg-[#fafaf8] p-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(row).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">{key}</p>
                        <p className="mt-1 break-words text-sm text-black/75">
                          {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? 'null')}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
