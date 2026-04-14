import { mockState } from "./mockWorkspace";
import type {  Id, BoardsManagementState } from "./types";

function nowIso() {
  return new Date().toISOString();
}

export function createState(): BoardsManagementState {
  return (mockState);
}

export function seedWorkspace(workspaceId: Id, workspaceName = "mychannel"): BoardsManagementState {
  const state = createState();
  // state.workspaces[workspaceId] = { id: workspaceId, name: workspaceName, boardIds: [] };
  return state;
}

export function seedBoard(state: BoardsManagementState, workspaceId: Id, boardId: Id, title: string) {
  const t = nowIso();
  state.boards[boardId] = {
    id: boardId,
    workspaceId,
    title,
    listIds: [],
    createdAt: t,
    updatedAt: t,
  };
  state.workspaces[workspaceId].boardIds.push(boardId);
}

export function seedDefaultLists(state: BoardsManagementState, boardId: Id) {
  const base = [
    { id: `${boardId}:todo`, title: "To do" },
    { id: `${boardId}:doing`, title: "Doing" },
    { id: `${boardId}:done`, title: "Done" },
  ];
  for (const item of base) {
    const t = nowIso();
    state.lists[item.id] = {
      id: item.id,
      boardId,
      title: item.title,
      taskIds: [],
      createdAt: t,
      updatedAt: t,
    };
    state.boards[boardId].listIds.push(item.id);
  }
}

