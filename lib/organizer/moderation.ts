"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function reviewReport(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "staff") return;

  const id = String(formData.get("reportId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || (status !== "reviewed" && status !== "actioned")) return;

  const { data: report } = await supabase
    .from("content_reports")
    .select("content_type,content_id")
    .eq("id", id)
    .single();
  if (!report) return;

  if (status === "actioned") {
    const admin = createAdminClient();
    if (report.content_type === "live") {
      const { data: post } = await admin
        .from("live_posts")
        .select("image_path")
        .eq("id", report.content_id)
        .maybeSingle();
      await admin.from("live_posts").delete().eq("id", report.content_id);
      if (post?.image_path) {
        await admin.storage.from("event-media").remove([post.image_path]);
      }
    } else {
      await admin
        .from("planned_events")
        .update({ is_published: false, updated_at: new Date().toISOString() })
        .eq("id", report.content_id);
    }
  }

  await supabase.from("content_reports").update({ status }).eq("id", id);
  revalidatePath("/admin/reports");
  revalidatePath("/");
}
