import fs from 'node:fs';
import path from 'node:path';
import type { AnalysisSnapshot, Project } from '@placegraph/types';
import { deleteRemote, hasSupabase, loadRemoteStore, syncAnalysis, syncProject } from './supabase-sync';

export interface StoreShape {
  projects: Record<string, Project>;
  analyses: Record<string, AnalysisSnapshot>;
}

const emptyStore = (): StoreShape => ({ projects: {}, analyses: {} });

function rootDir(): string {
  return (
    process.env.PLACEGRAPH_DATA_DIR ||
    (process.env.VERCEL ? path.join('/tmp', 'placegraph') : path.join(process.cwd(), 'data'))
  );
}

function dataPath(): string {
  return path.join(rootDir(), 'store.json');
}

function filesDir(): string {
  return path.join(rootDir(), 'files');
}

function ensureDir(file: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function atomicWrite(file: string, contents: string) {
  ensureDir(file);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, contents);
  fs.renameSync(tmp, file);
}

export class PlaceGraphStore {
  private data: StoreShape = emptyStore();
  private loaded = false;
  private hydrating: Promise<void> | null = null;

  load() {
    if (this.loaded) return;
    const file = dataPath();
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(raw) as StoreShape;
        this.data = {
          projects: parsed.projects || {},
          analyses: parsed.analyses || {}
        };
      }
    } catch (err) {
      console.warn('PlaceGraph store load failed, starting empty:', err);
      this.data = emptyStore();
    }
    this.loaded = true;
  }

  /**
   * Merge remote (Supabase) state into this instance's memory.
   * Supabase is the source of truth in serverless deployments, so remote
   * always wins over this instance's cached copy. Hydration runs on every
   * request (deduped while in flight) because a stale local copy previously
   * made pages show outdated pipeline state after a write on another instance.
   */
  hydrateRemote(_opts: { force?: boolean } = {}): Promise<void> {
    if (!hasSupabase()) return Promise.resolve();
    if (this.hydrating) return this.hydrating;
    this.hydrating = this.doHydrate().finally(() => {
      this.hydrating = null;
    });
    return this.hydrating;
  }

  private async doHydrate() {
    this.load();
    try {
      const remote = await loadRemoteStore();
      if (!remote) return;
      this.data.projects = { ...this.data.projects, ...remote.projects };
      this.data.analyses = { ...this.data.analyses, ...remote.analyses };
      for (const key of remote.deletedIds ?? []) {
        const sep = key.indexOf(':');
        if (sep < 0) continue;
        const kind = key.slice(0, sep);
        const id = key.slice(sep + 1);
        if (kind === 'project') delete this.data.projects[id];
        else if (kind === 'analysis') delete this.data.analyses[id];
      }
      this.persist();
    } catch (err) {
      console.warn('PlaceGraph remote hydration failed:', err);
    }
  }

  private persist() {
    try {
      atomicWrite(dataPath(), JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.warn('PlaceGraph store persist failed (in-memory only):', err);
    }
  }

  async listProjects(workspaceId?: string): Promise<Project[]> {
    this.load();
    await this.hydrateRemote();
    return Object.values(this.data.projects)
      .filter((p) => !workspaceId || !p.workspaceId || p.workspaceId === workspaceId)
      .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
  }

  async getProject(id: string): Promise<Project | null> {
    this.load();
    const hit = this.data.projects[id];
    if (hit) return hit;
    await this.hydrateRemote({ force: true });
    return this.data.projects[id] || null;
  }

  async saveProject(project: Project): Promise<Project> {
    this.load();
    this.data.projects[project.id] = project;
    this.persist();
    await syncProject(project);
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    this.load();
    delete this.data.projects[id];
    delete this.data.analyses[id];
    this.persist();
    try {
      const fp = path.join(filesDir(), id);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch {
      // ignore
    }
    await deleteRemote('project', id);
    await deleteRemote('analysis', id);
  }

  async getAnalysis(projectId: string): Promise<AnalysisSnapshot | null> {
    this.load();
    const hit = this.data.analyses[projectId];
    if (hit) return hit;
    await this.hydrateRemote({ force: true });
    return this.data.analyses[projectId] || null;
  }

  async saveAnalysis(analysis: AnalysisSnapshot): Promise<AnalysisSnapshot> {
    this.load();
    this.data.analyses[analysis.projectId] = analysis;
    this.persist();
    await syncAnalysis(analysis);
    return analysis;
  }

  saveFloorPlan(projectId: string, dataUrl: string): string {
    const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
    if (!match) return dataUrl;
    const ext = match[1].includes('png') ? 'png' : match[1].includes('jpeg') || match[1].includes('jpg') ? 'jpg' : 'bin';
    const dest = path.join(filesDir(), `${projectId}.${ext}`);
    ensureDir(dest);
    fs.writeFileSync(dest, Buffer.from(match[2], 'base64'));
    return `/api/files/${projectId}.${ext}`;
  }

  floorPlanDataUrl(project: Project): string | undefined {
    const url = project.floorPlanUrl;
    if (!url) return undefined;
    if (url.startsWith('data:')) return url;
    const name = url.replace(/^\/api\/files\//, '');
    const file = this.readFile(name);
    if (!file) return undefined;
    return `data:${file.contentType};base64,${file.body.toString('base64')}`;
  }

  readFile(name: string): { body: Buffer; contentType: string } | null {
    const safe = path.basename(name);
    const dest = path.join(filesDir(), safe);
    if (!fs.existsSync(dest)) return null;
    const ext = path.extname(safe);
    const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' ? 'image/jpeg' : 'application/octet-stream';
    return { body: fs.readFileSync(dest), contentType };
  }
}

const globalForStore = globalThis as unknown as { __placegraphStore?: PlaceGraphStore };

/**
 * Synchronous access to the in-memory store. Only safe for local file reads
 * (e.g. /api/files) — data may be stale or empty on a serverless instance
 * that hasn't hydrated remote state yet.
 */
export function getStore(): PlaceGraphStore {
  if (!globalForStore.__placegraphStore) {
    globalForStore.__placegraphStore = new PlaceGraphStore();
    globalForStore.__placegraphStore.load();
  }
  return globalForStore.__placegraphStore;
}

/**
 * Store with remote (Supabase) state merged in. Every API route should use
 * this before reading, so cold/warm serverless instances see projects and
 * analyses created by other instances.
 */
export async function getReadyStore(): Promise<PlaceGraphStore> {
  const store = getStore();
  await store.hydrateRemote();
  return store;
}
