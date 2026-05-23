/**
 * Shared API types used across API modules and hooks.
 */

export enum WorkspaceRole {
  ADMIN = "admin",
  MEMBER = "member",
  OWNER = "owner",
  OBSERVER = "observer"
}

export enum MemberStatus {
  ACTIVE = "active",
  INVITED = "invited",
  REMOVED = "removed",
  CANCELLED = "cancelled"
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

export interface Board {
  id: string;
  publicId: string;
  title: string;
  description?: string | null;
  workspaceId: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string | null;
}
