import assert from "node:assert/strict";
import test from "node:test";
import {
  intentFromReturnTo,
  loginHref,
  parseAuthIntent,
  safeReturnTo,
} from "../lib/auth/paths.ts";

test("safeReturnTo accepts only internal paths", () => {
  assert.equal(safeReturnTo("/event/123?mode=week"), "/event/123?mode=week");
  for (const unsafe of [
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/%5cexample.com",
    "/line\nbreak",
  ]) {
    assert.equal(safeReturnTo(unsafe), "/profile");
  }
});

test("auth intents are allow-listed and inferred", () => {
  assert.equal(parseAuthIntent("report"), "report");
  assert.equal(parseAuthIntent("admin"), undefined);
  assert.equal(intentFromReturnTo("/create?kind=live"), "create-live");
  assert.equal(intentFromReturnTo("/organizer/event/123"), "organizer");
  assert.equal(intentFromReturnTo("/profile/edit"), "edit-profile");
});

test("loginHref preserves safe context and truncates labels", () => {
  const href = loginHref("/event/123", "save", "A".repeat(120));
  const url = new URL(href, "https://kentron.am");
  assert.equal(url.pathname, "/login");
  assert.equal(url.searchParams.get("returnTo"), "/event/123");
  assert.equal(url.searchParams.get("intent"), "save");
  assert.equal(url.searchParams.get("about")?.length, 80);
});
