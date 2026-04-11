import { SessionHeader } from "@/components/session/session-header";
import { StatsBar } from "@/components/session/stats-bar";
import { SnippetEditor } from "@/components/session/snippet-editor";
import { ActionToolbar } from "@/components/session/action-toolbar";
import { SessionExpired } from "@/components/session/session-expired";

export default function Session() {
  const isExpired = false;

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 flex flex-col h-screen overflow-hidden">
      <main className="flex-grow flex flex-col relative">
        <SessionHeader />

        <div className="flex-grow relative flex flex-col bg-surface overflow-hidden">
          <StatsBar />
          <SnippetEditor />
          <ActionToolbar />

          {isExpired && <SessionExpired />}
        </div>
      </main>
    </div>
  );
}
