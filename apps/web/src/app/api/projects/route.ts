import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ projects: [], message: 'PlaceGraph API' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ id: `proj_${Date.now()}`, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
