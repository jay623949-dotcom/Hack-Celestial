import { useState, useEffect, useRef } from 'react';
import { BACKEND_URL } from '../config';

export function useEventStream(onEvent) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const streamUrl = `${BACKEND_URL}/api/events/stream`;

    let eventSource;
    try {
      eventSource = new EventSource(streamUrl);

      eventSource.onopen = () => {
        setIsConnected(true);
        setErrorCount(0);
      };

      eventSource.onmessage = (event) => {
        if (!event.data) return;
        try {
          const parsed = JSON.parse(event.data);
          if (onEventRef.current) {
            onEventRef.current(parsed);
          }
        } catch (e) {
          // Could be heartbeat or comment
          setLastHeartbeat(new Date().toLocaleTimeString());
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        setErrorCount((prev) => prev + 1);
      };
    } catch (err) {
      console.warn('SSE stream error:', err);
      setIsConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return { isConnected, lastHeartbeat, errorCount };
}
