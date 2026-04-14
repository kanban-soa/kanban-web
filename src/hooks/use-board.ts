"use client";

import * as React from "react";
import type { Board, Id, BoardsManagementState, List, Task, Workspace } from "../lib/board/types";
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
  initBoard: (boardId: Id) => void;
  deleteBoard: (boardId: Id) => void;
  createList: (boardId: Id, title: string) => Id;
  deleteList: (boardId: Id, listId: Id) => void;
  createTask: (boardId: Id, listId: Id, title: string, description?: string) => Id;
  deleteTask: (taskId: Id) => void;
  updateTask: (
    taskId: Id,
    patch: Partial<Pick<Task, "title" | "description" | "listId" | "labels" | "members">>,
  ) => void;
};

type BoardsManagementSelectors = {
  workspace: Workspace | null;
  boards: Board[];
  getBoard: (boardId: Id) => Board | null;
  getListsForBoard: (boardId: Id) => List[];
  getTasksForList: (listId: Id) => Task[];
  getTask: (taskId: Id) => Task | null;
  isLoading: boolean;
};

export function useBoardsManagement(workspaceId: Id): BoardsManagementSelectors & BoardsManagementActions {
  const [state, setState] = React.useState<BoardsManagementState>({ workspaces: {}, boards: {}, lists: {}, tasks: {} });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    setState(ensureWorkspaceInitialized(workspaceId));
    setIsLoading(false);
  }, [workspaceId]);

  const persist = React.useCallback(
    (next: BoardsManagementState) => {
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

  const getTasksForList = React.useCallback(
    (listId: Id) => {
      const list = state.lists[listId];
      if (!list) return [];
      return list.taskIds.map((id) => state.tasks[id]).filter(Boolean);
    },
    [state.lists, state.tasks],
  );

  const getTask = React.useCallback((taskId: Id) => state.tasks[taskId] ?? null, [state.tasks]);

  const createBoard = React.useCallback(
    (title: string) => {
      const next = structuredClone(state) as BoardsManagementState;
      if (!next.workspaces[workspaceId]) next.workspaces[workspaceId] = seedWorkspace(workspaceId).workspaces[workspaceId];
      const id = makeId("board");
      seedBoard(next, workspaceId, id, title.trim() || "Untitled board");
      persist(next);
      return id;
    },
    [persist, state, workspaceId],
  );

  const initBoard = React.useCallback(
    (boardId: Id) => {
      const board = state.boards[boardId];
      if (!board) return;
      if (board.listIds.length > 0) return;
      const next = structuredClone(state) as BoardsManagementState;
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

      const next = structuredClone(state) as BoardsManagementState;

      for (const listId of board.listIds) {
        const list = next.lists[listId];
        if (list) {
          for (const taskId of list.taskIds) {
            delete next.tasks[taskId];
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
      const next = structuredClone(state) as BoardsManagementState;
      const id = makeId("list");
      const t = nowIso();
      next.lists[id] = { id, boardId, title: title.trim() || "Untitled list", taskIds: [], createdAt: t, updatedAt: t };
      next.boards[boardId].listIds.push(id);
      next.boards[boardId].updatedAt = t;
      persist(next);
      return id;
    },
    [persist, state],
  );

  const deleteList = React.useCallback(
    (boardId: Id, listId: Id) => {
      const board = state.boards[boardId];
      const list = state.lists[listId];
      if (!board || !list) return;

      const next = structuredClone(state) as BoardsManagementState;
      const t = nowIso();

      for (const taskId of list.taskIds) {
        delete next.tasks[taskId];
      }

      delete next.lists[listId];
      next.boards[boardId].listIds = next.boards[boardId].listIds.filter((id) => id !== listId);
      next.boards[boardId].updatedAt = t;
      persist(next);
    },
    [persist, state],
  );

  const createTask = React.useCallback(
    (boardId: Id, listId: Id, title: string, description = "") => {
      const list = state.lists[listId];
      if (!list) return "";
      const next = structuredClone(state) as BoardsManagementState;
      const id = makeId("task");
      const t = nowIso();
      next.tasks[id] = {
        id,
        boardId,
        listId,
        title: title.trim() || "Untitled task",
        description,
        labels: [],
        members: [],
        createdAt: t,
        updatedAt: t,
      };
      next.lists[listId].taskIds.push(id);
      next.lists[listId].updatedAt = t;
      next.boards[boardId].updatedAt = t;
      persist(next);
      return id;
    },
    [persist, state],
  );

  const updateTask = React.useCallback(
    (
      taskId: Id,
      patch: Partial<Pick<Task, "title" | "description" | "listId" | "labels" | "members">>,
    ) => {
      const task = state.tasks[taskId];
      if (!task) return;
      const next = structuredClone(state) as BoardsManagementState;
      const t = nowIso();

      if (patch.listId && patch.listId !== task.listId) {
        const fromList = next.lists[task.listId];
        const toList = next.lists[patch.listId];
        if (fromList && toList) {
          fromList.taskIds = fromList.taskIds.filter((id) => id !== taskId);
          toList.taskIds.push(taskId);
          fromList.updatedAt = t;
          toList.updatedAt = t;
          next.tasks[taskId].listId = patch.listId;
        }
      }

      if (typeof patch.title === "string") next.tasks[taskId].title = patch.title;
      if (typeof patch.description === "string") next.tasks[taskId].description = patch.description;
      if (Array.isArray(patch.labels)) next.tasks[taskId].labels = patch.labels;
      if (Array.isArray(patch.members)) next.tasks[taskId].members = patch.members;

      next.tasks[taskId].updatedAt = t;
      persist(next);
    },
    [persist, state],
  );

  const deleteTask = React.useCallback(
    (taskId: Id) => {
      const task = state.tasks[taskId];
      if (!task) return;

      const next = structuredClone(state) as BoardsManagementState;
      const t = nowIso();

      const list = next.lists[task.listId];
      if (list) {
        list.taskIds = list.taskIds.filter((id) => id !== taskId);
        list.updatedAt = t;
      }

      if (next.boards[task.boardId]) {
        next.boards[task.boardId].updatedAt = t;
      }

      delete next.tasks[taskId];
      persist(next);
    },
    [persist, state],
  );

  return {
    workspace,
    boards,
    getBoard,
    getListsForBoard,
    getTasksForList,
    getTask,
    isLoading,
    createBoard,
    initBoard,
    deleteBoard,
    createList,
    deleteList,
    createTask,
    deleteTask,
    updateTask,
  };
}

