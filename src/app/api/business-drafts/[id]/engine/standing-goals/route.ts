import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,safeEngineError,EngineError} from '@/lib/base88-engine'

export const dynamic='force-dynamic'
type Context={params:Promise<{id:string}>}
const KEY=/^[A-Za-z0-9_-]{8,80}$/

function reply(value:unknown,status=200){
  return NextResponse.json(value,{status,headers:{
    'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',
  }})
}

export async function GET(request:NextRequest,context:Context){
  const {id}=await context.params
  try{
    const ctx=await resolveEngine(request,id)
    if(!ctx.workspaceId)
      return reply({imported:false,goals:[],external_actions:false})
    const upstream=await engineFetch(ctx.base,
      '/api/federation/v1/workspaces/'+ctx.workspaceId+'/standing-goals',ctx.jwt)
    if(!upstream.ok)throw new EngineError(upstream.status===401?401:503,
      'Unable to read your private business Operators.')
    const content:unknown=await upstream.json()
    if(!content||typeof content!=='object'||Array.isArray(content)
      ||!Array.isArray((content as Record<string,unknown>).goals)
      ||(content as Record<string,unknown>).external_actions!==false)
      throw new EngineError(502,'Invalid response from your private Operator.')
    return reply({...content,imported:true})
  }catch(error){
    const e=safeEngineError(error)
    return reply({error:e.error},e.status)
  }
}

export async function POST(request:NextRequest,context:Context){
  const {id}=await context.params
  try{
    const size=Number(request.headers.get('content-length')||'0')
    if(!Number.isFinite(size)||size>6000)
      return reply({error:'Operator instruction exceeds 6 KB.'},413)
    const raw=await request.text()
    if(Buffer.byteLength(raw,'utf8')>6000)
      return reply({error:'Operator instruction exceeds 6 KB.'},413)
    let parsed:unknown
    try{parsed=JSON.parse(raw)}catch{return reply({error:'Invalid JSON.'},400)}
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))
      return reply({error:'Invalid Operator instruction.'},400)
    const input=parsed as Record<string,unknown>
    if(typeof input.agent_label!=='string'||input.agent_label.trim().length<2
      ||input.agent_label.length>80||typeof input.objective!=='string'
      ||input.objective.trim().length<8||input.objective.length>5000
      ||typeof input.idempotency_key!=='string'||!KEY.test(input.idempotency_key))
      return reply({error:'Provide a name, a clear goal and a valid request ID.'},400)
    const ctx=await resolveEngine(request,id)
    if(!ctx.workspaceId)
      return reply({error:'Prepare this business in the independent engine first.'},409)
    const upstream=await engineFetch(ctx.base,
      '/api/federation/v1/workspaces/'+ctx.workspaceId+'/standing-goals',
      ctx.jwt,'POST',{agent_label:input.agent_label.trim(),
                     objective:input.objective.trim(),
                     idempotency_key:input.idempotency_key})
    if(!upstream.ok)
      return reply({error:upstream.status===409?'Goal conflicts with an existing request.':
        'Independent Operator could not save this goal.'},
        upstream.status===409?409:upstream.status===401?401:503)
    const content:unknown=await upstream.json()
    if(!content||typeof content!=='object'||Array.isArray(content)
      ||typeof (content as Record<string,unknown>).goal!=='object')
      throw new EngineError(502,'Invalid Operator creation receipt.')
    return reply({...content,external_actions:false},201)
  }catch(error){
    const e=safeEngineError(error)
    return reply({error:e.error},e.status)
  }
}
