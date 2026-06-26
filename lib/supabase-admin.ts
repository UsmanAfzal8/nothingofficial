import { createClient } from '@supabase/supabase-js'
import { getSupabaseServiceKey, getSupabaseUrl } from '@/lib/env'

let supabaseAdminClient: ReturnType<typeof createClient> | null = null

function createDebugFetch(supabaseUrl: string): typeof fetch {
  const nativeFetch = fetch
  const supabaseOrigin = new URL(supabaseUrl).origin

  return async (input, init) => {
    const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = init?.method ?? (typeof input === 'object' && 'method' in input ? input.method : undefined) ?? 'GET'

    try {
      const url = new URL(requestUrl)

      if (url.origin === supabaseOrigin) {
        console.log(`[supabase-request] ${method} ${url.pathname}${url.search}`)
      }
    } catch {
      // Keep debug logging best-effort so it never changes request behavior.
    }

    return nativeFetch(input, init)
  }
}

export function getSupabaseAdminClient() {
  const supabaseUrl = getSupabaseUrl()
  const serviceRoleKey = getSupabaseServiceKey()

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  if (supabaseAdminClient) {
    return supabaseAdminClient
  }

  supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    ...(process.env.SUPABASE_REQUEST_DEBUG === '1'
      ? {
          global: {
            fetch: createDebugFetch(supabaseUrl),
          },
        }
      : {}),
  })

  return supabaseAdminClient
}
