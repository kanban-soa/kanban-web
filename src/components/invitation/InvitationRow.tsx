import React from "react";
import { Button } from "@/components/ui/button";
import { useAcceptInvitation, useCancelInvitation } from "@/hooks/use-workspaces";
import type { Invitation } from "@/lib/api/types";

interface InvitationRowProps {
  invitation: Invitation;
}

export default function InvitationRow({ invitation }: InvitationRowProps) {
  // TODO: Replace with real user context
  const acceptMutation = useAcceptInvitation();
  const cancelMutation = useCancelInvitation();

  return (
    <tr className="border-b">
      <td className="py-2">{invitation.email}</td>
      <td className="py-2">{invitation.workspaceName || invitation.workspaceId}</td>
      <td className="py-2">{String(invitation.role)}</td>
      <td className="py-2">{String(invitation.status)}</td>
      <td className="py-2 flex gap-2">
        <Button size="sm" onClick={() => acceptMutation.mutate(invitation.id)}>
          Accept
        </Button>
        <Button size="sm" variant="destructive" onClick={() => cancelMutation.mutate(invitation.id)}>
          Remove
        </Button>
      </td>
    </tr>
  );
}
