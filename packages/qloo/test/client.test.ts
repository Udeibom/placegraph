import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createQlooClient,
  hasQlooKey,
  missingQlooConfigError,
  QlooApiError,
  QlooClient
} from '../src/client.ts';

const client = () =>
  new QlooClient({
    baseUrl: 'https://hackathon.api.qloo.com',
    apiKey: 'test-key',
    timeoutMs: 10,
    cacheTtlMs: 0
  });

test('search rejects unsupported types before making a request', async () => {
  await assert.rejects(
    () => client().searchEntities('London', { type: 'urn:entity:country' }),
    (error: unknown) =>
      error instanceof QlooApiError &&
      error.kind === 'invalid_request' &&
      error.endpoint === '/v2/search'
  );
});

test('demographics rejects an audience-only request', async () => {
  await assert.rejects(
    () =>
      client().getInsights({
        filterType: 'urn:demographics',
        demographicsAudienceIds: ['audience-id']
      }),
    (error: unknown) =>
      error instanceof QlooApiError &&
      error.kind === 'invalid_request' &&
      /interest signal/.test(error.message)
  );
});

test('heatmap rejects a location-only request', async () => {
  await assert.rejects(
    () => client().getInsights({ filterType: 'urn:heatmap', locationQuery: 'London' }),
    (error: unknown) =>
      error instanceof QlooApiError &&
      error.kind === 'invalid_request' &&
      /valid signal/.test(error.message)
  );
});

test('trending validates type and date range', async () => {
  await assert.rejects(
    () =>
      client().getTrending({
        filterType: 'urn:entity:place',
        startDate: '2026-01-01',
        endDate: '2026-02-01'
      }),
    (error: unknown) => error instanceof QlooApiError && /does not support/.test(error.message)
  );
  await assert.rejects(
    () => client().getTrending({ filterType: 'urn:entity:artist', startDate: '', endDate: '' }),
    (error: unknown) => error instanceof QlooApiError && /start_date/.test(error.message)
  );
});

test('missing configuration produces a structured error', () => {
  const error = missingQlooConfigError();
  assert.equal(error.kind, 'missing_configuration');
  assert.ok(error.environment === 'missing' || error.environment === 'hackathon-default');
});

test('production client requires an explicit base URL', () => {
  const original = process.env.NODE_ENV;
  const originalBase = process.env.QLOO_API_BASE_URL;
  process.env.NODE_ENV = 'production';
  process.env.QLOO_API_KEY = 'test-key';
  delete process.env.QLOO_API_BASE_URL;
  try {
    assert.throws(() => createQlooClient(), /QLOO_API_BASE_URL/);
  } finally {
    process.env.NODE_ENV = original;
    if (originalBase === undefined) delete process.env.QLOO_API_BASE_URL;
    else process.env.QLOO_API_BASE_URL = originalBase;
    delete process.env.QLOO_API_KEY;
  }
});

test('hasQlooKey reflects the runtime environment', () => {
  const original = process.env.QLOO_API_KEY;
  const originalPlural = process.env.QLOO_API_KEYS;
  delete process.env.QLOO_API_KEY;
  delete process.env.QLOO_API_KEYS;
  assert.equal(hasQlooKey(), false);
  process.env.QLOO_API_KEY = 'test-key';
  assert.equal(hasQlooKey(), true);
  delete process.env.QLOO_API_KEY;
  process.env.QLOO_API_KEYS = 'first-key, second-key';
  assert.equal(hasQlooKey(), true);
  if (original === undefined) delete process.env.QLOO_API_KEY;
  else process.env.QLOO_API_KEY = original;
  if (originalPlural === undefined) delete process.env.QLOO_API_KEYS;
  else process.env.QLOO_API_KEYS = originalPlural;
});

test('rotates to the next key after a 429', async () => {
  const originalFetch = globalThis.fetch;
  const seen: string[] = [];
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    const key = (init?.headers as Record<string, string>)['X-Api-Key'];
    seen.push(key);
    if (key === 'key-a') {
      return new Response(JSON.stringify({ error_msg: 'Rate limit exceeded' }), {
        status: 429,
        headers: {
          'content-type': 'application/json',
          'x-second-ratelimit-reset': '0.01',
          'x-second-ratelimit-remaining': '0'
        }
      });
    }
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-second-ratelimit-remaining': '9' }
    });
  }) as typeof fetch;

  try {
    const rotated = new QlooClient({
      baseUrl: 'https://hackathon.api.qloo.com',
      apiKey: 'key-a',
      apiKeys: ['key-a', 'key-b'],
      timeoutMs: 1000,
      cacheTtlMs: 0
    });
    await rotated.searchEntities('coffee', { take: 1 });
    assert.deepEqual(seen, ['key-a', 'key-b']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
