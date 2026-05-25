"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateWorkspace, useUpdateWorkspace } from "@/hooks/use-workspaces";
import { useRouter } from "next/navigation";

interface WorkspaceInitial {
  id: string | number;
  name: string;
  description?: string | null;
}

interface WorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  workspace?: WorkspaceInitial;
}

export function WorkspaceDialog({ open, onOpenChange, mode = "create", workspace }: WorkspaceDialogProps) {
  const isEdit = mode === "edit";
  const [name, setName] = React.useState(workspace?.name ?? "");
  const [description, setDescription] = React.useState(workspace?.description ?? "");
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const updateWorkspace = useUpdateWorkspace(String(workspace?.id ?? ""));

  React.useEffect(() => {
    if (open) {
      setName(workspace?.name ?? "");
      setDescription(workspace?.description ?? "");
    }
  }, [open, workspace?.name, workspace?.description]);

  const handleCreate = () => {
    if (!name.trim()) return toast.error("Please provide a workspace name");
    createWorkspace.mutate({ name: name.trim(), description: description.trim() }, {
      onSuccess: (ws) => {
        toast.success("Workspace created", { description: `"${ws.name}" has been created.` });
        setName("");
        setDescription("");
        onOpenChange(false);
        router.push(`/workspaces/${ws.publicId}/boards`);
      },
      onError: (err: any) => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || "Failed to create workspace";
        if (status === 500) {
          toast.error("Server error", { description: "Unable to create workspace right now." });
        } else {
          toast.error("Error", { description: msg });
        }
        console.error("Create workspace error:", err);
      },
    });
  };

  const handleUpdate = () => {
    if (!workspace) return;
    if (!name.trim()) return toast.error("Please provide a workspace name");
    updateWorkspace.mutate(
      { name: name.trim(), description: description?.toString().trim() || null },
      {
        onSuccess: () => {
          toast.success("Workspace updated", { description: `"${name.trim()}" has been updated.` });
          onOpenChange(false);
        },
        onError: (err: any) => {
          const status = err?.response?.status;
          const msg = err?.response?.data?.message || "Failed to update workspace";
          if (status === 403) {
            toast.error("Not allowed", { description: "Only workspace admins can update it." });
          } else if (status === 500) {
            toast.error("Server error", { description: "Unable to update workspace right now." });
          } else {
            toast.error("Error", { description: msg });
          }
          console.error("Update workspace error:", err);
        },
      },
    );
  };

  if (!open) return null;

  const isPending = isEdit ? updateWorkspace.isPending : createWorkspace.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={() => {
        setName("");
        setDescription("");
        onOpenChange(false);
      }} />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-xl border bg-card p-5 shadow-lg">
        <div className="text-base font-semibold">{isEdit ? "Edit Workspace" : "New Workspace"}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {isEdit ? "Update workspace details." : "Create a new workspace to organize your projects."}
        </div>
        <div className="mt-4 space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workspace name…" />
          {isEdit ? (
            <Textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)…"
            />
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => {
              setName("");
              setDescription("");
              onOpenChange(false);
            }}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={isEdit ? handleUpdate : handleCreate}
              disabled={isPending}
            >
              {isPending ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceDialog;
