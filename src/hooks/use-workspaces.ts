import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listWorkspaces, getWorkspace, createWorkspace, getMember, inviteMember, changeRole, removeMember, getInvitations, removeInvitation } from "@/lib/api/workspace.api";
import type { ChangeRoleRequest, InviteMemberRequest } from "@/lib/api/types";

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

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteMemberRequest) => inviteMember(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId] });
    },
  });
}

export function useMember(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId],
    queryFn: () => getMember(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useChangeRole(workspaceId: string, memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeRoleRequest) => changeRole(workspaceId, memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId] });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId] });
    },
  });
}

export function useChangeRoleMember(workspaceId: string, memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeRoleRequest) => changeRole(workspaceId, memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId] });
    },
  });
}

export function useInvitations(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "invitations"],
    queryFn: () => getInvitations(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useRemoveInvitation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => removeInvitation(workspaceId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "invitations"] });
    },
  });
}