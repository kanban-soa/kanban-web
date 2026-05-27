"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { MemberRequest } from "@/lib/api/types";
import { WorkspaceRole } from "@/lib/api/types";

interface RoleSwitchModalProps {
  open: boolean;
  member: MemberRequest | null;
  roles: WorkspaceRole[];
  selectedRole: WorkspaceRole;
  onChangeRole: (role: WorkspaceRole) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function RoleSwitchModal({ open, member, roles, selectedRole, onChangeRole, onClose, onConfirm }: RoleSwitchModalProps) {
  if (!open || !member) return null;

  // Use provided roles or default to all WorkspaceRole enum values
  const availableRoles = roles.length > 0 ? roles : Object.values(WorkspaceRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-xl border border-transparent bg-card shadow-sm p-5"
      >
        <div className="text-base font-semibold text-foreground">Change Role</div>
        <div className="mt-1 text-xs text-muted-foreground">{
          `Update role for ${member.email}`
        }</div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Select New Role</label>
            <select
              value={selectedRole}
              onChange={(e) => onChangeRole(e.target.value as WorkspaceRole)}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Role
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSwitchModal;
