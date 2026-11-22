import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {buildStudioDocument,suggestStudioKind} from '../src/lib/base88-studio.ts'

test('free-form app ideas choose an explicit functional starter, never fake AI output',()=>{
  assert.equal(suggestStudioKind('Appointment scheduling for a barber shop'),'bookings')
  assert.equal(suggestStudioKind('A CRM for managing leads and clients'),'clients')
  assert.equal(suggestStudioKind('A daily team to-do dashboard'),'tasks')
})

test('all three app kinds have a working offline CRUD script and data export',()=>{
  for(const kind of ['tasks','clients','bookings']){
    const html=buildStudioDocument({name:'Demo App',goal:'Build a useful local application.',kind})
    assert.match(html,/<!doctype html>/)
    assert.match(html,/addEventListener\('submit'/)
    assert.match(html,/items\.unshift\(item\)/)
    assert.match(html,/items=items\.filter/)
    assert.match(html,/localStorage\.setItem/)
    assert.match(html,/base88-local-records\.json/)
    assert.match(html,/textContent=/)
    const script=html.match(/<script>([\s\S]*?)<\/script>/)
    assert.ok(script,'embedded script found')
    assert.doesNotThrow(()=>new Function(script[1]),'script parses as JavaScript')
  }
})

test('project descriptions cannot escape HTML into code or executable tags',()=>{
  const hostile='</script><script>alert("XSS")</script><img src=x onerror=alert(1)>'
  const html=buildStudioDocument({name:'Client '+hostile,goal:'Build a client list with '+hostile,kind:'clients'})
  assert.ok(!html.includes(hostile))
  assert.match(html,/&lt;\/script&gt;/)
  assert.match(html,/&lt;img src=x onerror=alert/)
  assert.equal((html.match(/<script>/g)||[]).length,1)
  assert.equal((html.match(/<\/script>/g)||[]).length,1)
})

test('generator is deliberately local-only and rejects invalid app inputs',()=>{
  const html=buildStudioDocument({name:'Tasks',goal:'Manage team tasks offline.',kind:'tasks'})
  assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|https:\/\/api\./)
  assert.match(html,/no shared database, login, payments or hosting/i)
  assert.throws(()=>buildStudioDocument({name:'',goal:'Manage team tasks offline.',kind:'tasks'}))
  assert.throws(()=>buildStudioDocument({name:'Tasks',goal:'hi',kind:'tasks'}))
  assert.throws(()=>buildStudioDocument({name:'Tasks',goal:'Manage team tasks offline.',kind:'invalid'}))
})

test('Studio page provides an isolated live preview, source editor, and real ZIP export',()=>{
  const page=readFileSync('src/app/studio/page.tsx','utf8')
  assert.match(page,/buildStudioDocument/)
  assert.match(page,/srcDoc=\{code\}/)
  assert.match(page,/sandbox="allow-scripts allow-downloads"/)
  assert.doesNotMatch(page,/allow-same-origin/)
  assert.match(page,/createLaunchZip/)
  assert.match(page,/Source/)
  assert.match(page,/Not an AI-generated full-stack deployment/)
})