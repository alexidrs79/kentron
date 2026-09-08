import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { KentronLockup } from "@/components/logo";
import {
  parseAuthIntent,
  safeReturnTo,
  type AuthIntent,
} from "@/lib/auth/paths";
import { getServerLocale } from "@/lib/i18n-server";
import type { Locale } from "@/lib/i18n";

function authCopy(
  mode: "login" | "signup",
  intent?: AuthIntent,
  about?: string,
  locale: Locale = "en",
) {
  const name = about?.trim();
  const signup = mode === "signup";
  if (locale === "hy") {
    if (intent === "save") {
      return {
        title: signup
          ? `Ստեղծեք հաշիվ՝ ${name || "սա"} պահելու համար։`
          : `Մուտք գործեք՝ ${name || "սա"} պահելու համար։`,
        body: "Մուտքից հետո Կենտրոնը ձեզ կվերադարձնի այստեղ՝ պահպանումն ավարտելու համար։",
      };
    }
    if (intent === "report") {
      return {
        title: signup
          ? "Ստեղծեք հաշիվ՝ հաղորդում ուղարկելու համար։"
          : "Մուտք գործեք՝ հաղորդում ուղարկելու համար։",
        body: "Հաղորդման համար հաշիվ է պահանջվում։ Դուք կվերադառնաք նույն էջը։",
      };
    }
    if (intent === "create-live") {
      return {
        title: signup
          ? "Ստեղծեք հաշիվ՝ ուղիղ գրառում հրապարակելու համար։"
          : "Մուտք գործեք՝ ուղիղ գրառում հրապարակելու համար։",
        body: "Ուղիղ գրառումները հանրության համար անանուն են, բայց պատկանում են ձեր հաշվին։",
      };
    }
    if (intent === "create-event" || intent === "create") {
      return {
        title: signup
          ? "Ստեղծեք հաշիվ՝ միջոցառում հրապարակելու համար։"
          : "Մուտք գործեք՝ միջոցառում հրապարակելու համար։",
        body: "Նախատեսված միջոցառումները հրապարակվում են կազմակերպչի անունով։",
      };
    }
    return {
      title: signup
        ? "Պահեք ձեր Կենտրոնի գործունեությունը։"
        : "Մուտք գործեք ձեր Կենտրոնի հաշիվ։",
      body: signup
        ? "Հրապարակեք միջոցառումներ ու ուղիղ գրառումներ և պահեք ձեր շաբաթը։"
        : "Ձեր պահվածները, հրապարակումները և կարգավորումները կապված են ձեր հաշվին։",
    };
  }
  if (intent === "save") {
    return {
      title: signup
        ? name
          ? `Create an account to save ${name}.`
          : "Create an account to save this."
        : name
          ? `Log in to save ${name}.`
          : "Log in to save this.",
      body: "After you sign in, Kentron brings you back to finish saving.",
    };
  }
  if (intent === "report") {
    return {
      title: signup
        ? "Create an account to send a report."
        : "Log in to send a report.",
      body: "Reports need an account so Kentron can follow up. You will return to the same page.",
    };
  }
  if (intent === "create-live") {
    return {
      title: signup
        ? "Create an account to post live."
        : "Log in to post something live.",
      body: "Live posts are anonymous in public, but they belong to your account so you can remove them.",
    };
  }
  if (intent === "create-event" || intent === "create") {
    return {
      title: signup
        ? "Create an account to publish an event."
        : "Log in to publish a planned event.",
      body: "Planned events go out under your organiser name. You will return to the form.",
    };
  }
  if (intent === "saved") {
    return {
      title: signup
        ? "Create an account to keep a saved week."
        : "Log in to open your saved week.",
      body: "Saved live posts and events stay with this account across devices.",
    };
  }
  if (intent === "organizer") {
    return {
      title: signup
        ? "Create an account to publish from a desk."
        : "Log in to your publishing desk.",
      body: "Unpublish, edit, and reuse weekly drafts from this account.",
    };
  }
  if (intent === "edit-profile" || intent === "profile") {
    return {
      title: signup
        ? "Create an account to keep Kentron with you."
        : "Log in to your account.",
      body: "Your name, photo, saved week, and published events live here.",
    };
  }
  return {
    title: signup
      ? "Keep your Kentron activity with you."
      : "Log in to your Kentron account.",
    body: signup
      ? "Publish planned events and live posts, save your week, and access everything across devices."
      : "Your saved events, live posts, planned events, and preferences are tied to your account.",
  };
}

