"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import WorkspaceCard from "@/components/workspace/workspace-card";
import WorkspaceDialog from "@/components/workspace/workspace-dialog";
import { InviteMemberDialog } from "@/components/member/invite-member-dialog";
import { toast } from "sonner";

export default function WorkspacesPage() {
  const router = useRouter();
  const { data: workspaces, isLoading } = useWorkspaces();
  const [inviteWorkspaceId, setInviteWorkspaceId] = React.useState("");
  const [inviteWorkspaceName, setInviteWorkspaceName] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [workspaceName, setWorkspaceName] = React.useState("");

  const handleInvite = (e: React.MouseEvent, ws: { id: string; name: string }) => {
    e.stopPropagation();
    setInviteWorkspaceId(ws.id);
    setInviteWorkspaceName(ws.name);
  };

  return (
    <div className="m-auto h-full max-w-[1100px] p-8 px-5 md:px-28 md:py-12">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div>
            <div className="text-lg font-semibold tracking-tight">Workspaces</div>
            <div className="text-xs text-muted-foreground">Select a workspace to view boards</div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsCreateOpen(true)} className="px-3 py-2">
              New Workspace
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-[120px] rounded-lg" />
            ))}
          </div>
        ) : !workspaces || workspaces.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
            No workspaces yet. Create one from the button above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                id={ws.id}
                name={ws.name}
                members={ws.members}
                onClick={(id) => router.push(`/workspaces/${id}/boards`)}
                onInvite={(e, w) => handleInvite(e as React.MouseEvent, w as { id: string; name: string })}
              />
            ))}
          </div>
        )}
      </div>

      <InviteMemberDialog
        workspaceId={inviteWorkspaceId}
        workspaceName={inviteWorkspaceName}
        open={!!inviteWorkspaceId}
        onOpenChange={(open) => {
          if (!open) {
            setInviteWorkspaceId("");
            setInviteWorkspaceName("");
          }
        }}
      />

      <WorkspaceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
