import { notFound, redirect } from "next/navigation";
import { EventForm } from "@/app/create/event-form";
import { loginHref } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginHref(`/organizer/event/${id}`, "organizer"));

  const { data: event } = await supabase
    .from("planned_events")
    .select(
      "id,owner_id,organizer_name,title,venue_name,category,description,image_path,lat,lng,starts_at,is_recurring_template,is_published",
    )
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!event) notFound();

  const imageUrl = event.image_path
    ? supabase.storage.from("event-media").getPublicUrl(event.image_path).data
        .publicUrl
    : undefined;

  return (
    <EventForm
      backHref="/organizer"
      initial={{
        id: event.id,
        organizerName: event.organizer_name,
        title: event.title,
        category: event.category,
        startsAt: event.starts_at,
        venue: event.venue_name,
        description: event.description,
        imageUrl,
        weekly: event.is_recurring_template,
        published: event.is_published,
        coordinates: [event.lng, event.lat],
      }}
    />
  );
}
