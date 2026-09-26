"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "../lib/api";

export type ServerEvent = {
  event: string;
  event_type?: string;
  payload: Record<string, any>;
};

export function useEventStream(onEvent: (event: ServerEvent) => void) {
  const sourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const streamUrl = `${API_URL}/api/events/stream`;
    console.log(`Connecting to SSE stream at ${streamUrl}`);

    const source = new EventSource(streamUrl);
    sourceRef.current = source;

    source.onopen = () => {
      console.log("SSE stream connection established");
      setIsConnected(true);
    };

    source.onmessage = (e) => {
      try {
        if (!e.data || e.data.trim() === "" || e.data.startsWith(":")) return;
        const parsed = JSON.parse(e.data);
        const normalizedEvent: ServerEvent = {
          event: parsed.event || parsed.event_type || "UNKNOWN",
          event_type: parsed.event_type || parsed.event || "UNKNOWN",
          payload: parsed.payload || parsed.data || parsed,
        };
        onEventRef.current(normalizedEvent);
      } catch (err) {
        console.error("Failed to parse SSE event:", err, e.data);
      }
    };

    source.onerror = (err) => {
      console.warn("SSE connection error — browser will attempt auto-reconnect", err);
      setIsConnected(false);
    };

    return () => {
      console.log("Closing SSE stream connection");
      source.close();
      setIsConnected(false);
    };
  }, []);

  return { isConnected };
}
