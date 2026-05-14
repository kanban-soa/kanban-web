"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMembers,
  useChangeMemberRole,
  useRemoveMember,
} from "@/hooks/use-members";
import type { Member, WorkspaceRole } from "@/lib/api/types";

interface MembersTableProps {
  workspaceId: string;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function MembersTable({ workspaceId }: MembersTableProps) {
  const { data: members, isLoading } = useMembers(workspaceId);
  const changeRole = useChangeMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);

  const [isDeactivateOpen, setIsDeactivateOpen] = React.useState(false);
  const [isRoleSwitchOpen, setIsRoleSwitchOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = React.useState<WorkspaceRole>(
    "Member",
  );

  const handleDeactivate = (member: Member) => {
    setSelectedMember(member);
    setIsDeactivateOpen(true);
  };

  const handleRoleSwitch = (member: Member) => {
    setSelectedMember(member);
    setSelectedRole(member.role);
    setIsRoleSwitchOpen(true);
  };

  const confirmDeactivate = () => {
    if (selectedMember) {
      removeMember.mutate(selectedMember.id, {
        onSuccess: () => {
          setIsDeactivateOpen(false);
          setSelectedMember(null);
        },
      });
    }
  };

  const confirmRoleSwitch = () => {
    if (selectedMember) {
      changeRole.mutate(
        { memberId: selectedMember.id, payload: { role: selectedRole } },
        {
          onSuccess: () => {
            setIsRoleSwitchOpen(false);
            setSelectedMember(null);
          },
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-muted-900 border border-muted-700 shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-card border-b border-muted-700">
          <Skeleton className="h-4 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-6 py-4 border-b border-muted-700">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="rounded-xl bg-muted-900 border border-muted-700 shadow-lg overflow-hidden">
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-muted-400">No members in this workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-muted-900 border border-muted-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-card border-b border-muted-700">
        <p className="text-xs font-semibold text-muted-300 uppercase tracking-wide">
          Member
        </p>
        <p className="text-xs font-semibold text-muted-300 uppercase tracking-wide">
          Role
        </p>
        <p className="text-xs font-semibold text-muted-300 uppercase tracking-wide">
          Status
        </p>
        <p className="text-xs font-semibold text-muted-300 uppercase tracking-wide text-right">
          Actions
        </p>
      </div>

      {/* Rows */}
      <div className="divide-y divide-muted-700">
        {members.map((member) => (
          <div
            key={member.id}
            className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-muted-800 transition-colors items-center"
          >
            {/* Member Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-semibold text-sm text-white",
                  "bg-gradient-to-br from-blue-500 to-blue-600",
                )}
              >
                {getInitials(member.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {member.name ?? member.email}
                </p>
                <p className="text-xs text-muted-400 truncate">
                  {member.email}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center">
              <Badge
                variant={
                  member.role === "Owner"
                    ? "default"
                    : member.role === "Member"
                      ? "secondary"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {member.role}
              </Badge>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  member.status === "active"
                    ? "bg-emerald-500"
                    : "bg-yellow-500",
                )}
              />
              <span className="text-sm text-muted-300 capitalize">
                {member.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoleSwitch(member)}
                className="h-8 px-2 text-xs gap-1"
                title="Change role"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Role</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeactivate(member)}
                className="h-8 px-2 text-xs gap-1 hover:bg-red-950 hover:border-red-700"
                title="Remove member"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Remove Member Confirmation Modal */}
      {isDeactivateOpen && selectedMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsDeactivateOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border bg-muted-900 border-muted-700 p-5 shadow-lg"
          >
            <div className="text-base font-semibold text-white">
              Remove Member
            </div>
            <div className="mt-1 text-xs text-muted-400">
              Are you sure you want to remove {selectedMember.name} from this
              workspace?
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsDeactivateOpen(false)}
                className="bg-muted-800 border-muted-700 text-white hover:bg-muted-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDeactivate}
                disabled={removeMember.isPending}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {removeMember.isPending ? "Removing..." : "Remove Member"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Role Switch Modal */}
      {isRoleSwitchOpen && selectedMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsRoleSwitchOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border bg-muted-700 border-muted-700 p-5 shadow-lg"
          >
            <div className="text-base font-semibold text-white">
              Change Role
            </div>
            <div className="mt-1 text-xs text-muted-400">
              Update role for {selectedMember.name}
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-300 mb-2">
                  Select New Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as WorkspaceRole)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-muted-800 border border-muted-700 text-white text-sm outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50"
                >
                  <option value="Owner">Owner</option>
                  <option value="Member">Member</option>
                  <option value="Observer">Observer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsRoleSwitchOpen(false)}
                  className="bg-muted-800 border-muted-700 text-white hover:bg-muted-700"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmRoleSwitch}
                  disabled={changeRole.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {changeRole.isPending ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
