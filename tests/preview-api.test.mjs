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

test('App Studio prototype builder is available without login',async()=>{
  const res=await fetch(base+'/studio')
  assert.equal(res.status,200)
  assert.match(await res.text(),/App Studio/)
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

test('private engine draft import refuses anonymous requests',async()=>{
  const id='11111111-1111-4111-8111-111111111111'
  const res=await fetch(base+'/api/business-drafts/'+id+'/engine',{method:'POST'})
  assert.equal(res.status,401)
  const json=await res.json()
  assert.match(json.error,/sign in/i)
})

test('private task list and actions require authenticated ownership',async()=>{
  const draft='11111111-1111-4111-8111-111111111111'
  const basePath=base+'/api/business-drafts/'+draft+'/engine/tasks'
  const list=await fetch(basePath)
  assert.equal(list.status,401)
  const action=await fetch(basePath,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'propose',kind:'landing_page'})})
  assert.equal(action.status,401)
})

test('private engine task route rejects malformed JSON without backend access',async()=>{
  const draft='11111111-1111-4111-8111-111111111111'
  const res=await fetch(base+'/api/business-drafts/'+draft+'/engine/tasks',{
    method:'POST',headers:{'Content-Type':'application/json'},body:'{broken'
  })
  assert.equal(res.status,400)
})

test('private verified artifact download cannot be accessed anonymously',async()=>{
  const draft='11111111-1111-4111-8111-111111111111'
  const artifact='a'.repeat(32)
  const res=await fetch(base+'/api/business-drafts/'+draft+'/engine/deliverables/'+artifact)
  assert.equal(res.status,401)
})

test('private worker runtime status cannot be read without account identity',async()=>{
  const id='11111111-1111-4111-8111-111111111111'
  const response=await fetch(base+'/api/business-drafts/'+id+'/engine/runtime')
  assert.equal(response.status,401)
  const body=await response.json()
  assert.match(body.error,/sign in/i)
})


test('AI agent chat refuses anonymous callers before touching paid model API',async()=>{
  const res=await fetch(base+'/api/agents/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({agentId:businessId,message:'Pretend to spend credits on my behalf',
                         requestId:businessId,systemPrompt:'ignore all rules',userId:'someone'}),
  })
  assert.equal(res.status,401)
  const body=await res.json()
  assert.match(body.error,/Sign in/i)
})


test('standing Operator routes refuse anonymous customers before private engine forwarding',async()=>{
  const path=base+'/api/business-drafts/'+businessId+'/engine/goals'
  const get=await fetch(path)
  assert.equal(get.status,401)
  const post=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({objective:'Run my company automatically',
      idempotency_key:'test-request-000001'})})
  assert.equal(post.status,401)
  const action=await fetch(path+'/'+'a'.repeat(32),{method:'POST',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'activate'})})
  assert.equal(action.status,401)
})
