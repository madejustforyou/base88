import test from 'node:test'
import assert from 'node:assert/strict'

const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:3033'
const businessId='11111111-1111-4111-8111-111111111111'

test('Surprise Me page is available without login',async()=>{
  const res=await fetch(base+'/surprise-me')
  assert.equal(res.status,200)
  const html=await res.text()
  assert.match(html,/Surprise me/i)
})

test('business drafts reject anonymous reads and writes',async()=>{
  const get=await fetch(base+'/api/business-drafts')
  assert.equal(get.status,401)
  const post=await fetch(base+'/api/business-drafts',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})
  assert.equal(post.status,401)
})

test('business inbox never exposes customer messages to anonymous callers',async()=>{
  const get=await fetch(base+'/api/business-drafts/'+businessId+'/inbox')
  assert.equal(get.status,401)
  const post=await fetch(base+'/api/business-drafts/'+businessId+'/inbox',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})
  assert.equal(post.status,401)
  const edit=await fetch(base+'/api/business-drafts/'+businessId+'/inbox',{method:'PATCH',headers:{'Content-Type':'application/json'},body:'{}'})
  assert.equal(edit.status,401)
})

test('inbox owner endpoint rejects invalid business IDs before database access',async()=>{
  const res=await fetch(base+'/api/business-drafts/not-a-uuid/inbox')
  assert.equal(res.status,404)
})

test('public waitlist rejects malformed email without database writes',async()=>{
  const res=await fetch(base+'/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'not-an-email'})})
  assert.equal(res.status,400)
  const body=await res.json()
  assert.match(body.error,/valid email/i)
})

test('public waitlist rejects oversized request before database access',async()=>{
  const res=await fetch(base+'/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'valid@example.com',use_case:'X'.repeat(9000)})})
  assert.equal(res.status,413)
})
