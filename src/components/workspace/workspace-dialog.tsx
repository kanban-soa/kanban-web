"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { useRouter } from "next/navigation";

interface WorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceDialog({ open, onOpenChange }: WorkspaceDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={() => {
        setName("");
        setDescription("");
        onOpenChange(false);
      }} />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md rounded-xl border bg-card p-5 shadow-lg">
        <div className="text-base font-semibold">New Workspace</div>
        <div className="mt-1 text-xs text-muted-foreground">Create a new workspace to organize your projects.</div>
        <div className="mt-4 space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workspace name…" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Workspace description (optional)…" className="resize-none h-20" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => {
              setName("");
              setDescription("");
              onOpenChange(false);
            }}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreate}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceDialog;
