import { NextRequest, NextResponse } from "next/server";
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
    const payload = schema.parse(await request.json());
    const result = await voteOnAssessment({
      assessmentId,
      voteType: payload.voteType,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Failed to vote" }, { status: 400 });
  }
}
