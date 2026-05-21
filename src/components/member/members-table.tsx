"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreVertical, LogOut, Shield } from "lucide-react";
import type { MemberRequest, WorkspaceRole } from "@/lib/api/types";
import { useRemoveMember, useChangeRoleMember } from "@/hooks/use-workspaces";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import RoleSwitchModal from "@/components/member/role-switch-modal";
import RemoveMemberModal from "@/components/member/remove-member-modal";


interface MembersTableProps {
  members?: MemberRequest[];
  workspaceId: string;
}

const workspaceRoles: WorkspaceRole[] = ["owner", "member", "observer"];

function getInitials(name: string | undefined): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function MembersTable({ members, workspaceId }: MembersTableProps) {
  const [isDeactivateOpen, setIsDeactivateOpen] = React.useState(false);
  const [isRoleSwitchOpen, setIsRoleSwitchOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<MemberRequest | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<WorkspaceRole>("member");

  const removeMemberMutation = useRemoveMember(workspaceId);
  const changeRoleMutation = useChangeRoleMember(workspaceId, String(selectedMember?.userId ?? ""));

  const handleDeactivate = (member: MemberRequest) => {
    setSelectedMember(member);
    setIsDeactivateOpen(true);
  };

  const handleRoleSwitch = (member: MemberRequest) => {
    setSelectedMember(member);
    setSelectedRole(member.role as WorkspaceRole);
    setIsRoleSwitchOpen(true);
  };

  const confirmDeactivate = () => {
    if (selectedMember) {
      removeMemberMutation.mutate(String(selectedMember.id), {
        onSuccess: () => {
          toast.success("Member removed", {
            description: `${selectedMember.name} has been removed from the workspace.`,
          });
          setIsDeactivateOpen(false);
          setSelectedMember(null);
        },
        onError: (error: any) => {
          const status = error?.response?.status;
          const message = error?.response?.data?.message || "Failed to remove member";
          
          if (status === 404) {
            toast.error("Member not found", {
              description: "The member could not be found.",
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
          
        },
      });
    }
  };

  const confirmRoleSwitch = () => {
    if (selectedMember) {
      changeRoleMutation.mutate(
        { role: selectedRole as WorkspaceRole },
        {
          onSuccess: () => {
            toast.success("Role updated", {
              description: `${selectedMember.name}'s role has been changed to ${selectedRole}.`,
            });
            setIsRoleSwitchOpen(false);
            setSelectedMember(null);
          },
          onError: (error: any) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message || "Failed to update role";
            
            if (status === 404) {
              toast.error("Member not found", {
                description: "The member could not be found.",
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
          },
        }
      );
    }
  };

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
        {(members && members.length > 0 ? members : []).map((member) => (
          <div
            key={member.id}
            className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-muted-800 transition-colors items-center"
          >
            {/* Member Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-semibold text-sm text-white",
                  "bg-gradient-to-br from-gray-500 to-gray-600"
                )}
              >
                {getInitials(member.name || member.email)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {member.name || member.email.split('@')[0]}
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
                    : "bg-yellow-500"
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
                title="Deactivate member"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <RemoveMemberModal
        open={isDeactivateOpen}
        member={selectedMember}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={confirmDeactivate}
      />

      <RoleSwitchModal
        open={isRoleSwitchOpen}
        member={selectedMember}
        roles={workspaceRoles}
        selectedRole={selectedRole}
        onChangeRole={(r) => setSelectedRole(r)}
        onClose={() => setIsRoleSwitchOpen(false)}
        onConfirm={confirmRoleSwitch}
      />
    </div>
  );
}
