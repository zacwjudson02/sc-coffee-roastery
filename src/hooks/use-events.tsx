import { createContext, useContext, useMemo, useRef } from "react";

export type DomainEvent = {
  type: string; // e.g., booking.created, invoice.created
  payload: Record<string, any>;
  at: string; // ISO timestamp
};

type EventBus = {
  publish: (event: DomainEvent) => void;
  subscribe: (listener: (event: DomainEvent) => void) => () => void;
};

const EventsContext = createContext<EventBus | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const listenersRef = useRef<Set<(event: DomainEvent) => void>>(new Set());

  const bus = useMemo<EventBus>(() => ({
    publish: (event) => {
      listenersRef.current.forEach((fn) => fn(event));
    },
    subscribe: (listener) => {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    },
  }), []);

  return <EventsContext.Provider value={bus}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}


