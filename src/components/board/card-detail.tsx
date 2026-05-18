"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Trash2, X, Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Id, Label } from "@/lib/board/types";
import { useBoardsManagement } from "@/hooks/use-board";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const LABEL_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
];

function getLabelColor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
}

export function CardDetailPage({
  workspaceId,
  boardId,
  cardId,
}: {
  workspaceId: Id;
  boardId: Id;
  cardId: Id;
}) {
  const router = useRouter();
  const { workspace, getBoard, getcard, getListsForBoard, updatecard, deletecard, createBoardLabel } = useBoardsManagement(workspaceId);

  const board = getBoard(boardId);
  const card = getcard(cardId);
  const lists = getListsForBoard(boardId);

  const [title, setTitle] = React.useState(card?.title ?? "");
  const [description, setDescription] = React.useState(card?.description ?? "");
  const [listId, setListId] = React.useState(card?.listId ?? "");
  const [labels, setLabels] = React.useState<Label[]>(card?.labels ?? []);
  const [members, setMembers] = React.useState<string[]>(card?.members ?? []);
  const [labelInput, setLabelInput] = React.useState("");
  const [labelColor, setLabelColor] = React.useState("#3b82f6");
  const [memberInput, setMemberInput] = React.useState("");
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isLabelOpen, setIsLabelOpen] = React.useState(false);
  const [isCreateLabelOpen, setIsCreateLabelOpen] = React.useState(false);
  const [isMemberOpen, setIsMemberOpen] = React.useState(false);
  const [dueDate, setDueDate] = React.useState(card?.dueDate ?? "");

  React.useEffect(() => {
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
    setListId(card?.listId ?? "");
    setLabels(card?.labels ?? []);
    setMembers(card?.members ?? []);
    setDueDate(card?.dueDate ?? "");
  }, [card?.description, card?.labels, card?.listId, card?.members, card?.title, card?.dueDate]);

  const toggleLabel = (labelToToggle: Label) => {
    let next;
    if (labels.some((l) => l.text === labelToToggle.text)) {
      next = labels.filter((l) => l.text !== labelToToggle.text);
    } else {
      next = [...labels, labelToToggle];
    }
    setLabels(next);
    updatecard(cardId, { labels: next });
  };

  const createAndAddLabel = () => {
    const newLabelText = labelInput.trim();
    if (newLabelText) {
      const newLabel = { text: newLabelText, color: labelColor };
      createBoardLabel(boardId, newLabel);
      if (!labels.some((l) => l.text === newLabelText)) {
        toggleLabel(newLabel);
      }
    }
    setLabelInput("");
    setIsCreateLabelOpen(false);
  };

  const toggleMember = (value: string) => {
    let next;
    if (members.includes(value)) {
      next = members.filter((m) => m !== value);
    } else {
      next = [...members, value];
    }
    setMembers(next);
    updatecard(cardId, { members: next });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDueDate(val);
    updatecard(cardId, { dueDate: val });
  };

  const workspaceMembers = workspace?.members ?? [];
  const filteredMembers = workspaceMembers.filter((name) =>
    name.toLowerCase().includes(memberInput.trim().toLowerCase()),
  );

  if (!card) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
          card not found.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">card</div>
            <div className="truncate text-lg font-semibold tracking-tight">{card.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => router.push(`/workspaces/${workspaceId}/boards/${boardId}`)}
            >
              <X />
              Close
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2  px-2 py-2 lg:grid-cols-[1fr_420px]">
        <div className="rounded-xl border bg-card p-5">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold">Title</div>
              <div className="mt-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => updatecard(cardId, { title })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Description</div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => updatecard(cardId, { description })}
                >
                  Save
                </Button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description…"
                className={cn(
                  "mt-2 min-h-[180px] w-full rounded-xl border border-input bg-transparent p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-xl border bg-card p-5">
          <div className="grid grid-cols-[100px_1fr] items-start gap-4 text-sm">
            <div className="text-muted-foreground pt-1.5">List</div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-8 justify-start px-2 font-normal hover:bg-muted -ml-2">
                    {lists.find((l) => l.id === listId)?.title || "Select list"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-2">
                  <div className="space-y-1">
                    {lists.map((l) => {
                      const isActive = l.id === listId;
                      return (
                        <button
                          key={l.id}
                          className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted text-left"
                          onClick={() => {
                            setListId(l.id);
                            updatecard(cardId, { listId: l.id });
                          }}
                        >
                          <span className={isActive ? "font-medium" : "font-normal"}>{l.title}</span>
                          {isActive && <Check className="h-4 w-4 text-blue-500" />}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="text-muted-foreground pt-2">Labels</div>
            <div className="flex flex-wrap items-center gap-2">
              {labels.map((label, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-white shadow-sm"
                  style={{ backgroundColor: label.color }}
                >
                  {label.text}
                  <button
                    type="button"
                    className="text-white/80 hover:text-white ml-1"
                    onClick={() => toggleLabel(label)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 rounded-full text-xs text-muted-foreground">
                    <Plus className="mr-1 h-3 w-3" /> Add label
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-3">
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground">Edit labels</div>
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {(board?.labels ?? []).map((label, idx) => {
                        const isChecked = labels.some((l) => l.text === label.text);
                        return (
                          <button
                            key={idx}
                            type="button"
                            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => toggleLabel(label)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />
                              <span className={isChecked ? "font-medium" : "font-normal"}>{label.text}</span>
                            </div>
                            {isChecked && <Check className="h-4 w-4 text-blue-500" />}
                          </button>
                        );
                      })}
                      {(board?.labels ?? []).length === 0 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground">No available labels. Create one below.</div>
                      )}
                    </div>
                    <div className="border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs text-muted-foreground"
                        onClick={() => {
                          // Close default popover hack, we use standard approach or handled by external state if controlled
                          // For simplicity, we just trigger modal open.
                          setIsCreateLabelOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Create a new label
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="text-muted-foreground pt-2">Members</div>
            <div className="flex flex-wrap items-center gap-2">
              {members.map((member) => (
                <span
                  key={member}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs shadow-sm"
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/20 text-[9px] uppercase">
                    {member.charAt(0)}
                  </div>
                  {member}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground ml-1"
                    onClick={() => toggleMember(member)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 rounded-full text-xs text-muted-foreground">
                    <Plus className="mr-1 h-3 w-3" /> Add member
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-3">
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground">Members</div>
                    <Input
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      placeholder="Search..."
                      className="h-8"
                    />
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {filteredMembers.map((name) => {
                        const isChecked = members.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => toggleMember(name)}
                          >
                            <span>{name}</span>
                            {isChecked && <Check className="h-4 w-4 text-blue-500" />}
                          </button>
                        );
                      })}
                      {filteredMembers.length === 0 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground">No matches.</div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="text-muted-foreground pt-3">Due date</div>
            <div>
              <Input 
                type="date"
                value={dueDate}
                onChange={handleDueDateChange}
                className="h-8 max-w-[150px] bg-transparent text-sm -ml-2 border-transparent hover:border-border focus:border-border px-2 focus-visible:ring-0"
              />
            </div>
            
            <div className="col-span-2 pt-4">
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete card
              </Button>
              <Link
                href={`/workspaces/${workspaceId}/boards/${boardId}`}
                className="ml-2 inline-flex h-8 items-center justify-center rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem] text-sm font-medium hover:bg-muted/50"
              >
                Back to board
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete card</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deletecard(cardId);
                setIsDeleteOpen(false);
                router.push(`/workspaces/${workspaceId}/boards/${boardId}`);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateLabelOpen} onOpenChange={setIsCreateLabelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new label</DialogTitle>
            <DialogDescription>
              Choose a color and write a name for the new label.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "h-8 w-8 rounded-full ring-offset-background transition-all",
                    labelColor === c ? "ring-2 ring-ring ring-offset-2 scale-110" : ""
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setLabelColor(c)}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <div className="space-y-2">
              <label htmlFor="label-name" className="text-sm font-medium">Label name</label>
              <Input
                id="label-name"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="e.g. Bug, Feature, Urgent..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateLabelOpen(false)}>Cancel</Button>
            <Button onClick={createAndAddLabel}>Create Label</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

