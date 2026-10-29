import { readJson, apiError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assessmentRecommendation } from "@/ai/flows/assessment-recommendation";
import { getSessionFromRequest } from "@/lib/auth/session";

const payloadSchema = z.object({
  userHistory: z.array(
    z.object({
      assessmentCategory: z.string().max(80),
      score: z.number().min(0).max(100),
      interests: z.string().max(500),
    })
  ).max(100),
  availableAssessments: z.array(
    z.object({
      assessmentCategory: z.string().max(80),
      assessmentTitle: z.string().max(150),
    })
  ).max(100),
});

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await rateLimit("recommendations", session.userId, 10, 3600);
    const json = await readJson(request);
    const payload = payloadSchema.parse(json);
    const recommendations = await assessmentRecommendation(payload);
    return NextResponse.json(recommendations);
  } catch (error) {
    return apiError(error, "recommendations");
  }
}
