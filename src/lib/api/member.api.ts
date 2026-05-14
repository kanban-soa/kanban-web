import api from "./axios";
import { MEMBERS, INVITATIONS } from "./routes";
import type { Member, ChangeRoleRequest, Invitation } from "./types";

export async function listMembers(workspaceId: string): Promise<Member[]> {
  const { data } = await api.get<Member[] | { data: Member[] }>(
    MEMBERS.LIST(workspaceId),
  );
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function changeMemberRole(
  workspaceId: string,
  memberId: string,
  payload: ChangeRoleRequest,
): Promise<Member> {
  const { data } = await api.put<Member>(
    MEMBERS.CHANGE_ROLE(workspaceId, memberId),
    payload,
  );
  return data;
}

export async function removeMember(
  workspaceId: string,
  memberId: string,
): Promise<void> {
  await api.delete(MEMBERS.REMOVE(workspaceId, memberId));
}

export async function listInvitations(
  workspaceId: string,
): Promise<Invitation[]> {
  const { data } = await api.get<Invitation[] | { data: Invitation[] }>(
    INVITATIONS.LIST(workspaceId),
  );
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function cancelInvitation(
  workspaceId: string,
  invitationId: string,
): Promise<void> {
  await api.delete(INVITATIONS.CANCEL(workspaceId, invitationId));
}
