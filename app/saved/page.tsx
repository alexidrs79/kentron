import Image from "next/image";
import Link from "next/link";

export default function SavedPage() {
  return (
    <section className="grid min-h-[calc(100dvh-72px)] place-items-center px-5 py-8 md:min-h-dvh md:px-10">
      <div className="w-full max-w-2xl text-center">
        <Image
          src="/illustrations/vernissage-saved.jpg"
          alt="A woman browsing crafts at Vernissage"
          width={1024}
          height={558}
          priority
          className="aspect-[16/8] w-full rounded-3xl border border-line object-cover"
        />
        <p className="mt-8 font-mono text-[11px] text-paper-2">/saved</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">
          Nothing saved yet.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-paper-2">
          Planned events you keep will wait here. Live posts never do.
        </p>
        <Link
          href="/?mode=week"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-tuff px-5 text-sm font-medium text-dusk transition-colors hover:bg-[#df7668]"
        >
          Browse this week
        </Link>
      </div>
    </section>
  );
}
