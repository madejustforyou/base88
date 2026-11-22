import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync} from 'node:fs'
import {join} from 'node:path'

const root=process.cwd()
const file=(p)=>readFileSync(join(root,p),'utf8')

test('November 28 launch page exists and does not claim live autonomous services',()=>{
  assert.ok(existsSync(join(root,'src/app/launch/page.tsx')))
  const page=file('src/app/launch/page.tsx')
  assert.match(page,/NOV 28/)
  assert.match(page,/Backend deployment pending/)
  assert.match(page,/No live checkout/)
  assert.match(page,/Surprise Me/)
  assert.doesNotMatch(page,/is now running 24\/7|unlimited AI agent|guaranteed income/i)
})

test('Paid subscription cannot be self-assigned with a URL query',()=>{
  const signup=file('src/app/auth/signup/page.tsx')
  const billing=file('src/app/billing/page.tsx')
  assert.match(signup,/const \[plan\] = useState\('free'\)/)
  assert.doesNotMatch(signup,/const \[plan\] = useState\(defaultPlan\)/)
  assert.match(billing,/setCurrentPlan\('free'\)/)
  assert.doesNotMatch(billing,/setCurrentPlan\(data\.user\.user_metadata\?\.plan/)
  assert.match(billing,/not live yet/i)
})

test('Public marketing does not fabricate ratings and ready providers',()=>{
  const page=file('src/app/page.tsx')
  const layout=file('src/app/layout.tsx')
  assert.match(page,/November 28 launch/)
  assert.match(page,/Illustrative workflow examples/)
  assert.match(page,/independent backend/)
  assert.doesNotMatch(page,/PDPA-compliant|50\+ integrations|average deploy time|Running Now<\/div>/)
  assert.doesNotMatch(layout,/"aggregateRating"/)
  assert.doesNotMatch(layout,/Singapore.s #1/)
})

test('Live backend source remains private and has explicit setup fail-closed page',()=>{
  assert.ok(existsSync(join(root,'src/lib/base88-engine.ts')))
  assert.ok(existsSync(join(root,'src/app/preview-staging-required/page.tsx')))
  const engine=file('src/lib/base88-engine.ts')
  assert.match(engine,/Independent Base88 engine is not connected/)
  assert.match(engine,/checkedEngineOrigin/)
})
