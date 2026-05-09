import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listWorkspaces, getWorkspace, createWorkspace } from "@/lib/api/workspace.api";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: listWorkspaces,
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ["workspaces", id],
    queryFn: () => getWorkspace(id),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
