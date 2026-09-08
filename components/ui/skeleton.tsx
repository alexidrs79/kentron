"use client";

import { useLocale } from "@/components/locale-provider";

export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`skeleton block ${className}`} />;
}

/** Shared route fallback: it mirrors Kentron's dock-cleared content field. */
export function RouteSkeleton() {
  const { locale, t } = useLocale();
  return (
    <main
      className="min-h-[calc(100dvh-76px)] bg-canvas px-4 py-5 text-fg md:ml-[88px] md:min-h-dvh md:px-10 md:py-[7vh]"
      aria-busy="true"
      aria-label={t("loading")}
    >
      <div className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-panel border border-line bg-panel shadow-float">
        <div className="grid min-h-[620px] lg:grid-cols-[270px_minmax(0,1fr)]">
          <div className="border-b border-line p-6 lg:border-b-0 lg:border-r lg:p-8">
            <Skeleton className="h-8 w-36 rounded-md" />
            <Skeleton className="mt-3 h-3 w-24 rounded-full" />
            <div className="mt-10 space-y-5">
              <Skeleton className="h-12 w-full rounded-ctl" />
              <Skeleton className="h-12 w-4/5 rounded-ctl" />
              <Skeleton className="h-12 w-3/5 rounded-ctl" />
            </div>
          </div>
          <div className="p-6 md:p-10">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="mt-5 h-11 w-3/4 rounded-lg" />
            <Skeleton className="mt-3 h-4 w-1/2 rounded-full" />
            <div className="mt-10 space-y-4">
              {[0, 1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex min-h-16 items-center gap-4 border-b border-line pb-4"
                >
                  <Skeleton className="size-10 shrink-0 rounded-thumb" />
                  <span className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-2/3 rounded-full" />
                    <Skeleton className="mt-2 h-3 w-2/5 rounded-full" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">
        {locale === "hy" ? "Կենտրոնը բեռնվում է…" : "Loading Kentron…"}
      </span>
    </main>
  );
}

export function DetailSkeleton() {
  const { locale, t } = useLocale();
  return (
    <main
      className="min-h-[calc(100dvh-76px)] bg-canvas px-4 pt-5 pb-14 text-fg md:ml-[88px] md:min-h-dvh md:px-10 md:pt-8 md:pb-16"
      aria-busy="true"
      aria-label={t("loadingDetails")}
    >
      <div className="mx-auto w-full max-w-[1220px]">
        <Skeleton className="mb-3 h-11 w-32 rounded-ctl" />
        <div className="overflow-hidden rounded-panel border border-line bg-panel">
          <Skeleton className="aspect-[4/3] max-h-[min(52vh,560px)] w-full rounded-none" />
          <div className="grid lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
            <div className="px-5 py-6 md:px-8 md:py-8 lg:px-10">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="mt-5 h-11 w-4/5 rounded-lg" />
              <Skeleton className="mt-3 h-11 w-3/5 rounded-lg" />
              <Skeleton className="mt-8 h-4 w-full rounded-full" />
              <Skeleton className="mt-3 h-4 w-5/6 rounded-full" />
            </div>
            <div className="border-t border-line px-5 py-6 md:px-8 lg:border-t-0 lg:border-l lg:px-7 lg:py-8">
              <Skeleton className="h-3 w-12 rounded-full" />
              <Skeleton className="mt-4 h-6 w-3/4 rounded-lg" />
              <Skeleton className="mt-7 h-11 w-full rounded-ctl" />
              <Skeleton className="mt-2 h-11 w-full rounded-ctl" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">
        {locale === "hy" ? "Մանրամասները բեռնվում են…" : "Loading details…"}
      </span>
    </main>
  );
}

/** One map-shaped shell. No fake streets — those never match the real canvas. */
export function MapShellSkeleton() {
  const { locale } = useLocale();
  return (
    <main
      className="relative h-[calc(100dvh-76px)] overflow-hidden bg-canvas md:h-dvh"
      aria-busy="true"
      aria-label={locale === "hy" ? "Քարտեզը բեռնվում է" : "Loading map"}
    >
      <span className="absolute inset-0 bg-canvas" />
      <span className="absolute left-3 top-3 h-11 w-[210px] rounded-ctl border border-line bg-panel md:left-[88px] md:top-5" />
      <span className="absolute inset-y-5 right-5 hidden w-[396px] rounded-panel border border-line bg-panel shadow-float md:block" />
      <span className="sr-only">
        {locale === "hy"
          ? "Երևանի քարտեզը բեռնվում է…"
          : "Loading the Yerevan map…"}
      </span>
    </main>
  );
}

export function SearchSkeleton() {
  const { locale } = useLocale();
  return (
    <main
      className="min-h-[calc(100dvh-76px)] bg-canvas px-5 pt-6 text-fg md:ml-[88px] md:min-h-dvh md:px-10 md:pt-10"
      aria-busy="true"
    >
      <div className="mx-auto max-w-[1180px]">
        <Skeleton className="h-[60px] w-full rounded-ctl" />
        <div className="mt-5 grid gap-7 lg:mt-16 lg:grid-cols-2 lg:gap-12">
          <Skeleton className="aspect-[4/3] w-full rounded-panel" />
          <div className="space-y-4">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-[120px] w-full rounded-panel" />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">
        {locale === "hy" ? "Որոնումը բեռնվում է…" : "Loading search…"}
      </span>
    </main>
  );
}

export function ListPageSkeleton() {
  const { locale } = useLocale();
  return (
    <main
      className="min-h-[calc(100dvh-76px)] bg-canvas px-5 pt-6 text-fg md:ml-[88px] md:min-h-dvh md:px-10 md:pt-10"
      aria-busy="true"
    >
      <div className="mx-auto max-w-[1260px] overflow-hidden rounded-panel border border-line bg-panel">
        <div className="border-b border-line px-6 py-6">
          <Skeleton className="h-9 w-48 rounded-md" />
          <Skeleton className="mt-3 h-3 w-64 rounded-full" />
        </div>
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex h-[126px] items-center gap-5 border-b border-line px-6 last:border-0"
          >
            <Skeleton className="aspect-[4/3] w-[116px] rounded-thumb" />
            <span className="flex-1">
              <Skeleton className="h-5 w-2/3 rounded-full" />
              <Skeleton className="mt-3 h-3 w-2/5 rounded-full" />
            </span>
          </div>
        ))}
      </div>
      <span className="sr-only">
        {locale === "hy" ? "Ցանկը բեռնվում է…" : "Loading list…"}
      </span>
    </main>
  );
}

