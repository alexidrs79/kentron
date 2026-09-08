/** Keep return paths inside Kentron, including after browser URL normalization. */
export function safeReturnTo(value: unknown, fallback = "/profile") {
  const path = typeof value === "string" ? value : "";
  const unsafe =
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /%5c/i.test(path) ||
    /[\u0000-\u001f\u007f]/.test(path);
  return unsafe ? fallback : path;
}

export type AuthIntent =
  | "save"
  | "report"
  | "create-live"
  | "create-event"
  | "create"
  | "saved"
  | "profile"
  | "organizer"
  | "edit-profile";

const intents = new Set<AuthIntent>([
  "save",
  "report",
  "create-live",
  "create-event",
  "create",
  "saved",
  "profile",
  "organizer",
  "edit-profile",
]);

export function parseAuthIntent(value: unknown): AuthIntent | undefined {
  return typeof value === "string" && intents.has(value as AuthIntent)
    ? (value as AuthIntent)
    : undefined;
}

export function intentFromReturnTo(returnTo: string): AuthIntent | undefined {
  const path = returnTo.split("?")[0] ?? returnTo;
  if (path.startsWith("/create")) {
    if (returnTo.includes("kind=live")) return "create-live";
    if (returnTo.includes("kind=event")) return "create-event";
    return "create";
  }
  if (path.startsWith("/saved")) return "saved";
  if (path.startsWith("/organizer")) return "organizer";
  if (path.startsWith("/profile/edit")) return "edit-profile";
  if (path.startsWith("/profile")) return "profile";
  if (path.startsWith("/event/") || path.startsWith("/post/")) return "save";
  return undefined;
}

export function loginHref(
  returnTo: string,
  intent?: AuthIntent,
  about?: string,
) {
  const next = safeReturnTo(returnTo);
  const inferred = intent ?? intentFromReturnTo(next);
  const params = new URLSearchParams({ returnTo: next });
  if (inferred) params.set("intent", inferred);
  const label = about?.trim().slice(0, 80);
  if (label) params.set("about", label);
  return `/login?${params.toString()}`;
}
