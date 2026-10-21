import { cookies } from 'next/headers';
import { generateId } from '@placegraph/core';

export async function getWorkspaceId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get('pg_workspace')?.value;
  if (existing) return existing;
  const id = generateId('ws');
  jar.set('pg_workspace', id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365
  });
  return id;
}
