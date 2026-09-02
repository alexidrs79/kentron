# Shared components

The project uses hand-built components rather than a component library.

## PhasePlaceholder

- Path: `components/phase-placeholder.tsx`
- Shared route placeholder used outside the home map.
- Props: `title`, `route`

```tsx
import Link from "next/link";

export function PhasePlaceholder({
  title,
  route,
}: {
  title: string;
  route: string;
}) {
  return (
    <section className="grid min-h-[calc(100dvh-72px)] place-items-center px-6 md:min-h-dvh">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-surface p-8 sm:p-10">
        <p className="font-mono text-xs text-paper-2">{route}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em]">
          {title}
        </h1>
        <p className="mt-4 max-w-md leading-7 text-paper-2">
          The route is in place. Its product UI arrives in its own build phase.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-medium text-paper transition-colors hover:bg-line"
        >
          Back to the map
        </Link>
      </div>
    </section>
  );
}
```
