import { Sidebar } from "@/components/home/sidebar";
import { MobileHeader } from "@/components/home/mobile-header";
import { MobileNav } from "@/components/home/mobile-nav";
import { StatusBadge } from "@/components/home/status-badge";
import { SessionCard } from "@/components/home/session-card";
import { JoinSession } from "@/components/home/join-session";
import { FeatureGrid } from "@/components/home/feature-grid";

export default function Home() {
  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container flex min-h-screen">
      <Sidebar />
      <MobileHeader />

      <main className="md:ml-16 md:md:ml-20 flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-12 md:py-12 pt-24 md:pt-12 pb-32 md:pb-12 min-h-screen">
        <div className="max-w-5xl w-full">
          <header className="mb-12 md:mb-16 text-left">
            <div className="hidden md:block">
              <StatusBadge />
            </div>

            <div className="md:hidden w-12 h-1 bg-primary mb-6 rounded-xl"></div>

            <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tighter leading-tight mb-4">
              <span className="md:hidden">
                Secure, <br />
                Instant, <br />
                <span className="text-primary-dim">Temporary.</span>
              </span>
              <span className="hidden md:inline">
                TEMP<span className="text-primary-dim">CLIP</span>
              </span>
            </h1>

            <p className="text-on-surface-variant text-base md:text-lg font-body max-w-xl leading-relaxed">
              <span className="md:hidden">
                TempClip creates a transient bridge for your data. No logs, no
                traces, just the moment.
              </span>
              <span className="hidden md:inline">
                Securely move snippets and links between devices.
                <br className="hidden md:block" />
                Data disappears instantly when the session expires.
              </span>
            </p>
          </header>

          <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <SessionCard />
            <JoinSession />
          </div>

          <div className="md:hidden space-y-4">
            <button className="w-full bg-primary text-on-primary h-20 rounded-xl flex items-center justify-between px-8 hover:opacity-90 active:scale-95 transition-all group">
              <span className="font-heading font-bold text-lg">
                Start New Session
              </span>
              <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>

            <div className="bg-surface-container-low rounded-xl p-2 flex items-center">
              <input
                className="bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/50 w-full px-6 font-mono tracking-[0.5em] text-lg"
                maxLength={6}
                placeholder="Enter 6-digit code"
                type="text"
              />
              <button className="bg-surface-container-high text-primary px-6 h-14 rounded-xl font-bold hover:bg-surface-container-highest transition-colors">
                Join
              </button>
            </div>
          </div>

          <div className="md:hidden mt-16 grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-surface-container rounded-xl p-6 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-on-surface mb-1">
                  Peer-to-Peer
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Encrypted direct transfer
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">
                  hub
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-6 aspect-square flex flex-col justify-between">
              <span className="material-symbols-outlined text-tertiary">
                timer
              </span>
              <div>
                <h4 className="text-sm font-bold text-on-surface">Auto-Wipe</h4>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                  60 Seconds
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-6 aspect-square flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary">
                lock
              </span>
              <div>
                <h4 className="text-sm font-bold text-on-surface">No Cloud</h4>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Local Only
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <FeatureGrid />
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
