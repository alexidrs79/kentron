"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Removes a published event. Only the organiser who owns it can do this. */
export async function unpublishEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const id = String(formData.get("eventId") ?? "");
  if (!user || !id) return;

  // RLS additionally proves ownership; a forged event id cannot unpublish
  // somebody else's record.
  const { error } = await supabase
    .from("planned_events")
    .update({ is_published: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);

  revalidatePath("/organizer");
  revalidatePath("/profile");
  revalidatePath("/");
  redirect(`/organizer?status=${error ? "error" : "unpublished"}`);
}

export async function deleteLivePost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const id = String(formData.get("postId") ?? "");
  if (!user || !id) return;

  const { data: post } = await supabase
    .from("live_posts")
    .select("image_path")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (!post) redirect("/organizer?status=error");

  const { error } = await supabase.from("live_posts").delete().eq("id", id);
  if (error) redirect("/organizer?status=error");
  // Live media lives outside the owner folder to stay anonymous, so the
  // author's own client has no delete grant on it. Ownership was proven above.
  if (post.image_path) {
    await createAdminClient()
      .storage.from("event-media")
      .remove([post.image_path]);
  }
  revalidatePath("/organizer");
  revalidatePath("/profile");
  revalidatePath("/");
  redirect("/organizer?status=deleted");
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const id = String(formData.get("eventId") ?? "");
  if (!user || !id) return;

  const { data: event } = await supabase
    .from("planned_events")
    .select("image_path")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (!event) return;

  const { error } = await supabase.from("planned_events").delete().eq("id", id);
  if (!error && event.image_path) {
    await supabase.storage.from("event-media").remove([event.image_path]);
  }
  revalidateAccountRoutes();
  redirect(`/organizer?status=${error ? "error" : "deleted"}`);
}

export async function republishEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const id = String(formData.get("eventId") ?? "");
  if (!user || !id) return;

  const { error } = await supabase
    .from("planned_events")
    .update({ is_published: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);
  revalidateAccountRoutes();
  redirect(`/organizer?status=${error ? "error" : "published"}`);
}

function revalidateAccountRoutes() {
  revalidatePath("/organizer");
  revalidatePath("/profile");
  revalidatePath("/");
}
