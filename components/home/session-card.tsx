export function SessionCard() {
  return (
    <div className="md:col-span-7 bg-surface-container-low border border-outline-variant/10 p-8 md:p-10 flex flex-col justify-between rounded-2xl relative overflow-hidden group">
      <div className="relative z-10">
        <h2 className="text-2xl font-heading font-bold mb-3">Launch Session</h2>
        <p className="text-on-surface-variant text-sm font-body max-w-xs mb-8">
          Generate a secure temporary space for your text snippets. Valid for 15
          minutes.
        </p>
        <button className="flex items-center gap-3 bg-primary text-on-primary px-8 py-3 rounded-xl font-heading font-bold text-base hover:shadow-[0_0_20px_rgba(181,204,189,0.2)] transition-all active:scale-95 group/btn">
          Start New Session
          <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">
            arrow_forward
          </span>
        </button>
      </div>

      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary-container/10 rounded-xl blur-3xl group-hover:bg-primary-container/20 transition-colors"></div>
      <div className="absolute right-8 top-8 opacity-5">
        <span
          className="material-symbols-outlined text-8xl"
          style={{ fontVariationSettings: '"wght" 100' }}
        >
          bolt
        </span>
      </div>
    </div>
  );
}
