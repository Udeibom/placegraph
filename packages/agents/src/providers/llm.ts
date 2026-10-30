export type LLMModel =
  | 'llama-3.1-70b-versatile'
  | 'llama-3.3-70b-versatile'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it'
  | 'deepseek-r1-distill-llama-70b'
  | 'llama-3.1-8b-instant'
  | string;

export interface LLMConfig {
  provider: 'groq';
  model: LLMModel;
  apiKey: string;
  baseUrl?: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type LLMFailureKind =
  | 'budget'
  | 'rate_limit'
  | 'authentication'
  | 'unavailable'
  | 'upstream'
  | 'parse';

export interface LLMFailure {
  kind: LLMFailureKind;
  status?: number;
  message: string;
  model: string;
  retryable?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  failure?: LLMFailure;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function estimateRequestTokens(messages: LLMMessage[], maxTokens: number): number {
  return messages.reduce((total, message) => total + estimateTokens(message.content) + 8, 0) + maxTokens;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TOKEN_WINDOW_MS = 60_000;
const requestHistory: Array<{ at: number; tokens: number }> = [];

async function reserveTokenBudget(tokens: number, limit: number): Promise<void> {
  if (process.env.GROQ_TOKEN_THROTTLE === '0') return;
  let announced = false;
  while (true) {
    const now = Date.now();
    while (requestHistory.length && now - requestHistory[0].at >= TOKEN_WINDOW_MS) {
      requestHistory.shift();
    }
    const used = requestHistory.reduce((total, entry) => total + entry.tokens, 0);
    if (!requestHistory.length || used + tokens <= limit) {
      requestHistory.push({ at: now, tokens });
      return;
    }
    const waitMs = Math.max(750, requestHistory[0].at + TOKEN_WINDOW_MS - now + 250);
    if (!announced) {
      console.info(
        `[llm] token budget wait ${Math.ceil(waitMs / 1000)}s (${used}/${limit} tokens in window)`
      );
      announced = true;
    }
    await sleep(waitMs);
  }
}

function parseResetDuration(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/([\d.]+)\s*(ms|s|m|h)?/i);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  if (!Number.isFinite(amount)) return null;
  const unit = (match[2] || 's').toLowerCase();
  if (unit === 'ms') return amount;
  if (unit === 'm') return amount * 60_000;
  if (unit === 'h') return amount * 3_600_000;
  return amount * 1000;
}

export class LLMProvider {
  private config: LLMConfig;
  private resolvedModel: string | null = null;
  private tokenLimit: number;

  constructor(config: LLMConfig) {
    this.config = config;
    this.tokenLimit = Number(process.env.GROQ_TOKEN_LIMIT || process.env.GROQ_TPM_LIMIT || 8000);
  }

  get requestTokenLimit(): number {
    return this.tokenLimit;
  }

  get available(): boolean {
    return Boolean(this.config.apiKey);
  }

  private modelCandidates(): string[] {
    return Array.from(
      new Set(
        [
          this.resolvedModel,
          this.config.model,
          'openai/gpt-oss-120b',
          'openai/gpt-oss-20b',
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant'
        ].filter((m): m is string => Boolean(m))
      )
    );
  }

  async complete(messages: LLMMessage[], opts?: { temperature?: number; maxTokens?: number; json?: boolean }): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      return {
        content: '',
        model: this.config.model,
        failure: {
          kind: 'authentication',
          message: 'No LLM API key is configured.',
          model: this.config.model,
          retryable: false
        }
      };
    }

    const maxTokens = Math.max(256, Math.min(opts?.maxTokens ?? 2200, 4000));
    const candidates = Array.from(
      new Set(
        [
          this.resolvedModel,
          this.config.model,
          'openai/gpt-oss-120b',
          'openai/gpt-oss-20b',
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant'
        ].filter((m): m is string => Boolean(m))
      )
    );

