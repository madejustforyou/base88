import {isIP} from 'node:net'

/**
 * Validate the operator-managed independent engine origin before forwarding
 * an authenticated user's JWT. This is not DNS pinning; deployers must still
 * use an operator-owned TLS hostname and controlled egress policy.
 */
export function checkedEngineOrigin(raw:string):string|null {
  try {
    const u=new URL(raw)
    const host=u.hostname.toLowerCase()
    if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||
       u.search||u.hash||!host||host.endsWith('.')||
       host==='localhost'||host.endsWith('.localhost')||
       host.endsWith('.local')||host.endsWith('.internal')||
       isIP(host.replace(/^\[|\]$/g,''))!==0) return null
    return u.origin
  } catch {
    return null
  }
}
