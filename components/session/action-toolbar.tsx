"use client";

import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toast } from "@/components/ui/toast";
import { QRModal } from "@/components/ui/qr-modal";

type Props = { code: string; content: string };

export function ActionToolbar({ code, content }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  async function handleCopy() {
    try {
      if (content) {
        await navigator.clipboard.writeText(content);
        setToast("Copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to copy:", error);
      setToast("Failed to copy");
    }
  }

  async function handleDownload() {
    try {
      if (content) {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tempclip-${code}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setToast("Downloaded!");
      }
    } catch (error) {
      console.error("Failed to download:", error);
      setToast("Failed to download");
    }
  }

  function handleShare() {
    setShowQR(true);
  }

  async function handleClear() {
    if (
      confirm(
        "Are you sure you want to delete this session? This cannot be undone.",
      )
    ) {
      setIsDeleting(true);
      try {
        await apiClient.deleteSession(code);
        router.push("/");
      } catch (error) {
        console.error("Failed to delete:", error);
        setIsDeleting(false);
        setToast("Failed to delete");
      }
    }
  }

  const sessionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/session/${code}`
      : "";

  return (
    <>
      <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 md:p-1.5 bg-surface-container-high/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-outline-variant/20 shadow-2xl z-20">
        <button
          onClick={handleCopy}
          className="p-2 md:p-3 hover:bg-surface-container-highest rounded-lg md:rounded-xl transition-colors group flex items-center gap-1 md:gap-2 px-2 md:px-4"
          title="Copy to clipboard"
        >
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-lg md:text-2xl">
            content_copy
          </span>
          <span className="hidden sm:inline text-xs font-semibold text-on-surface-variant group-hover:text-on-surface">
            Copy
          </span>
        </button>

        <div className="w-[1px] h-6 bg-outline-variant/20 mx-0.5 md:mx-1"></div>

        <button
          onClick={handleDownload}
          className="p-2 md:p-3 hover:bg-surface-container-highest rounded-lg md:rounded-xl transition-colors group flex items-center gap-1 md:gap-2 px-2 md:px-4"
          title="Download as file"
        >
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-lg md:text-2xl">
            download
          </span>
          <span className="hidden sm:inline text-xs font-semibold text-on-surface-variant group-hover:text-on-surface">
            Save
          </span>
        </button>

        <div className="w-[1px] h-6 bg-outline-variant/20 mx-0.5 md:mx-1"></div>

        <button
          onClick={handleShare}
          className="p-2 md:p-3 hover:bg-surface-container-highest rounded-lg md:rounded-xl transition-colors group flex items-center gap-1 md:gap-2 px-2 md:px-4"
          title="Share QR code"
        >
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-lg md:text-2xl">
            qr_code_2
          </span>
          <span className="hidden sm:inline text-xs font-semibold text-on-surface-variant group-hover:text-on-surface">
            Share
          </span>
        </button>

        <div className="w-[1px] h-6 bg-outline-variant/20 mx-0.5 md:mx-1"></div>

        <button
          onClick={handleClear}
          disabled={isDeleting}
          className="p-2 md:p-3 hover:bg-error-container/20 rounded-lg md:rounded-xl transition-colors group flex items-center gap-1 md:gap-2 px-2 md:px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear all content"
        >
          <span className="material-symbols-outlined text-error-dim text-lg md:text-2xl">
            delete_sweep
          </span>
          <span className="hidden sm:inline text-xs font-semibold text-error-dim">
            {isDeleting ? "Deleting..." : "Clear"}
          </span>
        </button>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {showQR && (
        <QRModal
          url={sessionUrl}
          onClose={() => setShowQR(false)}
          onCopyLink={() => setToast("Link copied!")}
        />
      )}
    </>
  );
}
