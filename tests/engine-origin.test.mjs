import test from 'node:test'
import assert from 'node:assert/strict'
import {checkedEngineOrigin} from '../src/lib/base88-engine-origin.ts'

test('operator-approved canonical HTTPS hostname is accepted',()=>{
  assert.equal(checkedEngineOrigin('https://engine.base88.example/'),'https://engine.base88.example')
  assert.equal(checkedEngineOrigin('https://ENGINE.BASE88.EXAMPLE/'),'https://engine.base88.example')
})

test('private networks, literal IPs, local aliases and hostname tricks are refused',()=>{
  for(const target of [
    'http://engine.base88.example/',
    'https://localhost/',
    'https://foo.localhost/',
    'https://localhost./',
    'https://engine.local/',
    'https://metadata.google.internal/',
    'https://127.0.0.1/',
    'https://127.0.0.1./',
    'https://0x7f000001/',
    'https://10.0.0.10/',
    'https://169.254.169.254/',
    'https://[::1]/',
    'https://user:secret@engine.base88.example/',
    'https://engine.base88.example/hidden/',
    'https://engine.base88.example/?redirect=1',
    'https://engine.base88.example/#fragment',
    'this is not a URL',
  ])assert.equal(checkedEngineOrigin(target),null,target)
})
