"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { buttonClass, type ButtonTone } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmTone = "primary",
  onConfirm,
  children,
}: {
  title?: string;
  message: string;
  confirmLabel?: string;
  confirmTone?: ButtonTone;
  onConfirm: () => void | Promise<void>;
  children: (open: () => void) => ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
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
      {children(() => {
        setConfirming(false);
        setOpen(true);
      })}
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
            {title ?? t("pleaseConfirm")}
          </h2>
          <p className="mt-2 text-[13.5px] leading-6 text-dim">{message}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={confirming}
              className={buttonClass({ tone: confirmTone, size: "sm" })}
              onClick={() => {
                // A second click must not run a destructive action twice.
                if (confirming) return;
                setConfirming(true);
                setOpen(false);
                void onConfirm();
              }}
            >
              {confirmLabel ?? t("confirm")}
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
