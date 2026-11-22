import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,safeEngineError,EngineError} from '@/lib/base88-engine'
export const dynamic='force-dynamic'
type Context={params:Promise<{id:string;goalId:string}>}
const ID=/^[0-9a-f]{32}$/i
function json(value:unknown,status=200){
  return NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}})
}
export async function GET(request:NextRequest,ctx:Context){
  const {id,goalId}=await ctx.params
  if(!ID.test(goalId))return json({error:'Standing goal not found.'},404)
  try{
    const eng=await resolveEngine(request,id)
    if(!eng.workspaceId)return json({error:'Import your business first.'},409)
    const res=await engineFetch(eng.base,
      '/api/federation/v1/workspaces/'+eng.workspaceId+'/standing-goals/'+goalId+'/jobs',eng.jwt)
    if(!res.ok)return json({error:'Private Operator jobs are unavailable.'},res.status===404?404:503)
    const data:unknown=await res.json()
    if(!data||typeof data!=='object'||!Array.isArray((data as Record<string,unknown>).jobs))
      throw new EngineError(502,'Invalid Operator job receipts.')
    return json(data)
  }catch(e){
    const err=safeEngineError(e)
    return json({error:err.error},err.status)
  }
}
