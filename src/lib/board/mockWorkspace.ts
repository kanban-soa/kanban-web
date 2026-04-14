import { BoardsManagementState } from "./types";
export const mockState: BoardsManagementState = {
  workspaces: {
    default: {
      id: "default",
      name: "My Workspace",
      boardIds: ["default-board"],
      members: ["Vy", "Truong", "Linh", "Huy", "Thao"],
    },
  },

  boards: {
    "default-board": {
      id: "default-board",
      workspaceId: "default",
      title: "Main Board",
      listIds: [
        "default-board:todo",
        "default-board:doing",
        "default-board:done",
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },

  lists: {
    "default-board:todo": {
      id: "default-board:todo",
      boardId: "default-board",
      title: "To do",
      taskIds: ["task-1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    "default-board:doing": {
      id: "default-board:doing",
      boardId: "default-board",
      title: "Doing",
      taskIds: ["task-2"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    "default-board:done": {
      id: "default-board:done",
      boardId: "default-board",
      title: "Done",
      taskIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },

  tasks: {
    "task-1": {
      id: "task-1",
      boardId: "default-board",
      listId: "default-board:todo",
      title: "Setup project",
      description: "Initialize Next.js + state management",
      labels: ["setup"],
      members: ["Vy"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    "task-2": {
      id: "task-2",
      boardId: "default-board",
      listId: "default-board:doing",
      title: "Build UI",
      description: "Implement board and list components",
      labels: ["ui"],
      members: ["Truong"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};