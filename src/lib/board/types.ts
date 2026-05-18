export type Id = string;

export type Workspace = {
  id: Id;
  name: string;
  boardIds: Id[];
  members: string[];
};

export type Board = {
  id: Id;
  workspaceId: Id;
  title: string;
  description: string;
  listIds: Id[];
  labels?: Label[];
  createdAt: string;
  updatedAt: string;
};

export type List = {
  id: Id;
  boardId: Id;
  title: string;
  cardIds: Id[];
  createdAt: string;
  updatedAt: string;
};

export type Label = { text: string; color: string };

export type card = {
  id: Id;
  boardId: Id;
  listId: Id;
  title: string;
  description: string;
  labels: Label[];
  members: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardsManagementState = {
  workspaces: Record<Id, Workspace>;
  boards: Record<Id, Board>;
  lists: Record<Id, List>;
  cards: Record<Id, card>;
};

