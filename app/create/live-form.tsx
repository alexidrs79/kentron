"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PinPicker } from "@/components/pin-picker";
import { useLocale } from "@/components/locale-provider";
import { Button, buttonClass } from "@/components/ui/button";
import { FieldLabel, TextArea } from "@/components/ui/field";
import { Page } from "@/components/ui/page";
import { CAPTION_LIMIT, knownPlaces } from "@/lib/create/fields";
import type { EventCategory } from "@/lib/map/fixtures";
import { createClient } from "@/lib/supabase/client";
import { imageValidationError, uploadDataImage } from "@/lib/supabase/media";
import { CategoryPicker, FormFooter, PhotoField } from "./fields";

const CENTER: readonly [number, number] = [44.5136, 40.1811];

function nearestPlace(pin: readonly [number, number]) {
  return knownPlaces.reduce((closest, place) => {
    const next =
      (place.coordinates[0] - pin[0]) ** 2 +
      (place.coordinates[1] - pin[1]) ** 2;
    const current =
      (closest.coordinates[0] - pin[0]) ** 2 +
      (closest.coordinates[1] - pin[1]) ** 2;
    return next < current ? place : closest;
  });
}

export function LiveForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<EventCategory>("creative");
  const [pin, setPin] = useState<readonly [number, number]>(CENTER);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { locale, t } = useLocale();

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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!photo || caption.trim().length < 8) {
      setError(
        locale === "hy"
          ? "Ավելացրեք լուսանկար և առնվազն ութ նիշանոց գրառում։"
          : "A photo and a caption of at least eight characters.",
      );
      return;
    }
    setPending(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // Released before navigating: coming back would otherwise leave the
      // submit button disabled forever.
      setPending(false);
      router.push(`/login?returnTo=${encodeURIComponent("/create?kind=live")}`);
      return;
    }

    try {
      const imagePath = await uploadDataImage(photo, user.id, "live");
      const place = nearestPlace(pin);
      const { error: insertError } = await supabase.from("live_posts").insert({
        owner_id: user.id,
        caption: caption.trim(),
        place_name: place.name,
        category,
        image_path: imagePath,
        // Live posts identify a public place, never the reporter's exact pin.
        lat: place.coordinates[1],
        lng: place.coordinates[0],
      });
      if (insertError) throw insertError;
      window.dispatchEvent(new Event("kentron-records-change"));
    } catch {
      setError(
        locale === "hy"
          ? "Ուղիղ գրառումը չհրապարակվեց։ Կրկին փորձեք։"
          : "The live post could not be published. Try again.",
      );
      setPending(false);
      return;
    }
    router.push("/?mode=now");
    router.refresh();
  }

  return (
    <Page>
      <button
        type="button"
        onClick={onBack}
        className={`${buttonClass({ tone: "quiet", size: "sm" })} -ml-3 mb-3`}
      >
        <ArrowLeft size={15} strokeWidth={2} aria-hidden />
        {locale === "hy" ? "Վերադառնալ ընտրությանը" : "Back to choice"}
      </button>

      <header className="max-w-[680px]">
        <h1 className="type-display">
          {locale === "hy"
            ? "Հրապարակեք այն, ինչ տեսնում եք։"
            : "Post what you can see."}
        </h1>
        <p className="type-body mt-3 text-dim">
          {locale === "hy"
            ? "Այն երևում է առանց ձեր անվան և մի քանի ժամ անց անհետանում է։ Դուք կարող եք այն հեռացնել ձեր հաշվից։"
            : "It appears without your name and fades after a few hours. Your account can remove it."}
        </p>
      </header>

      <form
        onSubmit={submit}
        className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12"
      >
        <div className="space-y-6">
          <PhotoField required preview={photo} onChange={readPhoto} />

          <FieldLabel
            label={t("caption")}
            htmlFor="live-caption"
            hint={
              locale === "hy"
                ? "Նկարագրեք՝ ինչ կտեսնի մարդը, եթե մոտենա։"
                : "Say what someone would see if they walked over."
            }
            aside={
              <span className="text-[11.5px] tabular-nums text-dim">
                {caption.length}/{CAPTION_LIMIT}
              </span>
            }
          >
            <TextArea
              id="live-caption"
              value={caption}
              maxLength={CAPTION_LIMIT}
              rows={3}
              required
              onChange={(event) => setCaption(event.target.value)}
              placeholder={
                locale === "hy"
                  ? "Դուդուկ և կիթառ՝ վերևի աստիճաններին"
                  : "Duduk and guitar on the upper steps"
              }
            />
          </FieldLabel>

          <CategoryPicker value={category} onChange={setCategory} />

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
                ? "Հանրության համար անանուն, ձեր հաշվում՝ ձեզ պատկանող։"
                : "Publicly anonymous, privately owned by your account."
            }
          >
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? t("posting") : t("postLive")}
            </Button>
          </FormFooter>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <PinPicker
            value={pin}
            onChange={setPin}
            category={category}
            label={locale === "hy" ? "Որտե՞ղ է" : "Where is it?"}
            hint={`${locale === "hy" ? "Հանրային վայր" : "Public location"}: ${nearestPlace(pin).name}`}
          />
          <p className="mt-3 border-t border-line pt-3 text-[13px] leading-6 text-dim">
            {locale === "hy"
              ? "Նշիչը կլորացվում է հանրային վայրի անունով, ուստի ձեր ճշգրիտ դիրքը երբեք չի հրապարակվում։"
              : "The pin is rounded to a public place name, so your exact position is never published."}
          </p>
        </aside>
      </form>
    </Page>
  );
}
