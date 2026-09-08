"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { FieldLabel, TextInput } from "@/components/ui/field";
import { Page } from "@/components/ui/page";
import { requestPasswordReset } from "@/lib/auth/actions";
import { localizeServerMessage } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { locale, t } = useLocale();

  return (
    <Page width="read">
      <h1 className="type-display">
        {locale === "hy" ? "Վերականգնել գաղտնաբառը" : "Reset your password"}
      </h1>
      <p className="type-body mt-2 text-dim">
        {locale === "hy"
          ? "Մուտքագրեք հաշվին կցված էլ․ փոստը։ Եթե այն գոյություն ունի, կուղարկվի վերականգնման հղում։"
          : "Enter the email on the account. If it exists, a reset link is sent."}
      </p>
      <form
        className="mt-7 max-w-[400px] space-y-4"
        action={async (formData) => {
          setPending(true);
          setError("");
          const result = await requestPasswordReset(formData);
          setPending(false);
          if (result.error)
            setError(localizeServerMessage(locale, result.error));
          else
            setMessage(
              result.success ??
                (locale === "hy"
                  ? "Ստուգեք ձեր էլ․ փոստը։"
                  : "Check your email."),
            );
        }}
      >
        <FieldLabel label={t("email")} htmlFor="reset-email">
          <TextInput
            id="reset-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </FieldLabel>
        {error ? (
          <p role="alert" className="text-[13.5px] font-semibold text-apricot">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" className="text-[13.5px] leading-5 text-fg">
            {message}
          </p>
        ) : null}
        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? t("sending") : t("sendResetLink")}
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
