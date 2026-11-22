import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,EngineError,safeEngineError} from '@/lib/base88-engine'

export const dynamic='force-dynamic'
type Context={params:Promise<{id:string}>}

function response(body:unknown,status=200){
  return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store',
    'X-Content-Type-Options':'nosniff'}})
}

export async function GET(request:NextRequest,ctx:Context){
  const {id}=await ctx.params
  try{
    const eng=await resolveEngine(request,id)
    if(!eng.workspaceId)return response({
      connected:false, imported:false, goals:[], external_actions:false,
      error:'Import your business draft into the independent Base88 engine first.',
    })
    const res=await engineFetch(eng.base,
      '/api/federation/v1/workspaces/'+eng.workspaceId+'/standing-goals',eng.jwt)
    if(!res.ok)throw new EngineError(res.status===401?401:503,
      'The private Operator service did not return this workspace.')
    const data:unknown=await res.json()
    if(!data||typeof data!=='object'||!Array.isArray((data as Record<string,unknown>).goals))
      throw new EngineError(502,'Invalid private Operator response.')
    return response({connected:true,imported:true,...data as object})
  }catch(e){
    const err=safeEngineError(e)
    return response({error:err.error,connected:false,goals:[]},err.status)
  }
}

export async function POST(request:NextRequest,ctx:Context){
  const {id}=await ctx.params
  const length=Number(request.headers.get('content-length')||'0')
  if(!Number.isFinite(length)||length>7000)return response({error:'Goal is too long.'},413)
  let input:unknown
  try{
    const raw=await request.text()
    if(Buffer.byteLength(raw,'utf8')>7000)return response({error:'Goal is too long.'},413)
    input=JSON.parse(raw)
  }catch{return response({error:'Invalid goal JSON.'},400)}
  if(!input||typeof input!=='object'||Array.isArray(input))
    return response({error:'Invalid goal.'},400)
  const b=input as Record<string,unknown>
  if(typeof b.objective!=='string'||b.objective.trim().length<8||b.objective.length>5000
    ||typeof b.idempotency_key!=='string'||!/^[A-Za-z0-9_-]{8,80}$/.test(b.idempotency_key)
    ||(b.agent_label!==undefined&&
       (typeof b.agent_label!=='string'||b.agent_label.trim().length<2||b.agent_label.length>80)))
    return response({error:'Enter a clear goal and a valid request ID.'},400)
  try{
    const eng=await resolveEngine(request,id)
    if(!eng.workspaceId)return response({error:'Import this business draft first.'},409)
    const res=await engineFetch(eng.base,
      '/api/federation/v1/workspaces/'+eng.workspaceId+'/standing-goals',eng.jwt,'POST',{
        objective:b.objective.trim(),
        agent_label:typeof b.agent_label==='string'?b.agent_label.trim():'Base88 Director',
        idempotency_key:b.idempotency_key,
      })
    if(!res.ok)return response({error:res.status===409?'Goal already exists or limit reached.':
      'The independent engine could not save the goal.'},
      res.status===409?409:res.status===401?401:503)
    const data:unknown=await res.json()
    if(!data||typeof data!=='object'||!('goal'in data))
      return response({error:'Invalid private goal acknowledgment.'},502)
    return response(data,201)
  }catch(e){
    const err=safeEngineError(e)
    return response({error:err.error},err.status)
  }
}
