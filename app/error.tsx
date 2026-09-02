"use client";

import Image from "next/image";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="grid min-h-[calc(100dvh-72px)] place-items-center px-5 py-8 md:min-h-dvh md:px-10">
      <div className="w-full max-w-2xl text-center">
        <Image
          src="/illustrations/kond-lost.jpg"
          alt="A man trying to find his way through Kond"
          width={1024}
          height={558}
          className="aspect-[16/8] w-full rounded-3xl border border-line object-cover"
        />
        <p className="mt-8 font-mono text-[11px] text-paper-2">Error</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
          Lost the thread.
        </h1>
        <p className="mt-3 text-sm leading-6 text-paper-2">
          The map is still where we left it.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-line px-5 text-sm font-medium transition-colors hover:bg-line"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
