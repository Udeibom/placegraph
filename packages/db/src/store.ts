import fs from 'node:fs';
import path from 'node:path';
import type { AnalysisSnapshot, Project } from '@placegraph/types';
import { hasSupabase, loadRemoteStore, syncAnalysis, syncProject } from './supabase-sync';

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
  private remoteTried = false;

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

  async hydrateRemote() {
    if (this.remoteTried || !hasSupabase()) return;
    this.remoteTried = true;
    this.load();
    const remote = await loadRemoteStore();
    if (!remote) return;
    this.data.projects = { ...remote.projects, ...this.data.projects };
    this.data.analyses = { ...remote.analyses, ...this.data.analyses };
    this.persist();
  }

  private persist() {
    try {
      atomicWrite(dataPath(), JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.warn('PlaceGraph store persist failed (in-memory only):', err);
    }
  }

  listProjects(workspaceId?: string): Project[] {
    this.load();
    return Object.values(this.data.projects)
      .filter((p) => !workspaceId || !p.workspaceId || p.workspaceId === workspaceId)
      .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
  }

  getProject(id: string): Project | null {
    this.load();
    return this.data.projects[id] || null;
  }

  saveProject(project: Project): Project {
    this.load();
    this.data.projects[project.id] = project;
    this.persist();
    void syncProject(project);
    return project;
  }

  deleteProject(id: string) {
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
  }

  getAnalysis(projectId: string): AnalysisSnapshot | null {
    this.load();
    return this.data.analyses[projectId] || null;
  }

  saveAnalysis(analysis: AnalysisSnapshot): AnalysisSnapshot {
    this.load();
    this.data.analyses[analysis.projectId] = analysis;
    this.persist();
    void syncAnalysis(analysis);
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

export function getStore(): PlaceGraphStore {
  if (!globalForStore.__placegraphStore) {
    globalForStore.__placegraphStore = new PlaceGraphStore();
    globalForStore.__placegraphStore.load();
    void globalForStore.__placegraphStore.hydrateRemote();
  }
  return globalForStore.__placegraphStore;
}
