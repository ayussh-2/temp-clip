export type SessionData = {
  content: string | null;
  content_type: string;
  burn: boolean;
  reads: number;
  created_at: string;
};

export type CreateSessionRequest = {
  ttl?: number;
  burn_after_read?: boolean;
};

export type CreateSessionResponse = {
  code: string;
  ttl: number;
  burn_after_read: boolean;
  expires_at: string;
};

export type GetSessionResponse = SessionData & {
  code: string;
  burned?: boolean;
};

export type UpdateSessionRequest = {
  content: string;
  content_type?: string;
};

export type UpdateSessionResponse = {
  status: string;
  code: string;
  size_bytes: number;
  expires_at: string;
};

export type DeleteSessionResponse = {
  status: string;
  code: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export type StreamEvent =
  | {
      type: "content:update";
      content: string;
      content_type: string;
      updated_at: string;
    }
  | { type: "session:expired" }
  | { type: "session:deleted" }
  | { type: "ping"; ts: number };
