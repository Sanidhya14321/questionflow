import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assessmentRecommendation } from "@/ai/flows/assessment-recommendation";
import { getSessionFromRequest } from "@/lib/auth/session";

const payloadSchema = z.object({
  userHistory: z.array(
    z.object({
      assessmentCategory: z.string(),
      score: z.number(),
      interests: z.string(),
    })
  ),
  availableAssessments: z.array(
    z.object({
      assessmentCategory: z.string(),
      assessmentTitle: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const payload = payloadSchema.parse(json);
    const recommendations = await assessmentRecommendation(payload);
    return NextResponse.json(recommendations);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to generate recommendations", error: String(error) },
      { status: 500 }
    );
  }
}
