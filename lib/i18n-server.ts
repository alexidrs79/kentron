import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export async function getServerLocale(): Promise<Locale> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (stored === "hy" || stored === "en") return stored;

  const language =
    (await headers()).get("accept-language")?.toLowerCase() ?? "";
  return language.startsWith("hy") || language.includes(",hy") ? "hy" : "en";
}
