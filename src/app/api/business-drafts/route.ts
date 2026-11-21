import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TABLE = 'base88_business_drafts'
const MAX_BODY_BYTES = 16_384
const MAX_SAVED = 25

type Brief = {
  name: string
  category: string
  audience: string
  tagline: string
  problem: string
  firstProduct: string
  price: string
  validation: string[]
  acquisition: string[]
  risk: string
  freeTool: string
}

function json(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: {'Cache-Control':'no-store, private', 'X-Content-Type-Options':'nosniff'},
  })
}

async function authenticate(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  const match = /^Bearer ([^\s]{40,8192})$/.exec(auth)
  if (!match) return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return null
  // Crucial: we use the ANON key plus the user JWT. RLS is enforced at the database.
  // Never use SUPABASE_SERVICE_KEY for this customer-facing endpoint.
  const client = createClient(url, anon, {
    auth: {autoRefreshToken: false, persistSession: false},
    global: {headers: {Authorization: 'Bearer ' + match[1]}},
  })
  const {data, error} = await client.auth.getUser(match[1])
  return error || !data.user ? null : {client, user: data.user}
}

function string(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
}
function list(value: unknown): value is string[] {
  return Array.isArray(value) && value.length >= 1 && value.length <= 8
    && value.every(item => string(item, 350))
}
export function validateBrief(value: unknown): value is Brief {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const x = value as Record<string, unknown>
  return string(x.name, 120) && string(x.category, 64) && string(x.audience, 300)
    && string(x.tagline, 220) && string(x.problem, 1200) && string(x.firstProduct, 1200)
    && string(x.price, 80) && string(x.risk, 900) && string(x.freeTool, 180)
    && list(x.validation) && list(x.acquisition)
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return json({error:'Sign in to view your business drafts.'}, 401)
  const {data, error} = await auth.client.from(TABLE)
    .select('id,name,category,brief,status,created_at')
    .eq('owner_id', auth.user.id)
    .order('created_at',{ascending:false})
    .limit(MAX_SAVED)
  if (error) return json({error:'Draft storage is not available yet.'}, 503)
  return json({drafts: data || []})
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth) return json({error:'Sign in to save a business draft.'},401)
  const length = Number(request.headers.get('content-length') || '0')
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) return json({error:'Draft too large.'},413)
  let body: unknown
  try {
    const raw = await request.text()
    if (Buffer.byteLength(raw,'utf-8') > MAX_BODY_BYTES) return json({error:'Draft too large.'},413)
    body = JSON.parse(raw)
  } catch {return json({error:'Invalid JSON.'},400)}
  if (!validateBrief(body)) return json({error:'Business draft fields are invalid.'},400)
  const {count, error: countError} = await auth.client.from(TABLE)
    .select('id',{count:'exact',head:true}).eq('owner_id',auth.user.id)
  if (countError) return json({error:'Draft storage is not available yet.'},503)
  if ((count ?? MAX_SAVED) >= MAX_SAVED) return json({error:'You have reached the 25-draft limit.'},409)
  const b = body as Brief
  const brief = {
    name:b.name.trim(),category:b.category.trim(),audience:b.audience.trim(),
    tagline:b.tagline.trim(),problem:b.problem.trim(),firstProduct:b.firstProduct.trim(),
    price:b.price.trim(),risk:b.risk.trim(),freeTool:b.freeTool.trim(),
    validation:b.validation.map(v=>v.trim()),acquisition:b.acquisition.map(v=>v.trim()),
  }
  const {data,error} = await auth.client.from(TABLE)
    .insert({owner_id:auth.user.id,name:brief.name,category:brief.category,brief,status:'draft'})
    .select('id,name,category,status,created_at').single()
  if (error) return json({error:'Could not save business draft.'},503)
  return json({draft:data},201)
}
