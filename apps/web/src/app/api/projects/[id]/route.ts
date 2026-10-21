import { NextRequest, NextResponse } from 'next/server';
import { getReadyStore } from '@placegraph/db';
import { nowIso } from '@placegraph/core';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store = await getReadyStore();
  const project = await store.getProject(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const analysis = await store.getAnalysis(id);
  return NextResponse.json({ project, analysis });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store = await getReadyStore();
  const project = await store.getProject(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const updated = { ...project, ...body, id, updatedAt: nowIso() };
  await store.saveProject(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store = await getReadyStore();
  await store.deleteProject(id);
  return NextResponse.json({ ok: true });
}
