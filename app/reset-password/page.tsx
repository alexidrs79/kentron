"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { FieldLabel, TextInput } from "@/components/ui/field";
import { Page } from "@/components/ui/page";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { locale, t } = useLocale();

  return (
    <Page width="read">
      <h1 className="type-display">
        {locale === "hy" ? "Ընտրեք նոր գաղտնաբառ" : "Choose a new password"}
      </h1>
      <p className="type-body mt-2 text-dim">
        {locale === "hy"
          ? "Այս էջը բացվում է էլ․ փոստի վերականգնման հղումից։ Ընտրեք առնվազն ութ նիշանոց գաղտնաբառ։"
          : "This page is reached from the email reset link. Choose a password of at least eight characters."}
      </p>
      <form
        className="mt-7 max-w-[400px] space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const password = String(
            new FormData(event.currentTarget).get("password") ?? "",
          );
          if (password.length < 8) {
            setError(
              locale === "hy"
                ? "Օգտագործեք առնվազն ութ նիշ։"
                : "Use at least eight characters.",
            );
            return;
          }
          setPending(true);
          setError("");
          const { error: updateError } = await createClient().auth.updateUser({
            password,
          });
          setPending(false);
          if (updateError) {
            setError(
              locale === "hy"
                ? "Գաղտնաբառը չթարմացվեց։ Խնդրեք նոր հղում։"
                : "The password could not be updated. Request a new link.",
            );
            return;
          }
          router.push("/profile");
          router.refresh();
        }}
      >
        <FieldLabel label={t("newPassword")} htmlFor="new-password">
          <TextInput
            id="new-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </FieldLabel>
        {error ? (
          <p role="alert" className="text-[13.5px] font-semibold text-apricot">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" block disabled={pending}>
          {pending
            ? t("saving")
            : locale === "hy"
              ? "Պահել գաղտնաբառը"
              : "Save password"}
        </Button>
      </form>
      <p className="mt-5 text-[13px] text-dim">
        <Link
          href="/login"
          className="font-semibold text-fg hover:text-apricot"
        >
          {locale === "hy" ? "Վերադառնալ մուտքին" : "Back to log in"}
        </Link>
      </p>
    </Page>
  );
}
