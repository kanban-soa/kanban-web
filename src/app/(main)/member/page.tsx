"use client";

import React from "react";
import { useState, useEffect } from "react";
import { WorkspaceCard } from "@/components/member/workspace-card";
import { InsightCard } from "@/components/member/insight-card";
import { MembersTable } from "@/components/member/members-table";
import { InviteMemberDialog } from "@/components/member/invite-member-dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useMember, useInvitations } from "@/hooks/use-workspaces";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceContext } from "@/contexts/workspace.context";
import { WorkspaceRole } from "@/lib/api/types";
import { useAuth } from "@/hooks/use-auth";

export default function MemberPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { currentWorkspace, setCurrentWorkspace, workspaces, isLoadingWorkspaces } =
    useWorkspaceContext();

  const { data: memberData } = useMember(currentWorkspace?.publicId ?? "");

  const user = useAuth();
  const isAdminOfWorkspace = (Array.isArray(memberData) && user && memberData.find((m) => m.userId === user.id)?.role === WorkspaceRole.ADMIN) || false;

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
            {...currentWorkspace!}
          />

          {/* <InsightCard
            teamVelocity={12}
            focusScore={92}
            description="Your team is performing exceptionally well this sprint. Keep up the momentum!"
          /> */}
        </div>

        {/* Right Column: Members and Invitations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Project Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Workspace settings and team collaboration
              </p>
            </div>
            {isAdminOfWorkspace && (
              <Button
              onClick={() => setIsInviteOpen(true)}
              size="lg"
              className="gap-2 w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
            )}
          </div>

          {/* Members Table */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Active Members
            </h2>
            {memberData && currentWorkspace && (
              <MembersTable members={memberData} workspaceId={currentWorkspace?.publicId ?? ""} isAdminOfWorkspace={isAdminOfWorkspace} />
            )}
          </div>

          {/* Pending Invitations */}
          {/* <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Invitations
            </h2>
            <InvitationList invitations={invitationsData} workspaceId={currentWorkspace?.publicId ?? ""} />
          </div> */}
        </div>
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        workspaceId={currentWorkspace?.publicId ?? ""}
        workspaceName={currentWorkspace?.name ?? ""}
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
}
