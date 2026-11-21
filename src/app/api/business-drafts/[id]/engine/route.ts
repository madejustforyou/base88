import {NextRequest,NextResponse} from 'next/server'
import {authenticatedBusinessClient} from '@/lib/base88-auth'

export const dynamic = 'force-dynamic'
type RouteContext={params:Promise<{id:string}>}
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function reply(body:unknown,status=200){
  return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})
}

function engineOrigin(){
  const raw=process.env.BASE88_ENGINE_URL
  if(!raw)return null
  try{
    const u=new URL(raw)
    if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)
      return null
    if(!u.hostname||u.hostname==='localhost'||u.hostname.endsWith('.local')||u.hostname.endsWith('.internal'))
      return null
    return u.origin
  }catch{return null}
}

function str(value:unknown,min:number,max:number){
  return typeof value==='string'&&value.trim().length>=min&&value.length<=max
}

export async function POST(request:NextRequest,ctx:RouteContext){
  // User JWT from the existing browser login is verified by Supabase Auth.
  // No privileged service-role credentials are passed to the engine.
  const auth=await authenticatedBusinessClient(request)
  if(!auth)return reply({error:'Sign in to import your own business draft.'},401)
  const {id}=await ctx.params
  if(!UUID.test(id))return reply({error:'Draft not found.'},404)
  const {data,error}=await auth.client.from('base88_business_drafts')
    .select('id,name,category,brief')
    .eq('id',id).eq('owner_id',auth.userId).maybeSingle()
  if(error)return reply({error:'Business draft storage is not yet activated.'},503)
  if(!data)return reply({error:'Draft not found.'},404)

  const engine=engineOrigin()
  if(!engine)return reply({error:'The independent Base88 engine is not deployed yet.'},503)
  const brief=data.brief
  if(!brief||typeof brief!=='object'||Array.isArray(brief))
    return reply({error:'Saved draft format is invalid.'},409)
  const b=brief as Record<string,unknown>
  if(!str(data.name,2,120)||!str(data.category,2,64)
    ||!str(b.audience,2,300)||!str(b.tagline,2,220)
    ||!str(b.problem,2,1200)||!str(b.firstProduct,2,1200)
    ||!str(b.price,1,80))return reply({error:'Saved draft is incomplete.'},409)

  const match=/^Bearer ([^\s]{40,8192})$/.exec(request.headers.get('authorization')||'')
  if(!match)return reply({error:'Invalid session.'},401)
  try{
    const result=await fetch(engine+'/api/federation/v1/workspaces',{
      method:'POST',
      redirect:'error',
      cache:'no-store',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+match[1]},
      body:JSON.stringify({
        external_draft_id:data.id,name:data.name,category:data.category,
        audience:b.audience,tagline:b.tagline,problem:b.problem,
        firstProduct:b.firstProduct,price:b.price
      }),
      signal:AbortSignal.timeout(7000),
    })
    if(!result.ok)return reply({
      error:result.status===401?'The engine rejected the session. Sign in again.':
        'The independent Base88 engine could not import this business.'
    },result.status===401?401:503)
    const body:unknown=await result.json()
    if(!body||typeof body!=='object'||Array.isArray(body))
      return reply({error:'Unexpected response from Base88 engine.'},502)
    const obj=body as Record<string,unknown>
    if(!obj.workspace||typeof obj.workspace!=='object')
      return reply({error:'Unexpected response from Base88 engine.'},502)
    return reply({workspace:obj.workspace,created:obj.created===true,external_actions:false})
  }catch{
    return reply({error:'The independent Base88 engine is currently unavailable.'},503)
  }
}
