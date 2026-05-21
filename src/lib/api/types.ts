/**
 * Shared API types used across API modules and hooks.
 */

export type WorkspaceRole = "admin" | "member" | "owner" | "observer" ;

export type MemberStatus = "active" | "invited" | "removed" | "cancelled";

export type Workspace = {
  id: string;
  name: string;
  boardIds: string[];
  members: string[];
};

export type Account = {
  id: string;
  email: string;
  name: string;
};

export type MemberRequest = {
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

export type Invitation = {
  id: string;
  email: string;
  role: WorkspaceRole;
  sentAt: string;
  workspace: string;
};

export type InviteMemberRequest = {
  email: string;
};

export type ChangeRoleRequest = {
  role: WorkspaceRole;
};
