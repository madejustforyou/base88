import test from 'node:test'
import assert from 'node:assert/strict'

const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3034'

test('public Surprise Me remains available without account access',async()=>{
  const r=await fetch(base+'/surprise-me')
  assert.equal(r.status,200)
  const body=await r.text()
  assert.match(body,/Surprise me/i)
})

test('preview blocks access to all customer data APIs until isolated staging',async()=>{
  const urls=[
    '/api/business-drafts',
    '/api/business-drafts/11111111-1111-4111-8111-111111111111/inbox',
    '/api/business-drafts/11111111-1111-4111-8111-111111111111/engine/tasks',
    '/api/waitlist',
  ]
  for(const path of urls){
    const r=await fetch(base+path,{headers:{Authorization:'Bearer deliberately-fake-token'}})
    assert.equal(r.status,503,path+' was not blocked')
    const body=await r.json()
    assert.match(body.error,/staging/i)
    assert.equal(r.headers.get('cache-control'),'private, no-store')
  }
})

test('preview blocks account login and saved-business dashboard',async()=>{
  for(const path of ['/auth/login','/auth/signup','/dashboard','/business-drafts/11111111-1111-4111-8111-111111111111/inbox']){
    const r=await fetch(base+path,{redirect:'manual'})
    assert.equal(r.status,503,path+' remained available')
    const body=await r.text()
    assert.match(body,/temporarily locked|temporarily unavailable|separate staging database/i)
  }
})

test('preview refuses customer API writes without even parsing the body',async()=>{
  const path='/api/business-drafts'
  const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:'{not-json'})
  assert.equal(r.status,503)
})
