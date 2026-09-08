"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const nameSchema = z.string().trim().min(2).max(80);

export async function updateDisplayName(formData: FormData) {
  const parsed = nameSchema.safeParse(formData.get("displayName"));
  if (!parsed.success) {
    return { error: "Use a name between 2 and 80 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to edit your profile." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: "The name could not be saved." };

  await supabase.auth.updateUser({ data: { display_name: parsed.data } });
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: "Name saved." };
}

export async function updateAvatarPath(path: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to edit your profile." };

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: path,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: "The photo could not be saved." };

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: path ? "Photo saved." : "Photo removed." };
}

export async function changePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8 || password.length > 72) {
    return { error: "Use a password of at least eight characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to change your password." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return {
      error: "The password could not be updated. Sign in again and retry.",
    };
  return { success: "Password updated." };
}

export async function changeEmail(formData: FormData) {
  const parsed = z.string().trim().email().safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to change your email." };

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data.toLowerCase() },
    { emailRedirectTo: `${site}/auth/callback?next=/profile` },
  );
  if (error) return { error: "The email could not be updated." };
  return { success: "Check both inboxes to confirm the new email." };
}

export async function exportAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to export your data." };

  const [profile, events, posts, saves, reports] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("planned_events").select("*").eq("owner_id", user.id),
    supabase.from("live_posts").select("*").eq("owner_id", user.id),
    supabase
      .from("event_saves")
      .select("event_id,content_type,created_at,expires_at")
      .eq("user_id", user.id),
    supabase
      .from("content_reports")
      .select("content_type,content_id,reason,status,created_at")
      .eq("reporter_id", user.id),
  ]);

  return {
    data: {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      profile: profile.data,
      plannedEvents: events.data ?? [],
      livePosts: posts.data ?? [],
      saves: saves.data ?? [],
      reports: reports.data ?? [],
    },
  };
}

export async function deleteAccount(formData: FormData) {
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== "DELETE") {
    return { error: "Type DELETE to confirm." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to delete this account." };

  const admin = createAdminClient();

  // Anything under the owner folder, listed page by page so accounts with
  // more than a thousand objects do not leave media behind.
  const owned: string[] = [];
  for (const folder of ["", "event", "live", "avatar"]) {
    const prefix = folder ? `${user.id}/${folder}` : user.id;
    for (let offset = 0; ; offset += 100) {
      const { data } = await admin.storage
        .from("event-media")
        .list(prefix, { limit: 100, offset });
      if (!data?.length) break;
      owned.push(
        ...data
          .filter((file) => file.name.includes("."))
          .map((file) => `${prefix}/${file.name}`),
      );
      if (data.length < 100) break;
    }
  }

  // Live media sits outside the owner folder on purpose, so it can only be
  // found through the rows that reference it.
  const { data: liveMedia } = await admin
    .from("live_posts")
    .select("image_path")
    .eq("owner_id", user.id);
  const paths = [
    ...owned,
    ...(liveMedia ?? [])
      .map((row) => row.image_path as string | null)
      .filter((path): path is string => Boolean(path)),
  ];
  if (paths.length) {
    await admin.storage.from("event-media").remove(paths);
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: "The account could not be deleted." };

  await supabase.auth.signOut();
  return { success: true };
}
