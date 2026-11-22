import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

/** Account-scoped Supabase access. The service-role key is never used here. */
export async function authenticatedBusinessClient(request: NextRequest) {
  const match = /^Bearer ([^\s]{40,8192})$/.exec(request.headers.get('authorization') || '')
  if (!match) return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const client = createClient(url, key, {
    auth: {persistSession:false, autoRefreshToken:false},
    global: {headers:{Authorization:'Bearer '+match[1]}},
  })
  const {data,error} = await client.auth.getUser(match[1])
  if (error || !data.user) return null
  return {client, userId:data.user.id}
}
