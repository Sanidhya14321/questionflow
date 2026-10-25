import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/data/assessments";

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load admin stats", error: String(error) },
      { status: 500 }
    );
  }
}
