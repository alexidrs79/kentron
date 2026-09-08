"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  livePulses,
  plannedEvents,
  type LivePulse,
  type PlannedEvent,
} from "@/lib/map/fixtures";
import { createClient } from "@/lib/supabase/client";
import { isInYerevanWeek } from "@/lib/content";

interface StoredRecords {
  pulses: LivePulse[];
  events: PlannedEvent[];
}

interface LocalRecords {
  /** Public fixtures plus published Supabase records. */
  pulses: LivePulse[];
  events: PlannedEvent[];
  /** Only records owned by the signed-in account. */
  mine: StoredRecords;
  ready: boolean;
  /** Set when the fetch failed, so an outage is not shown as an empty city. */
  failed: boolean;
  refresh: () => Promise<void>;
}

const LocalRecordsContext = createContext<LocalRecords | null>(null);

const empty: StoredRecords = { pulses: [], events: [] };
const useFixtures =
  process.env.NEXT_PUBLIC_USE_FIXTURES === "true" ||
  (process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_USE_FIXTURES !== "false");

type EventRow = {
  id: string;
  owner_id: string;
  organizer_name: string;
  title: string;
  venue_name: string;
  category: PlannedEvent["category"];
  description: string;
  image_path: string | null;
  lat: number;
  lng: number;
  starts_at: string;
  is_recurring_template: boolean;
  is_published: boolean;
};

type PulseRow = {
  id: string;
  owner_id?: string;
  caption: string;
  place_name: string;
  category: LivePulse["category"];
  image_path: string;
  lat: number;
  lng: number;
  posted_at: string;
  expires_at: string;
};

export function LocalRecordsProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<StoredRecords>(empty);
  const [minePulses, setMinePulses] = useState<LivePulse[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadVersion = useRef(0);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function load() {
      const version = ++loadVersion.current;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const [eventsResult, pulsesResult, minePulsesResult] = await Promise.all([
        supabase
          .from("planned_events")
          .select(
            "id,owner_id,organizer_name,title,venue_name,category,description,image_path,lat,lng,starts_at,is_recurring_template,is_published",
          )
          .order("starts_at", { ascending: true }),
        // A view, not the table: live_posts.owner_id must never reach a
        // public reader. The view also applies the expiry filter.
        supabase
          .from("live_posts_public")
          .select(
            "id,caption,place_name,category,image_path,lat,lng,posted_at,expires_at",
          )
          .order("posted_at", { ascending: false }),
        user
          ? supabase
              .from("live_posts")
              .select(
                "id,owner_id,caption,place_name,category,image_path,lat,lng,posted_at,expires_at",
              )
              .eq("owner_id", user.id)
              .gt("expires_at", new Date().toISOString())
          : Promise.resolve({ data: [] as PulseRow[] }),
      ]);

      if (!active || version !== loadVersion.current) return;
      setUserId(user?.id ?? null);

      // A failed read is an outage, not a quiet city. Keep whatever we last
      // had on screen and let the surface say so.
      if (eventsResult.error || pulsesResult.error) {
        setFailed(true);
        setReady(true);
        return;
      }
      setFailed(false);

      const ownerIds = [
        ...new Set(
          (eventsResult.data ?? [])
            .map((row: EventRow) => row.owner_id)
            .filter(Boolean),
        ),
      ];
      type OrganizerPublic = {
        id: string;
        display_name: string;
        avatar_url: string | null;
      };
      const { data: organizers } = ownerIds.length
        ? await supabase.rpc("organizer_public", { ids: ownerIds })
        : { data: [] as OrganizerPublic[] };
      const organizerById = new Map<string, OrganizerPublic>(
        ((organizers ?? []) as OrganizerPublic[]).map((row) => [row.id, row]),
      );

      setRemote({
        events: (eventsResult.data ?? []).map((row: EventRow) => ({
          id: row.id,
          ownerId: row.owner_id,
          organizer: row.organizer_name,
          organizerAvatarUrl: publicMediaUrl(
            organizerById.get(row.owner_id)?.avatar_url ?? null,
          ),
          title: row.title,
          venue: row.venue_name,
          category: row.category,
          summary: row.description,
          when: formatWhen(row.starts_at),
          startsAt: row.starts_at,
          isWeekly: row.is_recurring_template,
          isPublished: row.is_published,
          imageUrl: publicMediaUrl(row.image_path),
          coordinates: coordinatesFor(row),
        })),
        pulses: (pulsesResult.data ?? []).map((row: PulseRow) => ({
          id: row.id,
          caption: row.caption,
          place: row.place_name,
          category: row.category,
          imageUrl: publicMediaUrl(row.image_path),
          expiresAt: row.expires_at,
          ageMinutes: Math.max(
            1,
            Math.floor(
              (Date.now() - new Date(row.posted_at).getTime()) / 60_000,
            ),
          ),
          coordinates: [row.lng, row.lat] as const,
        })),
      });
      setMinePulses(
        (minePulsesResult.data ?? []).map((row: PulseRow) => ({
          id: row.id,
          ownerId: row.owner_id,
          caption: row.caption,
          place: row.place_name,
          category: row.category,
          imageUrl: publicMediaUrl(row.image_path),
          expiresAt: row.expires_at,
          ageMinutes: Math.max(
            1,
            Math.floor(
              (Date.now() - new Date(row.posted_at).getTime()) / 60_000,
            ),
          ),
          coordinates: [row.lng, row.lat] as const,
        })),
      );
      setReady(true);
    }

    void load();
    window.addEventListener("kentron-records-change", load);
    const minuteTimer = window.setInterval(load, 60_000);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => void load());
    return () => {
      active = false;
      window.clearInterval(minuteTimer);
      window.removeEventListener("kentron-records-change", load);
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<LocalRecords>(
    () => ({
      pulses: useFixtures ? [...remote.pulses, ...livePulses] : remote.pulses,
      events: [
        ...remote.events.filter(
          (event) =>
            event.isPublished !== false && isInYerevanWeek(event.startsAt),
        ),
        ...(useFixtures ? plannedEvents : []),
      ],
      mine: {
        pulses: minePulses,
        events: remote.events.filter((item) => item.ownerId === userId),
      },
      ready,
      failed,
      refresh: async () => {
        window.dispatchEvent(new Event("kentron-records-change"));
      },
    }),
    [failed, minePulses, ready, remote, userId],
  );

  return (
    <LocalRecordsContext.Provider value={value}>
      {children}
    </LocalRecordsContext.Provider>
  );
}

function publicMediaUrl(path: string | null) {
  if (!path) return undefined;
  return createClient().storage.from("event-media").getPublicUrl(path).data
    .publicUrl;
}

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Yerevan",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replace(",", "");
}

function coordinatesFor(row: { lng?: number; lat?: number }) {
  return [row.lng ?? 44.5136, row.lat ?? 40.1811] as const;
}

export function useLocalRecords() {
  const records = useContext(LocalRecordsContext);
  if (!records) {
    throw new Error("LocalRecordsProvider is missing");
  }
  return records;
}
