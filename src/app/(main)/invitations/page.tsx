"use client";

import React from "react";
import { useInvitations } from "@/hooks/use-workspaces";
import InvitationTable from "@/components/invitation/InvitationTable";

export default function InvitationsPage() {
  // TODO: Replace with real user/workspace context
  const { data: invitations, isLoading } = useInvitations();

  return (
    <div className="m-auto h-full max-w-[900px] p-8 px-5 md:px-16 md:py-12">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div>
            <div className="text-lg font-semibold tracking-tight">Invitations</div>
            <div className="text-xs text-muted-foreground">All your workspace invitations</div>
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        <InvitationTable invitations={invitations || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
