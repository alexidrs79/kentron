"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { FieldLabel, TextInput } from "@/components/ui/field";
import { loginAction, signupAction } from "@/lib/auth/actions";
import { localizeServerMessage } from "@/lib/i18n";

export function AuthForm({
  mode,
  returnTo,
}: {
  mode: "login" | "signup";
  returnTo?: string;
}) {
  const signup = mode === "signup";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const { locale, t } = useLocale();

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    setSuccess("");
    const result = signup
      ? await signupAction(formData)
      : await loginAction(formData);
    if (result?.error) setError(localizeServerMessage(locale, result.error));
    if (result && "success" in result && result.success) {
      setSuccess(localizeServerMessage(locale, result.success));
    }
    setPending(false);
  }

  return (
    <form action={onSubmit} className="mt-6 space-y-4">
      <input type="hidden" name="returnTo" value={returnTo ?? "/profile"} />
      {signup ? (
        <FieldLabel
          label={locale === "hy" ? "Ձեր անունը" : "Your name"}
          htmlFor="auth-name"
        >
          <TextInput
            id="auth-name"
            name="name"
            required
            minLength={2}
            autoComplete="name"
          />
        </FieldLabel>
      ) : null}
      <FieldLabel label={t("email")} htmlFor="auth-email">
        <TextInput
          id="auth-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </FieldLabel>
      <FieldLabel
        label={t("password")}
        htmlFor="auth-password"
        hint={
          signup
            ? locale === "hy"
              ? "Առնվազն ութ նիշ։"
              : "At least eight characters."
            : undefined
        }
      >
        <TextInput
          id="auth-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={signup ? "new-password" : "current-password"}
        />
      </FieldLabel>
      {!signup ? (
        <p className="-mt-2 text-[13px]">
          <a
            href="/forgot-password"
            className="font-semibold text-dim hover:text-apricot"
          >
            {t("forgotPassword")}
          </a>
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-[13.5px] font-semibold text-apricot">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-[13.5px] leading-5 text-fg">
          {success}
        </p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending
          ? signup
            ? locale === "hy"
              ? "Հաշիվը ստեղծվում է…"
              : "Creating account…"
            : locale === "hy"
              ? "Մուտք է կատարվում…"
              : "Signing in…"
          : signup
            ? t("signUp")
            : t("logIn")}
      </Button>
    </form>
  );
}
