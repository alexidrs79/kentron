/*
  The Kentron mark: Ararat's two peaks inside a map pin.

  Vector rather than the raster original so it stays crisp at 24px and does not
  carry a baked-in dark square onto a panel. Geometry is traced from the source
  artwork: the mountain is a two-peak polygon whose outer slopes are cut by a
  circle, which is why the silhouette can be a single closed path.

  Two tones, because the source artwork only works on its own tile:
  - "apricot" (default) reverses the fills so the pin keeps a silhouette on the
    dark UI. A dark-bodied pin on a dark panel disappears below about 40px.
  - "night" is the original artwork, for large display on its own light or
    tiled background.

  Brand colours are hardcoded. A logo should not re-tint itself when the
  surrounding theme tokens move.
*/

const NIGHT = "#121110";
const APRICOT = "#F5A65B";

const PIN =
  "M256 426A256 256 0 0 1 768 426C768 505 600 792 512 792C424 792 256 505 256 426Z";

const MOUNTAIN =
  "M339.5 472.3L467 303L559 432L597 352L684.3 472.9A178 178 0 0 1 339.5 472.3Z";

// Snowcap gaps, painted in the pin colour so they read as notches.
const CAP_LEFT = "M463 331L522 413L486 388L464 418L441 388L405 413Z";
const CAP_RIGHT = "M597 382L618 411L597 403L576 411Z";

export function KentronMark({
  className = "",
  tone = "apricot",
}: {
  className?: string;
  tone?: "apricot" | "night";
}) {
  const night = tone === "night";
  const pinFill = night ? NIGHT : APRICOT;
  const mountainFill = night ? APRICOT : NIGHT;

  return (
    <svg
      viewBox="232 146 560 732"
      className={className}
      role="img"
      aria-label="Kentron"
      fill="none"
    >
      {night ? (
        <ellipse
          cx="512"
          cy="821"
          rx="143"
          ry="31"
          fill={NIGHT}
          opacity="0.55"
        />
      ) : null}
      <path d={PIN} fill={pinFill} />
      <path d={MOUNTAIN} fill={mountainFill} />
      <path d={CAP_LEFT} fill={pinFill} />
      <path d={CAP_RIGHT} fill={pinFill} />
      {night ? <circle cx="512" cy="743" r="20" fill={APRICOT} /> : null}
    </svg>
  );
}

/** Mark plus the Armenian wordmark, for auth and other full-bleed moments. */
export function KentronLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <KentronMark className="h-9 w-auto" />
      <span className="armenian text-[24px] font-semibold leading-none tracking-[-0.01em]">
        Կենտրոն
      </span>
    </span>
  );
}