    let lastFailure: LLMFailure | undefined;
    try {
      for (const model of candidates) {
        let attempt = 0;
        let requestMaxTokens = maxTokens;
        while (attempt < 3) {
          attempt++;
          const estimatedTokens = estimateRequestTokens(messages, requestMaxTokens);
          if (estimatedTokens > this.tokenLimit) {
            return {
              content: '',
              model,
              failure: {
                kind: 'budget',
                message: `Estimated request size (${estimatedTokens} tokens) exceeds the configured limit of ${this.tokenLimit}. Reduce prompt or completion size before retrying.`,
                model,
                retryable: false
              }
            };
          }
          await reserveTokenBudget(estimatedTokens, this.tokenLimit);

          const body: Record<string, unknown> = {
            model,
            messages,
            temperature: opts?.temperature ?? 0.4,
            max_tokens: requestMaxTokens
          };
          if (opts?.json !== false) {
            body.response_format = { type: 'json_object' };
          }

          let res: Response;
          try {
            res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            });
          } catch (err) {
            lastFailure = {
              kind: 'upstream',
              message: String(err),
              model,
              retryable: true
            };
            if (attempt < 3) {
              await sleep(attempt * 1000);
              continue;
            }
            break;
          }

          if (res.ok) {
            const data = await res.json();
            const resolved = data.model || model;
            this.resolvedModel = resolved;
            return {
              content: data.choices?.[0]?.message?.content || '',
              model: resolved,
              usage: data.usage
                ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens
                  }
                : undefined
            };
          }

          const text = await res.text().catch(() => '');
          console.warn(`Groq API error (${model}):`, res.status, text.slice(0, 200));
          const tooLarge =
            res.status === 413 ||
            text.includes('Request too large') ||
            text.includes('reduce the length');
          const rateLimited =
            res.status === 429 ||
            text.includes('rate limit');
          const authFailed = res.status === 401 || res.status === 403;
          const modelUnavailable =
            res.status === 404 ||
            text.includes('model_not_found') ||
            text.includes('does not exist') ||
            text.includes('do not have access');

          lastFailure = {
            kind: tooLarge
              ? 'budget'
              : authFailed
                ? 'authentication'
                : rateLimited
                  ? 'rate_limit'
                  : modelUnavailable
                    ? 'unavailable'
                    : 'upstream',
            status: res.status,
            message: text.slice(0, 500) || `Groq returned HTTP ${res.status}.`,
            model,
            retryable: rateLimited || res.status >= 500
          };

          if (authFailed) return { content: '', model, failure: lastFailure };
          if (modelUnavailable) break;

          if (tooLarge) {
            const reduced = Math.max(256, Math.floor(requestMaxTokens / 2));
            if (attempt === 1 && estimateRequestTokens(messages, reduced) <= this.tokenLimit) {
              requestMaxTokens = reduced;
              continue;
            }
            return { content: '', model, failure: lastFailure };
          }

          if (!rateLimited) return { content: '', model, failure: lastFailure };

          if (attempt === 1) {
            const reset =
              parseResetDuration(res.headers.get('retry-after')) ??
              parseResetDuration(res.headers.get('x-ratelimit-reset-tokens')) ??
              15_000;
            const waitMs = Math.max(1500, Math.min(30_000, reset + 750));
            console.warn(`Groq rate limit on ${model}; waiting ${Math.round(waitMs / 1000)}s`);
            await sleep(waitMs);
            continue;
          }
          break;
        }
      }

      return {
        content: '',
        model: this.config.model,
        failure:
          lastFailure || {
            kind: 'upstream',
            message: 'No LLM model returned a response.',
            model: this.config.model,
            retryable: false
          }
      };
    } catch (err) {
      return {
        content: '',
        model: this.config.model,
        failure: {
          kind: 'upstream',
          message: String(err),
          model: this.config.model,
          retryable: false
        }
      };
    }
  }

  async completeVision(prompt: string, imageDataUrl: string): Promise<string> {
    if (!this.config.apiKey) return '';
    const model = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 1800,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageDataUrl } }
              ]
            }
          ]
        })
      });
      if (!res.ok) {
        console.warn('Groq vision error:', res.status, await res.text().catch(() => ''));
        return '';
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err) {
      console.warn('Groq vision failed:', err);
      return '';
    }
  }
}

export function createLLMProvider(): LLMProvider {
  return new LLMProvider({
    provider: 'groq',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    apiKey: process.env.GROQ_API_KEY || ''
  });
}
