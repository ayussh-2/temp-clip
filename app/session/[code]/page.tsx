import { SessionHeader } from "@/components/session/session-header";
import { SnippetEditor } from "@/components/session/snippet-editor";
import { SessionExpired } from "@/components/session/session-expired";
import { redis } from "@/lib/redis";
import { redirect } from "next/navigation";
import type { SessionData } from "@/types/session";

type Props = { params: Promise<{ code: string }> };

export default async function SessionPage({ params }: Props) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();

  try {
    const key = `session:${code}`;
    const raw = await redis.get(key);

    if (!raw) {
      return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary/30 flex flex-col h-screen overflow-hidden items-center justify-center">
          <SessionExpired />
        </div>
      );
    }

    const session: SessionData =
      typeof raw === "string" ? JSON.parse(raw) : (raw as SessionData);
    const ttl = await redis.ttl(key);
    const expiresAt = new Date(Date.now() + ttl * 1000);

    return (
      <div className="bg-surface text-on-surface font-body selection:bg-primary/30 flex flex-col h-screen overflow-hidden">
        <main className="flex-grow flex flex-col relative">
          <SessionHeader code={code} expiresAt={expiresAt.toISOString()} />

          <div className="flex-grow relative flex flex-col bg-surface overflow-hidden">
            <SnippetEditor code={code} initialContent={session.content || ""} />
          </div>
        </main>
      </div>
    );
  } catch (error: any) {
    console.error("[SessionPage Error]", error);
    redirect("/");
  }
}
