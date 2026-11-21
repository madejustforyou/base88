import { NextRequest, NextResponse } from 'next/server'
import { authenticatedBusinessClient } from '@/lib/base88-auth'

export const dynamic = 'force-dynamic'
const BUSINESS = 'base88_business_drafts'
const INBOX = 'base88_business_inbox'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
type RouteContext = {params: Promise<{id:string}>}
function response(value: unknown, status=200) {
  return NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}})
}
async function parseBody(request: NextRequest) {
  const length=Number(request.headers.get('content-length')||'0')
  if (Number.isFinite(length) && length>8192) return null
  try {
    const raw=await request.text()
    if (Buffer.byteLength(raw,'utf8')>8192) return null
    const data: unknown=JSON.parse(raw)
    return data && typeof data==='object' && !Array.isArray(data) ? data as Record<string,unknown> : null
  } catch {return null}
}
function str(value: unknown,max: number): value is string {
  return typeof value==='string' && value.trim().length>0 && value.length<=max
}
async function owner(request: NextRequest,context:RouteContext) {
  const {id}=await context.params
  if (!UUID.test(id)) return {failure:response({error:'Business not found.'},404)} as const
  const auth=await authenticatedBusinessClient(request)
  if (!auth) return {failure:response({error:'Sign in required.'},401)} as const
  const {data,error}=await auth.client.from(BUSINESS).select('id,name').eq('id',id).eq('owner_id',auth.userId).maybeSingle()
  if (error) return {failure:response({error:'Business storage unavailable.'},503)} as const
  if (!data) return {failure:response({error:'Business not found.'},404)} as const
  return {auth,business:data} as const
}

export async function GET(request:NextRequest, context:RouteContext) {
  const result=await owner(request,context)
  if ('failure' in result) return result.failure
  const {auth,business}=result
  const {data,error}=await auth.client.from(INBOX)
    .select('id,source,from_name,from_email,subject,body,status,reply_draft,created_at')
    .eq('owner_id',auth.userId).eq('business_id',business.id)
    .order('created_at',{ascending:false}).limit(30)
  if (error) return response({error:'Inbox storage unavailable.'},503)
  return response({business,items:data||[],mode:'owner_test_only'})
}

export async function POST(request:NextRequest, context:RouteContext) {
  const result=await owner(request,context)
  if ('failure' in result) return result.failure
  const {auth,business}=result
  const body=await parseBody(request)
  if (!body || !str(body.from_name,120) || !str(body.from_email,320)
    || !str(body.subject,180) || !str(body.body,3500)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.from_email)) {
    return response({error:'Valid test inquiry fields are required.'},400)
  }
  const {count,error:countError}=await auth.client.from(INBOX)
    .select('id',{head:true,count:'exact'})
    .eq('owner_id',auth.userId).eq('business_id',business.id)
  if (countError) return response({error:'Inbox storage unavailable.'},503)
  if ((count||0)>=100) return response({error:'Test inbox reached the 100-message limit.'},409)
  const firstName=body.from_name.trim().split(/\s+/)[0].slice(0,35)
  const safeBusinessName=business.name.slice(0,120)
  const draft='Hi '+firstName+', thanks for contacting '+safeBusinessName+'. We received your question and will review the details before replying. Could you share any additional context that would help us assist you?\n\n'+safeBusinessName
  const {data,error}=await auth.client.from(INBOX).insert({
    business_id:business.id,owner_id:auth.userId,source:'owner_test',
    from_name:body.from_name.trim(),from_email:body.from_email.trim(),
    subject:body.subject.trim(),body:body.body.trim(),reply_draft:draft,
    status:'unread'
  }).select('id,source,from_name,from_email,subject,body,status,reply_draft,created_at').single()
  if (error) return response({error:'Test inquiry could not be created.'},503)
  return response({item:data,notice:'Simulated only. No customer received a message.'},201)
}

export async function PATCH(request:NextRequest, context:RouteContext) {
  const result=await owner(request,context)
  if ('failure' in result) return result.failure
  const {auth,business}=result
  const data=await parseBody(request)
  if (!data || !str(data.id,36) || !UUID.test(data.id)
    || typeof data.reply_draft!=='string' || data.reply_draft.length>3500
    || (data.status!=='unread' && data.status!=='resolved')) {
    return response({error:'Invalid inbox draft update.'},400)
  }
  const {data:updated,error}=await auth.client.from(INBOX)
    .update({reply_draft:data.reply_draft,status:data.status})
    .eq('id',data.id).eq('owner_id',auth.userId).eq('business_id',business.id)
    .eq('source','owner_test')
    .select('id,status,reply_draft').maybeSingle()
  if (error) return response({error:'Inbox update unavailable.'},503)
  if (!updated) return response({error:'Inquiry not found.'},404)
  return response({item:updated,notice:'Saved private draft only. No outgoing message was sent.'})
}
