import api from "./axios";

type Workspace = {
  id: string;
  name: string;
  boardIds: string[];
  members: string[];
};

export async function listWorkspaces(): Promise<Workspace[]> {
  const { data } = await api.get<Workspace[] | { data: Workspace[] }>("/api/v1/workspaces");
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function getWorkspace(id: string): Promise<Workspace> {
  const { data } = await api.get<Workspace>(`/api/v1/workspaces/${id}`);
  return data;
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const { data } = await api.post<Workspace>("/api/v1/workspaces", { name });
  return data;
}
