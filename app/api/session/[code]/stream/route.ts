import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ code: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();

  const exists = await redis.exists(`session:${code}`);
  if (!exists) {
    return new Response("Session not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  function sseMessage(event: string, data: object): Uint8Array {
    return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      let isActive = true;
      let lastUpdate = Date.now();

      const pingInterval = setInterval(() => {
        if (!isActive) {
          clearInterval(pingInterval);
          return;
        }
        try {
          controller.enqueue(sseMessage("ping", { ts: Date.now() }));
        } catch {
          isActive = false;
          clearInterval(pingInterval);
        }
      }, 25_000);

      const pollInterval = setInterval(async () => {
        if (!isActive) {
          clearInterval(pollInterval);
          return;
        }

        try {
          const sessionExists = await redis.exists(`session:${code}`);
          if (!sessionExists) {
            controller.enqueue(
              sseMessage("session:expired", { type: "session:expired" }),
            );
            isActive = false;
            clearInterval(pingInterval);
            clearInterval(pollInterval);
            controller.close();
            return;
          }

          const updateKey = `update:${code}`;
          const updateData = await redis.get<string>(updateKey);

          if (updateData) {
            try {
              const parsed = JSON.parse(updateData);
              const updateTime = parsed.timestamp || 0;

              if (updateTime > lastUpdate) {
                lastUpdate = updateTime;
                const eventType: string = parsed.type ?? "content:update";
                controller.enqueue(sseMessage(eventType, parsed));

                if (
                  eventType === "session:deleted" ||
                  eventType === "session:expired"
                ) {
                  isActive = false;
                  clearInterval(pingInterval);
                  clearInterval(pollInterval);
                  controller.close();
                  return;
                }
              }
            } catch {
              // Ignore malformed messages
            }
          }
        } catch (error) {
          console.error("[SSE Error]", error);
        }
      }, 500);
    },

    cancel() {
      // Cleanup handled by isActive flag
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
