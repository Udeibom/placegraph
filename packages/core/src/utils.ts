export function replaceVars(template: string, vars: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    if (v === undefined || v === null) return `{${key}}`;
    if (typeof v === 'object') return JSON.stringify(v, null, 2);
    return String(v);
  });
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function parseJsonFromLlm<T>(text: string, fallback: T): T {
  if (!text) return fallback;
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

  const attempts = [cleaned];
  const firstObj = cleaned.search(/[\[{]/);
  if (firstObj >= 0) {
    const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (lastBrace > firstObj) attempts.push(cleaned.slice(firstObj, lastBrace + 1));
  }

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as T;
    } catch {
      // continue
    }
  }
  return fallback;
}

export function nowIso(): string {
  return new Date().toISOString();
}
