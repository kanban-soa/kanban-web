import api from "./axios";
import { WORKSPACES } from "./routes";
import type { Workspace, InviteMemberRequest, Invitation, ChangeRoleRequest, MemberRequest } from "./types";

export async function listWorkspaces(): Promise<Workspace[]> {
  const { data } = await api.get<Workspace[] | { data: Workspace[] }>(WORKSPACES.LIST);
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function getWorkspace(id: string): Promise<Workspace> {
  const { data } = await api.get<Workspace>(WORKSPACES.DETAIL(id));
  return data;
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const { data } = await api.post<{ data: Workspace }>(WORKSPACES.CREATE, { name });
  return data.data;
}

export async function getMember(workspaceId: string): Promise<MemberRequest[]> {
  const { data } = await api.get<any>(WORKSPACES.MEMBERS(workspaceId));
  
  // Handle the server response structure
  const members = Array.isArray(data) ? data : data?.data ?? [];
  
  // Transform server response to MemberRequest format
  return members;
}

export async function inviteMember(
  workspaceId: string,
  payload: InviteMemberRequest,
): Promise<Invitation> {
  const { data } = await api.post<Invitation>(WORKSPACES.INVITE(workspaceId), payload);
  return data;
}

export async function changeRole(
  workspaceId: string,
  memberId: string,
  payload: ChangeRoleRequest,
): Promise<ChangeRoleRequest> {
  const { data } = await api.patch<Invitation>(WORKSPACES.CHANGE_ROLE(workspaceId, memberId), payload);
  return data;
}

export async function removeMember(
  workspaceId: string,
  memberId: string,
): Promise<void> {
  await api.delete(WORKSPACES.REMOVE_MEMBER(workspaceId, memberId));
}


// Get all invitations for the current user
export async function getInvitations(): Promise<Invitation[]> {
  const { data } = await api.get<Invitation[] | { data: Invitation[] }>("/api/v1/workspaces/invitations");
  return Array.isArray(data) ? data : (data as any)?.data ?? [];
}

export async function removeInvitation(
  workspaceId: string,
  invitationId: string,
): Promise<void> {
  await api.delete(WORKSPACES.REMOVE_INVITATION(workspaceId, invitationId));
}


// Accept invitation (user-scoped)
export async function acceptInvitation(invitationId: string): Promise<void> {
  await api.patch(`/api/v1/invitations/${invitationId}/accept`);
}


// Reject invitation (user-scoped)
export async function cancelInvitation(invitationId: string): Promise<void> {
  await api.patch(`/api/v1/invitations/${invitationId}/reject`);
}
