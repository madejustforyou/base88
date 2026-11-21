/**
 * Opt-in staging-only Supabase RLS test.
 * Never run against production: creates and deletes test drafts and inbox messages.
 */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

if (process.env.BASE88_TEST_DB_IS_EPHEMERAL !== 'yes') {
  throw new Error('Refusing to run: set BASE88_TEST_DB_IS_EPHEMERAL=yes on a disposable staging database')
}
const {TEST_SUPABASE_URL:url,TEST_SUPABASE_ANON_KEY:key,TEST_USER_A_JWT:a,TEST_USER_B_JWT:b} = process.env
if (![url,key,a,b].every(x => typeof x==='string' && x.length>10)) {
  throw new Error('Two distinct staging user JWTs and the staging Supabase URL/anon key are required')
}
const client=(jwt)=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:'Bearer '+jwt}}})
const A=client(a), B=client(b)
const [aUser,bUser]=await Promise.all([A.auth.getUser(a),B.auth.getUser(b)])
assert.ok(aUser.data.user && bUser.data.user,'staging test users must be authenticated')
assert.notEqual(aUser.data.user.id,bUser.data.user.id,'two different accounts required')
const owner=aUser.data.user.id
let created=null
try {
  const brief={name:'RLS Test '+randomUUID(),category:'Auto services',audience:'test audience',
    tagline:'Test tagline',problem:'Test problem',firstProduct:'Test product',price:'$0',
    validation:['test'],acquisition:['test'],risk:'none',freeTool:'test'}
  const insert=await A.from('base88_business_drafts').insert({owner_id:owner,name:brief.name,category:brief.category,status:'draft',brief}).select('id').single()
  assert.ifError(insert.error)
  created=insert.data.id

  const invisible=await B.from('base88_business_drafts').select('id').eq('id',created)
  assert.ifError(invisible.error)
  assert.equal(invisible.data.length,0,'Account B could view account A business!')

  const forged=await B.from('base88_business_drafts').insert({owner_id:owner,name:'Forged',category:'Auto services',status:'draft',brief})
  assert.ok(forged.error,'Account B could forge owner A!')

  const add=await A.from('base88_business_inbox').insert({owner_id:owner,business_id:created,
    source:'owner_test',from_name:'Test Customer',from_email:'test@example.com',
    subject:'Test',body:'Test inquiry',reply_draft:'Unsent draft',status:'unread'}).select('id').single()
  assert.ifError(add.error)

  const privateInbox=await B.from('base88_business_inbox').select('id').eq('business_id',created)
  assert.ifError(privateInbox.error)
  assert.equal(privateInbox.data.length,0,'Account B could read account A test inbox!')

  const forgedInbox=await B.from('base88_business_inbox').insert({owner_id:bUser.data.user.id,
    business_id:created,source:'owner_test',from_name:'Attacker',from_email:'a@example.com',
    subject:'Test',body:'Cross-tenant attempt',status:'unread'})
  assert.ok(forgedInbox.error,'Account B could write to account A inbox!')
  process.stdout.write('PASS: two-account Supabase row-level isolation and owner-bound inbox\n')
} finally {
  if (created) await A.from('base88_business_drafts').delete().eq('id',created).eq('owner_id',owner)
}
