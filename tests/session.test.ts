import assert from "node:assert/strict";
import { test } from "node:test";
import { signSession, verifySession } from "../src/lib/auth/session";

test("requires a strong session secret and rejects tampered tokens", async () => {
  const previous = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    await assert.rejects(signSession({ userId: "test", email: "test@example.com", name: "Test", role: "user" }));
    process.env.JWT_SECRET = "only-for-isolated-tests-1234567890abcdef";
    const user = { userId: "test", email: "test@example.com", name: "Test", role: "user" as const };
    const token = await signSession(user);
    assert.deepEqual(await verifySession(token), user);
    assert.equal(await verifySession(token + "tampered"), null);
    assert.equal(await verifySession("invalid-token"), null);
  } finally {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  }
});
