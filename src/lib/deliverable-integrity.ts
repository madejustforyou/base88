import {createHash} from 'node:crypto'

export const MAX_DELIVERABLE_BYTES=300_000
const ID=/^[a-f0-9]{32}$/i
const SHA256=/^[a-f0-9]{64}$/i

/** Validate the independent backend's declared digest against the exact bytes
 * served to the browser. An integrity_verified boolean is never sufficient.
 * The digest must still be bound to a trusted workspace by the backend.
 */
export function verifyDeliverableBytes(
  manifest:unknown, artifactId:string, bytes:Uint8Array
):boolean {
  if(!ID.test(artifactId)||!Array.isArray(manifest)||
     bytes.byteLength>MAX_DELIVERABLE_BYTES) return false
  const records=manifest.filter((entry):entry is Record<string,unknown>=>
    !!entry&&typeof entry==='object'&&!Array.isArray(entry)&&
    (entry as Record<string,unknown>).id===artifactId)
  if(records.length!==1)return false
  const record=records[0]
  if(record.integrity_verified!==true ||
     !Number.isSafeInteger(record.size_bytes) ||
     Number(record.size_bytes)<0 ||
     Number(record.size_bytes)>MAX_DELIVERABLE_BYTES ||
     Number(record.size_bytes)!==bytes.byteLength ||
     typeof record.sha256!=='string' || !SHA256.test(record.sha256))return false
  const actual=createHash('sha256').update(bytes).digest('hex')
  return actual===record.sha256.toLowerCase()
}
