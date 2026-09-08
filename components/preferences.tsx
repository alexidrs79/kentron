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
import type { TimeMode } from "@/lib/map/fixtures";
import {
  clearGuestPreferences,
  readGuestPreferences,
  writeGuestPreferences,
} from "@/lib/preferences-storage";
import { createClient } from "@/lib/supabase/client";

export type DistanceUnit = "km" | "mi";
export type ThemePreference = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

export interface Preferences {
  /** Which timeline the map opens on. */
  defaultMode: TimeMode;
  units: DistanceUnit;
  /** Follow the machine, or lock dark / light. */
  theme: ThemePreference;
  /** Forces the reduced-motion floor without changing the OS setting. */
  reduceMotion: boolean;
  /** Local reminders for saved events. */
  savedReminders: boolean;
  /** Local activity when something goes live in Yerevan. */
  nearbyAlerts: boolean;
}

export const defaultPreferences: Preferences = {
  defaultMode: "now",
  units: "km",
  theme: "system",
  reduceMotion: false,
  savedReminders: true,
  nearbyAlerts: true,
};

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function resolveTheme(theme: ThemePreference): ResolvedTheme {
  if (theme === "system") return systemPrefersDark() ? "dark" : "light";
  return theme;
}

function applyTheme(theme: ThemePreference) {
  const resolved = resolveTheme(theme);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "light" ? "#EDE6DA" : "#121110");
  }
}

interface PreferencesValue {
  preferences: Preferences;
  /** False until the account profile has been read. */
  ready: boolean;
  resolvedTheme: ResolvedTheme;
  update: (patch: Partial<Preferences>) => void;
  reset: () => void;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const guest = readGuestPreferences();
      let next = { ...defaultPreferences, ...guest };
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select(
            "theme,distance_unit,default_timeline,reduce_motion,saved_reminders,nearby_alerts",
          )
          .eq("id", user.id)
          .single();
        if (guest) {
          next = { ...defaultPreferences, ...guest };
          await persistPreferencePatch(next, next);
          clearGuestPreferences();
        } else if (data) {
          next = {
            theme: data.theme,
            units: data.distance_unit,
            defaultMode: data.default_timeline,
            reduceMotion: data.reduce_motion,
            savedReminders: data.saved_reminders,
            nearbyAlerts: data.nearby_alerts,
          };
        }
      }
      if (!active) return;
      setPreferences(next);
      applyTheme(next.theme);
      setResolvedTheme(resolveTheme(next.theme));
      setReady(true);
    }

    void load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => void load());
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.reduceMotion = String(
      preferences.reduceMotion,
    );
  }, [ready, preferences.reduceMotion]);

  useEffect(() => {
    if (!ready) return;
    applyTheme(preferences.theme);
    setResolvedTheme(resolveTheme(preferences.theme));
    if (preferences.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
      setResolvedTheme(resolveTheme("system"));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [ready, preferences.theme]);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      void persistPreferencePatch(next, patch);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPreferences(defaultPreferences);
    void persistPreferences(defaultPreferences);
  }, []);

  const value = useMemo(
    () => ({ preferences, ready, resolvedTheme, update, reset }),
    [preferences, ready, resolvedTheme, update, reset],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

async function persistPreferences(preferences: Preferences) {
  return persistPreferencePatch(preferences, preferences);
}

async function persistPreferencePatch(
  next: Preferences,
  patch: Partial<Preferences>,
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    writeGuestPreferences(next);
    return;
  }
  const values: Record<string, boolean | string> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.theme !== undefined) values.theme = patch.theme;
  if (patch.units !== undefined) values.distance_unit = patch.units;
  if (patch.defaultMode !== undefined) {
    values.default_timeline = patch.defaultMode;
  }
  if (patch.reduceMotion !== undefined) {
    values.reduce_motion = patch.reduceMotion;
  }
  if (patch.savedReminders !== undefined) {
    values.saved_reminders = patch.savedReminders;
  }
  if (patch.nearbyAlerts !== undefined) {
    values.nearby_alerts = patch.nearbyAlerts;
  }
  await supabase.from("profiles").update(values).eq("id", user.id);
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("PreferencesProvider is missing");
  return value;
}
