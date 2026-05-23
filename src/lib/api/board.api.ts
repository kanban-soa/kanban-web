import api from "./axios";
import { BOARDS } from "./routes";
import type { Board } from "./types";

/**
 * List all boards in a workspace
 */
export async function listBoards(workspaceId: string): Promise<Board[]> {
  const { data } = await api.get<Board[] | { data: Board[] }>(BOARDS.LIST(workspaceId));
  return Array.isArray(data) ? data : (data as { data: Board[] }).data ?? [];
}

/**
 * Create a new board in a workspace
 */
export async function createBoard(
  workspaceId: string,
  payload: { title: string; description?: string },
): Promise<Board> {
  const { data } = await api.post<{ data: Board } | Board>(
    BOARDS.CREATE(workspaceId),
    payload,
  );
  // Handle both { data: Board } and Board shapes
  return "data" in data && typeof (data as { data: Board }).data === "object"
    ? (data as { data: Board }).data
    : (data as Board);
}

/**
 * Delete a board from a workspace
 */
export async function deleteBoard(workspaceId: string, boardId: string): Promise<void> {
  await api.delete(BOARDS.DELETE(workspaceId, boardId));
}
