"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export function ConfirmForm({
  action,
  message,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  children: ReactNode;
}) {
  const form = useRef<HTMLFormElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const confirmed = useRef(false);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <>
      <form
        ref={form}
        action={action}
        onSubmit={(event) => {
          if (confirmed.current) {
            confirmed.current = false;
            return;
          }
          event.preventDefault();
          setConfirming(false);
          setOpen(true);
        }}
      >
        {children}
      </form>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        aria-labelledby={headingId}
        className="m-auto w-[calc(100%_-_32px)] max-w-[420px] rounded-panel border border-line bg-panel p-0 text-fg shadow-float backdrop:bg-black/65"
      >
        <div className="px-5 py-5">
          <h2 id={headingId} className="text-[18px] font-semibold">
            {t("pleaseConfirm")}
          </h2>
          <p className="mt-2 text-[13.5px] leading-6 text-dim">{message}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={confirming}
              className={buttonClass({ tone: "primary", size: "sm" })}
              onClick={() => {
                // A second click must not submit the action twice.
                if (confirming) return;
                setConfirming(true);
                confirmed.current = true;
                setOpen(false);
                form.current?.requestSubmit();
              }}
            >
              {t("confirm")}
            </button>
            <button
              type="button"
              className={buttonClass({ tone: "quiet", size: "sm" })}
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
