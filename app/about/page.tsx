import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { KentronMark } from "@/components/logo";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t(locale, "about"),
    description:
      locale === "hy"
        ? "Երկու ժամանակացույց, անանուն ուղիղ գրառումներ, նախատեսված միջոցառումներ և քարտեզի աղբյուրներ։"
        : "Two timelines, anonymous live posts, planned events, and where the map data comes from.",
  };
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const hy = locale === "hy";
  return (
    <main className="scroll-dark min-h-[calc(100dvh-76px)] bg-canvas text-fg md:ml-[88px] md:min-h-dvh">
      <div className="mx-auto grid w-full max-w-[1320px] overflow-hidden md:min-h-dvh md:grid-cols-[.78fr_1.22fr]">
        <header className="relative min-h-[430px] overflow-hidden border-b border-line md:min-h-dvh md:border-b-0 md:border-r">
          <Image
            src="/illustrations/cascade-auth.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover object-[62%_center] saturate-[.78] brightness-[.62]"
          />
          <div className="absolute inset-0 bg-canvas/25" />
          <div className="absolute inset-0 flex flex-col p-6 md:p-10 lg:p-12">
            <KentronMark className="h-10 w-auto self-start" />
            <div className="mt-auto max-w-[340px]">
              <h1 className="type-display text-fg">
                {hy ? "Երևանի կենդանի քարտեզը։" : "A live map for Yerevan."}
              </h1>
              <p className="type-body mt-4 text-fg/80">
                {hy
                  ? "Կենտրոնը քաղաքում հիմա և այս շաբաթ կատարվողի ուղեցույց է։"
                  : "Kentron is a field guide to what is happening around the city, now and later this week."}
              </p>
            </div>
          </div>
        </header>

        <article className="px-5 py-8 md:px-9 md:py-12 lg:px-14">
          <TimelineNote
            title={t(locale, "rightNow")}
            body={
              hy
                ? "Քաղաքում գտնվող մարդկանց անանուն գրառումներ՝ մեկ լուսանկար, մեկ նախադասություն և հանրային վայրին կլորացված նշիչ։ Դրանք անհետանում են չորս ժամ անց։"
                : "Anonymous posts from people out in the city: one image, one sentence, and a pin rounded to a public place. They disappear after four hours."
            }
            example={
              hy
                ? "Դուդուկ և կիթառ՝ Կասկադի վերևի աստիճաններին"
                : "Duduk and guitar on the upper Cascade steps"
            }
            exampleLabel={hy ? "Օրինակ" : "Example"}
          />
          <TimelineNote
            title={t(locale, "thisWeek")}
            body={
              hy
                ? "Կազմակերպչի անունով հրապարակված միջոցառումներ՝ հստակ ժամով և վայրով։ Դրանք կարելի է որոնել ու պահել։"
                : "Planned events published under an organiser name, with a fixed start time and venue. They can be saved and searched."
            }
            example={
              hy
                ? "Նոր հայկական լուսանկարչություն Միրզոյան գրադարանում"
                : "New Armenian photography at Mirzoyan Library"
            }
            exampleLabel={hy ? "Օրինակ" : "Example"}
          />

          <div className="mt-8 grid border-y border-line sm:grid-cols-3">
            <Fact title={t(locale, "privacy")}>
              {hy
                ? "Պահվածները, հրապարակումները և կարգավորումները պաշտպանված են ձեր հաշվով։ Ուղիղ գրառումները չեն ցուցադրում ձեր հաշիվը։"
                : "Saved items, content you publish, and settings are protected by your account. Live posts do not expose your profile publicly."}
            </Fact>
            <Fact title={hy ? "Աղբյուրներ" : "Sources"}>
              {hy
                ? "Միջոցառումները հրապարակում են Երևանի կազմակերպիչներն ու բնակիչները։ Կենտրոնը այլ կայքերից միջոցառումներ չի ներմուծում և վճարովի տեղադրում չունի։"
                : "Events come from organisers and people in Yerevan. Kentron does not ingest events from other websites and has no paid placement."}
            </Fact>
            <Fact title={hy ? "Կապ" : "Contact"}>
              <a
                href="mailto:hello@kentron.am"
                className="font-semibold text-apricot hover:text-apricot-soft"
              >
                hello@kentron.am
              </a>
            </Fact>
          </div>

          <footer className="type-data mt-7 flex flex-wrap items-center justify-between gap-4 leading-5 text-dim">
            <p>
              {hy ? "Քարտեզի տվյալներ" : "Map data"} © OpenStreetMap
              contributors · OpenFreeMap or CARTO
            </p>
            <div className="flex gap-4">
              <Link
                href="/"
                className="font-semibold text-fg hover:text-apricot"
              >
                {t(locale, "openMap")}
              </Link>
              <Link
                href="/privacy"
                className="font-semibold text-fg hover:text-apricot"
              >
                {t(locale, "privacy")}
              </Link>
              <Link
                href="/terms"
                className="font-semibold text-fg hover:text-apricot"
              >
                {t(locale, "terms")}
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}

function TimelineNote({
  title,
  body,
  example,
  exampleLabel,
}: {
  title: string;
  body: string;
  example: string;
  exampleLabel: string;
}) {
  return (
    <section className="border-b border-line py-8 first:pt-0">
      <h2 className="type-title">{title}</h2>
      <p className="type-body mt-2 text-dim">{body}</p>
      <p className="type-meta mt-5 border-t border-line pt-3 text-dim">
        <span className="mr-2 font-semibold text-apricot">{exampleLabel}</span>
        {example}
      </p>
    </section>
  );
}

function Fact({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
      <h2 className="type-ui">{title}</h2>
      <p className="type-meta mt-2 leading-5 text-dim">{children}</p>
    </section>
  );
}
