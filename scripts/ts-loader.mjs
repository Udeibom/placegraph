import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!specifier.startsWith('.') || /\.[a-z]+$/i.test(specifier)) throw error;
    const base = new URL(specifier, context.parentURL);
    const basePath = fileURLToPath(base);
    for (const candidate of [`${basePath}.ts`, `${basePath}.tsx`, `${basePath}/index.ts`]) {
      if (existsSync(candidate)) {
        return { url: new URL(`file://${candidate}`).href, shortCircuit: true };
      }
    }
    throw error;
  }
}
