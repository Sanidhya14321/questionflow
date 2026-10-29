import { NextRequest, NextResponse } from "next/server";
import { readJson, apiError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { voteOnAssessment } from "@/lib/data/assessments";
import { getSessionFromRequest } from "@/lib/auth/session";

const schema = z.object({
  voteType: z.enum(["up", "down"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { assessmentId } = await params;
    await rateLimit("vote", session.userId, 30);
    const payload = schema.parse(await readJson(request));
    const result = await voteOnAssessment({
      assessmentId,
      userId: session.userId,
      voteType: payload.voteType,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error, "vote");
  }
}
