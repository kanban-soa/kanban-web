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
      description: "This is the main board for the default workspace.",
      listIds: [
        "default-board:todo",
        "default-board:doing",
        "default-board:done",
      ],
      labels: [
        { text: "setup", color: "#3b82f6" },
        { text: "ui", color: "#f59e0b" },
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
      cardIds: ["card-1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    "default-board:doing": {
      id: "default-board:doing",
      boardId: "default-board",
      title: "Doing",
      cardIds: ["card-2"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    "default-board:done": {
      id: "default-board:done",
      boardId: "default-board",
      title: "Done",
      cardIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },

  cards: {
    "card-1": {
      id: "card-1",
      boardId: "default-board",
      listId: "default-board:todo",
      title: "Setup project",
      description: "Initialize Next.js + state management",
      labels: [{ text: "setup", color: "#3b82f6" }],
      members: ["Vy"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    "card-2": {
      id: "card-2",
      boardId: "default-board",
      listId: "default-board:doing",
      title: "Build UI",
      description: "Implement board and list components",
      labels: [{ text: "ui", color: "#f59e0b" }],
      members: ["Truong"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};