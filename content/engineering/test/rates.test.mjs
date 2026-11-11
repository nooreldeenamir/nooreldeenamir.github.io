import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRate } from '../examples/rates.mjs';

const good = { base: 'EUR', quote: 'USD', rate: 1.25 };
test('builds a real HTTP request contract and reads an object', async () => {
  let captured;
  const fetcher = async (url, options) => {
    captured = { url: url.href, signal: options.signal };
    return new Response(JSON.stringify(good));
  };
  assert.deepEqual(await loadRate('EUR', 'USD', { fetcher }), good);
  assert.equal(captured.url, 'https://api.frankfurter.dev/v2/rate/EUR/USD');
  assert.ok(captured.signal instanceof AbortSignal);
});
test('does not issue a request for a malformed currency', async () => {
  let calls = 0;
  await assert.rejects(loadRate('../secret', 'USD', {
    fetcher: async () => { calls++; },
  }), /uppercase/);
  assert.equal(calls, 0);
});
test('rejects unsuccessful HTTP status before reading JSON', async () => {
  await assert.rejects(loadRate('EUR', 'USD', {
    fetcher: async () => new Response('not JSON', { status: 422 }),
  }), /HTTP 422/);
});
for (const [name, value] of [
  ['wrong pair', { ...good, quote: 'GBP' }],
  ['zero rate', { ...good, rate: 0 }],
  ['string rate', { ...good, rate: '1.25' }],
  ['missing rate', { base: 'EUR', quote: 'USD' }],
  ['null body', null],
]) {
  test(`rejects ${name}`, async () => {
    await assert.rejects(loadRate('EUR', 'USD', {
      fetcher: async () => new Response(JSON.stringify(value)),
    }), /Unexpected/);
  });
}
test('propagates invalid JSON rather than inventing a rate', async () => {
  await assert.rejects(loadRate('EUR', 'USD', {
    fetcher: async () => new Response('{'),
  }), SyntaxError);
});
test('propagates a transport rejection', async () => {
  await assert.rejects(loadRate('EUR', 'USD', {
    fetcher: async () => { throw new Error('offline'); },
  }), /offline/);
});
test('passes the caller cancellation signal through unchanged', async () => {
  const controller = new AbortController();
  let signal;
  await loadRate('EUR', 'USD', {
    signal: controller.signal,
    fetcher: async (_url, options) => {
      signal = options.signal;
      return new Response(JSON.stringify(good));
    },
  });
  assert.equal(signal, controller.signal);
});