export async function AuthPage({
  mode,
  returnTo,
  intent,
  about,
  confirmationError,
}: {
  mode: "login" | "signup";
  returnTo?: string;
  intent?: string;
  about?: string;
  confirmationError?: boolean;
}) {
  const locale = await getServerLocale();
  const signup = mode === "signup";
  const next = safeReturnTo(returnTo);
  const resolvedIntent = parseAuthIntent(intent);
  const copy = authCopy(mode, resolvedIntent, about, locale);
  const switchParams = new URLSearchParams({ returnTo: next });
  if (resolvedIntent) switchParams.set("intent", resolvedIntent);
  if (about) switchParams.set("about", about);

  return (
    <section className="grid min-h-[calc(100dvh-72px)] bg-canvas text-fg md:min-h-dvh md:grid-cols-[minmax(380px,1fr)_minmax(0,1.05fr)]">
      <div className="relative hidden overflow-hidden bg-canvas md:block">
        <Image
          src="/illustrations/yerevan-rooftop-auth.jpg"
          alt={
            locale === "hy"
              ? "Երևանը գիշերը՝ տանիքից, լուսավորված քաղաքի հետևում Արարատը"
              : "Yerevan at night from a rooftop terrace, Mount Ararat beyond the lit city"
          }
          fill
          priority
          sizes="100vw"
          className="object-cover object-[30%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-28 bg-gradient-to-r from-canvas/0 via-canvas/70 to-canvas lg:w-40"
        />
        <Link
          href="/"
          aria-label={locale === "hy" ? "Կենտրոնի գլխավոր էջ" : "Kentron home"}
          className="absolute left-7 top-7 drop-shadow-[0_2px_12px_rgb(12_10_9/0.75)]"
        >
          <KentronLockup />
        </Link>
      </div>

      <div className="flex items-center px-5 py-9 md:px-12 md:py-12">
        <div className="w-full max-w-[400px]">
          <Image
            src="/illustrations/yerevan-rooftop-auth.jpg"
            alt=""
            width={1536}
            height={1024}
            sizes="100vw"
            className="mb-7 aspect-[16/7] w-full rounded-panel border border-line object-cover md:hidden"
          />
          <h1 className="type-display text-balance">
            {copy.title}
          </h1>
          <p className="type-body mt-3 text-dim">
            {copy.body}
          </p>
          {confirmationError ? (
            <p
              role="alert"
              className="mt-4 rounded-ctl border border-line bg-raised px-3 py-2.5 text-[13px] leading-5 text-apricot"
            >
              {locale === "hy"
                ? "Հաստատման հղումը սխալ է կամ ժամկետանց։ Խնդրեք նոր նամակ կամ փորձեք մուտք գործել։"
                : "That confirmation link is invalid or has expired. Request a new signup email or try logging in if the account is already confirmed."}
            </p>
          ) : null}

          <AuthForm mode={mode} returnTo={returnTo} />

          <p className="mt-8 text-[13px] text-dim md:hidden">
            <Link
              href="/settings"
              className="font-semibold text-fg underline decoration-line underline-offset-4 hover:text-apricot"
            >
              {locale === "hy" ? "Կարգավորումներ" : "Settings"}
            </Link>
            {" · "}
            {locale === "hy"
              ? "տեսքն ու շարժման կարգավորումները կմնան այս սարքում մինչև մուտք գործելը։"
              : "appearance and motion stay on this device until you log in."}
          </p>

          <p className="mt-5 text-[13.5px] text-dim">
            {signup
              ? locale === "hy"
                ? "Արդեն ունե՞ք հաշիվ"
                : "Already have an account?"
              : locale === "hy"
                ? "Նո՞ր եք այստեղ"
                : "New here?"}{" "}
            <Link
              href={`${signup ? "/login" : "/signup"}?${switchParams.toString()}`}
              className="font-semibold text-fg underline decoration-line underline-offset-4 hover:text-apricot"
            >
              {signup
                ? locale === "hy"
                  ? "Մուտք գործել"
                  : "Log in"
                : locale === "hy"
                  ? "Ստեղծել հաշիվ"
                  : "Create one"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
