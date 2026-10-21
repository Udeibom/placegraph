import { NextResponse } from 'next/server';
import { capabilities } from '@placegraph/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(capabilities());
}
