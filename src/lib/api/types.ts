/**
 * Shared API types used across API modules and hooks.
 */

export enum WorkspaceRole {
  ADMIN = "admin",
  MEMBER = "member"
}

export enum MemberStatus {
  ACTIVE = "active",
  INVITED = "invited",
  REMOVED = "removed",
  CANCELLED = "cancelled"
}

export interface User {
  id: string;
  publicId: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: number;
  publicId: string;
  slug: string;
  plan: string;
  name: string;
  description: string | null;
  showEmailsToMembers: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  // Fields present in list/detail responses:
  boardIds?: string[];
  members?: number;
};

export interface Account {
  id: string;
  email: string;
  name: string;
};

export interface MemberRequest {
  id: number;
  publicId: string;
  email: string;
  name: string | null;
  userId: string;
  workspaceId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  role: WorkspaceRole;
  roleId: string | null;
  status: MemberStatus;
};

export interface Invitation {
  id: string;
  publicId: string;
  email: string;
  role: WorkspaceRole;
  sentAt: string;
  workspace: string;
  workspaceName?: string;
  workspaceId?: string;
  status?: MemberStatus;
};

export interface InviteMemberRequest {
  email: string;
}

export interface ChangeRoleRequest {
  role: WorkspaceRole;
};

export interface BoardLabel {
  id: number;
  publicId: string;
  name: string;
  colourCode: string;
  boardId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  importId: string | null;
}

export interface BoardCard {
  id: number;
  publicId: string;
  title: string;
  description: string | null;
  index: number;
  listId: number;
  boardId?: number;
  dueDate: string | null;
  importId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  labels: Array<{ cardId: number; labelId: number; label: BoardLabel }>;
}

export interface BoardList {
  id: number;
  publicId: string;
  name: string;
  index: number;
  boardId: number;
  importId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  cards: BoardCard[];
}

export interface Board {
  id: number;
  publicId: string;
  name: string;
  description: string | null;
  slug: string;
  workspaceId: number;
  visibility: "public" | "private";
  type: "regular" | string;
  sourceBoardId: number | null;
  importId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  allLists?: BoardList[];
}

export interface BoardList {
  id: string;
  publicId?: string;
  name: string;
  position: number;
  boardId: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface Card {
  id: string;
  publicId?: string;
  title: string;
  description?: string | null;
  listId: string;
  list?: { publicId: string; name: string };
  position?: number;
  dueDate?: string | null;
  labels?: Label[];
  members?: string[];
  createdAt?: string;
  updatedAt?: string | null;
}

export interface Label {
  id: string;
  publicId?: string;
  name: string;
  color: string;
  boardId: string;
}
