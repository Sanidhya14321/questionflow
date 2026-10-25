import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyUserCredentials } from "@/lib/auth/users";
import { attachSessionCookie, signSession } from "@/lib/auth/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
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
  } catch {
    return NextResponse.json({ message: "Login failed" }, { status: 400 });
  }
}
