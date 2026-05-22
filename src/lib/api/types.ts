/**
 * Shared API types used across API modules and hooks.
 */

export interface WorkspaceRole {
  ADMIN: "admin";
  MEMBER: "member";
  OWNER: "owner";
  OBSERVER: "observer";
}

export interface MemberStatus {
  ACTIVE: "active";
  INVITED: "invited";
  REMOVED: "removed";
  CANCELLED: "cancelled";
}

export interface Workspace {
  id: string;
  name: string;
  boardIds: string[];
  members: string[];
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
  role: string;
  roleId: string | null;
  status: string;
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

