import api from "./axios";
import { BOARDS } from "./routes";
import type { Board } from "./types";

type ServerEnvelope<T> = { success: boolean; data: T; message?: string };

function unwrap<T>(data: any): T {
  if (data && typeof data === "object") {
    if ("data" in data && data.data !== undefined) {
      return data.data;
    }
  }
  return data as T;
}

/**
 * List all boards for a workspace.
 * POST /api/v1/boards/all  body: { workspaceId: string }
 */
export async function listBoards(workspaceId: string): Promise<Board[]> {
  const { data } = await api.post<any>(
    BOARDS.LIST,
    { workspaceId },
  );
  const result = unwrap<Board[]>(data);
  return Array.isArray(result) ? result : [];
}

/**
 * Create a new board in a workspace.
 * POST /api/v1/boards  body: { workspaceId, name, description }
 */
export async function createBoard(
  workspaceId: string,
  payload: { name: string; description?: string },
): Promise<Board> {
  const { data } = await api.post<any>(
    BOARDS.CREATE,
    {
      workspaceId,
      ...payload,
    },
  );
  return unwrap<Board>(data);
}

/**
 * Delete a board from a workspace.
 * DELETE /api/v1/boards/:boardId  body: { workspaceId }
 */
export async function deleteBoard(workspaceId: string, boardId: string): Promise<void> {
  await api.delete(BOARDS.DELETE(boardId), {
    data: { workspaceId },
  });
}
