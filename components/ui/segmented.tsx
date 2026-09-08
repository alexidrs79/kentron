"use client";

import { useRef, type CSSProperties, type KeyboardEvent } from "react";

const sizes = {
  sm: "min-h-11 px-3 text-[12.5px]",
  md: "min-h-11 px-3.5 text-[13px] sm:px-4",
} as const;

/** The one timeline switch, floating over the map or sitting inside a panel. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  size = "md",
  className = "",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const active = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = (active + delta + options.length) % options.length;
    onChange(options[next].value);
    buttons.current[next]?.focus();
  }

  // Equal columns are what let the clip below be expressed as a percentage,
  // so the selected segment is correct on the server with nothing measured.
  const columns = {
    gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
  } satisfies CSSProperties;
  // All four sides in the same unit, so the browser interpolates the inset
  // directly instead of falling back to a calc() blend.
  const segment = 100 / options.length;
  const clip = `inset(0% ${(options.length - 1 - active) * segment}% 0% ${
    active * segment
  }% round 9px)`;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      style={columns}
      className={`relative inline-grid w-full shrink-0 rounded-ctl border border-line bg-panel p-[3px] shadow-float md:w-auto ${className}`}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(node) => {
            buttons.current[index] = node;
          }}
          type="button"
          role="radio"
          aria-checked={index === active}
          tabIndex={index === active ? 0 : -1}
          onClick={() => onChange(option.value)}
          // 36px segments inside 3px padding and a hairline make the pill
          // exactly 44px, the shared height of every floating control.
          className={`whitespace-nowrap rounded-[9px] font-medium text-dim hover:text-fg ${sizes[size]}`}
        >
          {option.label}
        </button>
      ))}

      {/*
        A copy of the whole switch in its selected styling, revealed only over
        the active segment. Both layers carry the same weight and metrics, so
        the sweep changes colour without ever showing two sets of type. The
        radius belongs to the clip, not to the segments: rounding them
        individually would notch the pill's waist as it crosses the seam.
      */}
      <div
        aria-hidden
        style={{ ...columns, clipPath: clip }}
        className="segmented-active pointer-events-none absolute inset-[3px] grid"
      >
        {options.map((option) => (
          <span
            key={option.value}
            className={`grid place-items-center whitespace-nowrap bg-fg font-medium text-canvas ${sizes[size]}`}
          >
            {option.label}
          </span>
        ))}
      </div>
    </div>
  );
}
