# TempClip — Technical Documentation
### Session-Based Temporary Online Clipboard · Built with Next.js · Real-Time Sync

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How It Works](#4-how-it-works)
5. [Session Code System](#5-session-code-system)
6. [API Routes (Next.js Route Handlers)](#6-api-routes-nextjs-route-handlers)
7. [Real-Time Sync (SSE + Upstash Pub/Sub)](#7-real-time-sync-sse--upstash-pubsub)
8. [Redis Integration (Upstash)](#8-redis-integration-upstash)
9. [Data Lifecycle](#9-data-lifecycle)
10. [Pages & Components](#10-pages--components)
11. [Environment Variables](#11-environment-variables)
12. [Security Considerations](#12-security-considerations)
13. [Error Handling](#13-error-handling)
14. [Deployment](#14-deployment)
15. [Limitations](#15-limitations)

---

## 1. Overview

**TempClip** is a session-based temporary clipboard built as a full-stack **Next.js** application. It lets users share text, links, and code snippets across devices with zero login — just a short, unique session code.

Each clipboard session is identified by a **unique 6-character alphanumeric code** (e.g., `X4K9MQ`). Anyone with the code can read from or write to that session until it expires. Changes sync instantly to all connected devices in real time.

**Key characteristics:**

- Built entirely in Next.js (App Router) — frontend + backend in one repo
- No registration required
- Session data stored ephemerally in Redis (Upstash) with native TTL
- **Real-time sync** via Server-Sent Events (SSE) + Upstash Redis Pub/Sub
- Code-based access — no long URLs, no accounts
- Route Handlers replace a separate backend/API server
- Deployable to Vercel with zero config

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js Route Handlers (`app/api/`) |
| Session Store | Redis via Upstash (`@upstash/redis`) |
| Real-Time Messaging | Upstash Redis Pub/Sub + Server-Sent Events (SSE) |
| Rate Limiting | Upstash Ratelimit |
| Deployment | Vercel |
| Code Generation | `nanoid` (custom alphabet) |

---

## 3. Project Structure

```
tempclip/
├── app/
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Home page — create or join session
│   ├── [code]/
│   │   └── page.tsx                      # Clipboard page — read/write by code
│   └── api/
│       └── session/
│           ├── route.ts                  # POST /api/session → create session
│           └── [code]/
│               ├── route.ts              # GET / PUT / DELETE /api/session/[code]
│               └── stream/
│                   └── route.ts          # GET /api/session/[code]/stream → SSE
├── lib/
│   ├── redis.ts                          # Upstash Redis client (REST)
│   ├── pubsub.ts                         # Upstash Redis Pub/Sub client
│   ├── session.ts                        # Session logic (create, read, write, delete)
│   ├── codegen.ts                        # Session code generator
│   └── ratelimit.ts                      # Rate limiter setup
├── components/
│   ├── ClipboardEditor.tsx               # Write + real-time sync via SSE
│   ├── CodeDisplay.tsx                   # Show session code + copy button
│   └── TTLBadge.tsx                      # Shows expiry countdown
├── hooks/
│   └── useSessionStream.ts               # Custom hook — subscribes to SSE stream
├── types/
│   └── session.ts                        # Shared TypeScript types
├── .env.local                            # Environment variables (not committed)
├── next.config.ts
└── package.json
```

---

## 4. How It Works

### Basic Flow (Read / Write)

```
Browser (Device A)               Next.js App                    Redis (Upstash)
       |                              |                                |
       |-- POST /api/session -------> |                                |
       |                              |-- SETEX session:X4K9MQ -----> |
       |<-- { code: "X4K9MQ" } ------|                                |
       |                              |                                |
       |-- PUT /api/session/X4K9MQ-> |                                |
       |   { content: "Hello!" }     |-- SET + PUBLISH clip:X4K9MQ-> |
       |<-- { status: "ok" } --------|                                |
```

### Real-Time Sync Flow

```
Device A (writer)           Next.js SSE Route           Redis Pub/Sub       Device B (reader)
       |                           |                          |                    |
       |                           |<-- GET /stream/X4K9MQ --|--------------------| (SSE connect)
       |                           |-- SUBSCRIBE clip:X4K9MQ>|                    |
       |                           |                          |                    |
       |-- PUT content ----------->|                          |                    |
       |                           |-- PUBLISH clip:X4K9MQ ->|                    |
       |                           |                          |-- message -------->|
       |                           |-- data: {content} -------|------- SSE ------->|
       |                           |                          |                    | (UI updates instantly)
```

### Step-by-step Flow

1. **Create** — User visits `/`, hits "New Clipboard". `POST /api/session` generates a code and creates a Redis key with TTL.
2. **Redirect** — User is redirected to `/[code]` (e.g., `/X4K9MQ`).
3. **SSE Connect** — The clipboard page opens a persistent `GET /api/session/[code]/stream` connection. The server subscribes to the Redis channel `clip:[code]` and streams any published messages as SSE events.
4. **Write** — User types content. After a debounce, `PUT /api/session/[code]` saves to Redis **and** publishes to the `clip:[code]` Pub/Sub channel.
5. **Broadcast** — All other SSE connections subscribed to `clip:[code]` receive the event and update their UI instantly — no polling, no page refresh.
6. **Expire** — Redis natively deletes the session key after TTL. The SSE stream sends a `session:expired` event and the UI shows an expiry state.

---

## 5. Session Code System

### Code Format

| Property | Value |
|----------|-------|
| Length | 6 characters |
| Character set | Uppercase A–Z + digits 0–9 (Base 36) |
| Total combinations | 36⁶ = **2,176,782,336** unique codes |
| Collision probability (1M active sessions) | ~0.046% |

### Code Generator — `lib/codegen.ts`

```typescript
import { customAlphabet } from 'nanoid';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;

export const generateSessionCode = customAlphabet(ALPHABET, CODE_LENGTH);

// Usage:
// generateSessionCode() → "X4K9MQ"
```

> **Note:** Codes are normalized to uppercase on all API inputs — `x4k9mq` and `X4K9MQ` resolve to the same session.

### Code Lifecycle

```
[generateSessionCode()]
         |
         v
[SETEX session:{code} in Redis with TTL]
         |
         v
[Session ACTIVE] <──── (each read/write resets TTL via SETEX)
         |
         │ (no activity for TTL duration)
         v
[Redis auto-deletes key]
         |
         ├──→ GET /api/session/[code]  returns 404
         └──→ SSE stream sends "session:expired" event → UI shows Expired state
```

---

## 6. API Routes (Next.js Route Handlers)

All API logic lives in `app/api/` using the App Router convention. No separate Express/Fastify server needed.

---

### `POST /api/session` — Create Session

**File:** `app/api/session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateSessionCode } from '@/lib/codegen';
import { redis } from '@/lib/redis';
import { ratelimit } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const ttl: number = Math.min(body.ttl ?? 900, 86400);
  const burnAfterRead: boolean = body.burn_after_read ?? false;

  const code = generateSessionCode();
  const key = `session:${code}`;

  await redis.setex(key, ttl, JSON.stringify({
    content: null,
    content_type: 'text/plain',
    burn: burnAfterRead,
    reads: 0,
    created_at: new Date().toISOString(),
  }));

  return NextResponse.json({
    code,
    ttl,
    burn_after_read: burnAfterRead,
    expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
  });
}
```

---

### `GET /api/session/[code]` — Read Session

**File:** `app/api/session/[code]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

type Params = { params: { code: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const code = params.code.toUpperCase();
  const key = `session:${code}`;

  const raw = await redis.get<string>(key);
  if (!raw) {
    return NextResponse.json({ error: 'SESSION_NOT_FOUND' }, { status: 404 });
  }

  const session = JSON.parse(raw);

  if (session.content === null) {
    return NextResponse.json({ error: 'SESSION_EMPTY' }, { status: 409 });
  }

  if (session.burn) {
    await redis.del(key);
    return NextResponse.json({ ...session, code, burned: true });
  }

  session.reads += 1;
  const ttl = await redis.ttl(key);
  await redis.setex(key, ttl, JSON.stringify(session));

  return NextResponse.json({ ...session, code });
}
```

---

### `PUT /api/session/[code]` — Write & Publish

When content is written, it is saved to Redis **and** published to the Pub/Sub channel so all SSE subscribers receive the update immediately.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { pubsub } from '@/lib/pubsub';

type Params = { params: { code: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const code = params.code.toUpperCase();
  const key = `session:${code}`;

  const raw = await redis.get<string>(key);
  if (!raw) {
    return NextResponse.json({ error: 'SESSION_NOT_FOUND' }, { status: 404 });
  }

  const body = await req.json();
  const content: string = body.content ?? '';

  if (Buffer.byteLength(content, 'utf8') > 512 * 1024) {
    return NextResponse.json({ error: 'CONTENT_TOO_LARGE' }, { status: 400 });
  }

  const session = JSON.parse(raw);
  session.content = content;
  session.content_type = body.content_type ?? 'text/plain';

  const ttl = await redis.ttl(key);
  await redis.setex(key, ttl, JSON.stringify(session));

  // Publish update to all subscribers on this session's channel
  await pubsub.publish(`clip:${code}`, JSON.stringify({
    type: 'content:update',
    content,
    content_type: session.content_type,
    updated_at: new Date().toISOString(),
  }));

  return NextResponse.json({
    status: 'ok',
    code,
    size_bytes: Buffer.byteLength(content, 'utf8'),
    expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
  });
}
```

---

### `DELETE /api/session/[code]` — Delete Session

```typescript
export async function DELETE(_req: NextRequest, { params }: Params) {
  const code = params.code.toUpperCase();

  // Notify all subscribers before deleting
  await pubsub.publish(`clip:${code}`, JSON.stringify({ type: 'session:deleted' }));
  const deleted = await redis.del(`session:${code}`);

  if (!deleted) {
    return NextResponse.json({ error: 'SESSION_NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ status: 'deleted', code });
}
```

---

## 7. Real-Time Sync (SSE + Upstash Pub/Sub)

### Why SSE over WebSockets?

Vercel Serverless Functions support **streaming responses** natively, which enables Server-Sent Events (SSE). WebSockets require a persistent bidirectional connection that serverless functions cannot maintain. SSE is one-directional (server → client), which is exactly what we need: the server pushes updates when content changes.

| | SSE | WebSockets |
|---|---|---|
| Direction | Server → Client (one-way) | Bidirectional |
| Vercel support | ✅ Native (streaming) | ❌ Not supported |
| Protocol | HTTP/1.1 (chunked) | `ws://` upgrade |
| Auto-reconnect | ✅ Built into browser | ❌ Manual |
| Complexity | Low | High |

Writes (client → server) continue to use the existing `PUT /api/session/[code]` REST endpoint, which then publishes to Redis Pub/Sub. SSE only carries the server-push direction.

---

### SSE Event Types

| Event type | Payload | Trigger |
|---|---|---|
| `content:update` | `{ content, content_type, updated_at }` | Another device saved new content |
| `session:expired` | `{ type }` | Redis TTL elapsed; key was deleted |
| `session:deleted` | `{ type }` | Manual DELETE called on the session |
| `ping` | `{ ts }` | Sent every 25s to keep connection alive |

---

### SSE Route Handler — `app/api/session/[code]/stream/route.ts`

This route opens a streaming HTTP response and subscribes to a Redis Pub/Sub channel for the session. Every message published to `clip:[code]` (by any `PUT` call) is forwarded as an SSE event to the connected browser.

```typescript
import { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';
import { pubsub } from '@/lib/pubsub';

export const runtime = 'nodejs'; // Required — Edge runtime doesn't support Redis TCP sub

type Params = { params: { code: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const code = params.code.toUpperCase();

  // Verify session exists before opening stream
  const exists = await redis.exists(`session:${code}`);
  if (!exists) {
    return new Response('Session not found', { status: 404 });
  }

  const channel = `clip:${code}`;
  const encoder = new TextEncoder();

  // Helper to format an SSE message
  function sseMessage(event: string, data: object): Uint8Array {
    return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      // Keep-alive ping every 25 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(sseMessage('ping', { ts: Date.now() }));
        } catch {
          clearInterval(pingInterval);
        }
      }, 25_000);

      // Subscribe to Redis Pub/Sub channel
      await pubsub.subscribe(channel, (message) => {
        try {
          const parsed = JSON.parse(message);
          const eventType: string = parsed.type ?? 'content:update';
          controller.enqueue(sseMessage(eventType, parsed));

          // Close stream if session was deleted or expired
          if (eventType === 'session:deleted' || eventType === 'session:expired') {
            clearInterval(pingInterval);
            controller.close();
          }
        } catch {
          // Ignore malformed messages
        }
      });
    },

    cancel() {
      // Client disconnected — clean up subscription
      pubsub.unsubscribe(channel);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering (important for Vercel)
    },
  });
}
```

---

### Pub/Sub Client — `lib/pubsub.ts`

The Pub/Sub client uses a **separate Redis connection** from the regular REST client. Upstash provides a dedicated Pub/Sub REST API for serverless environments.

```typescript
import { Redis } from '@upstash/redis';

// Pub/Sub uses the same Upstash instance but a separate client instance
// to avoid blocking the main REST client during subscribe
export const pubsub = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Channel naming convention:
// clip:{SESSION_CODE}  →  e.g. clip:X4K9MQ
```

> **Note:** Upstash's REST-based Pub/Sub uses long-polling under the hood, which works correctly with Vercel's streaming response model. No persistent TCP socket is required.

---

### Custom Hook — `hooks/useSessionStream.ts`

This hook handles the browser-side SSE connection. It opens an `EventSource`, listens for events, auto-reconnects on disconnect, and cleans up on unmount.

```typescript
import { useEffect, useRef, useCallback } from 'react';

type StreamEvent =
  | { type: 'content:update'; content: string; content_type: string; updated_at: string }
  | { type: 'session:expired' }
  | { type: 'session:deleted' }
  | { type: 'ping'; ts: number };

type Options = {
  onUpdate: (content: string) => void;
  onExpired: () => void;
};

export function useSessionStream(code: string, { onUpdate, onExpired }: Options) {
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource(`/api/session/${code}/stream`);
    esRef.current = es;

    es.addEventListener('content:update', (e) => {
      const data: StreamEvent = JSON.parse(e.data);
      if (data.type === 'content:update') onUpdate(data.content);
    });

    es.addEventListener('session:expired', () => onExpired());
    es.addEventListener('session:deleted', () => onExpired());

    // Auto-reconnect on error (e.g. network blip)
    es.onerror = () => {
      es.close();
      setTimeout(connect, 3000); // Retry after 3 seconds
    };
  }, [code, onUpdate, onExpired]);

  useEffect(() => {
    connect();
    return () => esRef.current?.close(); // Cleanup on unmount
  }, [connect]);
}
```

---

### Debounced Auto-Save Strategy

To avoid flooding the server with a `PUT` on every keystroke, writes are **debounced**. The user's local state updates instantly for a responsive feel, while the server call (and subsequent Pub/Sub broadcast) fires only after the user pauses typing.

```typescript
// In ClipboardEditor.tsx
import { useDebouncedCallback } from 'use-debounce';

const saveToServer = useDebouncedCallback(async (value: string) => {
  await fetch(`/api/session/${code}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: value }),
  });
}, 600); // 600ms debounce — saves after user pauses typing
```

### Preventing Echo (Feedback Loop)

When Device A types and the server broadcasts the update back, Device A's SSE listener would naively overwrite its own textarea — creating a cursor-jump feedback loop. This is prevented with a **write-lock flag**:

```typescript
const isLocalChange = useRef(false);

// When user types:
function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
  isLocalChange.current = true;
  setContent(e.target.value);
  saveToServer(e.target.value);
}

// In useSessionStream onUpdate callback:
const handleRemoteUpdate = useCallback((remoteContent: string) => {
  if (isLocalChange.current) {
    isLocalChange.current = false;
    return; // Skip — this is an echo of our own write
  }
  setContent(remoteContent); // Apply only if change came from another device
}, []);
```

---

## 8. Redis Integration (Upstash)

Upstash is serverless-native, pay-per-request, and works with Vercel Serverless Functions without connection pooling issues.

### REST Client — `lib/redis.ts`

```typescript
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();
// Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env
```

### Rate Limiter — `lib/ratelimit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: false,
});
```

### Redis Key Schema

```
Session data
  Key    : session:{CODE}            e.g.  session:X4K9MQ
  Value  : JSON string
  TTL    : Set at creation; reset on each read/write

Pub/Sub channel
  Channel: clip:{CODE}               e.g.  clip:X4K9MQ
  Scope  : Ephemeral — no persistence; messages not stored

Example session value:
{
  "content": "Hello from Device A!",
  "content_type": "text/plain",
  "burn": false,
  "reads": 2,
  "created_at": "2025-04-11T14:15:00Z"
}
```

---

## 9. Data Lifecycle

### TTL Options

| Mode | TTL | Use Case |
|------|-----|----------|
| Flash | 5 min (300s) | Quick cross-device paste |
| Standard | 15 min (900s) | Default — most use cases |
| Extended | 1 hour (3600s) | Sharing with a delayed recipient |
| Long | 24 hours (86400s) | Leaving notes for yourself |

### TTL Reset Behavior

Every `GET` and `PUT` fetches the remaining TTL with `redis.ttl()` and re-applies it via `SETEX`, so activity resets the clock.

```
t=0  min : Session created, TTL=15 → expires at t=15
t=7  min : PUT (content written)   → TTL reset, expires at t=22
t=19 min : GET (content read)      → TTL reset, expires at t=34
t=34 min : No activity             → Redis deletes key + SSE sends "session:expired"
```

### Burn-After-Read Mode

When `burn: true`, the key is deleted by `redis.del()` inside the `GET` handler immediately after the response data is prepared.

```
t=0 : Session created (burn=true, TTL=900)
t=5 : PUT content written
t=8 : GET by Device B → content returned, key deleted, SSE sends "session:deleted"
t=9 : GET by Device C → 404 SESSION_NOT_FOUND
```

---

## 10. Pages & Components

### `app/page.tsx` — Home (Create or Join Session)

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  async function createSession() {
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttl: 900 }),
    });
    const { code } = await res.json();
    router.push(`/${code}`);
  }

  function joinSession() {
    if (joinCode.trim().length === 6) {
      router.push(`/${joinCode.trim().toUpperCase()}`);
    }
  }

  return (
    <main>
      <h1>TempClip</h1>
      <p>A temporary clipboard. No login. Just a code.</p>
      <button onClick={createSession}>New Clipboard</button>
      <div>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          placeholder="Enter code (e.g. X4K9MQ)"
        />
        <button onClick={joinSession}>Join</button>
      </div>
    </main>
  );
}
```

---

### `app/[code]/page.tsx` — Clipboard Page

```tsx
import { ClipboardEditor } from '@/components/ClipboardEditor';

type Props = { params: { code: string } };

export default async function ClipboardPage({ params }: Props) {
  const code = params.code.toUpperCase();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/session/${code}`,
    { cache: 'no-store' }
  );

  const data = res.status === 409
    ? { content: '' }
    : res.ok
    ? await res.json()
    : null;

  if (!data) {
    return (
      <main>
        <h1>Session not found</h1>
        <p>Code <code>{code}</code> has expired or doesn't exist.</p>
      </main>
    );
  }

  return <ClipboardEditor initialContent={data.content ?? ''} code={code} />;
}
```

---

### `components/ClipboardEditor.tsx` — With Real-Time Sync

```tsx
'use client';
import { useState, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useSessionStream } from '@/hooks/useSessionStream';

type Props = { code: string; initialContent: string };

export function ClipboardEditor({ code, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isExpired, setIsExpired] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'live' | 'reconnecting'>('live');
  const isLocalChange = useRef(false);

  // Debounced save — fires 600ms after user stops typing
  const saveToServer = useDebouncedCallback(async (value: string) => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/session/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: value }),
      });
      setSaveStatus(res.ok ? 'saved' : 'error');
    } catch {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, 600);

  // Handle remote updates (from other devices via SSE)
  const handleRemoteUpdate = useCallback((remoteContent: string) => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return; // Echo of our own write — skip
    }
    setContent(remoteContent);
  }, []);

  // Connect to SSE stream
  useSessionStream(code, {
    onUpdate: handleRemoteUpdate,
    onExpired: () => setIsExpired(true),
    onReconnecting: () => setSyncStatus('reconnecting'),
    onReconnected: () => setSyncStatus('live'),
  });

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    isLocalChange.current = true;
    setContent(e.target.value);
    saveToServer(e.target.value);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
  }

  if (isExpired) {
    return (
      <main>
        <h1>Session Expired</h1>
        <p>Code <code>{code}</code> has expired. Start a new clipboard.</p>
      </main>
    );
  }

  return (
    <div>
      <header>
        <span>
          Session: <strong>{code}</strong>
        </span>
        <span title={syncStatus === 'live' ? 'Real-time sync active' : 'Reconnecting…'}>
          {syncStatus === 'live' ? '🟢 Live' : '🟡 Reconnecting…'}
        </span>
        <button onClick={copyCode}>Copy Code</button>
      </header>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Paste or type anything here… other devices will see it instantly."
        rows={16}
      />

      <footer>
        <span>
          {saveStatus === 'saving' ? 'Saving…'
            : saveStatus === 'saved' ? 'Saved ✓'
            : saveStatus === 'error' ? '⚠ Save failed'
            : 'Auto-save on'}
        </span>
      </footer>
    </div>
  );
}
```

---

## 11. Environment Variables

Create `.env.local` in the project root. **Never commit this file.**

```env
# Upstash Redis — get from upstash.com dashboard
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# App base URL — used for server-side fetch inside page components
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

