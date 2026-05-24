/**
 * Centralized API gateway route constants.
 * Gateway base URL: http://localhost:8080 (configured via NEXT_PUBLIC_API_URL)
 */

// ── Auth ────────────────────────────────────────────────────────────────────
export const AUTH = {
  LOGIN: "/api/v1/auth/login",
  REGISTER: "/api/v1/auth/register",
  LOGOUT: "/api/v1/auth/logout",
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
  UPDATE: (id: string) => `/api/v1/workspaces/${id}`,
  DELETE: (id: string) => `/api/v1/workspaces/${id}`,
  MEMBERS: (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/members`,
  INVITE: (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/members`,
  CHANGE_ROLE: (workspaceId: string, memberId: string) => `/api/v1/workspaces/${workspaceId}/members/${memberId}`,
  REMOVE_MEMBER: (workspaceId: string, memberId: string) => `/api/v1/workspaces/${workspaceId}/members/${memberId}`,
  INVITATIONS: (workspaceId: string) => `/api/v1/workspaces/${workspaceId}/members/invitation`,
  REMOVE_INVITATION: (workspaceId: string, invitationId: string) => `/api/v1/workspaces/${workspaceId}/members/invitation/${invitationId}`,
} as const;

// ── Boards (board service, proxied as /api/v1/boards/*) ─────────────────────
export const BOARDS = {
  LIST: (workspaceId: string) =>
    `/api/v1/boards/workspaces/${workspaceId}/boards`,
  CREATE: (workspaceId: string) =>
    `/api/v1/boards/workspaces/${workspaceId}/boards`,
  DETAIL: (workspaceId: string, boardId: string) =>
    `/api/v1/boards/workspaces/${workspaceId}/boards/${boardId}`,
  UPDATE: (workspaceId: string, boardId: string) =>
    `/api/v1/boards/workspaces/${workspaceId}/boards/${boardId}`,
  DELETE: (workspaceId: string, boardId: string) =>
    `/api/v1/boards/workspaces/${workspaceId}/boards/${boardId}`,
  LISTS: (workspaceId: string, boardId: string) =>
    `/api/v1/boards/workspaces/${workspaceId}/boards/${boardId}/lists`,
  CREATE_LIST: (boardId: string) => `/api/v1/boards/${boardId}/lists`,
  STAT_METRICS: "/api/v1/boards/statistics/metrics",
  STAT_ACTIVITIES: "/api/v1/boards/statistics/activities",
  STAT_PRIORITIES: "/api/v1/boards/statistics/priorities",
  STAT_WORKLOADS: "/api/v1/boards/statistics/workloads",
} as const;

// ── Lists (board service) ───────────────────────────────────────────────────
export const LISTS = {
  UPDATE: (listId: string) => `/api/v1/boards/lists/${listId}`,
  DELETE: (listId: string) => `/api/v1/boards/lists/${listId}`,
  CREATE_CARD: (listId: string) => `/api/v1/boards/lists/${listId}/cards`,
  CARDS: (listId: string) => `/api/v1/boards/lists/${listId}/cards`,
} as const;

// ── Cards (board service) ───────────────────────────────────────────────────
export const CARDS = {
  DETAIL: (cardId: string) => `/api/v1/boards/cards/${cardId}`,
  UPDATE: (cardId: string) => `/api/v1/boards/cards/${cardId}`,
  DELETE: (cardId: string) => `/api/v1/boards/cards/${cardId}`,
  ATTACH_LABEL: (cardId: string) => `/api/v1/boards/cards/${cardId}/labels`,
  DETACH_LABEL: (cardId: string, labelId: string) =>
    `/api/v1/boards/cards/${cardId}/labels/${labelId}`,
  SET_DUE_DATE: (cardId: string) => `/api/v1/boards/cards/${cardId}/due-date`,
  CLEAR_DUE_DATE: (cardId: string) => `/api/v1/boards/cards/${cardId}/due-date`,
  ASSIGN_MEMBER: (cardId: string) => `/api/v1/boards/cards/${cardId}/members`,
  REMOVE_MEMBER: (cardId: string, memberId: string) =>
    `/api/v1/boards/cards/${cardId}/members/${memberId}`,
} as const;

// ── Labels (board service) ──────────────────────────────────────────────────
export const LABELS = {
  LIST: (boardId: string) => `/api/v1/boards/${boardId}/labels`,
  UPDATE: (boardId: string, labelId: string) =>
    `/api/v1/boards/${boardId}/labels/${labelId}`,
  DELETE: (boardId: string, labelId: string) =>
    `/api/v1/boards/${boardId}/labels/${labelId}`,
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
