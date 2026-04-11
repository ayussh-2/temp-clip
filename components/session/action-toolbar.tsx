export function ActionToolbar() {
  return (
    <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 md:p-1.5 bg-surface-container-high/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-outline-variant/20 shadow-2xl z-20">
      <button
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
        className="p-2 md:p-3 hover:bg-surface-container-highest rounded-lg md:rounded-xl transition-colors group flex items-center gap-1 md:gap-2 px-2 md:px-4"
        title="Share access QR"
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
        className="p-2 md:p-3 hover:bg-error-container/20 rounded-lg md:rounded-xl transition-colors group flex items-center gap-1 md:gap-2 px-2 md:px-4"
        title="Clear all content"
      >
        <span className="material-symbols-outlined text-error-dim text-lg md:text-2xl">
          delete_sweep
        </span>
        <span className="hidden sm:inline text-xs font-semibold text-error-dim">
          Clear
        </span>
      </button>
    </div>
  );
}
