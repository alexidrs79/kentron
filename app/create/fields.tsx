"use client";

import { ImagePlus } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { categories, type EventCategory } from "@/lib/create/fields";
import { categoryName } from "@/lib/content";

/**
 * Category chooses the marker color and pictogram as well as search grouping.
 */
export function CategoryPicker({
  value,
  onChange,
}: {
  value: EventCategory;
  onChange: (value: EventCategory) => void;
}) {
  const { locale, t } = useLocale();
  return (
    <fieldset>
      <legend className="mb-1.5 text-[13px] font-semibold text-fg">
        {t("category")}
      </legend>
      <div className="grid max-w-[560px] grid-cols-2 gap-0.5 rounded-ctl border border-line bg-panel p-0.5 sm:grid-cols-3">
        {categories.map((category) => {
          const selected = value === category.id;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(category.id)}
              className={`min-h-13 rounded-[9px] px-3 py-2 text-[12.5px] leading-4 font-semibold ${
                selected ? "bg-fg text-canvas" : "text-dim hover:text-fg"
              }`}
            >
              {categoryName(category.id, locale)}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-dim">
        {locale === "hy"
          ? "Ընտրում է քարտեզի նշիչի գույնն ու պատկերակը։"
          : "Chooses the map marker color and icon."}
      </p>
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
  const { locale, t } = useLocale();
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-fg">
        {t("photo")}
        {!required
          ? locale === "hy"
            ? " (ըստ ցանկության)"
            : " (optional)"
          : ""}
      </span>
      <span className="flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-panel border border-dashed border-line bg-panel text-[13.5px] text-dim hover:border-apricot/60 hover:text-fg">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <span className="flex items-center gap-2">
            <ImagePlus size={17} strokeWidth={1.9} aria-hidden />
            {t("choosePhoto")}
          </span>
        )}
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        required={required}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

/** Sticky action bar so submit is always reachable in a long form. */
export function FormFooter({
  children,
  note,
}: {
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="sticky bottom-[72px] z-10 -mx-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-canvas/92 px-5 py-3 backdrop-blur-md md:bottom-0 md:mx-0 md:rounded-b-card md:px-0">
      {children}
      {note ? <p className="text-[12.5px] text-dim">{note}</p> : null}
    </div>
  );
}
