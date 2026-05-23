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
        className="relative z-10 w-full max-w-md rounded-xl border bg-black border-muted-700 p-5 shadow-lg"
      >
        <div className="text-base font-semibold text-white">Remove Member</div>
        <div className="mt-1 text-xs text-muted-400">
          Are you sure you want to remove {member.name ?? member.email} from this workspace?
        </div>
        <div className="mt-4 flex justify-end gap-2">
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
