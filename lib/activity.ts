"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalRecords } from "@/components/local-records";
import { usePreferences, type Preferences } from "@/components/preferences";
import { parseWhen, weekdayName } from "@/lib/content";
import type { LivePulse, PlannedEvent } from "@/lib/map/fixtures";
import { formatAge } from "@/lib/map/viewport";
import { useSavedEvents } from "@/lib/saved-events";
import { createClient } from "@/lib/supabase/client";

export type ActivityKind = "reminder" | "nearby";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  meta: string;
  href: string;
  imageUrl?: string;
  /** Smaller sorts first: most immediate at the top. */
  sortKey: number;
}

/**
 * Activity is derived from account-owned saves and current public live posts.
 * Read state is stored on the account.
 */
export function buildActivity({
  savedEvents,
  pulses,
  preferences,
}: {
  savedEvents: PlannedEvent[];
  pulses: LivePulse[];
  preferences: Preferences;
}) {
  const items: ActivityItem[] = [];

  if (preferences.savedReminders) {
    savedEvents.forEach((event, index) => {
      const { day, time } = parseWhen(event.when);
      items.push({
        id: `reminder-${event.id}`,
        kind: "reminder",
        title: event.title,
        meta: `Saved · ${weekdayName(day)} ${time} · ${event.venue}`,
        href: `/event/${event.id}`,
        sortKey: 1_000 + index,
      });
    });
  }

  if (preferences.nearbyAlerts) {
    for (const pulse of pulses) {
      if (pulse.ageMinutes > 120) continue;
      items.push({
        id: `nearby-${pulse.id}`,
        kind: "nearby",
        title: pulse.caption,
        meta: `${pulse.place} · ${formatAge(pulse.ageMinutes)}`,
        href: `/post/${pulse.id}`,
        imageUrl: pulse.imageUrl,
        sortKey: pulse.ageMinutes,
      });
    }
  }

  return items.sort((a, b) => a.sortKey - b.sortKey);
}

export function useActivity() {
  const { events, pulses } = useLocalRecords();
  const { preferences } = usePreferences();
  const { ids } = useSavedEvents();
  const [read, setRead] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    async function sync() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) setRead([]);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("activity_read_ids")
        .eq("id", user.id)
        .single();
      if (active) setRead(data?.activity_read_ids ?? []);
    }
    void sync();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => void sync());
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const items = useMemo(
    () =>
      buildActivity({
        savedEvents: events.filter((event) => ids?.includes(event.id)),
        pulses,
        preferences,
      }),
    [events, pulses, ids, preferences],
  );

  const unread = useMemo(
    () => (read ? items.filter((item) => !read.includes(item.id)) : []),
    [items, read],
  );

  const markAllRead = useCallback(async () => {
    const next = [
      ...new Set([...(read ?? []), ...items.map((item) => item.id)]),
    ];
    setRead(next);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          activity_read_ids: next,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }
  }, [items, read]);

  return {
    items,
    read,
    ready: read !== null,
    unreadCount: unread.length,
    isUnread: (id: string) => Boolean(read && !read.includes(id)),
    markAllRead,
  };
}
