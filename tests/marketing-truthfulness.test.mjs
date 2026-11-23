import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const home = readFileSync(new URL('../src/app/page.tsx', import.meta.url), 'utf8');

test('starter download is not advertised as a live agent', () => {
  assert.doesNotMatch(home, /From idea to live agent in under a minute/i);
  assert.match(home, /Hosted agents, cloud execution and deployment are not yet available/);
});
