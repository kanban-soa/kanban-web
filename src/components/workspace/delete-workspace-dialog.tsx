"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDeleteWorkspace } from "@/hooks/use-workspaces";

interface DeleteWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace?: { id: string | number; name: string };
}

export function DeleteWorkspaceDialog({ open, onOpenChange, workspace }: DeleteWorkspaceDialogProps) {
  const deleteMutation = useDeleteWorkspace();

  const handleDelete = () => {
    if (!workspace) return;
    deleteMutation.mutate(String(workspace.id), {
      onSuccess: () => {
        toast.success("Workspace deleted", { description: `"${workspace.name}" has been removed.` });
        onOpenChange(false);
      },
      onError: (err: any) => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || "Failed to delete workspace";
        if (status === 403) {
          toast.error("Not allowed", { description: "Only workspace admins can delete it." });
        } else if (status === 500) {
          toast.error("Server error", { description: "Unable to delete workspace right now." });
        } else {
          toast.error("Error", { description: msg });
        }
        console.error("Delete workspace error:", err);
      },
    });
  };

  if (!open || !workspace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={() => onOpenChange(false)} />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-xl border bg-card p-5 shadow-lg">
        <div className="text-base font-semibold">Delete workspace</div>
        <div className="mt-2 text-sm text-muted-foreground">
          This will permanently delete <strong className="text-foreground">{workspace.name}</strong> and all its boards.
          This action cannot be undone.
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteWorkspaceDialog;
