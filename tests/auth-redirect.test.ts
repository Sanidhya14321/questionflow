import assert from "node:assert/strict";
import { test } from "node:test";
import { safeReturnTo } from "../src/lib/auth/redirect";

test("auth return destinations remain local and cannot loop through auth pages", () => {
  for (const unsafe of [null, "https://example.com", "//example.com", "/\\example.com", "/login", "/login/", "/%6cogin", "/profile/../login", "/signup?next=/login", "/api/auth/logout", "/profile\n"]) {
    assert.equal(safeReturnTo(unsafe), "/profile");
  }
  assert.equal(safeReturnTo("/assessments/web-dev-fundamentals?mode=study"), "/assessments/web-dev-fundamentals?mode=study");
});
