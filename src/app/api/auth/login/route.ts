import { readJson, apiError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyUserCredentials } from "@/lib/auth/users";
import { attachSessionCookie, signSession } from "@/lib/auth/session";

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await readJson(request, 8192));
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("Session configuration missing");
    await rateLimit("auth-email", payload.email.toLowerCase(), 10, 900);
    // Vercel overwrites this header; local development shares one test bucket.
    const ip = process.env.VERCEL ? (request.headers.get("x-vercel-forwarded-for")?.split(",")[0] || "unknown") : "local";
    await rateLimit("auth-ip", ip, 40, 900);
    const user = await verifyUserCredentials(payload.email.toLowerCase(), payload.password);

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const token = await signSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role === "admin" ? "admin" : "user",
    });

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    attachSessionCookie(response, token);
    return response;
  } catch (error) {
    return apiError(error, "login");
  }
}
