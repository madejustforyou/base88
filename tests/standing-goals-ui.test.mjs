import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const get=(p)=>readFileSync(p,'utf8')

test('one customer instruction produces a revocable durable goal form with no end date',()=>{
 const page=get('src/app/business-drafts/[id]/operator/page.tsx')
 assert.match(page,/Tell your Operator what to do/)
 assert.match(page,/No end date/)
 assert.match(page,/Save standing goal/)
 assert.match(page,/Activate private work/)
 assert.match(page,/Pause/)
 assert.match(page,/See actual jobs/)
 assert.doesNotMatch(page,/valid_until|expires_at|autoSpend|sign_contract/)
})

test('all new website routes use verified tenant-to-engine JWT and safe paths',()=>{
 for(const p of [
  'src/app/api/business-drafts/[id]/engine/goals/route.ts',
  'src/app/api/business-drafts/[id]/engine/goals/[goalId]/route.ts',
  'src/app/api/business-drafts/[id]/engine/goals/[goalId]/jobs/route.ts',
 ]){
  const source=get(p)
  assert.match(source,/resolveEngine\(request,id\)/,p)
  assert.match(source,/engineFetch\(/,p)
  assert.match(source,/private, no-store/,p)
  assert.doesNotMatch(source,/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_KEY|Authorization.*Basic/,p)
 }
})

test('all goal changes require explicit selected action and separate private limits',()=>{
 const action=get('src/app/api/business-drafts/[id]/engine/goals/[goalId]/route.ts')
 assert.match(action,/new Set\(\['activate','pause','resume','archive'\]\)/)
 assert.match(action,/ID\.test\(goalId\)/)
 assert.match(action,/Unknown standing goal action/)
 const create=get('src/app/api/business-drafts/[id]/engine/goals/route.ts')
 assert.match(create,/b\.objective\.trim\(\)\.length<8/)
 assert.match(create,/idempotency_key/)
 assert.match(create,/Import this business draft first/)
})

test('business dashboard links to Operator goals without declaring paid work complete',()=>{
 const dash=get('src/app/dashboard/page.tsx')
 assert.match(dash,/Standing Operator/)
 assert.match(dash,/\/operator'/)
 assert.match(dash,/Dedicate|Autonomous company operation/)
 assert.doesNotMatch(dash,/we guarantee your agent will make money/i)
})