For Vercel production, add all three via **Project → Settings → Environment Variables**.

---

## 12. Security Considerations

### What TempClip Does

- All traffic encrypted via **HTTPS / TLS** (enforced by Vercel)
- Content stored **only in Redis memory** — never on disk, never in server logs
- SSE connections authenticated only by session code — no additional token
- Sessions deleted permanently on expiry — no recovery possible
- No user accounts, no IP logging, no content analytics

### What TempClip Does NOT Do

- ❌ Encrypt content at rest (Redis stores plaintext JSON)
- ❌ Authenticate SSE subscribers — any client that knows the code can open a stream
- ❌ Guarantee privacy beyond code secrecy

### Threat Model

| Threat | Risk | Mitigation |
|--------|------|------------|
| Code brute-force | Low (2.1B combos) | Upstash Ratelimit: 60 req/min per IP |
| SSE stream snooping | Same as read access | Code secrecy; use burn-after-read for sensitive content |
| Man-in-the-middle | Mitigated | TLS via Vercel; HSTS header |
| Server compromise | Medium | In-memory only; Upstash encrypts data at rest |
| Pub/Sub message injection | Low | Channel names are server-generated; only the server publishes |

> ⚠️ **Do not use TempClip for passwords, private keys, or personal identification.** Protection is by code secrecy only — there is no authentication layer.

