import test from 'node:test'
import assert from 'node:assert/strict'
import {stagingIsIsolated} from '../src/lib/staging-isolation.ts'

const valid={
  BASE88_PREVIEW_DATA_ACCESS_ENABLED:'yes',
  BASE88_STAGING_PROJECT_REF:'abcdefghijklmnopqrst',
  BASE88_PRODUCTION_SUPABASE_PROJECT_REF:'uvwxyzabcdefghijklmn',
  NEXT_PUBLIC_SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co/',
}

test('staging only unlocks with two distinct exact project refs',()=>{
  assert.equal(stagingIsIsolated(valid),true)
  assert.equal(stagingIsIsolated({...valid,BASE88_PRODUCTION_SUPABASE_PROJECT_REF:valid.BASE88_STAGING_PROJECT_REF}),false)
  assert.equal(stagingIsIsolated({...valid,BASE88_PRODUCTION_SUPABASE_PROJECT_REF:''}),false)
  assert.equal(stagingIsIsolated({...valid,BASE88_STAGING_PROJECT_REF:''}),false)
  assert.equal(stagingIsIsolated({...valid,BASE88_PREVIEW_DATA_ACCESS_ENABLED:'no'}),false)
  assert.equal(stagingIsIsolated({...valid,BASE88_PREVIEW_DATA_ACCESS_ENABLED:undefined}),false)
})

test('no environment or malformed project reference fails closed',()=>{
  assert.equal(stagingIsIsolated({}),false)
  for(const ref of ['prod','ABCdefghijklmnopqrst','abcdefghijklmnopqrs-','localhost','']){
    assert.equal(stagingIsIsolated({...valid,BASE88_PRODUCTION_SUPABASE_PROJECT_REF:ref}),false,ref)
  }
})

test('URL must point exactly to the intended staging Supabase project',()=>{
  for(const url of [
    'https://uvwxyzabcdefghijklmn.supabase.co/',
    'http://abcdefghijklmnopqrst.supabase.co/',
    'https://abcdefghijklmnopqrst.supabase.co.evil.example/',
    'https://admin:pass@abcdefghijklmnopqrst.supabase.co/',
    'https://abcdefghijklmnopqrst.supabase.co/auth/v1',
    'https://abcdefghijklmnopqrst.supabase.co/?project=other',
    'https://abcdefghijklmnopqrst.supabase.co/#fragment',
    'https://abcdefghijklmnopqrst.supabase.co:444/',
    'not a URL',
  ]){
    assert.equal(stagingIsIsolated({...valid,NEXT_PUBLIC_SUPABASE_URL:url}),false,url)
  }
})
