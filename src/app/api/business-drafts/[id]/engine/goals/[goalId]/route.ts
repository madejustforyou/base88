import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,EngineError,safeEngineError} from '@/lib/base88-engine'

export const dynamic='force-dynamic'
type Context={params:Promise<{id:string;goalId:string}>}
const ID=/^[0-9a-f]{32}$/i
const ACTIONS=new Set(['activate','pause','resume','archive'])
function reply(body:unknown,status=200){
  return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
}

export async function POST(request:NextRequest,ctx:Context){
  const {id,goalId}=await ctx.params
  if(!ID.test(goalId))return reply({error:'Standing goal not found.'},404)
  let body:unknown
  try{
    const raw=await request.text()
    if(Buffer.byteLength(raw,'utf8')>300)return reply({error:'Invalid action request.'},413)
    body=JSON.parse(raw)
  }catch{return reply({error:'Invalid action JSON.'},400)}
  if(!body||typeof body!=='object'||Array.isArray(body)
     ||typeof (body as Record<string,unknown>).action!=='string'
     ||!ACTIONS.has((body as Record<string,string>).action))
    return reply({error:'Unknown standing goal action.'},400)
  try{
    const eng=await resolveEngine(request,id)
    if(!eng.workspaceId)return reply({error:'Business not imported to private engine.'},409)
    const action=(body as {action:string}).action
    const res=await engineFetch(eng.base,
      '/api/federation/v1/workspaces/'+eng.workspaceId+'/standing-goals/'+goalId+'/action',
      eng.jwt,'POST',{action})
    if(!res.ok)return reply({error:res.status===404?'Standing goal not found.':
      res.status===409?'Goal state cannot be changed.':'Independent engine rejected the action.'},
      res.status===404?404:res.status===409?409:res.status===401?401:503)
    const data:unknown=await res.json()
    if(!data||typeof data!=='object'||!('goal'in data))
      throw new EngineError(502,'Invalid private goal response.')
    return reply(data)
  }catch(e){
    const err=safeEngineError(e)
    return reply({error:err.error},err.status)
  }
}
