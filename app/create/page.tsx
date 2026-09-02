"use client";

import Image from "next/image";
import { useState } from "react";
import { EventForm } from "./event-form";
import { LiveForm } from "./live-form";

type Step = "branch" | "now" | "later";

export default function CreatePage() {
  const [step, setStep] = useState<Step>("branch");

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-8 md:px-10 md:py-12">
      {step === "branch" ? (
        <Branch onChoose={setStep} />
      ) : step === "now" ? (
        <LiveForm onBack={() => setStep("branch")} />
      ) : (
        <EventForm onBack={() => setStep("branch")} />
      )}
    </section>
  );
}

function Branch({ onChoose }: { onChoose: (step: Step) => void }) {
  return (
    <div>
      <p className="font-mono text-[11px] text-paper-2">/create</p>
      <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold tracking-[-0.04em]">
        Happening now, or planned for later?
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-paper-2">
        One choice. Then the short form that matches it.
      </p>
      <Image
        src="/illustrations/create-branch.jpg"
        alt="A woman captures what is happening now while a man plans an event"
        width={1024}
        height={558}
        priority
        className="mt-8 aspect-[16/7] w-full rounded-3xl border border-line object-cover"
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onChoose("now")}
          className="min-h-44 rounded-3xl border border-line bg-surface p-6 text-left transition-colors hover:border-apricot/50"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-apricot/15 text-apricot">
            <span className="size-2.5 rounded-full bg-apricot" />
          </span>
          <span className="mt-6 block font-display text-2xl font-semibold">
            Happening now
          </span>
          <span className="mt-3 block text-sm leading-6 text-paper-2">
            A live post with a pin. It fades over a few hours, then it leaves
            the map.
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChoose("later")}
          className="min-h-44 rounded-3xl border border-line bg-surface p-6 text-left transition-colors hover:border-tuff/50"
        >
          <span className="flex size-10 items-center justify-center rounded-[4px] bg-tuff/15 text-tuff">
            <span className="size-2.5 rounded-[2px] bg-tuff" />
          </span>
          <span className="mt-6 block font-display text-2xl font-semibold">
            Planned for later
          </span>
          <span className="mt-3 block text-sm leading-6 text-paper-2">
            An event with a time and a venue. People can find it and save it.
          </span>
        </button>
      </div>
    </div>
  );
}
