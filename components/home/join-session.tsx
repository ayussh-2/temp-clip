"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinSession() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleJoin() {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length === 6) {
      router.push(`/session/${trimmedCode}`);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleJoin();
    }
  }

  return (
    <div className="md:col-span-5 flex flex-col gap-6">
      <div className="bg-surface-container-high border border-outline-variant/20 p-8 rounded-2xl flex-1 flex flex-col shadow-xl">
        <h3 className="text-lg font-heading font-bold mb-1">Join Existing</h3>
        <p className="text-on-surface-variant font-body text-xs mb-6">
          Enter the 6-digit code shared with you.
        </p>

        <div className="mt-auto">
          <label className="text-[10px] font-label text-outline uppercase tracking-[0.2em] mb-2 block">
            Access Code
          </label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              maxLength={6}
              placeholder="000000"
              type="text"
              className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface font-heading font-bold tracking-[0.5em] px-4 py-3 placeholder:text-outline-variant/30 rounded-xl transition-colors"
            />
            <button
              onClick={handleJoin}
              disabled={code.trim().length !== 6}
              className="bg-primary-container/30 text-primary border border-primary/20 px-5 rounded-xl hover:bg-primary-container/50 transition-colors active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
