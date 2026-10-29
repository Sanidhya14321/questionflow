import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { gradeAssessment } from '@/lib/grade-assessment';
import { getAssessmentById, getResultsByUserId } from '@/lib/data/assessments';
import { getSessionFromRequest } from '@/lib/auth/session';
import { ApiError, apiError, readJson } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

const resultSchema = z.object({
  assessmentId: z.string().min(1).max(100),
  submissionId: z.string().uuid(),
  answers: z.array(z.object({ questionId: z.string().min(1).max(100), selectedAnswer: z.string().min(1).max(500) })).min(1).max(50),
});

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const userId = request.nextUrl.searchParams.get('userId') || session.userId;
    if (session.role !== 'admin' && session.userId !== userId) throw new ApiError(403, 'Forbidden');
    return NextResponse.json(await getResultsByUserId(userId));
  } catch (error) { return apiError(error, 'results-history'); }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const payload = resultSchema.parse(await readJson(request));
    const key = `${session.userId}:${payload.submissionId}`;
    const existing = await prisma.assessmentResult.findUnique({ where: { submissionKey: key } });
    if (existing) {
      if (existing.assessmentId !== payload.assessmentId || JSON.stringify(existing.answers) !== JSON.stringify(payload.answers)) throw new ApiError(409, 'Submission identifier already used for different answers.');
      return NextResponse.json(existing);
    }
    await rateLimit('results', session.userId, 20);
    const assessment = await getAssessmentById(payload.assessmentId);
    if (!assessment) throw new ApiError(404, 'Assessment not found.');
    let scorePercentage: number;
    try { scorePercentage = gradeAssessment(assessment.questions, payload.answers); }
    catch (error) { throw new ApiError(400, error instanceof Error ? error.message : 'Invalid answers.'); }
    // The unique key also handles concurrent first-attempt retries.
    const data = { assessmentId: assessment.id, assessmentTitle: assessment.title, category: assessment.category, userId: session.userId, scorePercentage, answers: payload.answers, submissionKey: key };
    const result = await prisma.assessmentResult.create({ data }).catch(async error => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return prisma.assessmentResult.findUniqueOrThrow({ where: { submissionKey: key } });
      }
      throw error;
    });
    if (result.assessmentId !== payload.assessmentId || JSON.stringify(result.answers) !== JSON.stringify(payload.answers)) throw new ApiError(409, 'Submission identifier already used for different answers.');
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return apiError(error, 'save-result'); }
}
