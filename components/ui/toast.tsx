"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, onClose, duration = 2000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-surface-container-highest backdrop-blur-xl px-6 py-3 rounded-xl border border-primary/20 shadow-2xl">
        <p className="text-on-surface font-medium text-sm">{message}</p>
      </div>
    </div>
  );
}
