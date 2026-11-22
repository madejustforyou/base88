/**
 * Fail-closed preview release gate.
 *
 * The staging project must have a different Supabase project reference from
 * production. Merely naming the production URL "staging" is not isolation.
 * Project refs are public identifiers, not secrets.
 */
export function stagingIsIsolated(env: Record<string,string|undefined> = process.env): boolean {
  if (env.BASE88_PREVIEW_DATA_ACCESS_ENABLED !== 'yes') return false
  const stagingRef=env.BASE88_STAGING_PROJECT_REF || ''
  const productionRef=env.BASE88_PRODUCTION_SUPABASE_PROJECT_REF || ''
  const REF=/^[a-z0-9]{20}$/
  if(!REF.test(stagingRef)||!REF.test(productionRef)||stagingRef===productionRef) return false
  try {
    const url=new URL(env.NEXT_PUBLIC_SUPABASE_URL || '')
    return url.protocol==='https:' &&
      url.hostname===stagingRef+'.supabase.co' &&
      url.port==='' && url.username==='' && url.password==='' &&
      url.pathname==='/' && url.search==='' && url.hash===''
  } catch {
    return false
  }
}
