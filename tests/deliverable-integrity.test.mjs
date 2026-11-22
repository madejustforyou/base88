import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {MAX_DELIVERABLE_BYTES,verifyDeliverableBytes} from '../src/lib/deliverable-integrity.ts'

const id='a'.repeat(32)
const bytes=Buffer.from('Actual private Base88 deliverable, byte for byte.\n','utf8')
const sha256=createHash('sha256').update(bytes).digest('hex')
const entry={id,integrity_verified:true,size_bytes:bytes.byteLength,sha256}

test('accept the exact file only when the matching manifest SHA256 and size agree',()=>{
  assert.equal(verifyDeliverableBytes([entry],id,bytes),true)
  assert.equal(verifyDeliverableBytes([entry],id,Uint8Array.from(bytes)),true)
})

test('reject tampered bytes even when upstream falsely says integrity_verified true',()=>{
  const corrupted=Buffer.from(bytes)
  corrupted[0]^=1
  assert.equal(verifyDeliverableBytes([entry],id,corrupted),false)
  assert.equal(verifyDeliverableBytes([entry],id,Buffer.from(bytes.subarray(0,-1))),false)
  assert.equal(verifyDeliverableBytes([entry],id,Buffer.concat([bytes,Buffer.from('!')])),false)
})

test('reject missing, conflicting, duplicated, or bad metadata',()=>{
  assert.equal(verifyDeliverableBytes([],id,bytes),false)
  assert.equal(verifyDeliverableBytes([entry,entry],id,bytes),false)
  assert.equal(verifyDeliverableBytes([{...entry,integrity_verified:false}],id,bytes),false)
  assert.equal(verifyDeliverableBytes([{...entry,sha256:'0'.repeat(64)}],id,bytes),false)
  assert.equal(verifyDeliverableBytes([{...entry,sha256:'not-a-hash'}],id,bytes),false)
  assert.equal(verifyDeliverableBytes([{...entry,size_bytes:bytes.byteLength+1}],id,bytes),false)
  assert.equal(verifyDeliverableBytes([{...entry,size_bytes:1.5}],id,bytes),false)
  assert.equal(verifyDeliverableBytes([{...entry,size_bytes:-1}],id,bytes),false)
  assert.equal(verifyDeliverableBytes([null,entry],id,bytes),true)
  assert.equal(verifyDeliverableBytes([entry],'../../internal',bytes),false)
})

test('reject files or metadata above the configured limit',()=>{
  assert.equal(verifyDeliverableBytes([{...entry,size_bytes:MAX_DELIVERABLE_BYTES+1}],id,bytes),false)
  assert.equal(verifyDeliverableBytes([{...entry,size_bytes:MAX_DELIVERABLE_BYTES+1}],id,Buffer.alloc(MAX_DELIVERABLE_BYTES+1)),false)
})
