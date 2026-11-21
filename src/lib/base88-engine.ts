import type { NextRequest } from 'next/server'
import { authenticatedBusinessClient } from '@/lib/base88-auth'

export type EngineContext = {
  jwt:string
  base:string
  workspaceId:string | null
}
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ID=/^[0-9a-f]{32}$/i

export class EngineError extends Error {
  constructor(public status:number, message:string){super(message)}
}

export function engineOrigin():string {
  const raw=process.env.BASE88_ENGINE_URL
  if(!raw)throw new EngineError(503,'Independent Base88 engine is not connected.')
  try{
    const u=new URL(raw)
    if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||
       u.search||u.hash||u.hostname==='localhost'||u.hostname.endsWith('.local')||
       u.hostname.endsWith('.internal')||u.hostname==='0.0.0.0')
      throw new Error('Invalid engine target')
    return u.origin
  }catch{throw new EngineError(503,'Independent Base88 engine configuration is invalid.')}
}

/** Resolve a signed customer and an RLS-owned business; no service-role privileges. */
export async function resolveEngine(request:NextRequest, draftId:string):Promise<EngineContext> {
  if(!UUID.test(draftId))throw new EngineError(404,'Business draft not found.')
  const user=await authenticatedBusinessClient(request)
  if(!user)throw new EngineError(401,'Sign in to access your own business.')
  const {data,error}=await user.client.from('base88_business_drafts')
    .select('id').eq('id',draftId).eq('owner_id',user.userId).maybeSingle()
  if(error)throw new EngineError(503,'Business draft storage is not yet connected.')
  if(!data)throw new EngineError(404,'Business draft not found.')
  const match=/^Bearer ([^\s]{40,8192})$/.exec(request.headers.get('authorization')||'')
  if(!match)throw new EngineError(401,'Invalid session.')
  const base=engineOrigin()
  const res=await engineFetch(base,'/api/federation/v1/workspaces',match[1])
  if(!res.ok)throw new EngineError(res.status===401?401:503,'Independent engine authorization is unavailable.')
  let parsed:unknown
  try{parsed=await res.json()}catch{throw new EngineError(502,'Invalid engine response.')}
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))
    throw new EngineError(502,'Invalid engine response.')
  const list=(parsed as Record<string,unknown>).workspaces
  if(!Array.isArray(list))throw new EngineError(502,'Invalid engine workspace list.')
  const matchWorkspace=list.find((entry)=>{
    if(!entry||typeof entry!=='object')return false
    const x=entry as Record<string,unknown>
    return x.external_draft_id===draftId && typeof x.id==='string' && ID.test(x.id)
  }) as {id:string}|undefined
  return {jwt:match[1],base,workspaceId:matchWorkspace?.id||null}
}

export function engineFetch(base:string,path:string,jwt:string,method:'GET'|'POST'='GET',body?:unknown) {
  // Paths must be assembled exclusively by our own server code, never supplied by callers.
  if(!path.startsWith('/api/federation/v1/')||path.includes('..')||path.includes('?'))
    throw new EngineError(500,'Internal engine path is invalid.')
  return fetch(base+path,{
    method,cache:'no-store',redirect:'error',
    headers:{Authorization:'Bearer '+jwt,...(body===undefined?{}:{'Content-Type':'application/json'})},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
    signal:AbortSignal.timeout(7000),
  })
}

export function safeEngineError(error:unknown):{status:number;error:string}{
  if(error instanceof EngineError)return {status:error.status,error:error.message}
  return {status:503,error:'Independent Base88 engine is temporarily unavailable.'}
}
