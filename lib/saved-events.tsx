"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

export type SaveableContentType = "event" | "live";

export interface SavedContent {
  id: string;
  type: SaveableContentType;
  expiresAt?: string;
}

const SELECT = "event_id,content_type,expires_at";

function keyOf(type: SaveableContentType, id: string) {
  return `${type}:${id}`;
}

interface SavedEventsValue {
  /** Null until the account and its saved rows have been read. */
  items: SavedContent[] | null;
  ids: string[] | null;
  ready: boolean;
  authenticated: boolean;
  count: number;
  /** Set while a write for this row is in flight, so it cannot be repeated. */
  isBusy: (type: SaveableContentType, id: string) => boolean;
  isSaved: (type: SaveableContentType, id: string) => boolean;
  toggle: (content: SavedContent) => Promise<boolean>;
  remove: (type: SaveableContentType, id: string) => Promise<void>;
  clear: () => Promise<void>;
}

const SavedEventsContext = createContext<SavedEventsValue | null>(null);

/**
 * Saves are account-owned Supabase rows. Live saves carry the post expiry, so
 * RLS stops returning them when the live window closes.
 *
 * One provider holds the state: two save controls for the same content must
 * never disagree about whether it is saved.
 */
export function SavedEventsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedContent[] | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());
  const itemsRef = useRef<SavedContent[] | null>(null);

  itemsRef.current = items;

  const reload = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("event_saves")
      .select(SELECT)
      .order("created_at", { ascending: false });
    setItems((data ?? []).map(savedContentFromRow));
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function sync() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      setAuthenticated(Boolean(user));
      if (!user) {
        setItems([]);
        return;
      }
      const { data } = await supabase
        .from("event_saves")
        .select(SELECT)
        .order("created_at", { ascending: false });
      if (active) setItems((data ?? []).map(savedContentFromRow));
    }

    void sync();
    // Live saves stop being returned once they expire, so re-read instead of
    // trusting the copy taken at mount.
    const timer = window.setInterval(() => void sync(), 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => void sync());
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      subscription.unsubscribe();
    };
  }, []);

  const withBusy = useCallback(
    async (key: string, work: () => Promise<void>) => {
      if (busy.has(key)) return;
      setBusy((current) => new Set(current).add(key));
      try {
        await work();
      } finally {
        setBusy((current) => {
          const next = new Set(current);
          next.delete(key);
          return next;
        });
      }
    },
    [busy],
  );

  const toggle = useCallback(
    async (content: SavedContent) => {
      const current = itemsRef.current;
      if (!authenticated || !current) return false;
      const key = keyOf(content.type, content.id);
      if (busy.has(key)) return false;

      let ok = false;
      await withBusy(key, async () => {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const saved = current.some(
          (item) => item.id === content.id && item.type === content.type,
        );
        const without = (list: SavedContent[] | null) =>
          (list ?? []).filter(
            (item) => item.id !== content.id || item.type !== content.type,
          );
        setItems((list) =>
          saved ? without(list) : [content, ...without(list)],
        );

        const result = saved
          ? await supabase
              .from("event_saves")
              .delete()
              .eq("user_id", user.id)
              .eq("content_type", content.type)
              .eq("event_id", content.id)
          : await supabase.from("event_saves").upsert(
              {
                user_id: user.id,
                event_id: content.id,
                content_type: content.type,
                expires_at: content.expiresAt ?? null,
              },
              { onConflict: "user_id,content_type,event_id" },
            );

        if (result.error) {
          await reload();
          return;
        }
        ok = true;
      });
      return ok;
    },
    [authenticated, busy, reload, withBusy],
  );

  const remove = useCallback(
    async (type: SaveableContentType, id: string) => {
      if (!itemsRef.current) return;
      await withBusy(keyOf(type, id), async () => {
        setItems((list) =>
          (list ?? []).filter((item) => item.id !== id || item.type !== type),
        );
        const { error } = await createClient()
          .from("event_saves")
          .delete()
          .eq("content_type", type)
          .eq("event_id", id);
        if (error) await reload();
      });
    },
    [reload, withBusy],
  );

  const clear = useCallback(async () => {
    const previous = itemsRef.current;
    if (!previous) return;
    await withBusy("__clear__", async () => {
      setItems([]);
      const { error } = await createClient()
        .from("event_saves")
        .delete()
        .in(
          "event_id",
          previous.length ? previous.map((item) => item.id) : ["__none__"],
        );
      if (error) setItems(previous);
    });
  }, [withBusy]);

  const value = useMemo<SavedEventsValue>(
    () => ({
      items,
      ids:
        items?.filter((item) => item.type === "event").map((item) => item.id) ??
        null,
      ready: items !== null,
      authenticated,
      count: items?.length ?? 0,
      isBusy: (type, id) => busy.has(keyOf(type, id)),
      isSaved: (type, id) =>
        Boolean(items?.some((item) => item.type === type && item.id === id)),
      toggle,
      remove,
      clear,
    }),
    [authenticated, busy, clear, items, remove, toggle],
  );

  return (
    <SavedEventsContext.Provider value={value}>
      {children}
    </SavedEventsContext.Provider>
  );
}

export function useSavedEvents() {
  const value = useContext(SavedEventsContext);
  if (!value) throw new Error("SavedEventsProvider is missing");
  return value;
}

function savedContentFromRow(row: {
  event_id: string;
  content_type: string;
  expires_at: string | null;
}): SavedContent {
  return {
    id: row.event_id,
    type: row.content_type === "live" ? "live" : "event",
    expiresAt: row.expires_at ?? undefined,
  };
}
