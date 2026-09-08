import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { buttonClass } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { loginHref } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function ProfileEditPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginHref("/profile/edit"));

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ||
    (user.user_metadata.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Your account";
  const avatarUrl = profile?.avatar_url
    ? supabase.storage.from("event-media").getPublicUrl(profile.avatar_url).data
        .publicUrl
    : undefined;

  return (
    <Page width="read">
      <Link
        href="/profile"
        className={`${buttonClass({ tone: "quiet", size: "sm" })} -ml-3 mb-4`}
      >
        <ArrowLeft size={15} strokeWidth={2} aria-hidden />
        {locale === "hy" ? "Վերադառնալ հաշվին" : "Back to profile"}
      </Link>
      <h1 className="type-display">
        {t(locale, "editProfile")}
      </h1>
      <p className="type-body mt-2 text-dim">
        {locale === "hy"
          ? "Ձեր լուսանկարն ու անունը երևում են այս հաշվում և ձեր հրապարակած միջոցառումներում։ Ուղիղ գրառումները մնում են անանուն։"
          : "Your photo and name appear on this account and on planned events you publish. Live posts stay anonymous."}
      </p>
      <div className="mt-8">
        <ProfileEditForm
          displayName={displayName}
          email={user.email ?? ""}
          avatarUrl={avatarUrl}
          avatarPath={profile?.avatar_url}
        />
      </div>
    </Page>
  );
}
