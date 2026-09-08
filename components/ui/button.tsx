import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonTone = "primary" | "secondary" | "quiet";

export type ButtonSize = "sm" | "md" | "lg";

const tones: Record<ButtonTone, string> = {
  primary: "bg-apricot text-on-apricot hover:bg-apricot-soft",
  secondary:
    "border border-line bg-panel text-fg hover:border-dim/50 hover:bg-raised",
  quiet: "text-dim hover:bg-raised hover:text-fg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "type-ui min-h-11 gap-1.5 px-3",
  md: "type-ui min-h-11 gap-2 px-4",
  lg: "type-ui min-h-12 gap-2 px-5",
};

export function buttonClass({
  tone = "primary",
  size = "md",
  block = false,
}: {
  tone?: ButtonTone;
  size?: ButtonSize;
  block?: boolean;
} = {}) {
  return [
    "inline-flex shrink-0 items-center justify-center rounded-ctl font-semibold",
    // Button-sized, so it takes the deeper press from globals.css.
    "[--press-scale:0.97]",
    "disabled:cursor-not-allowed disabled:opacity-45",
    tones[tone],
    sizes[size],
    block ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  tone,
  size,
  block,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  size?: ButtonSize;
  block?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      {...rest}
      className={`${buttonClass({ tone, size, block })} ${className}`}
    >
      {children}
    </button>
  );
}
