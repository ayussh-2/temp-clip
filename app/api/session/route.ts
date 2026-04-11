import { NextRequest, NextResponse } from "next/server";
import { generateSessionCode } from "@/lib/codegen";
import { redis } from "@/lib/redis";
import { ratelimit } from "@/lib/ratelimit";
import type { CreateSessionRequest, SessionData } from "@/types/session";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests" } },
      { status: 429 },
    );
  }

  const body: CreateSessionRequest = await req.json().catch(() => ({}));
  const ttl: number = Math.min(body.ttl ?? 900, 86400);
  const burnAfterRead: boolean = body.burn_after_read ?? false;

  const code = generateSessionCode();
  const key = `session:${code}`;

  const sessionData: SessionData = {
    content: null,
    content_type: "text/plain",
    burn: burnAfterRead,
    reads: 0,
    created_at: new Date().toISOString(),
  };

  await redis.setex(key, ttl, JSON.stringify(sessionData));

  return NextResponse.json({
    code,
    ttl,
    burn_after_read: burnAfterRead,
    expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
  });
}
