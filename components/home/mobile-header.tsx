export function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">blur_on</span>
        <h1 className="text-lg font-bold text-on-surface font-heading tracking-tight">
          Ephemeral
        </h1>
      </div>
      <div className="px-3 py-1 rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-medium tracking-wide">
        ID: 882-XJ
      </div>
    </header>
  );
}
