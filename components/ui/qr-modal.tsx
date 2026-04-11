"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

type Props = {
  url: string;
  onClose: () => void;
  onCopyLink?: () => void;
};

export function QRModal({ url, onClose, onCopyLink }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 256,
          margin: 2,
          color: {
            dark: "#e7e5e5",
            light: "#0e0e0e",
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        },
      );
    }
  }, [url]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-high rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-outline-variant/20 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold text-on-surface mb-2">
              Scan to Access
            </h2>
            <p className="text-on-surface-variant text-sm">
              Scan this QR code to open the session on another device
            </p>
          </div>

          <div className="bg-surface p-4 rounded-xl">
            <canvas ref={canvasRef} />
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(url);
                onCopyLink?.();
              }}
              className="w-full py-3 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Copy Link
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-surface-container text-on-surface-variant font-semibold rounded-xl hover:bg-surface-container-high active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
