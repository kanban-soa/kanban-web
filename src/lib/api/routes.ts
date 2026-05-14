/**
 * Centralized API gateway route constants.
 * Gateway base URL: http://localhost:8080 (configured via NEXT_PUBLIC_API_URL)
 */

// ── Auth ────────────────────────────────────────────────────────────────────
export const AUTH = {
  LOGIN: "/api/v1/auth/login",
  REGISTER: "/api/v1/auth/register",
  LIST_ACCOUNTS: "/api/v1/auth/",
} as const;

// ── Workspaces ──────────────────────────────────────────────────────────────
export const WORKSPACES = {
  LIST: "/api/v1/workspaces",
  CREATE: "/api/v1/workspaces",
  DETAIL: (id: string) => `/api/v1/workspaces/${id}`,
  INVITE: (workspaceId: string) => `/api/workspaces/${workspaceId}/members`,
} as const;

// ── Boards ──────────────────────────────────────────────────────────────────
export const BOARDS = {
  LIST: "/api/v1/boards",
  CREATE: "/api/v1/boards",
} as const;

// ── Notifications ───────────────────────────────────────────────────────────
export const NOTIFICATIONS = {
  LIST: "/api/v1/notifications",
} as const;

// ── Statistics ──────────────────────────────────────────────────────────────
export const STATISTICS = {
  GET: "/api/v1/statistics",
} as const;
