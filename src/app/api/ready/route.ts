import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Invalid configuration');
    // Verify migrated tables, not merely a TCP connection.
    await Promise.all([
      prisma.assessment.findFirst({ select: { id: true } }),
      prisma.assessmentResult.findFirst({ select: { submissionKey: true } }),
      prisma.assessmentVote.findFirst({ select: { id: true } }),
      prisma.rateLimitBucket.findFirst({ select: { key: true } }),
    ]);
    return NextResponse.json({ status: 'ready', database: 'connected', ai: process.env.GROQ_API_KEY ? 'configured' : 'disabled', revision: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
