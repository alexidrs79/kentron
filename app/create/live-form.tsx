"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PinPicker } from "@/components/pin-picker";
import { useLocalRecords } from "@/components/local-records";
import { CAPTION_LIMIT, knownPlaces, slugId } from "@/lib/create/fields";
import type { EventCategory } from "@/lib/map/fixtures";
import { CategoryPicker, PhotoField, fieldClass } from "./fields";

const CENTER: [number, number] = [44.5136, 40.1811];

function nearestPlace(pin: readonly [number, number]) {
  return knownPlaces.reduce((closest, place) => {
    const next =
      (place.coordinates[0] - pin[0]) ** 2 +
      (place.coordinates[1] - pin[1]) ** 2;
    const current =
      (closest.coordinates[0] - pin[0]) ** 2 +
      (closest.coordinates[1] - pin[1]) ** 2;
    return next < current ? place : closest;
  }).name;
}

export function LiveForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { addPulse } = useLocalRecords();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<EventCategory>("creative");
  const [pin, setPin] = useState<readonly [number, number]>(CENTER);
  const [error, setError] = useState("");

  function readPhoto(file: File | null) {
    if (!file) {
      setPhoto(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!photo || caption.trim().length < 8) {
      setError("Add a photo and a short caption.");
      return;
    }
    addPulse({
      id: slugId("pulse"),
      caption: caption.trim(),
      place: nearestPlace(pin),
      category,
      ageMinutes: 1,
      coordinates: pin,
    });
    router.push("/");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-paper-2 hover:text-paper"
      >
        Back
      </button>
      <h1 className="font-display text-3xl font-semibold tracking-[-0.04em]">
        Happening now
      </h1>
      <p className="text-sm leading-6 text-paper-2">
        A live post. It fades, then it is gone.
      </p>
      <PhotoField required preview={photo} onChange={readPhoto} />
      <label className="block">
        <span className="mb-2 flex items-center justify-between text-sm text-paper">
          Caption
          <span className="font-mono text-[11px] text-paper-2">
            {caption.length}/{CAPTION_LIMIT}
          </span>
        </span>
        <textarea
          value={caption}
          maxLength={CAPTION_LIMIT}
          rows={3}
          required
          onChange={(event) => setCaption(event.target.value)}
          className={`${fieldClass} min-h-24 py-3`}
        />
      </label>
      <CategoryPicker value={category} onChange={setCategory} />
      <PinPicker
        value={pin}
        onChange={setPin}
        accent="live"
        label="Drag the pin to where it is"
      />
      {error ? <p className="text-sm text-tuff">{error}</p> : null}
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-xl bg-tuff px-5 text-sm font-medium text-dusk transition-colors hover:bg-[#df7668]"
      >
        Post
      </button>
    </form>
  );
}
