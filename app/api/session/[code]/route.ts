import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { SessionData, UpdateSessionRequest } from "@/types/session";

type Params = { params: Promise<{ code: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const key = `session:${code}`;

  const raw = await redis.get(key);

  if (!raw) {
    return NextResponse.json(
      {
        error: {
          code: "SESSION_NOT_FOUND",
          message: `Session ${code} not found or expired`,
        },
      },
      { status: 404 },
    );
  }

  const session: SessionData =
    typeof raw === "string" ? JSON.parse(raw) : (raw as SessionData);

  if (session.content === null) {
    return NextResponse.json(
      {
        error: {
          code: "SESSION_EMPTY",
          message: "Session exists but has no content yet",
        },
      },
      { status: 409 },
    );
  }

  if (session.burn) {
    await redis.del(key);
    const updateKey = `update:${code}`;
    await redis.setex(
      updateKey,
      60,
      JSON.stringify({
        type: "session:deleted",
        timestamp: Date.now(),
      }),
    );
    return NextResponse.json({ ...session, code, burned: true });
  }

  session.reads += 1;
  const ttl = await redis.ttl(key);
  await redis.setex(key, ttl, JSON.stringify(session));

  return NextResponse.json({ ...session, code });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const key = `session:${code}`;

  const raw = await redis.get(key);

  if (!raw) {
    return NextResponse.json(
      {
        error: {
          code: "SESSION_NOT_FOUND",
          message: `Session ${code} not found or expired`,
        },
      },
      { status: 404 },
    );
  }

  const body: UpdateSessionRequest = await req.json();
  const content: string = body.content ?? "";

  if (Buffer.byteLength(content, "utf8") > 512 * 1024) {
    return NextResponse.json(
      {
        error: {
          code: "CONTENT_TOO_LARGE",
          message: "Content exceeds 512 KB limit",
        },
      },
      { status: 400 },
    );
  }

  const session: SessionData =
    typeof raw === "string" ? JSON.parse(raw) : (raw as SessionData);
  session.content = content;
  session.content_type = body.content_type ?? "text/plain";

  const ttl = await redis.ttl(key);
  await redis.setex(key, ttl, JSON.stringify(session));

  const updateKey = `update:${code}`;
  await redis.setex(
    updateKey,
    ttl,
    JSON.stringify({
      type: "content:update",
      content,
      content_type: session.content_type,
      updated_at: new Date().toISOString(),
      timestamp: Date.now(),
    }),
  );

  return NextResponse.json({
    status: "ok",
    code,
    size_bytes: Buffer.byteLength(content, "utf8"),
    expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const key = `session:${code}`;

  const updateKey = `update:${code}`;
  await redis.setex(
    updateKey,
    60,
    JSON.stringify({
      type: "session:deleted",
      timestamp: Date.now(),
    }),
  );

  const deleted = await redis.del(key);

  if (!deleted) {
    return NextResponse.json(
      {
        error: {
          code: "SESSION_NOT_FOUND",
          message: `Session ${code} not found`,
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: "deleted", code });
}
