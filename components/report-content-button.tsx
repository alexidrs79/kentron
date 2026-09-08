"use client";

import { Flag, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { loginHref } from "@/lib/auth/paths";
import type { SaveableContentType } from "@/lib/saved-events";
import { createClient } from "@/lib/supabase/client";

const reasons = [
  ["spam", "Spam or promotion"],
  ["misleading", "Misleading or no longer accurate"],
  ["unsafe", "Unsafe activity"],
  ["inappropriate", "Inappropriate content"],
  ["other", "Something else"],
] as const;

export function ReportContentButton({
  contentId,
  contentType,
  title,
}: {
  contentId: string;
  contentType: SaveableContentType;
  title: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { locale, t } = useLocale();
  const reasonLabels =
    locale === "hy"
      ? [
          "Սպամ կամ գովազդ",
          "Սխալ կամ այլևս ոչ ճշգրիտ",
          "Վտանգավոր գործունեություն",
          "Անպատշաճ բովանդակություն",
          "Այլ պատճառ",
        ]
      : reasons.map((reason) => reason[1]);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  async function beginReport() {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) {
      const returnTo = `${pathname}${window.location.search}`;
      router.push(loginHref(returnTo, "report", title));
      return;
    }
    setSent(false);
    setError("");
    setOpen(true);
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) {
      setOpen(false);
      router.push(loginHref(pathname, "report", title));
      return;
    }

    const { error: submitError } = await createClient()
      .from("content_reports")
      .insert({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason: form.get("reason"),
        details: String(form.get("details") ?? "").trim() || null,
      });

    setSubmitting(false);
    if (submitError?.code === "23505") {
      setSent(true);
      return;
    }
    if (submitError) {
      setError(
        locale === "hy"
          ? "Հաղորդումը չուղարկվեց։ Կրկին փորձեք։"
          : "The report could not be sent. Please try again.",
      );
      return;
    }
    setSent(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void beginReport()}
        className={buttonClass({ tone: "quiet", size: "sm" })}
      >
        <Flag size={15} strokeWidth={1.9} aria-hidden />
        {t("report")}
      </button>

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        aria-labelledby="report-title"
        className="m-auto max-h-[calc(100dvh_-_24px)] w-[calc(100%_-_32px)] max-w-[460px] overflow-y-auto rounded-panel border border-line bg-panel p-0 text-fg shadow-float backdrop:bg-black/65"
      >
        <div className="flex items-start gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="report-title" className="text-[18px] font-semibold">
              {locale === "hy"
                ? `Հաղորդել այս ${contentType === "live" ? "ուղիղ գրառման" : "միջոցառման"} մասին`
                : `Report this ${contentType === "live" ? "live post" : "event"}`}
            </h2>
            <p className="mt-1 line-clamp-1 text-[12.5px] text-dim">{title}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={
              locale === "hy" ? "Փակել հաղորդման ձևը" : "Close report form"
            }
            className="grid size-11 shrink-0 place-items-center rounded-ctl text-dim hover:bg-raised hover:text-fg"
          >
            <X size={17} strokeWidth={2} aria-hidden />
          </button>
        </div>

        {sent ? (
          <div className="px-5 py-6">
            <p className="text-[16px] font-semibold">{t("reportReceived")}</p>
            <p className="mt-2 text-[13.5px] leading-6 text-dim">
              {locale === "hy"
                ? "Շնորհակալություն։ Այն այժմ Կենտրոնի ստուգման հերթում է։"
                : "Thank you. It is now in Kentron’s review queue."}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`${buttonClass({ tone: "primary", size: "sm" })} mt-5`}
            >
              {locale === "hy" ? "Պատրաստ է" : "Done"}
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => void submitReport(event)} className="p-5">
            <label
              htmlFor="report-reason"
              className="text-[13px] font-semibold"
            >
              {locale === "hy" ? "Ի՞նչն է սխալ" : "What is wrong?"}
            </label>
            <select
              id="report-reason"
              name="reason"
              required
              defaultValue=""
              className="mt-2 min-h-11 w-full rounded-ctl border border-line bg-canvas px-3 text-[13.5px] outline-none focus:border-apricot"
            >
              <option value="" disabled>
                {locale === "hy" ? "Ընտրեք պատճառը" : "Choose a reason"}
              </option>
              {reasons.map(([value], index) => (
                <option key={value} value={value}>
                  {reasonLabels[index]}
                </option>
              ))}
            </select>

            <label
              htmlFor="report-details"
              className="mt-5 block text-[13px] font-semibold"
            >
              {locale === "hy" ? "Մանրամասներ" : "Details"}{" "}
              <span className="font-normal text-dim">
                {locale === "hy" ? "(ըստ ցանկության)" : "(optional)"}
              </span>
            </label>
            <textarea
              id="report-details"
              name="details"
              maxLength={500}
              rows={4}
              className="mt-2 w-full resize-y rounded-ctl border border-line bg-canvas px-3 py-2.5 text-[13.5px] leading-5 outline-none focus:border-apricot"
              placeholder={
                locale === "hy"
                  ? "Ավելացրեք տեղեկություն, որը կօգնի ստուգել։"
                  : "Add context that will help us review it."
              }
            />

            <p aria-live="polite" className="mt-3 text-[12.5px] text-apricot">
              {error}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={submitting}
                className={buttonClass({ tone: "primary", size: "sm" })}
              >
                {submitting ? t("sending") : t("sendReport")}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={buttonClass({ tone: "quiet", size: "sm" })}
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
