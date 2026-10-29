import { readJson, apiError, ApiError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/auth/users";
import { attachSessionCookie, signSession } from "@/lib/auth/session";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await readJson(request, 8192));
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("Session configuration missing");
    await rateLimit("auth-email", payload.email.toLowerCase(), 10, 900);
    // Vercel overwrites this header; local development shares one test bucket.
    const ip = process.env.VERCEL ? (request.headers.get("x-vercel-forwarded-for")?.split(",")[0] || "unknown") : "local";
    await rateLimit("auth-ip", ip, 40, 900);
    const user = await registerUser(payload.name, payload.email.toLowerCase(), payload.password);

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
    if (error instanceof Error && error.message === "An account with this email already exists.") return apiError(new ApiError(409, error.message), "signup");
    return apiError(error, "signup");
  }
}
