import { NextRequest, NextResponse } from 'next/server';
import { getReadyStore } from '@placegraph/db';
import { generateId, nowIso } from '@placegraph/core';
import type { Project } from '@placegraph/types';
import { getWorkspaceId } from '@/lib/workspace';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const store = await getReadyStore();
  const workspaceId = await getWorkspaceId();
  return NextResponse.json({ projects: await store.listProjects(workspaceId) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = nowIso();
    const workspaceId = await getWorkspaceId();
    const id = generateId('proj');
    const store = await getReadyStore();
    let floorPlanUrl = body.floorPlanUrl as string | undefined;
    if (floorPlanUrl?.startsWith('data:')) {
      floorPlanUrl = store.saveFloorPlan(id, floorPlanUrl);
    }
    const project: Project = {
      id,
      name: body.name || 'Untitled project',
      workspaceId,
      location: {
        address: body.location?.address || '',
        city: body.location?.city || '',
        neighborhood: body.location?.neighborhood || '',
        lat: body.location?.lat,
        lng: body.location?.lng
      },
      projectType: body.projectType || 'restaurant',
      businessType: body.businessType || body.projectType || undefined,
      objective: body.objective || '',
      investmentIntent: body.investmentIntent || undefined,
      budgetRange: body.budgetRange,
      floorArea: body.floorArea,
      floorPlanUrl,
      audiences: Array.isArray(body.audiences) ? body.audiences.filter((a: { name?: string }) => a.name) : (body.targetAudience ? [{ name: body.targetAudience, priority: 1 }] : []),
      targetAudience: body.targetAudience || undefined,
      constraints: Array.isArray(body.constraints) ? body.constraints.filter((c: { key?: string }) => c.key) : [],
      status: 'draft',
      createdAt: now,
      updatedAt: now
    };
    await store.saveProject(project);
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
