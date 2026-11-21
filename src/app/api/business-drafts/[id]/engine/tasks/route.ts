import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,safeEngineError,EngineError} from '@/lib/base88-engine'

export const dynamic='force-dynamic'
type Context={params:Promise<{id:string}>}
const ID=/^[0-9a-f]{32}$/i
const ALLOWED=new Set(['landing_page','starter_product','launch_checklist','business_review'])
function response(body:unknown,status=200){
  return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
}

export async function GET(request:NextRequest, context:Context){
  const {id}=await context.params
  try{
    const engine=await resolveEngine(request,id)
    if(!engine.workspaceId)return response({connected:true,imported:false,tasks:[],deliverables:[],external_actions:false})
    const basePath='/api/federation/v1/workspaces/'+engine.workspaceId
    const [tasks,outputs]=await Promise.all([
      engineFetch(engine.base,basePath+'/tasks',engine.jwt),
      engineFetch(engine.base,basePath+'/deliverables',engine.jwt),
    ])
    if(!tasks.ok||!outputs.ok)throw new EngineError(503,'Private tasks or deliverables are unavailable.')
    const t=await tasks.json()
    const o=await outputs.json()
    if(!t||!Array.isArray(t.tasks)||!o||!Array.isArray(o.deliverables))
      throw new EngineError(502,'Unexpected response from independent engine.')
    return response({connected:true,imported:true,workspace_id:engine.workspaceId,
      tasks:t.tasks,deliverables:o.deliverables,external_actions:false})
  }catch(error){
    const e=safeEngineError(error)
    return response({error:e.error},e.status)
  }
}

export async function POST(request:NextRequest,context:Context){
  const {id}=await context.params
  try{
    // Owner must explicitly press a button for each proposed, approved or cancelled task.
    const length=Number(request.headers.get('content-length')||'0')
    if(Number.isFinite(length)&&length>2000)
      return response({error:'Task request too large.'},413)
    const raw=await request.text()
    if(Buffer.byteLength(raw,'utf8')>2000)
      return response({error:'Task request too large.'},413)
    let body:unknown
    try { body=JSON.parse(raw) }
    catch { return response({error:'Invalid JSON task request.'},400) }
    if(!body||typeof body!=='object'||Array.isArray(body))
      return response({error:'Invalid task request.'},400)
    const b=body as Record<string,unknown>
    if(!['propose','approve','cancel'].includes(String(b.action)))
      return response({error:'Invalid task action.'},400)
    const engine=await resolveEngine(request,id)
    if(!engine.workspaceId)return response({error:'Import this business draft into the private engine first.'},409)
    const path='/api/federation/v1/workspaces/'+engine.workspaceId+'/tasks'
    let target:string
    let payload:unknown=undefined
    if(b.action==='propose'){
      if(typeof b.kind!=='string'||!ALLOWED.has(b.kind))
        return response({error:'This task type is not supported by the private engine.'},400)
      target=path
      payload={kind:b.kind}
    }else{
      if(typeof b.task_id!=='string'||!ID.test(b.task_id))
        return response({error:'Invalid task identifier.'},400)
      target=path+'/'+b.task_id+'/'+(b.action==='approve'?'approve':'cancel')
    }
    const res=await engineFetch(engine.base,target,engine.jwt,'POST',payload)
    if(!res.ok)return response({
      error:res.status===409?'This task cannot transition from its current state.':
        'The private engine rejected the requested task action.'
    },res.status===401?401:res.status===404?404:res.status===409?409:503)
    const returned=await res.json()
    if(!returned||typeof returned!=='object'||!('task'in returned))
      return response({error:'Unexpected task response.'},502)
    return response({task:(returned as Record<string,unknown>).task,external_actions:false},b.action==='propose'?201:200)
  }catch(error){
    const e=safeEngineError(error)
    return response({error:e.error},e.status)
  }
}
