import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBoards,
  createBoard,
  deleteBoard,
} from "@/lib/api/board.api";
import type { Board } from "@/lib/api/types";

// ─── Query: list all boards in a workspace ────────────────────────────────────
export function useBoards(workspacePublicId: string) {
  return useQuery<Board[]>({
    queryKey: ["boards", workspacePublicId],
    queryFn: () => listBoards(workspacePublicId),
    enabled: !!workspacePublicId,
  });
}

// ─── Query: single board by id ────────────────────────────────────────────────
export function useBoard(workspacePublicId: string, boardId: string) {
  const { data: boards = [] } = useBoards(workspacePublicId);
  return {
    data: boards.find((b) => b.id === boardId) ?? null,
  };
}

// ─── Mutation: create board ───────────────────────────────────────────────────
export function useCreateBoard(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; description?: string }) =>
      createBoard(workspacePublicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspacePublicId] });
    },
  });
}

// ─── Mutation: delete board ───────────────────────────────────────────────────
export function useDeleteBoard(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(workspacePublicId, boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspacePublicId] });
    },
  });
}

// ─── Compound hook: boards management (list + create + delete) ────────────────
// Mirrors the shape previously returned by the localStorage-based hook so that
// call-sites that destructure { boards, createBoard, deleteBoard } keep working.
export function useBoardsManagement(workspacePublicId: string) {
  const { data: boards = [], isLoading } = useBoards(workspacePublicId);
  const createBoardMutation = useCreateBoard(workspacePublicId);
  const deleteBoardMutation = useDeleteBoard(workspacePublicId);

  return {
    boards,
    isLoading,
    createBoard: (title: string, description?: string) =>
      createBoardMutation.mutateAsync({ title, description }),
    deleteBoard: (boardId: string) => deleteBoardMutation.mutateAsync(boardId),
    isCreating: createBoardMutation.isPending,
    isDeleting: deleteBoardMutation.isPending,
  };
}
