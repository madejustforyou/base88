import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,safeEngineError,EngineError} from '@/lib/base88-engine'

export const dynamic='force-dynamic'
type Context={params:Promise<{id:string}>}
const STATUSES=['proposed','queued','running','completed','failed','cancelled'] as const
function response(body:unknown,status=200){
  return NextResponse.json(body,{status,headers:{
    'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'
  }})
}

/** Account-scoped runtime evidence; never treat configuration as proof of execution. */
export async function GET(request:NextRequest,ctx:Context){
  const {id}=await ctx.params
  try{
    const e=await resolveEngine(request,id)
    if(!e.workspaceId)return response({
      imported:false,worker_heartbeat_fresh:false,observed_worker_count:0,
      most_recent_worker_pulse_at:null,observation_only:true,external_actions:false
    })
    const path='/api/federation/v1/workspaces/'+e.workspaceId+'/runtime'
    const upstream=await engineFetch(e.base,path,e.jwt)
    if(!upstream.ok)throw new EngineError(upstream.status===401?401:503,'Private runtime evidence is unavailable.')
    const value:unknown=await upstream.json()
    if(!value||typeof value!=='object'||Array.isArray(value))
      throw new EngineError(502,'Invalid private runtime evidence.')
    const x=value as Record<string,unknown>
    if(x.workspace_id!==e.workspaceId||typeof x.worker_heartbeat_fresh!=='boolean'||
       !Number.isInteger(x.observed_worker_count)||Number(x.observed_worker_count)<0||
       x.observation_only!==true||x.external_actions!==false)
      throw new EngineError(502,'Unverified private runtime evidence.')
    const counts=x.federated_tasks as Record<string,unknown>|undefined
    if(!counts||typeof counts!=='object'||Array.isArray(counts))
      throw new EngineError(502,'Invalid private task counts.')
    const tasks:Record<string,number>={}
    for(const state of STATUSES){
      const n=counts[state]
      if(!Number.isInteger(n)||Number(n)<0||Number(n)>1_000_000)
        throw new EngineError(502,'Invalid private task counts.')
      tasks[state]=Number(n)
    }
    const last=x.most_recent_worker_pulse_at
    if(last!==null && (typeof last!=='string'||last.length>60||
        !/^\d{4}-\d\d-\d\dT/.test(last)))
      throw new EngineError(502,'Invalid private worker timestamp.')
    return response({
      imported:true,worker_heartbeat_fresh:x.worker_heartbeat_fresh,
      observed_worker_count:Math.min(Number(x.observed_worker_count),1000),
      most_recent_worker_pulse_at:last,
      federated_tasks:tasks,observation_only:true,external_actions:false,
      // Only the explicitly measured pulse can render as green.
      remote_coding:'unverified',remote_browser:'unverified',
      live_payment_processing:'unverified',customer_messaging:'unverified'
    })
  }catch(error){
    const e=safeEngineError(error)
    return response({error:e.error},e.status)
  }
}
