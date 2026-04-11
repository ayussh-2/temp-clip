export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-surface/70 backdrop-blur-2xl rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col items-center justify-center bg-surface-container-high text-primary rounded-xl px-4 py-1 scale-95 active:scale-90 transition-transform">
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          home
        </span>
        {/* <span className="font-label text-[11px] uppercase tracking-widest mt-1">
          Home
        </span> */}
      </div>

      <div className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:text-on-surface transition-colors scale-95 active:scale-90 transition-transform">
        <span className="material-symbols-outlined">history</span>
        {/* <span className="font-label text-[11px] uppercase tracking-widest mt-1">
          History
        </span> */}
      </div>

      <div className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:text-on-surface transition-colors scale-95 active:scale-90 transition-transform">
        <span className="material-symbols-outlined">add_circle</span>
        {/* <span className="font-label text-[11px] uppercase tracking-widest mt-1">
          New Session
        </span> */}
      </div>
    </nav>
  );
}
