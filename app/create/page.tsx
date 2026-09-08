import { redirect } from "next/navigation";
import { loginHref } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";
import { CreateFlow } from "./create-flow";

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const returnTo =
      kind === "live" || kind === "event" ? `/create?kind=${kind}` : "/create";
    redirect(
      loginHref(
        returnTo,
        kind === "live"
          ? "create-live"
          : kind === "event"
            ? "create-event"
            : "create",
      ),
    );
  }

  return <CreateFlow initialKind={kind} />;
}
