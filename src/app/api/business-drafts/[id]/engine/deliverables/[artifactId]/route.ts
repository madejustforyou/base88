import {NextRequest,NextResponse} from 'next/server'
import {resolveEngine,engineFetch,safeEngineError,EngineError} from '@/lib/base88-engine'
import {MAX_DELIVERABLE_BYTES,verifyDeliverableBytes} from '@/lib/deliverable-integrity'

export const dynamic='force-dynamic'
type Context={params:Promise<{id:string;artifactId:string}>}
const ID=/^[a-f0-9]{32}$/i

export async function GET(request:NextRequest,context:Context){
  const {id,artifactId}=await context.params
  if(!ID.test(artifactId))return NextResponse.json({error:'Deliverable not found.'},{status:404})
  try{
    const engine=await resolveEngine(request,id)
    if(!engine.workspaceId)throw new EngineError(404,'Deliverable not found.')
    const basePath='/api/federation/v1/workspaces/'+engine.workspaceId+'/deliverables'

    // Obtain the manifest under the same authenticated workspace identity as
    // the download, then bind the file's exact bytes to its recorded digest.
    const listed=await engineFetch(engine.base,basePath,engine.jwt)
    if(!listed.ok)throw new EngineError(503,'Private deliverable manifest is unavailable.')
    const manifest:unknown=await listed.json()
    if(!manifest||typeof manifest!=='object'||Array.isArray(manifest)||
       !Array.isArray((manifest as Record<string,unknown>).deliverables))
      throw new EngineError(502,'Invalid private deliverable manifest.')
    const artifacts=(manifest as {deliverables:unknown[]}).deliverables
    const matching=artifacts.filter((item)=>{
      if(!item||typeof item!=='object'||Array.isArray(item))return false
      return (item as Record<string,unknown>).id===artifactId
    })
    // Reject missing/duplicate entries and unverified or oversize metadata
    // *before* reading the actual download stream.
    if(matching.length!==1)throw new EngineError(404,'Deliverable not found.')
    const meta=matching[0] as Record<string,unknown>
    if(meta.integrity_verified!==true||!Number.isSafeInteger(meta.size_bytes)||
       Number(meta.size_bytes)>MAX_DELIVERABLE_BYTES||Number(meta.size_bytes)<0)
      throw new EngineError(409,'Deliverable verification failed.')

    const upstream=await engineFetch(engine.base,basePath+'/'+artifactId+'/download',engine.jwt)
    if(!upstream.ok)throw new EngineError(upstream.status===409?409:404,
      upstream.status===409?'Deliverable verification failed.':'Deliverable is unavailable.')
    const declaredLength=upstream.headers.get('content-length')
    if(declaredLength!==null && Number(declaredLength)>MAX_DELIVERABLE_BYTES)
      throw new EngineError(502,'Deliverable exceeds download limit.')
    if(!upstream.body)throw new EngineError(502,'Deliverable stream is unavailable.')

    // Stream with an actual byte cap, not an unbounded .text() or .arrayBuffer().
    const reader=upstream.body.getReader()
    const chunks:Buffer[]=[]
    let size=0
    while(true){
      const {done,value}=await reader.read()
      if(done)break
      size+=value.byteLength
      if(size>MAX_DELIVERABLE_BYTES){
        await reader.cancel().catch(()=>{})
        throw new EngineError(502,'Deliverable exceeds download limit.')
      }
      chunks.push(Buffer.from(value))
    }
    const bytes=Buffer.concat(chunks,size)
    if(!verifyDeliverableBytes(artifacts,artifactId,bytes))
      throw new EngineError(409,'Deliverable verification failed.')

    // File integrity has now been checked by the proxy itself, not accepted
    // solely from the upstream integrity_verified field.
    const responseBody=Uint8Array.from(bytes).buffer
    return new NextResponse(responseBody,{status:200,headers:{
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
