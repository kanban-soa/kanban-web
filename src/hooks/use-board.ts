"use client";

import * as React from "react";
import type { Board, Id, BoardsManagementState, List, card, Workspace } from "../lib/board/types";
import { loadWorkspaceState, saveWorkspaceState } from "../lib/board/storage";
import { seedBoard, seedDefaultLists, seedWorkspace } from "../lib/board/seed";
import { mockState } from "../lib/board/mockWorkspace";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function ensureWorkspaceInitialized(workspaceId: Id): BoardsManagementState {
  const existing = loadWorkspaceState(workspaceId);
  if (existing) return existing;
  if (workspaceId === "default") {
    console.log("Seeding default workspace with mock data");
    saveWorkspaceState(workspaceId, mockState);
    return mockState;
  }
  const seeded = seedWorkspace(workspaceId);
  console.log(`Seeding workspace ${workspaceId} with default data`);
  saveWorkspaceState(workspaceId, seeded);
  return seeded;
}

type BoardsManagementActions = {
  createBoard: (title: string) => Id;
  updateBoard: (boardId: Id, patch: Partial<Pick<Board, "title" | "description">>) => void;
  initBoard: (boardId: Id) => void;
  deleteBoard: (boardId: Id) => void;
  createList: (boardId: Id, title: string) => Id;
  updateList: (listId: Id, patch: Partial<Pick<List, "title">>) => void;
  deleteList: (boardId: Id, listId: Id) => void;
  createcard: (boardId: Id, listId: Id, title: string, description?: string) => Id;
  deletecard: (cardId: Id) => void;
  updatecard: (
    cardId: Id,
    patch: Partial<Pick<card, "title" | "description" | "listId" | "labels" | "members" | "dueDate">>,
  ) => void;
  createBoardLabel: (boardId: Id, label: { text: string; color: string }) => void;
};

type BoardsManagementSelectors = {
  workspace: Workspace | null;
  boards: Board[];
  getBoard: (boardId: Id) => Board | null;
  getListsForBoard: (boardId: Id) => List[];
  getcardsForList: (listId: Id) => card[];
  getcard: (cardId: Id) => card | null;
  isLoading: boolean;
};

