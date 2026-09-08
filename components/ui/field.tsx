import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const fieldClass =
  "w-full min-h-11 rounded-ctl border border-line bg-raised px-3.5 text-[15px] text-fg outline-none placeholder:text-faint focus:border-apricot";

export function FieldLabel({
  label,
  hint,
  children,
  aside,
  htmlFor,
}: {
  label: string;
  hint?: string;
  aside?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-fg">
          {label}
        </label>
        {aside}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-xs text-dim">{hint}</span>
      ) : null}
    </div>
  );
}

export function TextInput({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${fieldClass} ${className}`} />;
}

export function TextArea({
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={`${fieldClass} min-h-24 py-2.5 leading-6 ${className}`}
    />
  );
}

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={`${fieldClass} pr-8 ${className}`}>
      {children}
    </select>
  );
}

/** A settings row with a real checkbox behind a switch-shaped control. */
export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 py-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-fg">{label}</span>
        {description ? (
          <span className="mt-1 block max-w-[52ch] text-[13px] leading-5 text-dim">
            {description}
          </span>
        ) : null}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`block h-6 w-11 rounded-full border transition-colors duration-150 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-apricot ${
            checked ? "border-apricot bg-apricot" : "border-line bg-raised"
          }`}
        >
          {/* The knob's travel and its colour run on the same clock, so the
              switch reads as one object crossing rather than two changes. */}
          <span
            aria-hidden
            className={`kentron-toggle-knob mt-0.5 ml-0.5 block size-4 rounded-full transition-[transform,background-color] duration-[180ms] [transition-timing-function:var(--ease-out-soft)] motion-reduce:transition-none ${
              checked
                ? "translate-x-5 bg-on-apricot"
                : "translate-x-0 bg-dim/60"
            }`}
          />
        </span>
      </span>
    </label>
  );
}
