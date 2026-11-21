import test from 'node:test'
import assert from 'node:assert/strict'
import { generateStarterSite } from '../src/lib/surprise-site.ts'

const safe = {
  name: 'DetailNudge',
  tagline: 'Book more detailing work',
  audience: 'Independent detailers',
  problem: 'Missed inquiries waste owner time.',
  firstProduct: 'Editable message scripts',
  price: '$19 experiment',
  freeTool: 'Reply idea generator',
  risk: 'Crowded template market'
}

test('generated HTML contains a usable offline starter site', () => {
  const html = generateStarterSite(safe)
  assert.ok(html.startsWith('<!doctype html>'))
  assert.match(html, /<meta name="viewport"/)
  assert.match(html, /<h1>Book more detailing work<\/h1>/)
  assert.match(html, /Editable message scripts/)
  assert.match(html, /Checkout is not connected/)
  assert.match(html, /No message is sent by this page/)
  assert.match(html, /noindex,nofollow/)
  assert.doesNotMatch(html, /<form[ >]|<script[ >]|<iframe[ >]/i)
  assert.doesNotMatch(html, /<link[^>]*href="https?:/i)
})

test('all user-controlled content is escaped and cannot inject markup', () => {
  const html = generateStarterSite({
    ...safe,
    name: '<script>alert("x")</script>',
    tagline: '<img src=x onerror=alert(1)>',
    audience: '<svg/onload=alert(1)>',
    firstProduct: '<a href="javascript:evil()">Buy</a>',
  })
  assert.match(html, /&lt;script&gt;/)
  assert.match(html, /&lt;img/)
  assert.match(html, /&lt;svg/)
  assert.match(html, /&lt;a href=&quot;javascript:evil\(\)&quot;&gt;/)
  assert.doesNotMatch(html, /<script>|<img|<svg|javascript:evil\(\)"/)
})

test('generator cannot turn a draft into live checkout or contact', () => {
  const html = generateStarterSite(safe)
  assert.doesNotMatch(html, /<input|<form|stripe\.com|mailto:/i)
  assert.match(html, /No payments can be taken/)
  assert.match(html, /No merchant, inbox, booking or payment integration is active/)
})