export function useBoardsManagement(workspaceId: Id): BoardsManagementSelectors & BoardsManagementActions {
  const [state, setState] = React.useState<BoardsManagementState>({ workspaces: {}, boards: {}, lists: {}, cards: {} });
  const [isLoading, setIsLoading] = React.useState(true);
  const stateRef = React.useRef(state);

  React.useEffect(() => {
    setIsLoading(true);
    const loaded = ensureWorkspaceInitialized(workspaceId);
    stateRef.current = loaded;
    setState(loaded);
    setIsLoading(false);
  }, [workspaceId]);

  const persist = React.useCallback(
    (next: BoardsManagementState) => {
      stateRef.current = next;
      setState(next);
      saveWorkspaceState(workspaceId, next);
    },
    [workspaceId],
  );

  const workspace = state.workspaces[workspaceId] ?? null;

  const boards = React.useMemo(() => {
    if (!workspace) return [];
    return workspace.boardIds.map((id) => state.boards[id]).filter(Boolean);
  }, [state.boards, workspace]);

  const getBoard = React.useCallback((boardId: Id) => state.boards[boardId] ?? null, [state.boards]);

  const getListsForBoard = React.useCallback(
    (boardId: Id) => {
      const board = state.boards[boardId];
      if (!board) return [];
      return board.listIds.map((id) => state.lists[id]).filter(Boolean);
    },
    [state.boards, state.lists],
  );

  const getcardsForList = React.useCallback(
    (listId: Id) => {
      const list = state.lists[listId];
      if (!list) return [];
      return list.cardIds.map((id) => state.cards[id]).filter(Boolean);
    },
    [state.lists, state.cards],
  );

  const getcard = React.useCallback((cardId: Id) => state.cards[cardId] ?? null, [state.cards]);

  const createBoard = React.useCallback(
    (title: string) => {
      const next = structuredClone(stateRef.current) as BoardsManagementState;
      if (!next.workspaces[workspaceId]) next.workspaces[workspaceId] = seedWorkspace(workspaceId).workspaces[workspaceId];
      const id = makeId("board");
      seedBoard(next, workspaceId, id, title.trim() || "Untitled board");
      persist(next);
      return id;
    },
    [persist, state, workspaceId],
  );

  const updateBoard = React.useCallback(
    (boardId: Id, patch: Partial<Pick<Board, "title" | "description">>) => {
      const board = state.boards[boardId];
      if (!board) return;

      const next = structuredClone(stateRef.current) as BoardsManagementState;
      const t = nowIso();

      if (patch.title) {
        next.boards[boardId].title = patch.title;
      }
      if (patch.description) {
        next.boards[boardId].description = patch.description;
      }
      next.boards[boardId].updatedAt = t;
      persist(next);
    },
    [persist, state],
  );

  const initBoard = React.useCallback(
    (boardId: Id) => {
      const board = state.boards[boardId];
      if (!board) return;
      if (board.listIds.length > 0) return;
      const next = structuredClone(stateRef.current) as BoardsManagementState;
      seedDefaultLists(next, boardId);
      next.boards[boardId].updatedAt = nowIso();
      persist(next);
    },
    [persist, state],
  );

  const deleteBoard = React.useCallback(
    (boardId: Id) => {
      const board = state.boards[boardId];
      if (!board) return;

      const next = structuredClone(stateRef.current) as BoardsManagementState;

      for (const listId of board.listIds) {
        const list = next.lists[listId];
        if (list) {
          for (const cardId of list.cardIds) {
            delete next.cards[cardId];
          }
        }
        delete next.lists[listId];
      }

      delete next.boards[boardId];
      const workspace = next.workspaces[board.workspaceId];
      if (workspace) {
        workspace.boardIds = workspace.boardIds.filter((id) => id !== boardId);
      }

      persist(next);
    },
    [persist, state],
  );

  const createList = React.useCallback(
    (boardId: Id, title: string) => {
      const board = state.boards[boardId];
      if (!board) return "";
      const next = structuredClone(stateRef.current) as BoardsManagementState;
      const id = makeId("list");
      const t = nowIso();
      next.lists[id] = { id, boardId, title: title.trim() || "Untitled list", cardIds: [], createdAt: t, updatedAt: t };
      next.boards[boardId].listIds.push(id);
      next.boards[boardId].updatedAt = t;
      persist(next);
      return id;
    },
    [persist, state],
  );

  const updateList = React.useCallback(
    (listId: Id, patch: Partial<Pick<List, "title">>) => {
      const list = state.lists[listId];
      if (!list) return;

      const next = structuredClone(stateRef.current) as BoardsManagementState;
      const t = nowIso();

      if (patch.title) {
        next.lists[listId].title = patch.title;
      }
      next.lists[listId].updatedAt = t;
      if (next.boards[list.boardId]) {
        next.boards[list.boardId].updatedAt = t;
      }
      persist(next);
    },
    [persist, state],
  );

  const deleteList = React.useCallback(
    (boardId: Id, listId: Id) => {
      const board = state.boards[boardId];
      const list = state.lists[listId];
      if (!board || !list) return;

      const next = structuredClone(stateRef.current) as BoardsManagementState;
      const t = nowIso();

      for (const cardId of list.cardIds) {
        delete next.cards[cardId];
      }

      delete next.lists[listId];
      next.boards[boardId].listIds = next.boards[boardId].listIds.filter((id) => id !== listId);
      next.boards[boardId].updatedAt = t;
      persist(next);
    },
    [persist, state],
  );

  const createcard = React.useCallback(
    (boardId: Id, listId: Id, title: string, description = "") => {
      const list = state.lists[listId];
      if (!list) return "";
      const next = structuredClone(stateRef.current) as BoardsManagementState;
      const id = makeId("card");
      const t = nowIso();
      next.cards[id] = {
        id,
        boardId,
        listId,
        title: title.trim() || "Untitled card",
        description,
        labels: [],
        members: [],
        createdAt: t,
        updatedAt: t,
      };
      next.lists[listId].cardIds.push(id);
      next.lists[listId].updatedAt = t;
      next.boards[boardId].updatedAt = t;
      persist(next);
      return id;
    },
    [persist, state],
  );

  const updatecard = React.useCallback(
    (
      cardId: Id,
      patch: Partial<Pick<card, "title" | "description" | "listId" | "labels" | "members" | "dueDate">>,
    ) => {
      const card = state.cards[cardId];
      if (!card) return;
      const next = structuredClone(stateRef.current) as BoardsManagementState;
      const t = nowIso();

      if (patch.listId && patch.listId !== card.listId) {
        const fromList = next.lists[card.listId];
        const toList = next.lists[patch.listId];
        if (fromList && toList) {
          fromList.cardIds = fromList.cardIds.filter((id) => id !== cardId);
          toList.cardIds.push(cardId);
          fromList.updatedAt = t;
          toList.updatedAt = t;
          next.cards[cardId].listId = patch.listId;
        }
      }

      if (typeof patch.title === "string") next.cards[cardId].title = patch.title;
      if (typeof patch.description === "string") next.cards[cardId].description = patch.description;
      if (Array.isArray(patch.labels)) next.cards[cardId].labels = patch.labels;
      if (Array.isArray(patch.members)) next.cards[cardId].members = patch.members;
      if (patch.dueDate !== undefined) next.cards[cardId].dueDate = patch.dueDate;

      next.cards[cardId].updatedAt = t;
      persist(next);
    },
    [persist, state],
  );

  const deletecard = React.useCallback(
    (cardId: Id) => {
      const card = state.cards[cardId];
      if (!card) return;

      const next = structuredClone(stateRef.current) as BoardsManagementState;
      const t = nowIso();

      const list = next.lists[card.listId];
      if (list) {
        list.cardIds = list.cardIds.filter((id) => id !== cardId);
        list.updatedAt = t;
      }

      if (next.boards[card.boardId]) {
        next.boards[card.boardId].updatedAt = t;
      }

      delete next.cards[cardId];
      persist(next);
    },
    [persist, state],
  );

  const createBoardLabel = React.useCallback(
    (boardId: Id, label: { text: string; color: string }) => {
      const board = state.boards[boardId];
      if (!board) return;
      const next = structuredClone(stateRef.current) as BoardsManagementState;
      if (!next.boards[boardId].labels) {
        next.boards[boardId].labels = [];
      }
      if (!next.boards[boardId].labels!.some((l) => l.text === label.text)) {
        next.boards[boardId].labels!.push(label);
        next.boards[boardId].updatedAt = nowIso();
        persist(next);
      }
    },
    [persist, state]
  );

  return {
    workspace,
    boards,
    getBoard,
    getListsForBoard,
    getcardsForList,
    getcard,
    isLoading,
    createBoard,
    updateBoard,
    initBoard,
    deleteBoard,
    createList,
    updateList,
    deleteList,
    createcard,
    deletecard,
    updatecard,
    createBoardLabel,
  };
}

