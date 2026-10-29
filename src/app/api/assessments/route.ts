import { NextRequest, NextResponse } from "next/server";
import { assessmentSchema } from "@/lib/assessment-schema";
import { readJson, apiError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { createAssessment, getAllAssessments } from "@/lib/data/assessments";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const assessments = await getAllAssessments(session?.userId);
    return NextResponse.json(assessments);
  } catch (error) {
    return apiError(error, "list-assessments");
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await rateLimit("create", session.userId, 10);
    const payload = assessmentSchema.parse(await readJson(request));
    const assessment = await createAssessment({
      ...payload,
      createdByRole: session.role,
      createdByUserId: session.userId,
      isAIGenerated: false,
    });
    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    return apiError(error, "create-assessment");
  }
}
