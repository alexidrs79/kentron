"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useState } from "react";
import { EventForm } from "./event-form";
import { LiveForm } from "./live-form";

type Branch = "none" | "live" | "event";

export function CreateFlow({ initialKind }: { initialKind?: string }) {
  const { t } = useLocale();
  const initialBranch: Branch =
    initialKind === "live" || initialKind === "event" ? initialKind : "none";
  const [branch, setBranch] = useState<Branch>(initialBranch);

  if (branch === "live") return <LiveForm onBack={() => setBranch("none")} />;
  if (branch === "event") return <EventForm onBack={() => setBranch("none")} />;

  return (
    <main className="min-h-[calc(100dvh-76px)] bg-canvas text-fg md:ml-[88px] md:min-h-dvh">
      <div className="mx-auto flex min-h-[calc(100dvh-76px)] w-full max-w-[1280px] items-center px-4 py-5 md:min-h-dvh md:px-10 md:py-10">
        <section className="grid w-full overflow-hidden rounded-panel border border-line bg-panel shadow-float md:grid-cols-[1.02fr_.98fr]">
          <div className="relative min-h-[230px] md:min-h-[620px]">
            <Image
              src="/illustrations/create-branch.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 52vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          <div className="flex flex-col justify-center px-5 py-8 md:px-10 md:py-12 lg:px-14">
            <h1 className="type-display">
              {t("createWhat")}
            </h1>
            <p className="type-body mt-3 text-dim">
              {t("createHint")}
            </p>

            <div className="mt-8 divide-y divide-line border-y border-line md:mt-12">
              <BranchRow
                title={t("createLive")}
                body={t("createLiveBody")}
                onClick={() => setBranch("live")}
                accent
              />
              <BranchRow
                title={t("createEvent")}
                body={t("createEventBody")}
                onClick={() => setBranch("event")}
              />
            </div>

            <Link
              href="/about"
              className="type-ui mt-8 inline-flex min-h-10 items-center gap-2 self-start font-medium text-dim underline decoration-line underline-offset-4 hover:text-apricot"
            >
              {t("howItWorks")}
              <ArrowRight size={14} strokeWidth={1.9} aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function BranchRow({
  title,
  body,
  onClick,
  accent,
}: {
  title: string;
  body: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-5 py-6 text-left hover:text-apricot md:py-7"
    >
      <span className="min-w-0 flex-1">
        <span className="type-title block font-medium">
          {title}
        </span>
        <span className="type-body mt-1.5 block text-dim">
          {body}
        </span>
      </span>
      <ArrowRight
        size={27}
        strokeWidth={1.7}
        className={`kentron-motion-nudge shrink-0 transition-transform group-hover:translate-x-1 ${
          accent ? "text-apricot" : "text-fg"
        }`}
        aria-hidden
      />
    </button>
  );
}
