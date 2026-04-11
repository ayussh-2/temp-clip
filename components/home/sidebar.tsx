export function Sidebar() {
  return (
    <aside className="hidden md:flex w-16 md:w-20 bg-surface-container-low border-r border-outline-variant/15 flex-col items-center py-8 gap-10 fixed h-full z-50">
      <div className="text-xs font-black tracking-tighter text-primary font-heading flex flex-col gap-1 items-center">
        <span className="material-symbols-outlined text-primary mb-2">
          terminal
        </span>
      </div>

      <nav className="flex flex-col gap-6 items-center flex-1">
        <button
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(181,204,189,0.3)] transition-all active:scale-90 group relative"
          title="New Session"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-surface-container-high text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest font-bold">
            New Session
          </span>
        </button>

        <button
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all active:scale-90 group relative"
          title="Security"
        >
          <span className="material-symbols-outlined">verified_user</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-surface-container-high text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest font-bold">
            Security
          </span>
        </button>
      </nav>
    </aside>
  );
}
