export function JoinSession() {
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
              className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface font-heading font-bold tracking-[0.5em] px-4 py-3 placeholder:text-outline-variant/30 rounded-xl transition-colors"
              placeholder="000000"
              type="text"
            />
            <button className="bg-primary-container/30 text-primary border border-primary/20 px-5 rounded-xl hover:bg-primary-container/50 transition-colors active:scale-95 flex items-center justify-center">
              <span className="material-symbols-outlined">login</span>
            </button>
          </div>
        </div>
      </div>

      {/* <div className="bg-surface-container-low border border-outline-variant/10 p-6 rounded-2xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
          <span className="material-symbols-outlined text-xl">encrypted</span>
        </div>
        <div>
          <h4 className="font-heading font-bold text-sm text-tertiary-dim">
            End-to-End Quiet
          </h4>
          <p className="text-on-surface-variant text-[11px] font-body leading-tight">
            Encrypted client-side. Zero persistence.
          </p>
        </div>
      </div> */}
    </div>
  );
}
