"use client";

import React from "react";
import { WorkspaceCard } from "@/components/member/workspace-card";
import { InsightCard } from "@/components/member/insight-card";
import { MembersTable } from "@/components/member/members-table";
import { InvitationList } from "@/components/member/invitation-list";
import { InviteMemberDialog } from "@/components/member/invite-member-dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useMember, useInvitations } from "@/hooks/use-workspaces";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceContext } from "@/contexts/workspace.context";

export default function MemberPage() {
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [isWorkspaceSwitchOpen, setIsWorkspaceSwitchOpen] = React.useState(false);

  const { currentWorkspace, setCurrentWorkspace, workspaces, isLoadingWorkspaces } =
    useWorkspaceContext();

  const { data: memberData } = useMember(currentWorkspace?.publicId ?? "");
  const { data: invitationsData } = useInvitations();

  const handleSwitchWorkspace = () => {
    setIsWorkspaceSwitchOpen(true);
  };

  const handleConfirmWorkspaceSwitch = (workspacePublicId: string) => {
    const ws = workspaces.find((w) => w.publicId === workspacePublicId);
    if (ws) setCurrentWorkspace(ws);
    setIsWorkspaceSwitchOpen(false);
  };


  if (isLoadingWorkspaces) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[60px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="p-8">
        <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
          No workspaces yet. Create one from the sidebar.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Workspace Settings */}
        <div className="lg:col-span-1 space-y-6">
          <WorkspaceCard
            initials={currentWorkspace?.name.split(" ").map((n) => n[0]).join("") ?? ""}
            title={currentWorkspace?.name ?? ""}
            description="Collaborate on design projects and brand assets with your team members."
            onSwitchWorkspace={handleSwitchWorkspace}
          />

          <InsightCard
            teamVelocity={12}
            focusScore={92}
            description="Your team is performing exceptionally well this sprint. Keep up the momentum!"
          />
        </div>

        {/* Right Column: Members and Invitations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Project Management
              </h1>
              <p className="text-slate-400 mt-1">
                Workspace settings and team collaboration
              </p>
            </div>
            <Button
              onClick={() => setIsInviteOpen(true)}
              size="lg"
              className="gap-2 w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </div>

          {/* Members Table */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Active Members
            </h2>
            <MembersTable members={memberData} workspaceId={currentWorkspace?.publicId ?? ""}/>
          </div>

          {/* Pending Invitations */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Invitations
            </h2>
            <InvitationList invitations={invitationsData} workspaceId={currentWorkspace?.publicId ?? ""} />
          </div>
        </div>
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        workspaceId={currentWorkspace?.publicId ?? ""}
        workspaceName={currentWorkspace?.name ?? ""}
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />

      {/* Workspace Switch Modal */}
      {isWorkspaceSwitchOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsWorkspaceSwitchOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border bg-black border-muted-700 p-5 shadow-lg"
          >
            <div className="text-base font-semibold text-white">Switch Workspace</div>
            <div className="mt-1 text-xs text-muted-400">
              Select a workspace to manage members and settings
            </div>
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.publicId}
                  onClick={() => handleConfirmWorkspaceSwitch(ws.publicId)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                    currentWorkspace?.publicId === ws.publicId
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-muted-800 border-muted-700 text-muted-300 hover:bg-muted-700 hover:border-gray-600"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium">{ws.name}</p>
                  </div>
                  {currentWorkspace?.publicId === ws.publicId && (
                    <span className="text-gray-400 text-sm font-semibold">Active</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-muted-700">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsWorkspaceSwitchOpen(false)}
                className="bg-muted-600 border-muted-700 text-white hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
