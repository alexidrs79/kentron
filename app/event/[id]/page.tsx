import type { Metadata } from "next";
import { EventDetail } from "./event-detail";
import { imageFor } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n-server";

/** Fixture ids are slugs, so only real rows are worth a database round trip. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function yerevanWhen(startsAt: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Yerevan",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startsAt));
}

function clamp(value: string, limit = 158) {
  const flat = value.replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;
  return `${flat.slice(0, limit - 1).trimEnd()}…`;
}

async function loadEvent(id: string) {
  if (!UUID.test(id)) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("planned_events")
      .select(
        "title,venue_name,description,image_path,starts_at,organizer_name",
      )
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerLocale();
  const event = await loadEvent(id);

  if (!event) {
    return {
      title: locale === "hy" ? "Միջոցառում — Կենտրոն" : "Event — Kentron",
      description:
        locale === "hy"
          ? "Նախատեսված միջոցառում Երևանում՝ Կենտրոնի քարտեզին։"
          : "A planned event in Yerevan, on the Kentron map.",
    };
  }

  const title = `${event.title} — ${event.venue_name}`;
  const description = clamp(
    event.description?.trim()
      ? `${yerevanWhen(event.starts_at)} at ${event.venue_name}. ${event.description}`
      : `${event.organizer_name} at ${event.venue_name}, ${yerevanWhen(event.starts_at)}.`,
  );
  const image = event.image_path
    ? (await createClient()).storage
        .from("event-media")
        .getPublicUrl(event.image_path).data.publicUrl
    : imageFor(id);

  return {
    title,
    description,
    alternates: { canonical: `/event/${id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/event/${id}`,
      images: [{ url: image, width: 1440, height: 1080, alt: event.title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function EventPage() {
  return <EventDetail />;
}
