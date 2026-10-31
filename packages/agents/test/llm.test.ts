import test from 'node:test';
import assert from 'node:assert/strict';
import { LLMProvider } from '../src/providers/llm';

test('LLMProvider fails over immediately when a model hits its daily token limit', async (t) => {
  const previousThrottle = process.env.GROQ_TOKEN_THROTTLE;
  process.env.GROQ_TOKEN_THROTTLE = '0';

  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    calls.push(body.model);
    if (body.model === 'openai/gpt-oss-120b') {
      return new Response(
        JSON.stringify({
          error: {
            message:
              'Rate limit reached for model `openai/gpt-oss-120b` on tokens per day (TPD): Limit 200000'
          }
        }),
        { status: 429, headers: { 'content-type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({
        model: body.model,
        choices: [{ message: { content: '{"ok":true}' } }]
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  }) as typeof fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
    if (previousThrottle === undefined) delete process.env.GROQ_TOKEN_THROTTLE;
    else process.env.GROQ_TOKEN_THROTTLE = previousThrottle;
  });

  const provider = new LLMProvider({
    provider: 'groq',
    model: 'openai/gpt-oss-120b',
    apiKey: 'test-key'
  });

  const started = Date.now();
  const first = await provider.complete([{ role: 'user', content: 'hello' }], { maxTokens: 256 });
  assert.equal(first.failure, undefined);
  assert.equal(first.model, 'openai/gpt-oss-20b');
  assert.deepEqual(calls, ['openai/gpt-oss-120b', 'openai/gpt-oss-20b']);

  const second = await provider.complete([{ role: 'user', content: 'hello' }], { maxTokens: 256 });
  assert.equal(second.failure, undefined);
  assert.deepEqual(calls, ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'openai/gpt-oss-20b']);
  assert.ok(Date.now() - started < 2000, 'daily limit should not trigger a wait');
});
