import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { unstable_doesMiddlewareMatch as doesProxyMatch } from "next/experimental/testing/server";
import { config, proxy } from "../src/proxy";
import { AUTH_COOKIE_NAME, signSession, attachSessionCookie, clearSessionCookie, getSessionFromRequest } from "../src/lib/auth/session";

const origin = "https://questionflow.test";
const secret = "isolated-auth-routing-test-secret-0123456789";
const previousSecret = process.env.JWT_SECRET;
let learnerToken: string;
let adminToken: string;
let expiredToken: string;

before(async () => {
  process.env.JWT_SECRET = secret;
  const learner = { userId: "learner", name: "Learner", email: "learner@example.test", role: "user" as const };
  learnerToken = await signSession(learner);
  adminToken = await signSession({ ...learner, userId: "admin", role: "admin" });
  expiredToken = await new SignJWT(learner).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) - 60).sign(new TextEncoder().encode(secret));
});
after(() => {
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

function request(path: string, token?: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, origin), {
    headers: { ...headers, ...(token === undefined ? {} : { cookie: `${AUTH_COOKIE_NAME}=${token}` }) },
  });
}

const navigationModes: Record<string, string>[] = [
  {},
  { "next-router-prefetch": "1", purpose: "prefetch" },
  { rsc: "1", "next-router-prefetch": "1" },
];

test("route matcher covers tests, nested routes, auth pages and prefetched navigation", () => {
  for (const headers of navigationModes) {
    for (const path of ["/assessments/web-dev-fundamentals", "/assessments/create", "/profile", "/profile/history", "/admin/add-assessment", "/api/auth/me", "/api/results", "/login", "/signup"]) {
      assert.equal(doesProxyMatch({ config, url: origin + path, headers }), true, path);
    }
  }
  for (const path of ["/", "/_next/static/app.js", "/favicon.ico"]) {
    assert.equal(doesProxyMatch({ config, url: origin + path }), false, path);
  }
});

test("missing, tampered and expired sessions cannot open or prefetch a protected page", async () => {
  for (const token of [undefined, learnerToken + "tampered", expiredToken, ""]) {
    for (const headers of navigationModes) {
      for (const path of ["/assessments/web-dev-fundamentals?mode=review", "/assessments/create", "/profile"]) {
        const response = await proxy(request(path, token, headers));
        assert.equal(response.status, 307, path);
        const destination = new URL(response.headers.get("location")!);
        assert.equal(destination.origin, origin);
        assert.equal(destination.pathname, "/login");
        assert.equal(destination.searchParams.get("next"), path);
        assert.match(response.headers.get("cache-control")!, /private.*no-store/);
      }
    }
  }
});

test("one valid session survives repeated test and profile navigation without another login", async () => {
  for (let visit = 0; visit < 3; visit++) {
    for (const headers of navigationModes) {
      for (const path of ["/profile", "/assessments/web-dev-fundamentals", "/assessments/create"]) {
        const response = await proxy(request(path, learnerToken, headers));
        assert.equal(response.headers.get("x-middleware-next"), "1");
        assert.equal(response.headers.get("location"), null);
        assert.equal(response.headers.get("set-cookie"), null);
        assert.match(response.headers.get("cache-control")!, /no-store/);
      }
    }
  }
});

test("authenticated auth-page requests preserve safe return links and reject login loops", async () => {
  for (const page of ["/login", "/signup"]) {
    for (const [next, expected] of [
      ["/assessments/web-dev-fundamentals?mode=review", "/assessments/web-dev-fundamentals?mode=review"],
      ["//attacker.invalid", "/profile"],
      ["https://attacker.invalid", "/profile"],
      ["/login/", "/profile"],
      ["/signup?next=/login", "/profile"],
    ]) {
      const response = await proxy(request(`${page}?next=${encodeURIComponent(next)}`, learnerToken));
      assert.equal(response.status, 307);
      assert.equal(response.headers.get("location"), origin + expected);
      assert.match(response.headers.get("cache-control")!, /no-store/);
    }
  }
});

test("learner and administrator sessions retain their role boundaries", async () => {
  for (const token of [undefined, learnerToken, expiredToken]) {
    assert.equal((await proxy(request("/api/admin/stats", token))).status, 403);
    assert.equal((await proxy(request("/admin", token))).status, 307);
  }
  assert.equal((await proxy(request("/admin", adminToken))).headers.get("x-middleware-next"), "1");
  assert.equal((await proxy(request("/api/admin/stats", adminToken))).headers.get("x-middleware-next"), "1");
  for (const path of ["/profile", "/login", "/signup"]) {
    assert.equal((await proxy(request(path, adminToken))).headers.get("location"), origin + "/admin");
  }
});

test("cross-origin logout cannot clear a session", async () => {
  const response = await proxy(new NextRequest(origin + "/api/auth/logout", {
    method: "POST", headers: { origin: "https://attacker.invalid", cookie: `${AUTH_COOKIE_NAME}=${learnerToken}` },
  }));
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("set-cookie"), null);
});


test("login and logout cookies share their scope and clear authentication in every environment", async () => {
  const env: Record<string, string | undefined> = process.env;
  const previousMode = env.NODE_ENV;
  try {
    for (const mode of ["development", "production"]) {
      env.NODE_ENV = mode;
      const loginResponse = NextResponse.json({ ok: true });
      attachSessionCookie(loginResponse, learnerToken);
      const issued = loginResponse.cookies.get(AUTH_COOKIE_NAME)!;
      assert.equal(issued.path, "/");
      assert.equal(issued.httpOnly, true);
      assert.equal(issued.sameSite, "lax");
      assert.equal(issued.secure, mode === "production");
      assert.equal(issued.maxAge, 7 * 24 * 60 * 60);
      assert.equal((await getSessionFromRequest(request("/api/auth/me", issued.value)))?.userId, "learner");

      const logoutResponse = NextResponse.json({ ok: true });
      clearSessionCookie(logoutResponse);
      const cleared = logoutResponse.cookies.get(AUTH_COOKIE_NAME)!;
      assert.equal(cleared.name, issued.name);
      assert.equal(cleared.path, issued.path);
      assert.equal(cleared.domain, issued.domain);
      assert.equal(cleared.secure, issued.secure);
      assert.equal(cleared.httpOnly, issued.httpOnly);
      assert.equal(cleared.sameSite, issued.sameSite);
      assert.equal(cleared.maxAge, 0);
      assert.equal(cleared.value, "");
      assert.equal(await getSessionFromRequest(request("/api/auth/me", cleared.value)), null);
      assert.equal((await proxy(request("/assessments/web-dev-fundamentals", cleared.value))).status, 307);
    }
  } finally {
    if (previousMode === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = previousMode;
  }
});
