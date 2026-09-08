import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth-page";
import { safeReturnTo } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    returnTo?: string;
    error?: string;
    intent?: string;
    about?: string;
  }>;
}) {
  const { returnTo, error, intent, about } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(safeReturnTo(returnTo));

  return (
    <AuthPage
      mode="login"
      returnTo={returnTo}
      intent={intent}
      about={about}
      confirmationError={error === "confirmation"}
    />
  );
}
