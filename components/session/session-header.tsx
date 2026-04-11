"use client";

import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useState, useEffect } from "react";

type Props = { code: string; expiresAt: string };

export function SessionHeader({ code, expiresAt }: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function updateTimer() {
      const now = Date.now();
      const expires = new Date(expiresAt).getTime();
      const diff = Math.max(0, expires - now);

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  async function handleNewSession() {
    setIsCreating(true);
    try {
      const { code: newCode } = await apiClient.createSession({ ttl: 900 });
      router.push(`/session/${newCode}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      setIsCreating(false);
    }
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  }

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-surface-container-low border-b border-outline-variant/10">
      <div className="flex items-center gap-3 md:gap-6">
        <div className="text-xs md:text-sm font-bold tracking-tighter text-on-surface opacity-50">
          TEMPCLIP
        </div>
        <div className="h-4 w-[1px] bg-outline-variant/30"></div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label leading-none mb-1">
            Session ID
          </span>
          <button
            onClick={handleCopyCode}
            className="text-base md:text-lg font-heading font-extrabold tracking-tight leading-none hover:text-primary transition-colors text-left"
            title="Click to copy"
          >
            {code}
          </button>
        </div>
      </div>

      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-3 bg-surface-container-highest px-4 py-2 rounded-full border border-primary/20">
        <span className="material-symbols-outlined text-primary text-xl animate-pulse">
          timer
        </span>
        <span className="text-primary font-heading text-lg font-bold tabular-nums tracking-wider">
          {timeLeft}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={handleNewSession}
          disabled={isCreating}
          className="bg-primary text-on-primary font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs tracking-widest active:scale-95 transition-transform hover:opacity-90 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? "CREATING..." : "NEW"}
        </button>
      </div>
    </div>
  );
}
