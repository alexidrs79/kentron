import type { Preferences } from "@/components/preferences";

export const PREFERENCES_STORAGE_KEY = "kentron-preferences";

export function readGuestPreferences(): Partial<Preferences> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = JSON.parse(
      localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "null",
    ) as Partial<Preferences> | null;
    return raw && typeof raw === "object" ? raw : null;
  } catch {
    return null;
  }
}

export function writeGuestPreferences(preferences: Preferences) {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

export function clearGuestPreferences() {
  localStorage.removeItem(PREFERENCES_STORAGE_KEY);
}