---

## 13. Error Handling

All Route Handlers return consistent JSON error objects.

**Utility — `lib/errors.ts`**

```typescript
import { NextResponse } from 'next/server';

export function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}
```

| HTTP Status | Error Code | Trigger |
|-------------|------------|---------|
| `400` | `INVALID_CODE_FORMAT` | Code is not 6 alphanumeric characters |
| `400` | `CONTENT_TOO_LARGE` | Content exceeds 512 KB |
| `400` | `INVALID_TTL` | TTL outside 60–86400 range |
| `404` | `SESSION_NOT_FOUND` | Redis key missing (expired or never created) |
| `404` | `SESSION_BURNED` | Burn-after-read session already consumed |
| `409` | `SESSION_EMPTY` | Session exists but no content has been written yet |
| `429` | `RATE_LIMITED` | IP exceeded rate limit |
| `500` | `INTERNAL_ERROR` | Unexpected Redis or server error |

**SSE stream errors** are not HTTP errors — they cause the `EventSource.onerror` handler to fire on the client, which triggers the auto-reconnect logic in `useSessionStream`.

**Example JSON error response:**

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "No session found for code 'X4K9MQ'. It may have expired."
  }
}
```

---

## 14. Deployment

### Local Development

```bash
# 1. Clone and install
git clone https://github.com/you/tempclip.git
cd tempclip
npm install

