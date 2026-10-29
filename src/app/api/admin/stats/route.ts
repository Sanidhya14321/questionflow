import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/data/assessments';
import { getSessionFromRequest } from '@/lib/auth/session';
import { apiError } from '@/lib/api';
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (session?.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  try { return NextResponse.json(await getAdminStats()); }
  catch (error) { return apiError(error, 'admin-stats'); }
}
