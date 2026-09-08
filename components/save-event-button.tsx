"use client";

import { Suspense } from "react";
import { Bookmark } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { loginHref } from "@/lib/auth/paths";
import { type SaveableContentType, useSavedEvents } from "@/lib/saved-events";

export function SaveContentButton({
  contentId,
  contentType,
  expiresAt,
  title,
}: {
  contentId: string;
  contentType: SaveableContentType;
  expiresAt?: string;
  title?: string;
}) {
  return (
    <Suspense
      fallback={
        <button
          type="button"
          disabled
          className={buttonClass({ tone: "secondary" })}
        >
          Save
        </button>
      }
    >
      <SaveContentControl
        contentId={contentId}
        contentType={contentType}
        expiresAt={expiresAt}
        title={title}
      />
    </Suspense>
  );
}

function SaveContentControl({
  contentId,
  contentType,
  expiresAt,
  title,
}: {
  contentId: string;
  contentType: SaveableContentType;
  expiresAt?: string;
  title?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { isSaved, isBusy, toggle, ready, authenticated } = useSavedEvents();
  const { t } = useLocale();
  const saved = isSaved(contentType, contentId);
  const busy = isBusy(contentType, contentId);
  const returnTo = `${pathname}${search.toString() ? `?${search.toString()}` : ""}`;

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={
        saved
          ? `Remove ${title ?? "this event"} from saved`
          : `Save ${title ?? "this event"}`
      }
      disabled={!ready || busy}
      onClick={() => {
        if (!authenticated) {
          router.push(loginHref(returnTo, "save", title));
          return;
        }
        void toggle({
          id: contentId,
          type: contentType,
          expiresAt,
        });
      }}
      className={buttonClass({ tone: saved ? "primary" : "secondary" })}
    >
      <Bookmark
        size={16}
        strokeWidth={2}
        fill={saved ? "currentColor" : "none"}
        aria-hidden
      />
      {saved ? t("saved") : t("save")}
    </button>
  );
}
