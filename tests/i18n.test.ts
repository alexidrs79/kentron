import assert from "node:assert/strict";
import test from "node:test";
import { messages, resolveLocale, t, type MessageKey } from "../lib/i18n.ts";

test("English and Armenian dictionaries have identical keys", () => {
  assert.deepEqual(
    Object.keys(messages.hy).sort(),
    Object.keys(messages.en).sort(),
  );
});

test("every Armenian message is present and not an English fallback", () => {
  for (const key of Object.keys(messages.en) as MessageKey[]) {
    assert.ok(t("hy", key).trim(), `${key} is empty`);
    if (!["languageEn", "languageHy"].includes(key)) {
      assert.notEqual(t("hy", key), t("en", key), `${key} was not translated`);
    }
  }
});

test("explicit locale preferences win", () => {
  assert.equal(resolveLocale("en"), "en");
  assert.equal(resolveLocale("hy"), "hy");
});
