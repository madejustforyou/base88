import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,safeEngineError,EngineError} from '@/lib/base88-engine'

export const dynamic='force-dynamic'
type Context={params:Promise<{id:string;artifactId:string}>}
const ID=/^[a-f0-9]{32}$/i

export async function GET(request:NextRequest,context:Context){
  const {id,artifactId}=await context.params
  if(!ID.test(artifactId))return NextResponse.json({error:'Deliverable not found.'},{status:404})
  try{
    const engine=await resolveEngine(request,id)
    if(!engine.workspaceId)throw new EngineError(404,'Deliverable not found.')
    const path='/api/federation/v1/workspaces/'+engine.workspaceId+
      '/deliverables/'+artifactId+'/download'
    const upstream=await engineFetch(engine.base,path,engine.jwt)
    if(!upstream.ok)throw new EngineError(upstream.status===409?409:404,
      upstream.status===409?'Deliverable verification failed.':'Deliverable is unavailable.')
    const body=await upstream.text()
    if(Buffer.byteLength(body,'utf8')>300000)
      throw new EngineError(502,'Deliverable exceeds download limit.')
    return new NextResponse(body,{status:200,headers:{
      'Content-Type':'text/plain; charset=utf-8',
      'Content-Disposition':'attachment; filename="base88-deliverable-'+artifactId+'.txt"',
      'Cache-Control':'private, no-store',
      'X-Content-Type-Options':'nosniff',
      'Content-Security-Policy':"default-src 'none'; sandbox",
    }})
  }catch(error){
    const e=safeEngineError(error)
    return NextResponse.json({error:e.error},{status:e.status,headers:{'Cache-Control':'private, no-store'}})
  }
}
