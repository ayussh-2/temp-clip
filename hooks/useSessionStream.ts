import { useEffect, useRef, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { StreamEvent } from "@/types/session";

type Options = {
  onUpdate: (content: string) => void;
  onExpired: () => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
};

export function useSessionStream(code: string, options: Options) {
  const { onUpdate, onExpired, onReconnecting, onReconnected } = options;
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const streamUrl = apiClient.getStreamUrl(code);
    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.addEventListener("content:update", (e) => {
      const data: StreamEvent = JSON.parse(e.data);
      if (data.type === "content:update") {
        onUpdate(data.content);
      }
    });

    es.addEventListener("session:expired", () => {
      onExpired();
    });

    es.addEventListener("session:deleted", () => {
      onExpired();
    });

    es.addEventListener("ping", () => {
      // Keep-alive ping
    });

    es.onopen = () => {
      onReconnected?.();
    };

    es.onerror = () => {
      es.close();
      onReconnecting?.();
      setTimeout(connect, 3000);
    };
  }, [code, onUpdate, onExpired, onReconnecting, onReconnected]);

  useEffect(() => {
    connect();
    return () => esRef.current?.close();
  }, [connect]);
}
