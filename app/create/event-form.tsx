"use client";

import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PinPicker } from "@/components/pin-picker";
import { useLocale } from "@/components/locale-provider";
import { Button, buttonClass } from "@/components/ui/button";
import { FieldLabel, TextArea, TextInput } from "@/components/ui/field";
import { Page } from "@/components/ui/page";
import {
  formatYerevanWhen,
  knownPlaces,
  yerevanDateTimeLocal,
} from "@/lib/create/fields";
import { mapsPlaceUrl } from "@/lib/geo";
import type { EventCategory } from "@/lib/map/fixtures";
import { createClient } from "@/lib/supabase/client";
import { imageValidationError, uploadDataImage } from "@/lib/supabase/media";
import { CategoryPicker, FormFooter, PhotoField } from "./fields";

const CENTER: readonly [number, number] = [44.5136, 40.1811];

export type EventFormValues = {
  id: string;
  organizerName: string;
  title: string;
  category: EventCategory;
  startsAt: string;
  venue: string;
  description: string;
  imageUrl?: string;
  weekly: boolean;
  published: boolean;
  coordinates: readonly [number, number];
};

export function EventForm({
  onBack,
  backHref,
  initial,
}: {
  onBack?: () => void;
  backHref?: string;
  initial?: EventFormValues;
}) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [organizer, setOrganizer] = useState(initial?.organizerName ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<EventCategory>(
    initial?.category ?? "tech",
  );
  const [startsAt, setStartsAt] = useState(
    initial
      ? yerevanDateTimeLocal(new Date(initial.startsAt))
      : yerevanDateTimeLocal(),
  );
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [photo, setPhoto] = useState<string | null>(initial?.imageUrl ?? null);
  const [pin, setPin] = useState<readonly [number, number]>(
    initial?.coordinates ?? CENTER,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"draft" | "publish" | false>(false);
  const [published, setPublished] = useState<{
    id: string;
    draft: boolean;
  } | null>(null);
  const { locale, t } = useLocale();

  const suggestions = useMemo(
    () =>
      venue.trim().length < 2
        ? []
        : knownPlaces
            .filter((item) =>
              item.name.toLowerCase().includes(venue.toLowerCase()),
            )
            .filter((item) => item.name.toLowerCase() !== venue.toLowerCase()),
    [venue],
  );

  function readPhoto(file: File | null) {
    if (!file) {
      setPhoto(null);
      return;
    }
    const fileError = imageValidationError(file);
    if (fileError) {
      setPhoto(null);
      setError(fileError);
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function validate() {
    const next: Record<string, string> = {};
    if (title.trim().length < 3) {
      next.title =
        locale === "hy"
          ? "Օգտագործեք առնվազն 3 նիշ։"
          : "Use at least 3 characters.";
    }
    if (venue.trim().length < 2) {
      next.venue =
        locale === "hy"
          ? "Օգտագործեք առնվազն 2 նիշ։"
          : "Use at least 2 characters.";
    }
    if (description.trim().length < 8) {
      next.description =
        locale === "hy"
          ? "Օգտագործեք առնվազն 8 նիշ։"
          : "Use at least 8 characters.";
    }
    if (organizer.trim().length === 1) {
      next.organizer =
        locale === "hy"
          ? "Կազմակերպչի անունը պետք է լինի առնվազն 2 նիշ։"
          : "The organiser name must be at least 2 characters.";
    }
    setFieldErrors(next);
    if (next.title) document.getElementById("event-title")?.focus();
    else if (next.organizer)
      document.getElementById("event-organiser")?.focus();
    else if (next.venue) document.getElementById("event-venue")?.focus();
    else if (next.description)
      document.getElementById("event-description")?.focus();
    return Object.keys(next).length === 0;
  }

  async function submit(asDraft: boolean) {
    if (!validate()) return;
    setPending(asDraft ? "draft" : "publish");
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Released before navigating: coming back would otherwise leave both
      // submit buttons disabled forever.
      setPending(false);
      router.push(
        `/login?returnTo=${encodeURIComponent("/create?kind=event")}&intent=create-event`,
      );
      return;
    }

    try {
      const imagePath = photo?.startsWith("data:")
        ? await uploadDataImage(photo, user.id, "event")
        : undefined;
      const displayName =
        organizer.trim() ||
        (user.user_metadata.display_name as string | undefined) ||
        user.email?.split("@")[0] ||
        "Organiser";
      const payload = {
        organizer_name: displayName,
        title: title.trim(),
        venue_name: venue.trim(),
        category,
        description: description.trim(),
        starts_at: yerevanIso(startsAt),
        lat: pin[1],
        lng: pin[0],
        is_recurring_template: asDraft,
        is_published: !asDraft,
        updated_at: new Date().toISOString(),
        ...(imagePath ? { image_path: imagePath } : {}),
      };

      if (initial) {
        const { error: updateError } = await supabase
          .from("planned_events")
          .update(payload)
          .eq("id", initial.id)
          .eq("owner_id", user.id);
        if (updateError) throw updateError;
        window.dispatchEvent(new Event("kentron-records-change"));
        setPublished({ id: initial.id, draft: asDraft });
      } else {
        const { data, error: insertError } = await supabase
          .from("planned_events")
          .insert({ ...payload, owner_id: user.id })
          .select("id")
          .single();
        if (insertError || !data) throw insertError;
        window.dispatchEvent(new Event("kentron-records-change"));
        setPublished({ id: data.id, draft: asDraft });
      }
    } catch {
      setError(
        locale === "hy"
          ? "Միջոցառումը չպահվեց։ Ստուգեք տվյալները և կրկին փորձեք։"
          : "The event could not be saved. Check the details and try again.",
      );
      setPending(false);
      return;
    }
    setPending(false);
    router.refresh();
  }

  if (published) {
    return (
      <Page width="read">
        <p className="type-ui text-apricot">
          {published.draft
            ? locale === "hy"
              ? "Սևագիրը պահված է"
              : "Draft saved"
            : locale === "hy"
              ? "Հրապարակված է"
              : "Published"}
        </p>
        <h1 className="type-display mt-2">
          {published.draft
            ? locale === "hy"
              ? "Քարտեզին չի երևա, մինչև չհրապարակեք։"
              : "Kept off the map until you publish it."
            : locale === "hy"
              ? `${title}-ը քարտեզին է։`
              : `${title} is on the map.`}
        </h1>
        <p className="type-body mt-3 text-dim">
          {published.draft
            ? locale === "hy"
              ? "Բացեք այն հրապարակման սեղանից, երբ տվյալները պատրաստ լինեն։"
              : "Open it from your publishing desk when the details are ready."
            : locale === "hy"
              ? "Այժմ այն կարող են գտնել Երևանում այս շաբաթը դիտողները։"
              : "Anyone browsing This week in Yerevan can find it now."}
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {published.draft ? (
            <Link
              href="/organizer"
              className={buttonClass({ tone: "primary" })}
            >
              {locale === "hy"
                ? "Բացել հրապարակման սեղանը"
                : "Open publishing desk"}
            </Link>
          ) : (
            <>
              <Link
                href={`/event/${published.id}`}
                className={buttonClass({ tone: "primary" })}
              >
                {locale === "hy" ? "Դիտել միջոցառումը" : "View event"}
              </Link>
              <Link
                href={`/?mode=week&pin=${published.id}`}
                className={buttonClass({ tone: "secondary" })}
              >
                {t("openOnMap")}
              </Link>
              <a
                href={mapsPlaceUrl(pin)}
                target="_blank"
                rel="noreferrer"
                className={buttonClass({ tone: "quiet" })}
              >
                {t("directions")}
                <span className="sr-only"> (opens in a new tab)</span>
                <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden />
              </a>
            </>
          )}
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {backHref ? (
        <Link
          href={backHref}
          className={`${buttonClass({ tone: "quiet", size: "sm" })} -ml-3 mb-3`}
        >
          <ArrowLeft size={15} strokeWidth={2} aria-hidden />
          {editing
            ? locale === "hy"
              ? "Վերադառնալ սեղանին"
              : "Back to desk"
            : locale === "hy"
              ? "Վերադառնալ ընտրությանը"
              : "Back to choice"}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className={`${buttonClass({ tone: "quiet", size: "sm" })} -ml-3 mb-3`}
        >
          <ArrowLeft size={15} strokeWidth={2} aria-hidden />
          {editing
            ? locale === "hy"
              ? "Վերադառնալ սեղանին"
              : "Back to desk"
            : locale === "hy"
              ? "Վերադառնալ ընտրությանը"
              : "Back to choice"}
        </button>
      )}

      <header className="max-w-[720px]">
        <h1 className="type-display">
          {editing
            ? locale === "hy"
              ? "Ուղղեք տվյալները, նախքան մարդիկ կուղևորվեն այնտեղ։"
              : "Correct the details before people walk there."
            : locale === "hy"
              ? "Տվեք մարդկանց ծրագիր, որը կարող են պահել։"
              : "Give people a plan they can keep."}
        </h1>
        <p className="type-body mt-3 text-dim">
          {locale === "hy"
            ? "Սկսեք՝ ինչ, երբ և որտեղ հարցերից։ Աջ կողմի նախադիտումն այդպես կերևա ցանկում։"
            : "Start with what, when, and where. The preview on the right is how the list will read."}
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit(false);
        }}
        className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12"
      >
        <div className="space-y-8">
          <fieldset className="space-y-5">
            <legend className="mb-1 font-display text-[17px] font-medium">
              {locale === "hy" ? "Միջոցառման տվյալներ" : "Event details"}
            </legend>
            <FieldLabel
              label={t("title")}
              htmlFor="event-title"
              hint={fieldErrors.title}
            >
              <TextInput
                id="event-title"
                value={title}
                required
                minLength={3}
                maxLength={140}
                aria-invalid={Boolean(fieldErrors.title)}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={
                  locale === "hy"
                    ? "Կամերային երաժշտություն աշխատանքից հետո"
                    : "Chamber music after work"
                }
              />
            </FieldLabel>
            <FieldLabel
              label={t("organiserName")}
              htmlFor="event-organiser"
              hint={
                fieldErrors.organizer ??
                (locale === "hy"
                  ? "Երևում է միջոցառման էջում։ Դատարկ թողեք՝ հաշվի անունն օգտագործելու համար։"
                  : "Shown on the event. Leave blank to use your profile name.")
              }
            >
              <TextInput
                id="event-organiser"
                value={organizer}
                minLength={2}
                maxLength={80}
                aria-invalid={Boolean(fieldErrors.organizer)}
                onChange={(event) => setOrganizer(event.target.value)}
                placeholder="Mirzoyan Library"
              />
            </FieldLabel>
            <CategoryPicker value={category} onChange={setCategory} />
          </fieldset>

          <fieldset className="space-y-5 border-t border-line pt-7">
            <legend className="mb-1 font-display text-[17px] font-medium">
              {locale === "hy" ? "Ժամանակ և վայր" : "Time and place"}
            </legend>
            <FieldLabel
              label={t("starts")}
              htmlFor="event-starts"
              hint={locale === "hy" ? "Երևանի ժամով։" : "Yerevan time."}
            >
              <TextInput
                id="event-starts"
                type="datetime-local"
                value={startsAt}
                required
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </FieldLabel>
            <FieldLabel
              label={t("venue")}
              htmlFor="event-venue"
              hint={fieldErrors.venue}
            >
              <TextInput
                id="event-venue"
                value={venue}
                required
                minLength={2}
                maxLength={160}
                aria-invalid={Boolean(fieldErrors.venue)}
                onChange={(event) => setVenue(event.target.value)}
                placeholder="Mirzoyan Library"
              />
              {suggestions.length ? (
                <span className="mt-2 block overflow-hidden rounded-ctl border border-line bg-raised">
                  {suggestions.slice(0, 4).map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      className="block min-h-10 w-full px-3 py-2 text-left text-[13.5px] hover:bg-canvas"
                      onClick={() => {
                        setVenue(item.name);
                        setPin(item.coordinates);
                      }}
                    >
                      {item.name}
                      <span className="ml-2 text-[12px] text-dim">
                        {locale === "hy"
                          ? "տեղափոխում է նշիչը"
                          : "moves the pin"}
                      </span>
                    </button>
                  ))}
                </span>
              ) : null}
            </FieldLabel>
          </fieldset>

          <fieldset className="space-y-5 border-t border-line pt-7">
            <legend className="mb-1 font-display text-[17px] font-medium">
              {t("description")}
            </legend>
            <FieldLabel
              label={t("description")}
              htmlFor="event-description"
              hint={
                fieldErrors.description ??
                (locale === "hy"
                  ? "Ինչ է տեղի ունենալու, ում համար է, և ինչ պետք է բերել։"
                  : "What happens, who it is for, and anything people should bring.")
              }
            >
              <TextArea
                id="event-description"
                value={description}
                required
                minLength={8}
                maxLength={4000}
                rows={5}
                aria-invalid={Boolean(fieldErrors.description)}
                onChange={(event) => setDescription(event.target.value)}
              />
            </FieldLabel>
            <PhotoField preview={photo} onChange={readPhoto} />
          </fieldset>

          {error ? (
            <p
              role="alert"
              className="text-[13.5px] font-semibold text-apricot"
            >
              {error}
            </p>
          ) : null}

          <FormFooter
            note={
              locale === "hy"
                ? "Այն կարող եք խմբագրել կամ հանել քարտեզից կազմակերպչի էջում։"
                : "You can edit or unpublish it again from your organiser page."
            }
          >
            <Button type="submit" size="lg" disabled={Boolean(pending)}>
              {pending === "publish"
                ? t("publishingEvent")
                : editing
                  ? locale === "hy"
                    ? "Պահել և հրապարակել"
                    : "Save and publish"
                  : t("publishEvent")}
            </Button>
            {editing && initial?.published ? null : (
              <Button
                type="button"
                tone="secondary"
                size="lg"
                disabled={Boolean(pending)}
                onClick={() => void submit(true)}
              >
                {pending === "draft" ? t("saving") : t("saveDraft")}
              </Button>
            )}
          </FormFooter>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
          <PinPicker
            value={pin}
            onChange={setPin}
            category={category}
            label={
              locale === "hy"
                ? "Տեղադրեք նշիչը վայրի վրա"
                : "Place the pin on the venue"
            }
          />
          <div className="rounded-panel border border-line bg-raised p-4">
            <p className="text-[12px] font-medium text-dim">
              {locale === "hy" ? "Նախադիտում" : "Preview"}
            </p>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                className="mt-3 aspect-[4/3] w-full rounded-thumb object-cover"
              />
            ) : null}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="w-[52px] shrink-0 text-[12.5px] font-semibold tabular-nums text-dim">
                {formatYerevanWhen(startsAt).split(" ")[1] ?? "—"}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-medium leading-snug">
                  {title ||
                    (locale === "hy"
                      ? "Ձեր միջոցառման վերնագիրը"
                      : "Your event title")}
                </span>
                <span className="mt-1 block truncate text-[12.5px] text-dim">
                  {venue ||
                    (locale === "hy"
                      ? "Վայր Երևանում"
                      : "Venue in Yerevan")}{" "}
                  · {formatYerevanWhen(startsAt).split(" ")[0] ?? ""}
                </span>
              </span>
            </div>
            <p className="mt-3 line-clamp-4 text-[13px] leading-5 text-dim">
              {description ||
                (locale === "hy"
                  ? "Նկարագրությունը կհայտնվի միջոցառման էջում հրապարակելուց հետո։"
                  : "The description appears on the event page after you publish.")}
            </p>
          </div>
        </aside>
      </form>
    </Page>
  );
}

function yerevanIso(value: string) {
  return new Date(`${value}:00+04:00`).toISOString();
}
