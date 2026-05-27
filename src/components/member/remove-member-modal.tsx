"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { MemberRequest } from "@/lib/api/types";

interface RemoveMemberModalProps {
  open: boolean;
  member: MemberRequest | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveMemberModal({ open, member, onClose, onConfirm }: RemoveMemberModalProps) {
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
        className="relative z-10 w-full max-w-md rounded-xl border border-transparent bg-card shadow-sm p-5"
      >
        <div className="text-base font-semibold text-foreground">Remove Member</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Are you sure you want to remove {member.name ?? member.email} from this workspace?
        </div>
        <div className="mt-4 flex justify-end gap-2">
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
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Remove Member
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RemoveMemberModal;
