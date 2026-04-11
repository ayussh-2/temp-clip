export function SessionExpired() {
  return (
    <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 md:p-10">
        <div className="space-y-4">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-on-surface">
            Session Expired
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            This session has timed out or is no longer valid. For your security,
            please start a new session to continue.
          </p>
        </div>

        <div className="pt-4">
          <button className="w-full py-4 bg-primary text-on-primary font-heading font-bold rounded-xl hover:bg-primary-dim active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/10">
            RESTART SESSION
          </button>
        </div>
      </div>
    </div>
  );
}
