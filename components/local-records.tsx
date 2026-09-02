"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  livePulses,
  plannedEvents,
  type LivePulse,
  type PlannedEvent,
} from "@/lib/map/fixtures";

interface LocalRecords {
  pulses: LivePulse[];
  events: PlannedEvent[];
  addPulse: (pulse: LivePulse) => void;
  addEvent: (event: PlannedEvent) => void;
}

const LocalRecordsContext = createContext<LocalRecords | null>(null);

export function LocalRecordsProvider({ children }: { children: ReactNode }) {
  const [pulses, setPulses] = useState(livePulses);
  const [events, setEvents] = useState(plannedEvents);

  const value = useMemo(
    () => ({
      pulses,
      events,
      addPulse: (pulse: LivePulse) =>
        setPulses((current) => [pulse, ...current]),
      addEvent: (event: PlannedEvent) =>
        setEvents((current) => [event, ...current]),
    }),
    [pulses, events],
  );

  return (
    <LocalRecordsContext.Provider value={value}>
      {children}
    </LocalRecordsContext.Provider>
  );
}

export function useLocalRecords() {
  const records = useContext(LocalRecordsContext);
  if (!records) {
    throw new Error("LocalRecordsProvider is missing");
  }
  return records;
}
