"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { FieldLabel, TextInput } from "@/components/ui/field";
import { initialOf } from "@/lib/content";
import { localizeServerMessage } from "@/lib/i18n";
import {
  changeEmail,
  changePassword,
  deleteAccount,
  exportAccount,
  updateAvatarPath,
  updateDisplayName,
} from "@/lib/auth/profile-actions";
import {
  imageValidationError,
  removeStoragePath,
  uploadDataImage,
} from "@/lib/supabase/media";
import { createClient } from "@/lib/supabase/client";

export function ProfileEditForm({
  displayName,
  email,
  avatarUrl,
  avatarPath,
}: {
  displayName: string;
  email: string;
  avatarUrl?: string;
  avatarPath?: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [preview, setPreview] = useState(avatarUrl ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { locale, t } = useLocale();

  async function saveName(formData: FormData) {
    setPending(true);
    setError("");
    const result = await updateDisplayName(formData);
    setPending(false);
    if (result.error) setError(localizeServerMessage(locale, result.error));
    else
      setMessage(locale === "hy" ? "Պահված է։" : (result.success ?? "Saved."));
  }

  async function onPhoto(file: File | null) {
    if (!file) return;
    const invalid = imageValidationError(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setPending(true);
    setError("");
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) {
      setPending(false);
      setError(
        locale === "hy"
          ? "Մուտք գործեք՝ լուսանկարը փոխելու համար։"
          : "Sign in to change your photo.",
      );
      return;
    }
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read"));
        reader.readAsDataURL(file);
      });
      setPreview(dataUrl);
      const path = await uploadDataImage(dataUrl, user.id, "avatar");
      const result = await updateAvatarPath(path);
      if (result.error) setError(localizeServerMessage(locale, result.error));
      else
        setMessage(
          locale === "hy"
            ? "Լուսանկարը պահված է։"
            : (result.success ?? "Photo saved."),
        );
    } catch {
      setError(
        locale === "hy"
          ? "Լուսանկարը չվերբեռնվեց։"
          : "The photo could not be uploaded.",
      );
    }
    setPending(false);
  }

  async function removePhoto() {
    setPending(true);
    setError("");
    try {
      if (avatarPath) await removeStoragePath(avatarPath);
      const result = await updateAvatarPath(null);
      setPreview("");
      if (result.error) setError(localizeServerMessage(locale, result.error));
      else
        setMessage(
          locale === "hy"
            ? "Լուսանկարը հեռացված է։"
            : (result.success ?? "Photo removed."),
        );
    } catch {
      setError(
        locale === "hy"
          ? "Լուսանկարը չհեռացվեց։"
          : "The photo could not be removed.",
      );
    }
    setPending(false);
  }

  async function onExport() {
    setPending(true);
    const result = await exportAccount();
    setPending(false);
    if ("error" in result && result.error) {
      setError(localizeServerMessage(locale, result.error));
      return;
    }
    if ("data" in result && result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = "kentron-account.json";
      link.click();
      URL.revokeObjectURL(href);
      setMessage(
        locale === "hy"
          ? "Ձեր հաշվի տվյալների պատճենը ներբեռնվել է։"
          : "A copy of your account data was downloaded.",
      );
    }
  }

  async function onDelete(formData: FormData) {
    setPending(true);
    setError("");
    const result = await deleteAccount(formData);
    if (result.error) {
      setPending(false);
      setError(localizeServerMessage(locale, result.error));
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-[18px] font-medium">
          {locale === "hy" ? "Լուսանկար և անուն" : "Photo and name"}
        </h2>
        <div className="mt-5 flex items-center gap-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-full bg-apricot-wash text-[22px] font-semibold text-apricot">
              {initialOf(name)}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-ctl border border-line bg-panel px-3 text-[13px] font-semibold hover:bg-raised">
              {t("choosePhoto")}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(event) =>
                  void onPhoto(event.target.files?.[0] ?? null)
                }
              />
            </label>
            {preview ? (
              <Button
                type="button"
                tone="quiet"
                size="sm"
                disabled={pending}
                onClick={() => void removePhoto()}
              >
                {locale === "hy" ? "Հեռացնել" : "Remove"}
              </Button>
            ) : null}
          </div>
        </div>
        <form
          action={(formData) => void saveName(formData)}
          className="mt-6 max-w-[420px] space-y-4"
        >
          <FieldLabel label={t("displayName")} htmlFor="display-name">
            <TextInput
              id="display-name"
              name="displayName"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </FieldLabel>
          <Button type="submit" disabled={pending}>
            {locale === "hy" ? "Պահել անունը" : "Save name"}
          </Button>
        </form>
      </section>

      <section className="border-t border-line pt-8">
        <h2 className="text-[18px] font-medium">{t("account")}</h2>
        <form
          action={async (formData) => {
            setPending(true);
            const result = await changeEmail(formData);
            setPending(false);
            if (result.error)
              setError(localizeServerMessage(locale, result.error));
            else
              setMessage(
                locale === "hy"
                  ? "Ստուգեք ձեր էլ․ փոստը։"
                  : (result.success ?? "Check your email."),
              );
          }}
          className="mt-5 max-w-[420px] space-y-4"
        >
          <FieldLabel
            label={t("email")}
            htmlFor="account-email"
            hint={
              locale === "hy"
                ? "Նոր հասցեին հաստատման նամակ է ուղարկվում։"
                : "A confirmation is sent to the new address."
            }
          >
            <TextInput
              id="account-email"
              name="email"
              type="email"
              required
              defaultValue={email}
              autoComplete="email"
            />
          </FieldLabel>
          <Button type="submit" tone="secondary" disabled={pending}>
            {locale === "hy" ? "Թարմացնել էլ․ փոստը" : "Update email"}
          </Button>
        </form>
        <form
          action={async (formData) => {
            setPending(true);
            const result = await changePassword(formData);
            setPending(false);
            if (result.error)
              setError(localizeServerMessage(locale, result.error));
            else
              setMessage(
                locale === "hy"
                  ? "Գաղտնաբառը թարմացված է։"
                  : (result.success ?? "Password updated."),
              );
          }}
          className="mt-8 max-w-[420px] space-y-4"
        >
          <FieldLabel
            label={t("newPassword")}
            htmlFor="account-password"
            hint={
              locale === "hy"
                ? "Առնվազն ութ նիշ։"
                : "At least eight characters."
            }
          >
            <TextInput
              id="account-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </FieldLabel>
          <Button type="submit" tone="secondary" disabled={pending}>
            {t("updatePassword")}
          </Button>
        </form>
      </section>

      <section className="border-t border-line pt-8">
        <h2 className="text-[18px] font-medium">
          {locale === "hy" ? "Ձեր տվյալները" : "Your data"}
        </h2>
        <p className="mt-2 max-w-[52ch] text-[13.5px] leading-6 text-dim">
          {locale === "hy"
            ? "Ներբեռնեք այս հաշվի պատճենը կամ ընդմիշտ ջնջեք այն և կցված լուսանկարները։"
            : "Download a copy of this account, or permanently delete it and the photos attached to it."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            tone="secondary"
            disabled={pending}
            onClick={() => void onExport()}
          >
            {locale === "hy" ? "Ներբեռնել իմ տվյալները" : "Download my data"}
          </Button>
        </div>
        <form
          action={(formData) => void onDelete(formData)}
          className="mt-6 max-w-[420px] space-y-3"
        >
          <FieldLabel
            label={locale === "hy" ? "Ջնջել այս հաշիվը" : "Delete this account"}
            htmlFor="delete-confirm"
            hint={
              locale === "hy"
                ? "Հաստատելու համար գրեք DELETE։ Սա հնարավոր չէ հետարկել։"
                : "Type DELETE to confirm. This cannot be undone."
            }
          >
            <TextInput id="delete-confirm" name="confirmation" required />
          </FieldLabel>
          <Button type="submit" tone="quiet" disabled={pending}>
            {locale === "hy" ? "Ջնջել հաշիվը" : "Delete account"}
          </Button>
        </form>
      </section>

      {error ? (
        <p role="alert" className="text-[13.5px] font-semibold text-apricot">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-[13.5px] text-fg">
          {message}
        </p>
      ) : null}
    </div>
  );
}
