"use client";

import * as React from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Label as ApiLabel } from "@/lib/api/types";
import {
  useBoardLabels,
  useUpdateLabel,
  useDeleteLabel,
} from "@/hooks/use-board";

const LABEL_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export function LabelManagementDialog({
  boardId,
  open,
  onOpenChange,
}: {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: labels = [], isLoading } = useBoardLabels(boardId);
  const updateMut = useUpdateLabel(boardId);
  const deleteMut = useDeleteLabel(boardId);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editColor, setEditColor] = React.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (!open) {
      setEditingId(null);
      setConfirmDeleteId(null);
    }
  }, [open]);

  const beginEdit = (label: ApiLabel) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const saveEdit = (labelId: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Label name cannot be empty");
      return;
    }
    updateMut.mutate(
      { labelId, payload: { name: trimmed, color: editColor } },
      {
        onSuccess: () => {
          toast.success("Label updated");
          cancelEdit();
        },
        onError: () => toast.error("Failed to update label"),
      },
    );
  };

  const confirmDelete = (labelId: string) => {
    deleteMut.mutate(labelId, {
      onSuccess: () => {
        toast.success("Label deleted");
        setConfirmDeleteId(null);
      },
      onError: () => toast.error("Failed to delete label"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage labels</DialogTitle>
          <DialogDescription>
            Edit or delete labels for this board. Changes apply to every card
            using the label.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto py-2">
          {isLoading ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              Loading labels...
            </div>
          ) : labels.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No labels yet. Create one from a card&apos;s label picker.
            </div>
          ) : (
            labels.map((label) => {
              const isEditing = editingId === label.id;
              const isConfirming = confirmDeleteId === label.id;

              if (isEditing) {
                return (
                  <div
                    key={label.id}
                    className="space-y-3 rounded-md border p-3"
                  >
                    <div className="flex flex-wrap gap-2">
                      {LABEL_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={cn(
                            "h-6 w-6 rounded-full ring-offset-background transition-all",
                            editColor === c
                              ? "ring-2 ring-ring ring-offset-2 scale-110"
                              : "",
                          )}
                          style={{ backgroundColor: c }}
                          onClick={() => setEditColor(c)}
                          aria-label={`Select color ${c}`}
                        />
                      ))}
                    </div>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Label name"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveEdit(label.id)}
                        disabled={updateMut.isPending}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={label.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="truncate text-sm">{label.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isConfirming ? (
                      <>
                        <span className="text-xs text-muted-foreground">
                          Delete?
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setConfirmDeleteId(null)}
                          aria-label="Cancel delete"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => confirmDelete(label.id)}
                          disabled={deleteMut.isPending}
                          aria-label="Confirm delete"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => beginEdit(label)}
                          aria-label="Edit label"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setConfirmDeleteId(label.id)}
                          aria-label="Delete label"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
