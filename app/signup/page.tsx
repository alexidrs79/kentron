import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth-page";
import { safeReturnTo } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{
    returnTo?: string;
    intent?: string;
    about?: string;
  }>;
}) {
  const { returnTo, intent, about } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(safeReturnTo(returnTo));

  return (
    <AuthPage mode="signup" returnTo={returnTo} intent={intent} about={about} />
  );
}
