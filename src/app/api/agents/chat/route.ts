import { NextRequest, NextResponse } from 'next/server'
import { authenticatedBusinessClient } from '@/lib/base88-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REQUEST_MAX_BYTES = 5000
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MODEL = process.env.BASE88_CHAT_MODEL || 'claude-haiku-5-5'

function reply(body: object, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {'Cache-Control':'no-store, private', 'X-Content-Type-Options':'nosniff'},
  })
}

/** Customer-owned, metered AI chat.
 * Never accept userId, systemPrompt, provider, or model from untrusted JSON.
 * Actual provider use requires both a verified owner and transactional quota.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticatedBusinessClient(req)
  if (!auth) return reply({error:'Sign in to message your Operator.'}, 401)

  if (process.env.BASE88_AI_CHAT_ENABLED !== 'true')
    return reply({error:'Live Operator chat is not yet enabled for this workspace.'}, 503)

  const length = Number(req.headers.get('content-length') || '0')
  if (!Number.isFinite(length) || length > REQUEST_MAX_BYTES)
    return reply({error:'Message too large.'}, 413)

  let body: unknown
  try {
    const raw = await req.text()
    if (Buffer.byteLength(raw, 'utf-8') > REQUEST_MAX_BYTES)
      return reply({error:'Message too large.'}, 413)
    body = JSON.parse(raw)
  } catch {
    return reply({error:'Invalid request body.'}, 400)
  }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return reply({error:'Invalid request.'}, 400)

  const {agentId, message, requestId} = body as Record<string, unknown>
  if (typeof agentId !== 'string' || !UUID.test(agentId)
      || typeof requestId !== 'string' || !UUID.test(requestId)
      || typeof message !== 'string' || message.trim().length < 1 || message.length > 3000)
    return reply({error:'Invalid agent, request ID, or message.'}, 400)

  const {data:agent, error:ownerError} = await auth.client
    .from('agents')
    .select('id, name, system_prompt, user_id, status')
    .eq('id', agentId).eq('user_id', auth.userId)
    .maybeSingle()
  if (ownerError) return reply({error:'Agent ownership could not be verified.'}, 503)
  if (!agent) return reply({error:'Operator not found in this account.'}, 404)
  if (agent.status !== 'active') return reply({error:'Operator is paused.'}, 409)

  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key.length < 25) return reply({error:'The model provider is not connected.'}, 503)

  // Server-owned SECURITY DEFINER function validates auth.uid(), ownership,
  // limits and unique request key. Missing ledger always fails closed.
  const {data:reserved, error:reserveError} = await auth.client.rpc(
    'base88_reserve_agent_chat', {
      p_agent_id: agentId,
      p_request_id: requestId,
    },
  )
  if (reserveError) return reply({error:'The usage ledger is not available.'}, 503)
  if (reserved !== true) return reply({error:'Message limit reached or duplicate request.'}, 429)

  try {
    const sys = String(agent.system_prompt || '').slice(0,2000)
      || ('You are ' + String(agent.name).slice(0,80) + ', a Base88 virtual business assistant.')
    const systemText = sys + '\nYou are a clearly identified AI assistant, not a human employee.' +
      '\nDo not fabricate external research, trading, calls, publishing, purchases or task results.' +
      '\nExternal actions require connected tools and separately verified owner authorization.' +
      '\nDate: ' + new Date().toISOString().slice(0,10) + '. Platform: Base88.'
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system: systemText,
        messages: [{role:'user', content:message.trim()}],
      }),
      signal: AbortSignal.timeout(25_000),
      cache: 'no-store',
    })
    if (!response.ok) return reply({error:'The AI provider did not complete the request.'}, 502)
    const data = await response.json()
    const answer = data?.content?.find((x: {type?:string, text?:string})=>x.type==='text')?.text
    if (typeof answer !== 'string' || !answer.trim())
      return reply({error:'The AI provider returned no usable answer.'}, 502)
    return reply({ok:true, reply:answer.slice(0,12000)}, 200)
  } catch {
    return reply({error:'The model connection timed out or is unavailable.'}, 503)
  }
}
