export function StatsBar() {
  return (
    <div className="px-4 md:px-8 py-2 md:py-3 flex justify-between items-center text-[10px] text-on-surface-variant font-label uppercase tracking-widest bg-surface/50 backdrop-blur-sm z-10 border-b border-outline-variant/5">
      <div className="flex gap-3 md:gap-6">
        <span>Words: 124</span>
        <span>Chars: 842</span>
      </div>
      <div className="hidden lg:flex gap-4">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-xl bg-primary"></span>
          MBP-16-Main
        </span>
        <span className="flex items-center gap-1 opacity-50">
          <span className="w-1 h-1 rounded-xl bg-primary"></span>
          iPhone 15 Pro
        </span>
      </div>
    </div>
  );
}
