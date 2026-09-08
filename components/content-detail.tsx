"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { imageTreatment } from "@/lib/content";

export interface RelatedContent {
  href: string;
  image: string;
  title: string;
  meta: string;
  place: string;
}

export function ContentDetail({
  backHref,
  backLabel,
  image,
  imageAlt,
  eyebrow,
  title,
  summary,
  publisher,
  place,
  distance,
  placeNote,
  actions,
  report,
  relatedTitle,
  relatedMeta,
  related,
}: {
  backHref: string;
  backLabel: string;
  image: string;
  imageAlt: string;
  eyebrow: ReactNode;
  title: string;
  summary?: string;
  publisher?: ReactNode;
  place: string;
  distance?: string;
  placeNote: string;
  actions: ReactNode;
  report: ReactNode;
  relatedTitle: string;
  relatedMeta?: string;
  related: RelatedContent[];
}) {
  const { t } = useLocale();

  return (
    <main className="scroll-dark min-h-[calc(100dvh-76px)] bg-canvas text-fg md:ml-[88px] md:min-h-dvh">
      <div className="mx-auto w-full max-w-[1220px] px-4 pt-5 pb-14 md:px-10 md:pt-8 md:pb-16">
        <Link
          href={backHref}
          className={`${buttonClass({ tone: "quiet", size: "sm" })} -ml-3 mb-3`}
        >
          <ArrowLeft size={15} strokeWidth={2} aria-hidden />
          {backLabel}
        </Link>

        <article className="overflow-hidden rounded-panel border border-line bg-panel shadow-float">
          <Image
            src={image}
            alt={imageAlt}
            width={1440}
            height={1080}
            priority
            className={`aspect-[4/3] max-h-[min(52vh,560px)] w-full object-cover ${imageTreatment(image)}`}
          />
          <div className="grid lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
            <div className="px-5 pt-6 pb-5 md:px-8 md:pt-8 lg:px-10 lg:pb-3">
              <div className="type-meta text-apricot">
                {eyebrow}
              </div>
              <h1 className="type-display mt-3 max-w-[24ch]">
                {title}
              </h1>
            </div>

            <aside className="border-y border-line px-5 py-5 md:px-8 lg:row-span-2 lg:row-start-1 lg:col-start-2 lg:border-y-0 lg:border-l lg:px-7 lg:py-8">
              <p className="type-meta text-dim">{t("where")}</p>
              <h2 className="type-lede mt-2">
                {place}
              </h2>
              {distance ? (
                <p className="type-meta mt-1 text-dim">
                  {distance} {t("fromYou")}
                </p>
              ) : null}
              <p className="type-meta mt-2 leading-5 text-dim">{placeNote}</p>
              <div className="mt-5 grid gap-2 [&>*]:w-full">{actions}</div>
              <div className="-ml-3 mt-3">{report}</div>
            </aside>

            {(summary || publisher) && (
              <div className="px-5 pt-5 pb-6 md:px-8 md:pb-8 lg:px-10 lg:pt-1">
                {summary ? (
                  <p className="type-body text-dim">
                    {summary}
                  </p>
                ) : null}
                {publisher ? (
                  <p className="type-meta mt-7 border-t border-line pt-4 text-dim">
                    {publisher}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </article>

        {related.length ? (
          <section className="mt-7">
            <div className="flex items-baseline justify-between gap-5">
              <h2 className="type-ui">{relatedTitle}</h2>
              {relatedMeta ? (
                <p className="type-meta text-dim">{relatedMeta}</p>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-t border-line py-3 hover:text-apricot"
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={184}
                    height={138}
                    className={`aspect-[4/3] w-full rounded-thumb object-cover ${imageTreatment(item.image)}`}
                  />
                  <span className="min-w-0">
                    <span className="type-data text-dim">
                      {item.meta}
                    </span>
                    <span className="type-ui mt-1 line-clamp-2 block font-medium text-fg">
                      {item.title}
                    </span>
                    <span className="type-data mt-1 block truncate text-dim">
                      {item.place}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
