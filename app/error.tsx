"use client";

import Link from "next/link";
import { Button, buttonClass } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { Page } from "@/components/ui/page";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale, t } = useLocale();
  return (
    <Page width="read">
      <div className="max-w-[52ch]">
        <h1 className="type-display">{t("lostThread")}</h1>
        <p className="type-body mt-3 text-dim">
          {locale === "hy"
            ? "Քարտեզը դեռ այնտեղ է։ Կրկին փորձեք այս էջը կամ վերադարձեք քարտեզին։"
            : "The map is still where we left it. Try this page again, or go back to it."}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={reset}>{t("tryAgain")}</Button>
          <Link href="/" className={buttonClass({ tone: "secondary" })}>
            {t("openMap")}
          </Link>
        </div>
        {error.digest ? (
          <p className="type-meta mt-6 border-t border-line pt-4 text-dim">
            {locale === "hy" ? "Հղում" : "Reference"} {error.digest}
          </p>
        ) : null}
      </div>
    </Page>
  );
}
