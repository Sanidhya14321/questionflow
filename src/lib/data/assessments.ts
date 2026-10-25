import type { Assessment, AssessmentCategory, AssessmentResult, Question } from "@/lib/types";
import { PREDEFINED_ASSESSMENTS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

let seedPromise: Promise<void> | null = null;

function mapRecordToAssessment(record: {
  id: string;
  title: string;
  category: string;
  description: string;
  questions: unknown;
  durationMinutes: number | null;
  upvotes: number;
  downvotes: number;
  isPredefined: boolean;
  createdByRole: string;
  createdByUserId: string | null;
  isAIGenerated: boolean;
  createdAt: Date;
}): Assessment {
  return {
    id: record.id,
    title: record.title,
    category: record.category as AssessmentCategory,
    description: record.description,
    questions: record.questions as Question[],
    durationMinutes: record.durationMinutes ?? undefined,
    upvotes: record.upvotes,
    downvotes: record.downvotes,
    isPredefined: record.isPredefined,
    createdByRole: record.createdByRole as Assessment["createdByRole"],
    createdByUserId: record.createdByUserId,
    isAIGenerated: record.isAIGenerated,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapResultToDomain(record: {
  assessmentId: string;
  assessmentTitle: string;
  category: string;
  userId: string;
  scorePercentage: number;
  answers: unknown;
  completedAt: Date;
}): AssessmentResult {
  return {
    assessmentId: record.assessmentId,
    assessmentTitle: record.assessmentTitle,
    category: record.category as AssessmentCategory,
    userId: record.userId,
    scorePercentage: record.scorePercentage,
    answers: record.answers as AssessmentResult["answers"],
    completedAt: record.completedAt.toISOString(),
  };
}

export async function ensureAssessmentsSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const existingCount = await prisma.assessment.count();
    if (existingCount > 0) return;

    await prisma.$transaction(
      PREDEFINED_ASSESSMENTS.map((assessment) =>
        prisma.assessment.upsert({
          where: { id: assessment.id },
          create: {
            id: assessment.id,
            title: assessment.title,
            category: assessment.category,
            description: assessment.description,
            questions: assessment.questions as unknown as Prisma.InputJsonValue,
            durationMinutes: assessment.durationMinutes,
            upvotes: assessment.upvotes,
            downvotes: assessment.downvotes,
            isPredefined: true,
            createdByRole: "admin",
            createdByUserId: null,
            isAIGenerated: false,
            createdAt: new Date(assessment.createdAt),
          },
          update: {
            title: assessment.title,
            category: assessment.category,
            description: assessment.description,
            questions: assessment.questions as unknown as Prisma.InputJsonValue,
            durationMinutes: assessment.durationMinutes,
            isPredefined: true,
            createdByRole: "admin",
            isAIGenerated: false,
          },
        })
      )
    );
  })();

  return seedPromise;
}

export async function getAllAssessments(userId?: string): Promise<Assessment[]> {
  await ensureAssessmentsSeeded();

  let completedAssessmentIds: string[] = [];
  if (userId) {
    const completed = await prisma.assessmentResult.findMany({
      where: { userId },
      distinct: ["assessmentId"],
      select: { assessmentId: true },
    });
    completedAssessmentIds = completed.map((row) => row.assessmentId);
  }

  const records = await prisma.assessment.findMany({
    where: completedAssessmentIds.length > 0 ? { id: { notIn: completedAssessmentIds } } : undefined,
    orderBy: [{ isPredefined: "desc" }, { createdAt: "desc" }],
  });
  return records.map(mapRecordToAssessment);
}

export async function getAssessmentById(id: string): Promise<Assessment | null> {
  await ensureAssessmentsSeeded();
  const record = await prisma.assessment.findUnique({ where: { id } });
  return record ? mapRecordToAssessment(record) : null;
}

export async function createAssessment(input: {
  title: string;
  category: string;
  description: string;
  questions: Array<Omit<Question, "id"> & { id?: string }>;
  durationMinutes?: number;
  createdByRole: "admin" | "user" | "ai";
  createdByUserId?: string | null;
  isAIGenerated?: boolean;
}): Promise<Assessment> {
  const titleSlug = input.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  const id = `${titleSlug || "assessment"}-${crypto.randomUUID().slice(0, 8)}`;

  const record = await prisma.assessment.create({
    data: {
      id,
      title: input.title,
      category: input.category,
      description: input.description,
      questions: input.questions.map((question, index) => ({
        ...question,
        id: question.id ?? `q-${index + 1}`,
      })) as Prisma.InputJsonValue,
      durationMinutes: input.durationMinutes,
      isPredefined: false,
      createdByRole: input.createdByRole,
      createdByUserId: input.createdByUserId,
      isAIGenerated: input.isAIGenerated ?? false,
      upvotes: 0,
      downvotes: 0,
    },
  });

  return mapRecordToAssessment(record);
}

export async function getAssessmentStatsByCategory(): Promise<Record<string, number>> {
  await ensureAssessmentsSeeded();
  const grouped = await prisma.assessment.groupBy({
    by: ["category"],
    _count: { _all: true },
  });

  return grouped.reduce<Record<string, number>>((acc, row) => {
    acc[row.category] = row._count._all;
    return acc;
  }, {});
}

export async function voteOnAssessment(input: { assessmentId: string; voteType: "up" | "down" }) {
  const data =
    input.voteType === "up"
      ? { upvotes: { increment: 1 } }
      : { downvotes: { increment: 1 } };

  const record = await prisma.assessment.update({
    where: { id: input.assessmentId },
    data,
  });

  return {
    id: record.id,
    upvotes: record.upvotes,
    downvotes: record.downvotes,
  };
}

export async function saveAssessmentResult(input: AssessmentResult): Promise<void> {
  await prisma.assessmentResult.create({
    data: {
      assessmentId: input.assessmentId,
      assessmentTitle: input.assessmentTitle,
      category: input.category,
      userId: input.userId,
      scorePercentage: input.scorePercentage,
      answers: input.answers,
      completedAt: new Date(input.completedAt),
    },
  });
}

export async function getResultsByUserId(userId: string): Promise<AssessmentResult[]> {
  const records = await prisma.assessmentResult.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
  });

  return records.map(mapResultToDomain);
}

export async function getAdminStats(): Promise<{
  totalAssessments: number;
  assessmentsByCategory: Record<string, number>;
  totalUsers: number;
}> {
  await ensureAssessmentsSeeded();
  const [totalAssessments, assessmentsByCategory, totalUsers] = await Promise.all([
    prisma.assessment.count(),
    getAssessmentStatsByCategory(),
    prisma.user.count(),
  ]);

  return {
    totalAssessments,
    assessmentsByCategory,
    totalUsers,
  };
}
