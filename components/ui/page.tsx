import type { ReactNode } from "react";

/**
 * Every non-map route. Same canvas as the map, content offset to clear
 * the floating dock. Spatial pages share one 1220 measure; linear pages
 * stay at a reading width.
 */
export function Page({
  children,
  width = "spatial",
}: {
  children: ReactNode;
  width?: "spatial" | "wide" | "read";
}) {
  const measure =
    width === "read"
      ? "max-w-[68ch]"
      : width === "wide"
        ? "max-w-[1220px]"
        : "max-w-[1220px]";

  return (
    <div className="scroll-dark min-h-[calc(100dvh-76px)] bg-canvas text-fg md:min-h-dvh">
      <div className="md:ml-[88px]">
        <div
          className={`mx-auto w-full px-5 pb-16 pt-6 md:px-10 md:pb-20 md:pt-10 ${measure}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function PageHead({
  title,
  description,
  action,
  size = "md",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-6">
      <div className="min-w-0">
        <h1 className={size === "lg" ? "type-display" : "type-title"}>
          {title}
        </h1>
        {description ? (
          <p className="type-body mt-2 text-dim">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </header>
  );
}

/** A titled band with an optional right-hand count or control. */
export function SectionHead({
  title,
  meta,
  action,
  className = "",
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 ${className}`}
    >
      <h2 className="type-lede">{title}</h2>
      <div className="flex items-baseline gap-3">
        {meta ? <p className="type-meta text-dim">{meta}</p> : null}
        {action}
      </div>
    </div>
  );
}

/** Small type used for meta lines, always tabular so numbers line up. */
export function Meta({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`type-meta text-dim ${className}`}>{children}</p>;
}

/** The one framed container: a floating panel on the dark canvas. */
export function Panel({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-panel border border-line bg-panel shadow-float ${
        padded ? "p-5 md:p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Shared interior desk: one floating panel used by Saved, Organizer,
 * Settings, and Profile so those routes read as one instrument.
 */
export function Desk({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-panel border border-line bg-panel shadow-float ${className}`}
    >
      {children}
    </section>
  );
}

export function DeskHead({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-line px-5 py-5 md:px-8 md:py-6">
      <div className="min-w-0 flex-1">
        <h1 className="type-title">{title}</h1>
        {meta ? <div className="type-meta mt-1.5 text-dim">{meta}</div> : null}
      </div>
      {action}
    </header>
  );
}

export function EmptyNote({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Panel>
      <p className="type-lede">{title}</p>
      <p className="type-body mt-2 text-dim">{body}</p>
      {action ? (
        <div className="mt-5 flex flex-wrap gap-2">{action}</div>
      ) : null}
    </Panel>
  );
}
