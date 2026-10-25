import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAssessment, getAllAssessments } from "@/lib/data/assessments";
import { getSessionFromRequest } from "@/lib/auth/session";

const questionSchema = z.object({
  id: z.string().min(1).optional(),
  questionText: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctAnswer: z.string().min(1),
  type: z.enum(["multiple-choice", "true-false"]),
});

const createAssessmentSchema = z.object({
  title: z.string().min(5),
  category: z.string().min(2),
  description: z.string().min(20),
  durationMinutes: z.number().int().positive().optional(),
  questions: z.array(questionSchema).min(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const assessments = await getAllAssessments(session?.userId);
    return NextResponse.json(assessments);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load assessments", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const payload = createAssessmentSchema.parse(json);
    const assessment = await createAssessment({
      ...payload,
      createdByRole: session.role,
      createdByUserId: session.userId,
      isAIGenerated: false,
    });
    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Failed to create assessment", error: String(error) },
      { status: 500 }
    );
  }
}
