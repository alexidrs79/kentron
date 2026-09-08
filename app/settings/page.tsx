"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLocalRecords } from "@/components/local-records";
import { usePreferences } from "@/components/preferences";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Desk, Page } from "@/components/ui/page";
import { Toggle } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { useSavedEvents } from "@/lib/saved-events";

export default function SettingsPage() {
  const { preferences, ready, update, reset } = usePreferences();
  const {
    locale,
    t,
    preference: language,
    setPreference: setLanguage,
  } = useLocale();
  const { authenticated, count, items, clear } = useSavedEvents();
  const { mine } = useLocalRecords();
  const [cleared, setCleared] = useState("");

  async function clearSaved() {
    await clear();
    setCleared(
      locale === "hy" ? "Պահվածները մաքրված են։" : "Saved items cleared.",
    );
  }

  return (
    <Page>
      <Desk className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-line px-5 py-6 md:px-7 lg:min-h-[640px] lg:border-b-0 lg:border-r lg:py-8">
            <h1 className="type-title">
              {t("settingsTitle")}
            </h1>
            <p className="type-meta mt-2 text-dim">
              {!ready
                ? locale === "hy"
                  ? "Հաշվի կարգավորումները բեռնվում են"
                  : "Loading account settings"
                : authenticated
                  ? locale === "hy"
                    ? "Համաժամեցված է ձեր հաշվին"
                    : "Synced to your account"
                  : locale === "hy"
                    ? "Մնում է այս սարքում մինչև մուտք գործելը"
                    : "Kept on this device until you log in"}
            </p>

            <dl className="mt-7 grid grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-3">
              <DeviceLine label={t("saved")} value={count} />
              <DeviceLine
                label={locale === "hy" ? "Ուղիղ գրառումներ" : "Live posts"}
                value={mine.pulses.length}
              />
              <DeviceLine
                label={locale === "hy" ? "Միջոցառումներ" : "Events"}
                value={mine.events.length}
              />
            </dl>

            <div className="mt-7 flex flex-wrap gap-2 lg:mt-auto lg:block">
              <ConfirmDialog
                title={
                  locale === "hy"
                    ? "Վերակայե՞լ կարգավորումները"
                    : "Reset preferences?"
                }
                message={
                  locale === "hy"
                    ? "Վերակայե՞լ տեսքը, միավորները, ժամանակացույցը և շարժումը։"
                    : "Reset appearance, units, timeline, and motion to the defaults?"
                }
                confirmLabel={locale === "hy" ? "Վերակայել" : "Reset"}
                confirmTone="secondary"
                onConfirm={() => {
                  reset();
                  setCleared(
                    locale === "hy"
                      ? "Կարգավորումները վերակայված են։"
                      : "Preferences reset to defaults.",
                  );
                }}
              >
                {(open) => (
                  <Button
                    tone="quiet"
                    size="sm"
                    onClick={open}
                    className="lg:-ml-3 lg:w-full lg:justify-start"
                  >
                    {t("resetPreferences")}
                  </Button>
                )}
              </ConfirmDialog>
              <ConfirmDialog
                title={
                  locale === "hy" ? "Մաքրե՞լ պահվածները" : "Clear saved items?"
                }
                message={
                  locale === "hy"
                    ? "Հեռացնե՞լ այս հաշվին պահված ամեն ինչ։"
                    : "Remove everything saved to this account?"
                }
                confirmLabel={t("clearSaved")}
                confirmTone="secondary"
                onConfirm={clearSaved}
              >
                {(open) => (
                  <Button
                    tone="quiet"
                    size="sm"
                    onClick={open}
                    disabled={!items?.length}
                    className="lg:-ml-3 lg:mt-1 lg:w-full lg:justify-start"
                  >
                    {t("clearSaved")}
                  </Button>
                )}
              </ConfirmDialog>
              {cleared ? (
                <p
                  role="status"
                  className="type-meta mt-3 w-full text-apricot"
                >
                  {cleared}
                </p>
              ) : null}
            </div>
          </aside>

          {ready ? (
            <div className="px-5 py-2 md:px-8 lg:px-10 lg:py-3">
              <section className="py-6">
                <h2 className="type-lede">
                  {t("navMap")}
                </h2>
                <div className="mt-3 divide-y divide-line">
                  <Row label={t("language")} note={t("languageNote")}>
                    <Segmented
                      size="sm"
                      label={t("language")}
                      value={language}
                      onChange={setLanguage}
                      options={[
                        { value: "system", label: t("languageSystem") },
                        { value: "en", label: t("languageEn") },
                        { value: "hy", label: t("languageHy") },
                      ]}
                    />
                  </Row>
                  <Row
                    label={t("appearance")}
                    note={
                      locale === "hy"
                        ? "Հետևում է սարքի կարգավորմանը, եթե չընտրեք Մուգ կամ Բաց։"
                        : "Follows this machine unless you lock Dark or Light."
                    }
                  >
                    <Segmented
                      size="sm"
                      label={t("appearance")}
                      value={preferences.theme}
                      onChange={(theme) => update({ theme })}
                      options={[
                        { value: "system", label: t("system") },
                        { value: "dark", label: t("dark") },
                        { value: "light", label: t("light") },
                      ]}
                    />
                  </Row>
                  <Row
                    label={
                      locale === "hy"
                        ? "Քարտեզի սկզբնական ժամանակացույցը"
                        : "Timeline the map opens on"
                    }
                    note={
                      locale === "hy"
                        ? "Հիմա՝ ուղիղ գրառումներ։ Այս շաբաթ՝ նախատեսված միջոցառումներ։"
                        : "Right now shows live posts. This week shows planned events."
                    }
                  >
                    <Segmented
                      size="sm"
                      label={
                        locale === "hy"
                          ? "Լռելյայն ժամանակացույց"
                          : "Default timeline"
                      }
                      value={preferences.defaultMode}
                      onChange={(defaultMode) => update({ defaultMode })}
                      options={[
                        { value: "now", label: t("rightNow") },
                        { value: "week", label: t("thisWeek") },
                      ]}
                    />
                  </Row>
                  <Row
                    label={locale === "hy" ? "Հեռավորություններ" : "Distances"}
                    note={
                      locale === "hy"
                        ? "Օգտագործվում է ցանկերում և մանրամասների էջերում։"
                        : "Used in lists and on detail pages."
                    }
                  >
                    <Segmented
                      size="sm"
                      label={t("distanceUnits")}
                      value={preferences.units}
                      onChange={(units) => update({ units })}
                      options={[
                        {
                          value: "km",
                          label: locale === "hy" ? "Մետրական" : "Metric",
                        },
                        {
                          value: "mi",
                          label: locale === "hy" ? "Կայսերական" : "Imperial",
                        },
                      ]}
                    />
                  </Row>
                </div>
              </section>

              <section className="border-t border-line py-6">
                <h2 className="type-lede">
                  {t("activity")}
                </h2>
                <div className="mt-2 divide-y divide-line">
                  <Toggle
                    label={
                      locale === "hy"
                        ? "Պահված միջոցառումների հիշեցումներ"
                        : "Saved event reminders"
                    }
                    description={
                      locale === "hy"
                        ? "Ցույց տալ օրն ու ժամը Գործունեության էջում։ Հրումային ծանուցումներ չկան։"
                        : "Show their day and time on the Activity page. Kentron does not send push notifications."
                    }
                    checked={preferences.savedReminders}
                    onChange={(savedReminders) => update({ savedReminders })}
                  />
                  <Toggle
                    label={
                      locale === "hy"
                        ? "Նոր ուղիղ գրառումներ"
                        : "Fresh live posts"
                    }
                    description={
                      locale === "hy"
                        ? "Ցույց տալ Երևանի նոր ուղիղ գրառումները։"
                        : "Show recent live posts from across Yerevan."
                    }
                    checked={preferences.nearbyAlerts}
                    onChange={(nearbyAlerts) => update({ nearbyAlerts })}
                  />
                </div>
                <p className="type-meta mt-2 text-dim">
                  {locale === "hy"
                    ? "Գործունեությունը մնում է Կենտրոնի ներսում։ Հրումային ծանուցումներ չկան։"
                    : "Activity stays inside Kentron. There are no push notifications."}
                </p>
              </section>

              <section className="border-t border-line py-6">
                <h2 className="type-lede">
                  {locale === "hy" ? "Շարժում" : "Motion"}
                </h2>
                <div className="mt-2">
                  <Toggle
                    label={t("reduceMotion")}
                    description={
                      locale === "hy"
                        ? "Կանգնեցնում է վահանակների շարժումն ու ուղիղ նշիչի զարկը։"
                        : "Stops sheet and popup movement and freezes the live marker pulse."
                    }
                    checked={preferences.reduceMotion}
                    onChange={(reduceMotion) => update({ reduceMotion })}
                  />
                </div>
              </section>

              <nav className="border-t border-line py-2">
                <Link
                  href="/profile"
                  className="group flex min-h-14 items-center justify-between gap-5 border-b border-line py-3 text-[15px] hover:text-apricot"
                >
                  <span>
                    <span className="block font-medium">
                      {t("organiserAccount")}
                    </span>
                    <span className="type-meta mt-0.5 block text-dim">
                      {locale === "hy"
                        ? "Մուտք գործել և կառավարել միջոցառումները"
                        : "Sign in and manage published events"}
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    strokeWidth={1.8}
                    className="text-dim group-hover:text-apricot"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/about"
                  className="group flex min-h-14 items-center justify-between gap-5 py-3 text-[15px] hover:text-apricot"
                >
                  <span>
                    <span className="block font-medium">
                      {locale === "hy" ? "Կենտրոնի մասին" : "About Kentron"}
                    </span>
                    <span className="type-meta mt-0.5 block text-dim">
                      {locale === "hy"
                        ? "Ժամանակացույցեր, գաղտնիություն և քարտեզի տվյալներ"
                        : "Timelines, privacy, and map data"}
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    strokeWidth={1.8}
                    className="text-dim group-hover:text-apricot"
                    aria-hidden
                  />
                </Link>
              </nav>
            </div>
          ) : (
            <div className="skeleton min-h-[560px]" />
          )}
      </Desk>

        <p className="type-meta mt-4 max-w-[64ch] leading-5 text-dim">
          {authenticated
            ? "Your saved events, published events, live posts, and preferences stay with your account across devices. "
            : "Appearance, units, and motion stay on this device. Sign in to keep them with your account. "}
          <Link
            href="/profile"
            className="font-semibold text-fg underline decoration-line underline-offset-2 hover:text-apricot"
          >
            Manage your account
          </Link>
        </p>
    </Page>
  );
}

function Row({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        {note ? (
          <p className="type-meta mt-1 max-w-[52ch] leading-5 text-dim">
            {note}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function DeviceLine({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 lg:max-w-[180px]">
      <dt className="type-data text-dim">{label}</dt>
      <dd className="type-ui tabular-nums">{value}</dd>
    </div>
  );
}
