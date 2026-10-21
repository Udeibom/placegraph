import type { AnalysisSnapshot, Project } from '@placegraph/types';
import type { StoreShape } from './store';

function config() {
  const url = process.env.SUPABASE_URL;
  // Accept both service role key (server-side) and publishable/anon key (Vercel env)
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

async function upsert(kind: 'project' | 'analysis', id: string, workspaceId: string | undefined, payload: unknown) {
  const cfg = config();
  if (!cfg) return;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/placegraph_documents`, {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: `${kind}:${id}`,
        kind,
        workspace_id: workspaceId || null,
        payload,
        updated_at: new Date().toISOString()
      })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`Supabase upsert failed [${res.status}]:`, text.slice(0, 200));
    }
  } catch (err) {
    console.warn('Supabase upsert failed:', err);
  }
}

export async function syncProject(project: Project) {
  await upsert('project', project.id, project.workspaceId, project);
}

export async function syncAnalysis(analysis: AnalysisSnapshot) {
  await upsert('analysis', analysis.projectId, undefined, analysis);
}

export async function loadRemoteStore(): Promise<Partial<StoreShape> | null> {
  const cfg = config();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/placegraph_documents?select=kind,payload&order=updated_at.desc`, {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`
      }
    });
    if (!res.ok) {
      console.warn('Supabase load failed:', res.status, await res.text().catch(() => ''));
      return null;
    }
    const rows = (await res.json()) as { kind: string; payload: any }[];
    const projects: Record<string, Project> = {};
    const analyses: Record<string, AnalysisSnapshot> = {};
    for (const row of rows) {
      if (row.kind === 'project' && row.payload?.id) projects[row.payload.id] = row.payload;
      if (row.kind === 'analysis' && row.payload?.projectId) analyses[row.payload.projectId] = row.payload;
    }
    return { projects, analyses };
  } catch (err) {
    console.warn('Supabase load failed:', err);
    return null;
  }
}

export function hasSupabase(): boolean {
  return Boolean(config());
}
