import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,safeEngineError,EngineError} from '@/lib/base88-engine'

export const dynamic='force-dynamic'
type Context={params:Promise<{id:string,goalId:string}>}
const ID=/^[0-9a-f]{32}$/i
function reply(value:unknown,status=200){
  return NextResponse.json(value,{status,headers:{
    'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',
  }})
}
export async function GET(request:NextRequest,context:Context){
  const {id,goalId}=await context.params
  if(!ID.test(goalId))return reply({error:'Operator goal not found.'},404)
  try{
    const ctx=await resolveEngine(request,id)
    if(!ctx.workspaceId)return reply({error:'Business not imported.'},409)
    const upstream=await engineFetch(ctx.base,
      '/api/federation/v1/workspaces/'+ctx.workspaceId+
      '/standing-goals/'+goalId+'/jobs',ctx.jwt)
    if(!upstream.ok)return reply({error:'Could not load verified Operator jobs.'},
      upstream.status===404?404:upstream.status===401?401:503)
    const content:unknown=await upstream.json()
    if(!content||typeof content!=='object'||Array.isArray(content)
      ||!Array.isArray((content as Record<string,unknown>).jobs)
      ||(content as Record<string,unknown>).external_actions!==false)
      throw new EngineError(502,'Invalid Operator job receipts.')
    return reply(content)
  }catch(error){
    const e=safeEngineError(error)
    return reply({error:e.error},e.status)
  }
}
