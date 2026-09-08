"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGE_STORAGE_KEY,
  LOCALE_COOKIE,
  resolveLocale,
  t as translate,
  type LanguagePreference,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";

interface LocaleValue {
  preference: LanguagePreference;
  locale: Locale;
  setPreference: (preference: LanguagePreference) => void;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleValue | null>(null);

function readStoredPreference(): LanguagePreference {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "en" || stored === "hy" || stored === "system") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "system";
}

function persist(preference: LanguagePreference, locale: Locale) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, preference);
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
  document.documentElement.lang = locale;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [preference, setPreferenceState] =
    useState<LanguagePreference>("system");
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    const nextPreference = readStoredPreference();
    const nextLocale =
      nextPreference === "system"
        ? initialLocale
        : resolveLocale(nextPreference);
    setPreferenceState(nextPreference);
    setLocale(nextLocale);
    persist(nextPreference, nextLocale);
  }, [initialLocale]);

  const setPreference = useCallback((next: LanguagePreference) => {
    const resolved = resolveLocale(next);
    setPreferenceState(next);
    setLocale(resolved);
    persist(next, resolved);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      locale,
      setPreference,
      t: (key: MessageKey) => translate(locale, key),
    }),
    [preference, locale, setPreference],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider is missing");
  return value;
}
