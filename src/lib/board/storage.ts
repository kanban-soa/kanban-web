import type { BoardsManagementState, Id } from "./types";

const STORAGE_PREFIX = "kanban:web";

function keyForWorkspace(workspaceId: Id) {
  return `${STORAGE_PREFIX}:workspace:${workspaceId}`;
}

export function loadWorkspaceState(workspaceId: Id): BoardsManagementState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(keyForWorkspace(workspaceId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BoardsManagementState;
  } catch {
    return null;
  }
}

export function saveWorkspaceState(workspaceId: Id, state: BoardsManagementState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyForWorkspace(workspaceId), JSON.stringify(state));
}

