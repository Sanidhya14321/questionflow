import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/auth/users";
import { attachSessionCookie, signSession } from "@/lib/auth/session";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
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
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
