import api from "./axios";
import { BOARDS } from "./routes";
import type { Board } from "./types";

type ServerEnvelope<T> = { success: boolean; data: T; message?: string };

function unwrap<T>(data: ServerEnvelope<T> | T): T {
  if (data && typeof data === "object" && "success" in data) {
    return (data as ServerEnvelope<T>).data;
  }
  return data as T;
}

/**
 * List all boards for a workspace.
 * POST /api/v1/boards  body: { workspaceId: string }
 */
export async function listBoards(workspaceId: string): Promise<Board[]> {
  const { data } = await api.post<ServerEnvelope<Board[]> | Board[]>(
    BOARDS.LIST,
    { workspaceId },
  );
  const result = unwrap(data);
  return Array.isArray(result) ? result : [];
}

/**
 * Create a new board in a workspace.
 * POST /api/v1/workspaces/:workspaceId/boards
 */
export async function createBoard(
  workspaceId: string,
  payload: { name: string; description?: string },
): Promise<Board> {
  const { data } = await api.post<ServerEnvelope<Board> | Board>(
    BOARDS.CREATE(workspaceId),
    payload,
  );
  return unwrap(data);
}

/**
 * Delete a board from a workspace.
 * DELETE /api/v1/workspaces/:workspaceId/boards/:boardId
 */
export async function deleteBoard(workspaceId: string, boardId: string): Promise<void> {
  await api.delete(BOARDS.DELETE(workspaceId, boardId));
}
