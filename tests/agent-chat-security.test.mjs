import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const read=(p)=>readFileSync(p,'utf8')
const route=read('src/app/api/agents/chat/route.ts')
const client=read('src/app/agents/[id]/page.tsx')
const sql=read('supabase/migrations/20261122_base88_agent_chat_reservations.sql')

test('no anonymous, client-assigned AI access and no unmetered API calls',()=>{
  assert.match(route,/authenticatedBusinessClient\(req\)/)
  assert.match(route,/BASE88_AI_CHAT_ENABLED/)
  assert.match(route,/base88_reserve_agent_chat/)
  assert.match(route,/\.eq\('user_id', auth\.userId\)/)
  assert.doesNotMatch(route,/const \{ agentId, message, systemPrompt, userId \}/)
  assert.doesNotMatch(route,/claude-3-5-sonnet-20241022/)
  assert.match(route,/max_tokens: 900/)
})

test('client sends signed Supabase session and one request key',()=>{
  assert.match(client,/session\.data\.session\?\.access_token/)
  assert.match(client,/'Authorization': 'Bearer ' \+ accessToken/)
  assert.match(client,/requestId: crypto\.randomUUID\(\)/)
  assert.doesNotMatch(client,/systemPrompt: agent\.system_prompt/)
  assert.doesNotMatch(client,/userId: user\.id \}/)
})

test('transactional quota is per owner and global and never trusts client entitlements',()=>{
  assert.match(sql,/auth\.uid\(\)/)
  assert.match(sql,/security definer/)
  assert.match(sql,/pg_advisory_xact_lock/)
  assert.match(sql,/request_id/)
  assert.match(sql,/>= 5/)
  assert.match(sql,/>= 60/)
  assert.match(sql,/>= 200/)
  assert.match(sql,/a\.user_id = customer/)
  assert.doesNotMatch(sql,/user_metadata/)
})
