"use client";

import React from "react";
import { WorkspaceCard } from "@/components/member/workspace-card";
import { InsightCard } from "@/components/member/insight-card";
import { MembersTable } from "@/components/member/members-table";
import { InvitationList } from "@/components/member/invitation-list";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function MemberPage() {
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"Owner" | "Member" | "Observer">("Member");
  const [isWorkspaceSwitchOpen, setIsWorkspaceSwitchOpen] = React.useState(false);
  const [currentWorkspace, setCurrentWorkspace] = React.useState("design-collective");

  const projects = [
    { id: "design-collective", name: "Design Collective" },
    { id: "marketing-hub", name: "Marketing Hub" },
    { id: "dev-team", name: "Dev Team" },
    { id: "product-launch", name: "Product Launch" },
  ];

  const currentWorkspaceData = projects.find((p) => p.id === currentWorkspace) || projects[0];

  const handleInviteMember = () => {
    setIsInviteOpen(true);
  };

  const handleSendInvite = () => {
    if (inviteEmail.trim()) {
      console.log("Invite sent to:", inviteEmail, "Workspace:", currentWorkspace, "Role:", inviteRole);
      setInviteEmail("");
      setInviteRole("Member");
      setIsInviteOpen(false);
    }
  };

  const handleSwitchWorkspace = () => {
    setIsWorkspaceSwitchOpen(true);
  };

  const handleConfirmWorkspaceSwitch = (workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
    console.log("Switched to workspace:", workspaceId);
    setIsWorkspaceSwitchOpen(false);
  };

  const handleAcceptInvitation = (id: string) => {
    console.log("Accept invitation:", id);
  };

  const handleRejectInvitation = (id: string) => {
    console.log("Reject invitation:", id);
  };

  return (
    <div className="p-8 space-y-8">
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Workspace Settings */}
        <div className="lg:col-span-1 space-y-6">
          <WorkspaceCard
            initials={currentWorkspaceData.name.split(" ").map(n => n[0]).join("")}
            title={currentWorkspaceData.name}
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
              onClick={handleInviteMember}
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
            <MembersTable />
          </div>

          {/* Pending Invitations */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Invitations
            </h2>
            <InvitationList
              invitations={[
                {
                  id: "1",
                  email: "john.doe@company.com",
                  role: "Member",
                  sentAt: "Sent 2 days ago",
                  workspace: currentWorkspaceData.name,
                  onAccept: () =>
                    handleAcceptInvitation("john.doe@company.com"),
                  onReject: () =>
                    handleRejectInvitation("john.doe@company.com"),
                },
                {
                  id: "2",
                  email: "lisa.park@company.com",
                  role: "Observer",
                  sentAt: "Sent 1 week ago",
                  workspace: currentWorkspaceData.name,
                  onAccept: () =>
                    handleAcceptInvitation("lisa.park@company.com"),
                  onReject: () =>
                    handleRejectInvitation("lisa.park@company.com"),
                },
                {
                  id: "3",
                  email: "team.lead@company.com",
                  role: "Member",
                  sentAt: "Sent 3 days ago",
                  workspace: currentWorkspaceData.name,
                  onAccept: () =>
                    handleAcceptInvitation("team.lead@company.com"),
                  onReject: () =>
                    handleRejectInvitation("team.lead@company.com"),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsInviteOpen(false)}
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
                  className="w-full px-3 py-2 rounded-lg bg-muted-800 border border-muted-700 text-white placeholder-muted-500 text-sm outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>

              {/* Current Workspace Display */}
              <div>
                <label className="block text-sm font-medium text-muted-300 mb-2">
                  Workspace
                </label>
                <div className="w-full px-3 py-2 rounded-lg bg-muted-800 border border-muted-700 text-white text-sm font-medium">
                  {currentWorkspaceData.name}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-muted-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "Owner" | "Member" | "Observer")}
                  className="w-full px-3 py-2 rounded-lg bg-muted-800 border border-muted-700 text-white text-sm outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="Owner">Owner</option>
                  <option value="Member">Member</option>
                  <option value="Observer">Observer</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="bg-muted-800 border-muted-700 text-white hover:bg-muted-700"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSendInvite}
                  disabled={!inviteEmail.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-muted-700 disabled:text-muted-400"
                >
                  Send Invite
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
            className="relative z-10 w-full max-w-md rounded-xl border bg-muted-700 border-muted-700 p-5 shadow-lg"
          >
            <div className="text-base font-semibold text-white">Switch Workspace</div>
            <div className="mt-1 text-xs text-muted-400">
              Select a workspace to manage members and settings
            </div>
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleConfirmWorkspaceSwitch(project.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                    currentWorkspace === project.id
                      ? "bg-blue-900 border-blue-700 text-white"
                      : "bg-muted-800 border-muted-700 text-muted-300 hover:bg-muted-700 hover:border-muted-600"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium">{project.name}</p>
                  </div>
                  {currentWorkspace === project.id && (
                    <span className="text-blue-400 text-sm font-semibold">Active</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-muted-700">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsWorkspaceSwitchOpen(false)}
                className="bg-muted-800 border-muted-700 text-white hover:bg-muted-700"
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
