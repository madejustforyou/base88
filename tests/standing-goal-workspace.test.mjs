import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const read=p=>readFileSync(p,'utf8')

test('customer goal route verifies signed tenant and never directly trusts a workspace ID',()=>{
  const src=read('src/app/api/business-drafts/[id]/engine/standing-goals/route.ts')
  assert.match(src,/resolveEngine\(request,id\)/)
  assert.match(src,/engineFetch\(/)
  assert.match(src,/standing-goals/)
  assert.match(src,/idempotency_key/)
  assert.match(src,/external_actions:false/)
  assert.doesNotMatch(src,/service.role|SUPABASE_SERVICE_ROLE_KEY|rootPassword|SSH_PRIVATE_KEY/i)
})

test('goal activation, pause and archive all use authenticated engine bridge',()=>{
  const src=read('src/app/api/business-drafts/[id]/engine/standing-goals/[goalId]/action/route.ts')
  assert.match(src,/resolveEngine\(request,id\)/)
  assert.match(src,/const ACTIONS=new Set\(\['activate','pause','resume','archive'\]\)/)
  assert.match(src,/engineFetch\(/)
  assert.match(src,/external_actions:false/)
  assert.match(src,/if\(!ID\.test\(goalId\)\)/)
})

test('receipt route verifies customer and bound goal ID',()=>{
  const src=read('src/app/api/business-drafts/[id]/engine/standing-goals/[goalId]/jobs/route.ts')
  assert.match(src,/resolveEngine\(request,id\)/)
  assert.match(src,/engineFetch\(/)
  assert.match(src,/Array\.isArray/)
  assert.match(src,/external_actions!==false/)
})

test('customer-facing operator does not claim real external actions before connection',()=>{
  const src=read('src/app/business-drafts/[id]/engine/operations/page.tsx')
  const dashboard=read('src/app/dashboard/page.tsx')
  assert.match(src,/Run my business/)
  assert.match(src,/No expiration date required/)
  assert.match(src,/only private website drafts and evidence-based operating reviews/)
  assert.match(src,/Start private work/)
  assert.match(src,/Pause work/)
  assert.match(src,/Verified private work history/)
  assert.match(src,/Crypto|trades|trading/)
  assert.match(dashboard,/Run my business/)
})
