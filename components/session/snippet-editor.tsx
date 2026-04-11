"use client";

import { useState, useCallback, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useSessionStream } from "@/hooks/useSessionStream";
import { apiClient } from "@/lib/api-client";
import { StatsBar } from "./stats-bar";
import { ActionToolbar } from "./action-toolbar";

type Props = { code: string; initialContent: string };

export function SnippetEditor({ code, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [isExpired, setIsExpired] = useState(false);
  const isLocalChange = useRef(false);

  const saveToServer = useDebouncedCallback(async (value: string) => {
    try {
      await apiClient.updateSession(code, { content: value });
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }, 600);

  const handleRemoteUpdate = useCallback((remoteContent: string) => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    setContent(remoteContent);
  }, []);

  useSessionStream(code, {
    onUpdate: handleRemoteUpdate,
    onExpired: () => setIsExpired(true),
  });

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    isLocalChange.current = true;
    setContent(e.target.value);
    saveToServer(e.target.value);
  }

  if (isExpired) {
    return (
      <div className="w-full h-full flex items-center justify-center p-10">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-on-surface mb-2">
            Session Expired
          </h2>
          <p className="text-on-surface-variant">
            This session has timed out. Please start a new session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StatsBar content={content} />
      <textarea
        value={content}
        onChange={handleChange}
        className="w-full h-full bg-transparent border-none focus:ring-0 p-4 md:p-10 text-on-surface font-body text-base md:text-xl leading-relaxed placeholder:text-on-surface-variant/20 resize-none selection:bg-primary/20"
        placeholder="Paste or type your snippet here..."
      />
      <ActionToolbar code={code} content={content} />
    </>
  );
}
