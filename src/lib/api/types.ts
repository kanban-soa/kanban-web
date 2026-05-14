/**
 * Shared API types used across API modules and hooks.
 */

export type WorkspaceRole = "Owner" | "Member" | "Observer";

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

export type Member = {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  status: "active" | "away";
  avatar?: string;
};

export type ChangeRoleRequest = {
  role: WorkspaceRole;
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
  role: WorkspaceRole;
};
