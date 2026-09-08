import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function NotFound() {
  const locale = await getServerLocale();
  return (
    <Page width="read">
      <div className="grid items-center gap-7 sm:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <p className="type-data text-dim">404</p>
          <h1 className="type-display mt-2">
            {locale === "hy"
              ? "Կոնդում սխալ շրջադարձ արեցինք։"
              : "Took a wrong turn in Kond."}
          </h1>
          <p className="type-body mt-3 text-dim">
            {locale === "hy"
              ? "Այս էջը քարտեզին չկա։ Այս կողմի փողոցները երբեմն այդպես են շփոթեցնում։"
              : "This page is not on the map. The streets around here do that to people."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/" className={buttonClass({ tone: "primary" })}>
              {t(locale, "backToMap404")}
            </Link>
            <Link href="/search" className={buttonClass({ tone: "secondary" })}>
              {t(locale, "searchYerevan")}
            </Link>
          </div>
        </div>
        <Image
          src="/illustrations/kond-lost.jpg"
          alt={
            locale === "hy"
              ? "Կոնդի փողոցներում ճանապարհ որոնող մարդ"
              : "Someone finding their way through the streets of Kond"
          }
          width={1024}
          height={768}
          priority
          className="aspect-[4/3] w-full rounded-panel border border-line object-cover"
        />
      </div>
    </Page>
  );
}
