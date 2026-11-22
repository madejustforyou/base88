import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

// A public intake endpoint. Never return provider/database internals to strangers.
const MAX_BYTES = 8192
function response(body: unknown, status: number) {
  return NextResponse.json(body, {status, headers:{'Cache-Control':'no-store'}})
}
function text(v: unknown, max: number): string | null {
  if (v == null || v === '') return ''
  if (typeof v !== 'string' || v.length > max) return null
  return v.trim()
}
export async function POST(req: NextRequest) {
  if (!(req.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return response({error:'JSON body required'},415)
  }
  const length = Number(req.headers.get('content-length')||'0')
  if (Number.isFinite(length) && length > MAX_BYTES) return response({error:'Request too large'},413)
  let body: Record<string,unknown>
  try {
    const raw = await req.text()
    if (Buffer.byteLength(raw,'utf8') > MAX_BYTES) return response({error:'Request too large'},413)
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return response({error:'Invalid request'},400)
    }
    body = parsed as Record<string,unknown>
  } catch {return response({error:'Invalid JSON'},400)}
  // Simple honeypot; not a substitute for edge rate limits and abuse monitoring.
  if (body.website) return response({success:true},200)
  const email = text(body.email,320)
  const name = text(body.name,120)
  const company = text(body.company,160)
  const use_case = text(body.use_case,1000)
  if (email === null || name === null || company === null || use_case === null
    || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response({error:'A valid email and supported fields are required'},400)
  }
  try {
    const client = getServerSupabase()
    const {error} = await client.from('waitlist').insert([{
      email,name,company,use_case,created_at:new Date().toISOString()
    }])
    if (error) return response({error:'Waitlist registration is temporarily unavailable'},503)
    return response({success:true},201)
  } catch {
    return response({error:'Waitlist registration is temporarily unavailable'},503)
  }
}
