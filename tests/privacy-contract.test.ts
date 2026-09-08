import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("public live-post view omits owner identity", async () => {
  const sql = await readFile(
    new URL(
      "supabase/migrations/20260907160000_close_live_post_anonymity_gaps.sql",
      root,
    ),
    "utf8",
  );
  const view = sql.match(
    /create or replace view public\.live_posts_public as([\s\S]*?)from public\.live_posts/i,
  )?.[1];
  assert.ok(view, "public live-post view is missing");
  assert.doesNotMatch(view, /\bowner_id\b/i);
  assert.match(sql, /create policy "live_posts_owner_read"/);
  assert.match(sql, /new\.expires_at := now\(\) \+ interval '4 hours'/);
});

test("live upload paths do not contain ownerId", async () => {
  const source = await readFile(new URL("lib/supabase/media.ts", root), "utf8");
  assert.match(
    source,
    /kind === "live"[\s\S]*`live\/\$\{crypto\.randomUUID\(\)\}/,
  );
  assert.doesNotMatch(
    source,
    /kind === "live"[\s\S]{0,120}\$\{ownerId\}\/live/,
  );
});

test("public records query uses the identity-free view", async () => {
  const source = await readFile(
    new URL("components/local-records.tsx", root),
    "utf8",
  );
  assert.match(source, /\.from\("live_posts_public"\)/);
  assert.doesNotMatch(
    source,
    /\.from\("live_posts"\)\s*\.select\(\s*"id,caption/,
  );
});
