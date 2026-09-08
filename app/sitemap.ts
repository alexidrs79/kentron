import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticPaths = ["", "/about", "/search", "/privacy", "/terms"];

/** Regenerate hourly so newly published events appear without a redeploy. */
export const revalidate = 3600;

/**
 * Published events are the shareable surface, so they belong in the sitemap.
 * Live posts are deliberately left out: they expire after four hours.
 */
async function publishedEventPaths() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
    const { data } = await supabase
      .from("planned_events")
      .select("id,starts_at")
      .eq("is_published", true)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(500);
    return (data ?? []).map((row) => `/event/${row.id}`);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await publishedEventPaths();
  return [...staticPaths, ...events].map((path) => ({
    url: `${site}${path}`,
    lastModified: new Date(),
  }));
}
