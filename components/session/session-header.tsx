export function SessionHeader() {
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
          <span className="text-base md:text-lg font-heading font-extrabold tracking-tight leading-none">
            X4K9MQ
          </span>
        </div>
      </div>

      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-3 bg-surface-container-highest px-4 py-2 rounded-xl border border-primary/20">
        <span className="material-symbols-outlined text-primary text-xl animate-pulse">
          timer
        </span>
        <span className="text-primary font-heading text-lg font-bold tabular-nums tracking-wider">
          14:59:02
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-surface-container rounded-lg border border-outline-variant/10">
          <span className="w-2 h-2 bg-primary rounded-xl animate-pulse"></span>
          <span className="text-[10px] font-label uppercase tracking-widest text-primary">
            Live: 4
          </span>
        </div>
        <button className="bg-primary text-on-primary font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs tracking-widest active:scale-95 transition-transform hover:opacity-90 shadow-lg shadow-primary/10">
          NEW
        </button>
      </div>
    </div>
  );
}
