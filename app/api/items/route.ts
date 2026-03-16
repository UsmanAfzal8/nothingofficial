import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseTableName } from '@/lib/env'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

const NO_INDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
}

function jsonNoIndex(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...NO_INDEX_HEADERS,
      ...(init?.headers ?? {}),
    },
  })
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const tableName = getSupabaseTableName()

    if (!supabase) {
      return jsonNoIndex(
        { error: 'Supabase is not configured. Add the URL and key to your local env file.' },
        { status: 500 },
      )
    }

    const { data, error, count } = await supabase.from(tableName).select('*', { count: 'exact' }).limit(50)

    if (error) {
      return jsonNoIndex(
        {
          error: error.message,
          table: tableName,
          rows: [],
          count: 0,
          columns: [],
        },
        { status: 404 },
      )
    }

    return jsonNoIndex({
      table: tableName,
      rows: data || [],
      count: count ?? data?.length ?? 0,
      columns: data?.[0] ? Object.keys(data[0]) : [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return jsonNoIndex({ error: message, rows: [], count: 0, columns: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient()
    const tableName = getSupabaseTableName()

    if (!supabase) {
      return jsonNoIndex(
        { error: 'Supabase is not configured. Add the URL and key to your local env file.' },
        { status: 500 },
      )
    }

    const payload = await request.json()
    const rows = Array.isArray(payload) ? payload : [payload]
    const supabaseAdmin = supabase as any

    const { data, error } = await supabaseAdmin.from(tableName).insert(rows).select('*')

    if (error) {
      return jsonNoIndex({ error: error.message, table: tableName }, { status: 400 })
    }

    return jsonNoIndex({ table: tableName, rows: data || [] }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return jsonNoIndex({ error: message }, { status: 500 })
  }
}
