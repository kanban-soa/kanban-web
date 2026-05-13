"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Id } from "@/lib/board/types";
import { useBoardsManagement } from "@/hooks/use-board";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const { workspace, getcard, getListsForBoard, updatecard, deletecard } = useBoardsManagement(workspaceId);

  const card = getcard(cardId);
  const lists = getListsForBoard(boardId);

  const [title, setTitle] = React.useState(card?.title ?? "");
  const [description, setDescription] = React.useState(card?.description ?? "");
  const [listId, setListId] = React.useState(card?.listId ?? "");
  const [labels, setLabels] = React.useState<string[]>(card?.labels ?? []);
  const [members, setMembers] = React.useState<string[]>(card?.members ?? []);
  const [labelInput, setLabelInput] = React.useState("");
  const [memberInput, setMemberInput] = React.useState("");
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isLabelOpen, setIsLabelOpen] = React.useState(false);
  const [isMemberOpen, setIsMemberOpen] = React.useState(false);

  React.useEffect(() => {
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
    setListId(card?.listId ?? "");
    setLabels(card?.labels ?? []);
    setMembers(card?.members ?? []);
  }, [card?.description, card?.labels, card?.listId, card?.members, card?.title]);

  const addLabel = (value: string) => {
    const nextLabel = value.trim();
    if (!nextLabel || labels.includes(nextLabel)) return;
    const next = [...labels, nextLabel];
    setLabels(next);
    setLabelInput("");
    updatecard(cardId, { labels: next });
  };

  const removeLabel = (value: string) => {
    const next = labels.filter((label) => label !== value);
    setLabels(next);
    updatecard(cardId, { labels: next });
  };

  const addMember = (value: string) => {
    const nextMember = value.trim();
    if (!nextMember || members.includes(nextMember)) return;
    const next = [...members, nextMember];
    setMembers(next);
    setMemberInput("");
    updatecard(cardId, { members: next });
  };

  const removeMember = (value: string) => {
    const next = members.filter((member) => member !== value);
    setMembers(next);
    updatecard(cardId, { members: next });
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

      <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1fr_320px]">
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

        <div className="space-y-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm font-semibold">List</div>
            <div className="mt-2">
              <select
                value={listId}
                onChange={(e) => {
                  const next = e.target.value;
                  setListId(next);
                  updatecard(cardId, { listId: next });
                }}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Moving a card updates its list column.
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm font-semibold">Actions</div>
            <div className="mt-3 space-y-4">
              <div>
                <div className="text-sm font-semibold">Labels</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {labels.length > 0 ? (
                    labels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-xs"
                      >
                        {label}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => removeLabel(label)}
                        >
                          x
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No labels yet.</span>
                  )}
                </div>
                <div className="mt-2">
                  <Button type="button" size="sm" onClick={() => setIsLabelOpen(true)}>
                    Add label
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold">Members</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {members.length > 0 ? (
                    members.map((member) => (
                      <span
                        key={member}
                        className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-xs"
                      >
                        {member}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => removeMember(member)}
                        >
                          x
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No members yet.</span>
                  )}
                </div>
                <div className="mt-2">
                  <Button type="button" size="sm" onClick={() => setIsMemberOpen(true)}>
                    Add member
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span className="truncate">Due date (coming soon)</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 />
                Delete card
              </Button>
            </div>
          </div>

          <Link
            href={`/workspaces/${workspaceId}/boards/${boardId}`}
            className="block rounded-xl border bg-muted/10 p-4 text-sm font-medium hover:bg-muted/25"
          >
            Back to board
          </Link>
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

      {isLabelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsLabelOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border bg-background p-5 shadow-lg"
          >
            <div className="text-base font-semibold">Add label</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Enter a label name to attach it to this card.
            </div>
            <div className="mt-4 space-y-3">
              <Input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Label name…"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsLabelOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    addLabel(labelInput);
                    setIsLabelOpen(false);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isMemberOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsMemberOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border bg-background p-5 shadow-lg"
          >
            <div className="text-base font-semibold">Add member</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Enter a member name to attach it to this card.
            </div>
            <div className="mt-4 space-y-3">
              <Input
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder="Search members…"
              />
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="w-full rounded-md px-2 py-1 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        addMember(name);
                        setIsMemberOpen(false);
                      }}
                    >
                      {name}
                    </button>
                  ))
                ) : (
                  <div className="px-2 py-1 text-xs text-muted-foreground">No matches.</div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsMemberOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setIsMemberOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