# 2. Install real-time dependency
npm install use-debounce

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your Upstash credentials

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

### Vercel (Production)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add NEXT_PUBLIC_BASE_URL
```

### Upstash Redis Setup

1. Create a free account at [upstash.com](https://upstash.com)
2. Create a new **Redis** database → select the region closest to your Vercel deployment
3. Copy the **REST URL** and **REST Token** into your environment variables
4. Set **Eviction Policy** to `noeviction`
5. Confirm **Pub/Sub** is enabled (it is by default on all Upstash Redis instances)

### Architecture on Vercel (with Real-Time Sync)

```
Devices (Browsers)
   │  │  │
   │  │  └─── SSE stream ──────────────────────────────────────┐
   │  │                                                         │
   │  └─────── PUT /api/session/[code] ──────────────────────┐ │
   │                                                          │ │
   └─────────── GET /api/session/[code] ──────────────┐      │ │
                                                       │      │ │
                                          Vercel Serverless Functions
                                          ┌────────────┴──────┴─┴──┐
                                          │   Route Handlers        │
                                          │   GET / PUT / DELETE    │
                                          │   GET /stream (SSE)     │
                                          └────────────┬────────────┘
                                                       │ HTTPS REST
                                          ┌────────────▼────────────┐
                                          │   Upstash Redis         │
                                          │   ┌──────────────────┐  │
                                          │   │ session:{code}   │  │
                                          │   │ (key/value + TTL)│  │
                                          │   └──────────────────┘  │
                                          │   ┌──────────────────┐  │
                                          │   │ clip:{code}      │  │
                                          │   │ (Pub/Sub channel)│  │
                                          │   └──────────────────┘  │
                                          └─────────────────────────┘
```

---

## 15. Limitations

| Limitation | Value / Note |
|------------|--------------|
| Max content size | 512 KB per session |
| Min TTL | 60 seconds |
| Max TTL | 86,400 seconds (24 hours) |
| Rate limit | 60 requests / minute per IP |
| Concurrent SSE connections | Subject to Vercel function concurrency limits |
| SSE max duration | ~5 min on Vercel Hobby; unlimited on Pro (streaming functions) |
| Concurrent sessions | Unlimited (subject to Upstash free tier) |
| Supported content | Plain text, URLs, code snippets |
| Binary / file upload | ❌ Not supported |
| End-to-end encryption | ❌ Not provided |
| Collaborative cursor tracking | ❌ Not built-in (would require operational transform / CRDT) |
| Access control | Code-only — no passwords, no auth tokens |

> **Vercel Hobby plan note:** Streaming responses are capped at ~5 minutes. For longer-lived SSE connections, upgrade to Vercel Pro or implement client-side polling as a fallback when the stream closes.

---

*TempClip — ephemeral by design. When it's gone, it's gone.*