import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMembers,
  changeMemberRole,
  removeMember,
  listInvitations,
  cancelInvitation,
} from "@/lib/api/member.api";
import type { ChangeRoleRequest } from "@/lib/api/types";

export function useMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => listMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useChangeMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      payload,
    }: {
      memberId: string;
      payload: ChangeRoleRequest;
    }) => changeMemberRole(workspaceId, memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
  });
}

export function useInvitations(workspaceId: string) {
  return useQuery({
    queryKey: ["invitations", workspaceId],
    queryFn: () => listInvitations(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCancelInvitation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      cancelInvitation(workspaceId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invitations", workspaceId],
      });
    },
  });
}
