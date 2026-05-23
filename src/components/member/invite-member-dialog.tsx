"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useInviteMember } from "@/hooks/use-workspaces";
import type { WorkspaceRole } from "@/lib/api/types";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  workspaceId: string;
  workspaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const [inviteEmail, setInviteEmail] = React.useState("");
  const inviteMutation = useInviteMember(workspaceId);

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(
      { email: inviteEmail.trim() },
      {
        onSuccess: () => {
          toast.success("Invitation sent successfully", {
            description: `Invitation sent to ${inviteEmail}`,
          });
          setInviteEmail("");
          onOpenChange(false);
        },
        onError: (error: any) => {
          const status = error?.response?.status;
          const message = error?.response?.data?.message || "Failed to send invitation";
          
          if (status === 404) {
            toast.error("Invalid email", {
              description: "The email address is not valid or not registered.",
            });
          } else if (status === 500) {
            toast.error("Server error", {
              description: "The server is temporarily unavailable. Please try again.",
            });
          } else {
            toast.error("Error", {
              description: message,
            });
          }
          
          // console.error("Invite error:", {
          //   status,
          //   message,
          //   error,
          // });
        },
      },
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-xl border bg-black border-muted-700 p-5 shadow-lg"
      >
        <div className="text-base font-semibold text-white">Invite Member</div>
        <div className="mt-1 text-xs text-muted-400">
          Send an invitation to join your workspace
        </div>
        <div className="mt-4 space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-muted-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@company.com"
              className="w-full px-3 py-2 rounded-lg bg-muted-800 border border-muted-700 text-white placeholder-muted-500 text-sm outline-none focus-visible:border-gray-500 focus-visible:ring-2 focus-visible:ring-gray-500"
            />
          </div>

          {/* Current Workspace Display */}
          <div>
            <label className="block text-sm font-medium text-muted-300 mb-2">
              Workspace
            </label>
            <div className="w-full px-3 py-2 rounded-lg bg-muted-800 border border-muted-700 text-white text-sm font-medium">
              {workspaceName}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="bg-muted-800 border-muted-700 text-white hover:bg-muted-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendInvite}
              disabled={!inviteEmail.trim() || inviteMutation.isPending}
              className="bg-gray-600 hover:bg-gray-700 text-white disabled:bg-muted-700 disabled:text-muted-400"
            >
              {inviteMutation.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