export function SplitPageSkeleton() {
  return (
    <main
      className="min-h-[calc(100dvh-76px)] bg-canvas px-4 py-5 md:ml-[88px] md:min-h-dvh md:px-10 md:py-10"
      aria-busy="true"
    >
      <div className="mx-auto grid min-h-[610px] max-w-[1120px] overflow-hidden rounded-panel border border-line bg-panel lg:grid-cols-[280px_1fr]">
        <Skeleton className="min-h-[300px] w-full rounded-none" />
        <div className="p-8 lg:p-14">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="mt-5 h-10 w-3/4 rounded-md" />
          <Skeleton className="mt-4 h-4 w-full rounded-full" />
          <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
          <div className="mt-10 space-y-5">
            <Skeleton className="h-16 w-full rounded-ctl" />
            <Skeleton className="h-16 w-full rounded-ctl" />
            <Skeleton className="h-16 w-full rounded-ctl" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function CreateSkeleton() {
  return (
    <main
      className="min-h-[calc(100dvh-76px)] bg-canvas px-4 py-7 md:ml-[88px] md:min-h-dvh md:px-10"
      aria-busy="true"
    >
      <div className="mx-auto max-w-[1040px]">
        <Skeleton className="h-10 w-2/3 rounded-md" />
        <Skeleton className="mt-3 h-4 w-1/2 rounded-full" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Skeleton className="aspect-[4/3] w-full rounded-panel" />
            <Skeleton className="h-14 w-full rounded-ctl" />
            <Skeleton className="h-32 w-full rounded-ctl" />
          </div>
          <Skeleton className="h-64 w-full rounded-panel" />
        </div>
      </div>
    </main>
  );
}
