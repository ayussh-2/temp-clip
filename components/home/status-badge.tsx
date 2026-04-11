export function StatusBadge() {
  return (
    <div className="inline-flex items-center gap-3 mb-6 bg-primary-container/10 px-3 py-1 rounded-xl border border-primary-container/20">
      <span className="w-2 h-2 rounded-xl bg-primary animate-pulse"></span>
      <span className="text-primary-dim font-heading font-bold tracking-widest text-[10px] uppercase">
        Service Online
      </span>
    </div>
  );
}
