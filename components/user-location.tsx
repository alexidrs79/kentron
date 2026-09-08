"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Coordinates = readonly [number, number];

interface UserLocationValue {
  /** Browser-granted position, lng/lat. Never persisted. */
  origin: Coordinates | null;
  setOrigin: (origin: Coordinates | null) => void;
}

const UserLocationContext = createContext<UserLocationValue | null>(null);

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const value = useMemo(() => ({ origin, setOrigin }), [origin]);

  return (
    <UserLocationContext.Provider value={value}>
      {children}
    </UserLocationContext.Provider>
  );
}

export function useUserLocation() {
  const value = useContext(UserLocationContext);
  if (!value) throw new Error("UserLocationProvider is missing");
  return value;
}
