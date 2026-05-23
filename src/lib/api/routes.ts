/**
 * Centralized API gateway route constants.
 * Gateway base URL: http://localhost:8080 (configured via NEXT_PUBLIC_API_URL)
 */

// ── Auth ────────────────────────────────────────────────────────────────────
export const AUTH = {
  LOGIN: "/api/v1/auth/login",
  REGISTER: "/api/v1/auth/register",
  LIST_ACCOUNTS: "/api/v1/auth/",
  UPDATE_USER: (id: string) => `/api/v1/auth/users/${id}`,
  GET_USER: (id: string) => `/api/v1/auth/users/${id}`,
} as const;

// ── Workspaces ──────────────────────────────────────────────────────────────
export const WORKSPACES = {
  LIST: "/api/v1/workspaces",
  DEFAULT: "/api/v1/workspaces/default",
  CREATE: "/api/v1/workspaces",
  DETAIL: (id: string) => `/api/v1/workspaces/${id}`,
  MEMBERS: (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/members`,
  INVITE: (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/members`,
  CHANGE_ROLE: (workspaceId: string, memberId: string) => `/api/v1/workspaces/${workspaceId}/members/${memberId}`,
  REMOVE_MEMBER: (workspaceId: string, memberId: string) => `/api/v1/workspaces/${workspaceId}/members/${memberId}`,
  INVITATIONS: (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/members/invitation`,
  REMOVE_INVITATION: (workspaceId: string, invitationId: string) => `/api/v1/workspaces/${workspaceId}/members/invitation/${invitationId}`,
} as const;

// ── Boards ──────────────────────────────────────────────────────────────────
export const BOARDS = {
  LIST: (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/boards`,
  CREATE: (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/boards`,
  DELETE: (workspaceId: string, boardId: string) =>
    `/api/v1/workspaces/${workspaceId}/boards/${boardId}`,
} as const;

// ── Notifications ───────────────────────────────────────────────────────────
export const NOTIFICATIONS = {
  LIST: "/api/v1/notifications",
} as const;

// ── Statistics ──────────────────────────────────────────────────────────────
export const STATISTICS = {
  SUMMARY: (workspaceId: string) => `/api/v1/statistics/${workspaceId}`,
  EXPORT: (workspaceId: string) => `/api/v1/statistics/${workspaceId}/export`,
  ACTIVITIES: (workspaceId: string) => `/api/v1/statistics/${workspaceId}/activities`,
  SELF_PERFORMANCE: (workspaceId: string) =>
    `/api/v1/statistics/${workspaceId}/self-performance`,
} as const;
