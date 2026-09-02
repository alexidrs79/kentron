"use client";

import { categories, type EventCategory } from "@/lib/create/fields";

export function CategoryPicker({
  value,
  onChange,
}: {
  value: EventCategory;
  onChange: (value: EventCategory) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-paper">Category</legend>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((category) => {
          const selected = value === category.id;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(category.id)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-sm transition-colors ${
                selected
                  ? "border-paper bg-paper text-dusk"
                  : "border-line text-paper-2 hover:text-paper"
              }`}
            >
              <span
                className={`size-2.5 ${
                  category.id === "tech"
                    ? "rounded-[2px] bg-pin-tech"
                    : category.id === "creative"
                      ? "rotate-45 bg-pin-creative"
                      : "rounded-full bg-pin-market"
                }`}
                aria-hidden
              />
              {category.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function PhotoField({
  required,
  preview,
  onChange,
}: {
  required?: boolean;
  preview: string | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-paper">
        Photo{required ? "" : " (optional)"}
      </span>
      <span className="flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-dusk text-sm text-paper-2">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-36 w-full object-cover" />
        ) : (
          "Tap to add a photo"
        )}
      </span>
      <input
        type="file"
        accept="image/*"
        required={required}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

export const fieldClass =
  "w-full min-h-11 rounded-xl border border-line bg-dusk px-3 text-sm text-paper outline-none";
