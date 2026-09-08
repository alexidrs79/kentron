import { redirect } from "next/navigation";
import { loginHref } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export default async function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(loginHref("/saved", "saved"));
  return children;
}
