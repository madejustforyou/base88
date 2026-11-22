import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,safeEngineError,EngineError} from '@/lib/base88-engine'

export const dynamic='force-dynamic'
type Context={params:Promise<{id:string,goalId:string}>}
const ID=/^[0-9a-f]{32}$/i
const ACTIONS=new Set(['activate','pause','resume','archive'])
function reply(value:unknown,status=200){
  return NextResponse.json(value,{status,headers:{
    'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',
  }})
}

export async function POST(request:NextRequest,context:Context){
  const {id,goalId}=await context.params
  if(!ID.test(goalId))return reply({error:'Operator goal not found.'},404)
  let body:unknown
  try{
    const raw=await request.text()
    if(Buffer.byteLength(raw,'utf8')>300)return reply({error:'Request too large.'},413)
    body=JSON.parse(raw)
  }catch{return reply({error:'Invalid action.'},400)}
  if(!body||typeof body!=='object'||Array.isArray(body)
    ||typeof (body as Record<string,unknown>).action!=='string'
    ||!ACTIONS.has((body as Record<string,unknown>).action as string))
    return reply({error:'Unsupported Operator action.'},400)
  try{
    const ctx=await resolveEngine(request,id)
    if(!ctx.workspaceId)return reply({error:'Business not yet imported.'},409)
    const upstream=await engineFetch(ctx.base,
      '/api/federation/v1/workspaces/'+ctx.workspaceId+
      '/standing-goals/'+goalId+'/action',
      ctx.jwt,'POST',{action:(body as Record<string,unknown>).action})
    if(!upstream.ok)return reply({
      error:upstream.status===409?'The Operator cannot make that transition.':
        upstream.status===404?'This Operator goal was not found.':
        'The independent Operator could not change state.',
    },upstream.status===409?409:upstream.status===404?404:upstream.status===401?401:503)
    const content:unknown=await upstream.json()
    if(!content||typeof content!=='object'||Array.isArray(content)
      ||!(content as Record<string,unknown>).goal)
      throw new EngineError(502,'Invalid Operator transition receipt.')
    return reply({...content,external_actions:false})
  }catch(error){
    const e=safeEngineError(error)
    return reply({error:e.error},e.status)
  }
}
