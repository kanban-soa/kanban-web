"use client";

import React from "react";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRemoveInvitation } from "@/hooks/use-workspaces";
import type { Invitation } from "@/lib/api/types";

interface InvitationListProps {
  invitations?: Invitation[];
  workspaceId: string;
}

export function InvitationList({
  invitations = [],
  workspaceId,
}: InvitationListProps) {
  const [isRemoveOpen, setIsRemoveOpen] = React.useState(false);
  const [selectedInvitation, setSelectedInvitation] = React.useState<Invitation | null>(null);
  const removeInvitationMutation = useRemoveInvitation(workspaceId);

  const handleRemoveInvitation = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setIsRemoveOpen(true);
  };

  const confirmRemove = () => {
    if (selectedInvitation) {
      removeInvitationMutation.mutate(selectedInvitation.id, {
        onSuccess: () => {
          setIsRemoveOpen(false);
          setSelectedInvitation(null);
        },
      });
    }
  };

  return (
    <div className="rounded-xl bg-muted-900 border border-muted-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-muted-700 bg-card">
        <p className="text-sm font-semibold text-white">Pending Invitations</p>
        <p className="text-xs text-muted-400 mt-1">
          {invitations.length} invitation{invitations.length !== 1 ? "s" : ""} pending
        </p>
      </div>

      {/* Invitations List */}
      {invitations.length > 0 ? (
        <div className="divide-y divide-muted-700">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted-800 transition-colors"
            >
              {/* Left: Email, Role, Time, Workspace */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {invitation.email}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    variant={
                      invitation.role === "Owner"
                        ? "default"
                        : invitation.role === "Member"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {invitation.role}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-400">
                    <Clock className="h-3 w-3" />
                    {invitation.sentAt}
                  </div>
                </div>
              </div>

              {/* Right: Workspace Name */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-slate-200">
                  {invitation.workspace}
                </p>
              </div>

              {/* Remove Button */}
              <div className="shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveInvitation(invitation)}
                  className="h-8 w-8 p-0 hover:bg-red-950 hover:border-red-700"
                  title="Remove invitation"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-muted-400">No pending invitations</p>
        </div>
      )}

      {/* Remove Invitation Confirmation Modal */}
      {isRemoveOpen && selectedInvitation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsRemoveOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border bg-black p-5 shadow-lg"
          >
            <div className="text-base font-semibold text-white">Cancel Invitation</div>
            <div className="mt-1 text-xs text-muted-400">
              Are you sure you want to remove the invitation for {selectedInvitation.email}?
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsRemoveOpen(false)}
                className="bg-muted-800 border-muted-700 text-white hover:bg-muted-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmRemove}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Remove Invitation
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
