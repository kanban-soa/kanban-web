import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  listBoardLists,
  createList,
  updateList,
  deleteList,
  createCard,
  getCard,
  updateCard,
  deleteCard,
  attachLabelToCard,
  detachLabelFromCard,
  setCardDueDate,
  clearCardDueDate,
  assignMemberToCard,
  removeMemberFromCard,
  listBoardLabels,
  updateLabel,
  deleteLabel,
  getBoardMetrics,
  getBoardActivityStats,
  getBoardPriorityStats,
  getBoardWorkloadStats,
  type CreateBoardRequest,
  type UpdateBoardRequest,
  type CreateCardRequest,
  type UpdateCardRequest,
  type CreateListRequest,
  type UpdateListRequest,
  type UpdateLabelRequest,
} from "@/lib/api/board.api";
import type { Board, BoardList, Card, Label } from "@/lib/api/types";

// ── Boards ──────────────────────────────────────────────────────────────────
export function useBoards(workspacePublicId: string) {
  return useQuery<Board[]>({
    queryKey: ["boards", workspacePublicId],
    queryFn: () => listBoards(workspacePublicId),
    enabled: !!workspacePublicId,
  });
}

export function useBoard(workspacePublicId: string, boardId: string) {
  return useQuery<Board>({
    queryKey: ["boards", workspacePublicId, boardId],
    queryFn: () => getBoard(workspacePublicId, boardId),
    enabled: !!workspacePublicId && !!boardId,
  });
}

export function useCreateBoard(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBoardRequest) =>
      createBoard(workspacePublicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspacePublicId] });
    },
  });
}

export function useUpdateBoard(workspacePublicId: string, boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBoardRequest) =>
      updateBoard(workspacePublicId, boardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspacePublicId] });
      queryClient.invalidateQueries({
        queryKey: ["boards", workspacePublicId, boardId],
      });
    },
  });
}

export function useDeleteBoard(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(workspacePublicId, boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", workspacePublicId] });
    },
  });
}

// ── Lists ───────────────────────────────────────────────────────────────────
export function useBoardLists(workspacePublicId: string, boardId: string) {
  return useQuery<BoardList[]>({
    queryKey: ["boards", workspacePublicId, boardId, "lists"],
    queryFn: () => listBoardLists(workspacePublicId, boardId),
    enabled: !!workspacePublicId && !!boardId,
  });
}

export function useCreateList(workspacePublicId: string, boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateListRequest) => createList(boardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boards", workspacePublicId, boardId, "lists"],
      });
    },
  });
}

export function useUpdateList(workspacePublicId: string, boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listId,
      payload,
    }: {
      listId: string;
      payload: UpdateListRequest;
    }) => updateList(listId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boards", workspacePublicId, boardId, "lists"],
      });
    },
  });
}

export function useDeleteList(workspacePublicId: string, boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => deleteList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boards", workspacePublicId, boardId, "lists"],
      });
    },
  });
}

// ── Cards ───────────────────────────────────────────────────────────────────
export function useCard(cardId: string) {
  return useQuery<Card>({
    queryKey: ["cards", cardId],
    queryFn: () => getCard(cardId),
    enabled: !!cardId,
  });
}

export function useCreateCard(
  workspacePublicId: string,
  boardId: string,
  listId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCardRequest) => createCard(listId, payload),
    onSuccess: (newCard) => {
      const key = ["boards", workspacePublicId, boardId, "lists"];
      // Merge into the cached lists. We intentionally do NOT invalidate the
      // lists query: the lists endpoint may not re-embed cards on refetch,
      // which would wipe the new card from the UI.
      queryClient.setQueryData<(BoardList & { cards?: Card[] })[]>(
        key,
        (old) => {
          if (!old) return old;
          return old.map((l) => {
            const matchesList =
              l.id === listId ||
              l.publicId === listId ||
              l.id === newCard.listId ||
              l.publicId === newCard.listId;
            if (!matchesList) return l;
            const existing = l.cards ?? [];
            return { ...l, cards: [...existing, newCard] };
          });
        },
      );
    },
  });
}

export function useUpdateCard(workspacePublicId: string, boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      payload,
    }: {
      cardId: string;
      payload: UpdateCardRequest;
    }) => updateCard(cardId, payload),
    onSuccess: (_data, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
      queryClient.invalidateQueries({
        queryKey: ["boards", workspacePublicId, boardId, "lists"],
      });
    },
  });
}

export function useDeleteCard(workspacePublicId: string, boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boards", workspacePublicId, boardId, "lists"],
      });
    },
  });
}

export function useAttachLabelToCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, labelId }: { cardId: string; labelId: string }) =>
      attachLabelToCard(cardId, labelId),
    onSuccess: (_d, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
    },
  });
}

export function useDetachLabelFromCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, labelId }: { cardId: string; labelId: string }) =>
      detachLabelFromCard(cardId, labelId),
    onSuccess: (_d, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
    },
  });
}

export function useSetCardDueDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, dueDate }: { cardId: string; dueDate: string }) =>
      setCardDueDate(cardId, dueDate),
    onSuccess: (_d, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
    },
  });
}

export function useClearCardDueDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => clearCardDueDate(cardId),
    onSuccess: (_d, cardId) => {
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
    },
  });
}

export function useAssignMemberToCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      workspaceMemberPublicId,
    }: {
      cardId: string;
      workspaceMemberPublicId: string;
    }) => assignMemberToCard(cardId, workspaceMemberPublicId),
    onSuccess: (_d, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
    },
  });
}

export function useRemoveMemberFromCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, memberId }: { cardId: string; memberId: string }) =>
      removeMemberFromCard(cardId, memberId),
    onSuccess: (_d, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
    },
  });
}

// ── Labels ──────────────────────────────────────────────────────────────────
export function useBoardLabels(boardId: string) {
  return useQuery<Label[]>({
    queryKey: ["boards", boardId, "labels"],
    queryFn: () => listBoardLabels(boardId),
    enabled: !!boardId,
  });
}

export function useUpdateLabel(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      labelId,
      payload,
    }: {
      labelId: string;
      payload: UpdateLabelRequest;
    }) => updateLabel(boardId, labelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", boardId, "labels"] });
    },
  });
}

export function useDeleteLabel(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => deleteLabel(boardId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", boardId, "labels"] });
    },
  });
}

// ── Board statistics ────────────────────────────────────────────────────────
export function useBoardMetrics<T = unknown>() {
  return useQuery<T>({
    queryKey: ["board-stats", "metrics"],
    queryFn: () => getBoardMetrics<T>(),
  });
}

export function useBoardActivityStats<T = unknown>() {
  return useQuery<T>({
    queryKey: ["board-stats", "activities"],
    queryFn: () => getBoardActivityStats<T>(),
  });
}

export function useBoardPriorityStats<T = unknown>() {
  return useQuery<T>({
    queryKey: ["board-stats", "priorities"],
    queryFn: () => getBoardPriorityStats<T>(),
  });
}

export function useBoardWorkloadStats<T = unknown>() {
  return useQuery<T>({
    queryKey: ["board-stats", "workloads"],
    queryFn: () => getBoardWorkloadStats<T>(),
  });
}

// ── Compound hook (back-compat with existing callers) ───────────────────────
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
