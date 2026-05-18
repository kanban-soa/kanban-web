import api from "./axios";
import { WORKSPACES } from "./routes";
import type { Workspace, InviteMemberRequest, Invitation } from "./types";

export async function listWorkspaces(): Promise<Workspace[]> {
  const { data } = await api.get<Workspace[] | { data: Workspace[] }>(WORKSPACES.LIST);
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function getWorkspace(id: string): Promise<Workspace> {
  const { data } = await api.get<Workspace>(WORKSPACES.DETAIL(id));
  return data;
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const { data } = await api.post<Workspace>(WORKSPACES.CREATE, { name });
  return data;
}

export async function inviteMember(
  workspaceId: string,
  payload: InviteMemberRequest,
): Promise<Invitation> {
  const { data } = await api.post<Invitation>(WORKSPACES.INVITE(workspaceId), payload);
  return data;
}
