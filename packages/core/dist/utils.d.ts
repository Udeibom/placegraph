export declare function replaceVars(template: string, vars: Record<string, any>): string;
export declare function generateId(prefix?: string): string;
export declare function parseJsonFromLlm<T>(text: string, fallback: T): T;
export declare function nowIso(): string;
