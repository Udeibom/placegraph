export function capabilities() {
  const supabase = Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY ||
     process.env.SUPABASE_ANON_KEY ||
     process.env.SUPABASE_PUBLISHABLE_KEY)
  );
  const vercel = Boolean(process.env.VERCEL);
  return {
    groq: Boolean(process.env.GROQ_API_KEY),
    qloo: Boolean(process.env.QLOO_API_KEY || process.env.QLOO_API_KEYS),
    hf: Boolean(process.env.HF_TOKEN),
    supabase,
    storage: supabase ? 'supabase' : vercel ? 'ephemeral' : 'disk'
  };
}
