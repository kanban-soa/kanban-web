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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-xl border bg-black border-muted-700 p-5 shadow-lg"
      >
        <div className="text-base font-semibold text-white">Change Role</div>
        <div className="mt-1 text-xs text-muted-400">{
          `Update role for ${member.name ?? member.email}`
        }</div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-300 mb-2">Select New Role</label>
            <select
              value={selectedRole}
              onChange={(e) => onChangeRole(e.target.value as WorkspaceRole)}
              className="w-full px-3 py-2 rounded-lg bg-muted-800 border border-muted-700 text-white text-sm outline-none focus-visible:border-gray-500 focus-visible:ring-2 focus-visible:ring-gray-500/50"
            >
              {roles.map((role) => (
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
              className="bg-muted-800 border-muted-700 text-white hover:bg-muted-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="bg-gray-600 hover:bg-gray-700 text-white"
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
