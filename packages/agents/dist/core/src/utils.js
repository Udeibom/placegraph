export function replaceVars(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        const v = vars[key];
        if (v === undefined || v === null)
            return `{${key}}`;
        if (typeof v === 'object')
            return JSON.stringify(v, null, 2);
        return String(v);
    });
}
export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
