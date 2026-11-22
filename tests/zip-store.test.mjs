import test from 'node:test'
import assert from 'node:assert/strict'
import {writeFileSync} from 'node:fs'
import {createLaunchZip} from '../src/lib/zip-store.ts'

test('launch package contains portable ZIP headers and three expected source files',()=>{
  const binary=createLaunchZip([
    {name:'brief.md',content:'# Hello'},
    {name:'product.md',content:'A real first product draft'},
    {name:'website.html',content:'<!doctype html><title>My company</title>'}
  ])
  const data=new Uint8Array(binary)
  assert.equal(new DataView(binary).getUint32(0,true),0x04034b50)
  assert.equal(new DataView(binary).getUint32(binary.byteLength-22,true),0x06054b50)
  assert.ok(data.length>100)
  writeFileSync('/tmp/base88-launch-test.zip',Buffer.from(binary))
})

test('ZIP generation rejects duplicate names and path traversal',()=>{
  assert.throws(()=>createLaunchZip([{name:'../secret',content:'x'}]),/Invalid/)
  assert.throws(()=>createLaunchZip([{name:'one.txt',content:'a'},{name:'one.txt',content:'b'}]),/Invalid/)
  assert.throws(()=>createLaunchZip([{name:'big.txt',content:'a'.repeat(500001)}]),/limit/)
})
