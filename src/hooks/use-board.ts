import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBoards,
  createBoard,
  deleteBoard,
} from "@/lib/api/board.api";
import type { Board } from "@/lib/api/types";

// ─── Query: list all boards in a workspace ────────────────────────────────────
export function useBoards(workspaceId: string) {
  return useQuery<Board[]>({
    queryKey: ["boards", workspaceId],
    queryFn: () => listBoards(workspaceId),
    enabled: !!workspaceId,
  });
}

// ─── Query: single board by id ────────────────────────────────────────────────
export function useBoard(workspaceId: string, boardId: string | number) {
  const { data: boards = [], isLoading } = useBoards(workspaceId);
  return {
    data: boards.find((b) => String(b.id) === String(boardId)) ?? null,
    isLoading,
  };
}

// ─── Mutation: create board ───────────────────────────────────────────────────
export function useCreateBoard(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      createBoard(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
    },
  });
}

// ─── Mutation: delete board ───────────────────────────────────────────────────
export function useDeleteBoard(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(workspaceId, boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
    },
  });
}

// ─── Compound hook: boards management (list + create + delete) ────────────────
export function useBoardsManagement(workspaceId: string) {
  const { data: boards = [], isLoading } = useBoards(workspaceId);
  const createBoardMutation = useCreateBoard(workspaceId);
  const deleteBoardMutation = useDeleteBoard(workspaceId);

  return {
    boards,
    isLoading,
    createBoard: (name: string, description?: string) =>
      createBoardMutation.mutateAsync({ name, description }),
    deleteBoard: (boardId: string) => deleteBoardMutation.mutateAsync(boardId),
    isCreating: createBoardMutation.isPending,
    isDeleting: deleteBoardMutation.isPending,
  };
}
