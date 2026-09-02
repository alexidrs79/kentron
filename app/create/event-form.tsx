"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PinPicker } from "@/components/pin-picker";
import { useLocalRecords } from "@/components/local-records";
import {
  formatYerevanWhen,
  knownPlaces,
  slugId,
  yerevanDateTimeLocal,
} from "@/lib/create/fields";
import type { EventCategory } from "@/lib/map/fixtures";
import { CategoryPicker, PhotoField, fieldClass } from "./fields";

const CENTER: [number, number] = [44.5136, 40.1811];

export function EventForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { addEvent } = useLocalRecords();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("tech");
  const [startsAt, setStartsAt] = useState(yerevanDateTimeLocal);
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [weekly, setWeekly] = useState(false);
  const [pin, setPin] = useState<readonly [number, number]>(CENTER);
  const [error, setError] = useState("");

  const suggestions = useMemo(
    () =>
      venue.trim().length < 2
        ? []
        : knownPlaces.filter((item) =>
            item.name.toLowerCase().includes(venue.toLowerCase()),
          ),
    [venue],
  );

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
    if (!title.trim() || !venue.trim() || !description.trim()) {
      setError("Add a title, venue, and a short description.");
      return;
    }
    addEvent({
      id: slugId("event"),
      title: title.trim(),
      venue: venue.trim(),
      category,
      when: weekly
        ? `${formatYerevanWhen(startsAt)} · weekly`
        : formatYerevanWhen(startsAt),
      isWeekly: weekly,
      coordinates: pin,
    });
    router.push("/?mode=week");
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
        Planned for later
      </h1>
      <p className="text-sm leading-6 text-paper-2">
        An event people can find and save this week.
      </p>
      <label className="block">
        <span className="mb-2 block text-sm text-paper">Title</span>
        <input
          value={title}
          required
          onChange={(event) => setTitle(event.target.value)}
          className={fieldClass}
        />
      </label>
      <CategoryPicker value={category} onChange={setCategory} />
      <label className="block">
        <span className="mb-2 block text-sm text-paper">
          Starts (Yerevan time)
        </span>
        <input
          type="datetime-local"
          value={startsAt}
          required
          onChange={(event) => setStartsAt(event.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-paper">Venue</span>
        <input
          value={venue}
          required
          onChange={(event) => setVenue(event.target.value)}
          className={fieldClass}
        />
        {suggestions.length > 0 && (
          <ul className="mt-2 overflow-hidden rounded-xl border border-line">
            {suggestions.slice(0, 4).map((item) => (
              <li key={item.name}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-line"
                  onClick={() => {
                    setVenue(item.name);
                    setPin(item.coordinates);
                  }}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </label>
      <PinPicker
        value={pin}
        onChange={setPin}
        accent={category}
        label="Place the pin on the venue"
      />
      <label className="block">
        <span className="mb-2 block text-sm text-paper">Description</span>
        <textarea
          value={description}
          required
          rows={4}
          onChange={(event) => setDescription(event.target.value)}
          className={`${fieldClass} min-h-28 py-3`}
        />
      </label>
      <PhotoField preview={photo} onChange={readPhoto} />
      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          checked={weekly}
          onChange={(event) => setWeekly(event.target.checked)}
          className="mt-1 size-4 accent-tuff"
        />
        <span>
          This happens weekly
          <span className="mt-1 block text-paper-2">
            Keeps a reusable draft for next week. Not an automated series.
          </span>
        </span>
      </label>
      {error ? <p className="text-sm text-tuff">{error}</p> : null}
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-xl bg-tuff px-5 text-sm font-medium text-dusk transition-colors hover:bg-[#df7668]"
      >
        Publish
      </button>
    </form>
  );
}
