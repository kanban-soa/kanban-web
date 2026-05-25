"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  X,
  Check,
  Plus,
  MoreHorizontal,
  Paperclip,
  CheckCircle,
  ArrowUp,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Id } from "@/lib/board/types";
import {
  useBoard,
  useBoardLists,
  useBoardLabels,
  useCreateLabel,
  useCard,
  useUpdateCard,
  useDeleteCard,
  useAttachLabelToCard,
  useDetachLabelFromCard,
  useSetCardDueDate,
  useClearCardDueDate,
  useAssignMemberToCard,
  useRemoveMemberFromCard,
} from "@/hooks/use-board";
import { useMember, useWorkspace } from "@/hooks/use-workspaces";
import { useWorkspaceActivities } from "@/hooks/use-statistics";
import type { Label as ApiLabel } from "@/lib/api/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

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

type DisplayList = { id: string; title: string };

function formatInitials(name: string) {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
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

  const { data: workspace } = useWorkspace(workspaceId);
  const { data: board } = useBoard(workspaceId, boardId);
  const { data: card, isLoading: isCardLoading } = useCard(cardId);
  const { data: rawLists = [] } = useBoardLists(workspaceId, boardId);
  const { data: boardLabels = [] } = useBoardLabels(boardId);
  const { data: workspaceMembers = [] } = useMember(workspaceId);
  const { data: activitiesData } = useWorkspaceActivities(workspaceId, {
    limit: 50,
    entityType: "card",
    entityId: card?.publicId ?? String(cardId),
  });

  const createLabelMut = useCreateLabel(boardId);
  const updateCardMut = useUpdateCard(workspaceId, boardId);
  const deleteCardMut = useDeleteCard(workspaceId, boardId);
  const attachLabelMut = useAttachLabelToCard(workspaceId, boardId);
  const detachLabelMut = useDetachLabelFromCard(workspaceId, boardId);
  const setDueDateMut = useSetCardDueDate();
  const clearDueDateMut = useClearCardDueDate();
  const assignMemberMut = useAssignMemberToCard(workspaceId, boardId);
  const removeMemberMut = useRemoveMemberFromCard(workspaceId, boardId);

  const lists: DisplayList[] = React.useMemo(
    () =>
      rawLists.map((l) => {
        const withTitle = l as { title?: string; name?: string };
        return {
          id: String(l.id),
          title: withTitle.title ?? withTitle.name ?? "",
        };
      }),
    [rawLists],
  );

  const cardLabels = React.useMemo<ApiLabel[]>(
    () => (card?.labels ?? []) as ApiLabel[],
    [card?.labels],
  );
  const cardMemberIds = React.useMemo<string[]>(
    () => card?.members ?? [],
    [card?.members],
  );

  const cardActivities = React.useMemo(() => {
    if (!activitiesData?.items) return [];
    return activitiesData.items.filter(
      (a) =>
        a.entityType === "card" &&
        (a.entityId === cardId || a.entityId === card?.publicId),
    );
  }, [activitiesData, cardId, card?.publicId]);

  const [title, setTitle] = React.useState(card?.title ?? "");
  const [description, setDescription] = React.useState(card?.description ?? "");
  const [comment, setComment] = React.useState("");
  const [listId, setListId] = React.useState(card?.listId ?? "");
  const [dueDate, setDueDate] = React.useState(card?.dueDate ?? "");
  const [labelInput, setLabelInput] = React.useState("");
  const [labelColor, setLabelColor] = React.useState("#3b82f6");
  const [memberInput, setMemberInput] = React.useState("");
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isCreateLabelOpen, setIsCreateLabelOpen] = React.useState(false);

  React.useEffect(() => {
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
    setListId(card?.listId ?? "");
    setDueDate(card?.dueDate ?? "");
  }, [card?.title, card?.description, card?.listId, card?.dueDate]);

  const toggleLabel = (label: ApiLabel) => {
    const isAttached = cardLabels.some((l) => l.id === label.id);
    if (isAttached) {
      detachLabelMut.mutate({ cardId, labelId: label.id });
    } else {
      attachLabelMut.mutate({ cardId, labelId: label.id });
    }
  };

  const createAndAddLabel = () => {
    if (!labelInput.trim()) return;
    createLabelMut.mutate(
      { name: labelInput.trim(), color: labelColor },
      {
        onSuccess: (newLabel) => {
          attachLabelMut.mutate({ cardId, labelId: newLabel.id });
          toast.success("Label created and attached successfully!");
          setLabelInput("");
          setIsCreateLabelOpen(false);
        },
        onError: () => {
          toast.error("Failed to create label.");
        },
      },
    );
  };


  const toggleMember = (workspaceMemberPublicId: string) => {
    const isAssigned = cardMemberIds.includes(workspaceMemberPublicId);
    if (isAssigned) {
      removeMemberMut.mutate({ cardId, memberId: workspaceMemberPublicId });
    } else {
      assignMemberMut.mutate({ cardId, workspaceMemberPublicId });
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDueDate(val);
    if (val) {
      setDueDateMut.mutate({ cardId, dueDate: val });
    } else {
      clearDueDateMut.mutate(cardId);
    }
  };

  const memberLabel = (publicId: string): string => {
    const member = workspaceMembers.find((m) => m.publicId === publicId);
    const name = member?.name?.trim();
    const email = member?.email?.trim();
    return name || email || publicId || "Member";
  };

  const memberInitial = (publicId: string) =>
    memberLabel(publicId).charAt(0).toUpperCase() || "?";

  const filteredMembers = workspaceMembers.filter((m) => {
    const haystack = (m.name ?? m.email ?? "").toLowerCase();
    return haystack.includes(memberInput.trim().toLowerCase());
  });

  const currentListName = lists.find((l) => l.id === listId || l.id === card?.listId)?.title || "Unknown";

  if (isCardLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading card…</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Card not found.</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header / Breadcrumbs */}
      <div className="flex items-center justify-between border-b px-6 py-2.5">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="hover:text-foreground transition-colors cursor-default">
            {workspace?.name || "Workspace"}
          </span>
          <span className="text-muted-foreground/40 text-[10px]">›</span>
          <Link
            href={`/workspaces/${workspaceId}/boards/${boardId}`}
            className="hover:text-foreground transition-colors"
          >
            {board?.title || "Board"}
          </Link>
          <span className="text-muted-foreground/40 text-[10px]">›</span>
          <span className="font-medium text-foreground/60 truncate max-w-[150px]">
            {card.publicId || card.title}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() =>
              router.push(`/workspaces/${workspaceId}/boards/${boardId}`)
            }
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid flex-1 overflow-hidden lg:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <div className="overflow-y-auto px-8 py-6">
          <div className="max-w-3xl space-y-6">
            {/* Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title !== card.title) {
                  updateCardMut.mutate({ cardId, payload: { title } });
                }
              }}
              className="w-full bg-transparent text-2xl font-bold outline-none border-none p-0 focus:ring-0"
              placeholder="Card title"
            />

            {/* Description */}
            <div className="group relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  if (description !== card.description) {
                    updateCardMut.mutate({ cardId, payload: { description } });
                  }
                }}
                placeholder="Add description... (type '/' to open commands or '@' to mention)"
                className="w-full min-h-[100px] bg-transparent text-sm leading-relaxed outline-none border-none p-0 resize-none focus:ring-0 placeholder:text-muted-foreground/50"
              />
              <div className="flex items-center gap-4 py-3 text-muted-foreground/30 border-b">
                <CheckCircle className="h-3.5 w-3.5" />
                <div className="flex-1" />
                <Paperclip className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Activity Section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold">Activity</h3>

              <div className="relative space-y-5 pl-2">
                {/* Vertical Line */}
                <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-muted/60" />

                {cardActivities.length === 0 && (
                  <div className="text-xs text-muted-foreground pl-10">
                    No activity yet.
                  </div>
                )}

                {cardActivities.map((activity) => {
                  const member = workspaceMembers.find(
                    (m) => m.userId === activity.actorUserId || m.publicId === activity.actorUserId
                  );
                  const actorName = activity.metadata?.actor?.username || member?.name || "Someone";

                  return (
                    <div key={activity.id} className="relative flex gap-4 pl-0">
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                        {formatInitials(actorName)}
                      </div>
                      <div className="flex flex-col text-[13px] pt-1.5">
                        <div>
                          <span className="font-semibold">{actorName}</span>{" "}
                          <span className="text-muted-foreground">
                            {activity.actionType.replace("card.", "")}{" "}
                            <span className="font-medium text-foreground/80">{activity.metadata?.title || "the card"}</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comment Box */}
              <div className="mt-6 relative flex flex-col gap-2 rounded-xl border bg-muted/10 p-3 focus-within:ring-1 focus-within:ring-ring transition-all">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add comment... (type '/' to open commands or '@' to mention)"
                  className="min-h-[60px] w-full bg-transparent text-xs outline-none border-none resize-none focus:ring-0"
                />
                <div className="flex justify-end">
                  <Button
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    disabled={!comment.trim()}
                    onClick={() => {
                      toast.info("Comments aren't supported yet.");
                      setComment("");
                    }}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="border-l bg-muted/[0.03] px-6 py-6 space-y-6 text-[13px]">
          <div className="grid grid-cols-[80px_1fr] items-baseline gap-2">
            <div className="text-muted-foreground">List</div>
            <div className="font-medium">{currentListName}</div>
          </div>

          <div className="grid grid-cols-[80px_1fr] items-start gap-2">
            <div className="text-muted-foreground pt-1">Labels</div>
            <div className="flex flex-wrap items-center gap-1.5">
              {cardLabels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-white shadow-sm"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full text-xs text-muted-foreground"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add label
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-3">
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Edit labels
                    </div>
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {boardLabels.map((label) => {
                        const isChecked = cardLabels.some(
                          (l) => l.id === label.id,
                        );
                        return (
                          <button
                            key={label.id}
                            type="button"
                            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => toggleLabel(label)}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: label.color }}
                              />
                              <span
                                className={
                                  isChecked ? "font-medium" : "font-normal"
                                }
                              >
                                {label.name}
                              </span>
                            </div>
                            {isChecked && (
                              <Check className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        );
                      })}
                      {boardLabels.length === 0 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          No available labels. Create one below.
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs text-muted-foreground"
                        onClick={() => setIsCreateLabelOpen(true)}
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
              {cardMemberIds.map((memberId) => (
                <span
                  key={memberId}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs shadow-sm"
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/20 text-[9px] uppercase">
                    {memberInitial(memberId)}
                  </div>
                  {memberLabel(memberId)}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground ml-1"
                    onClick={() => toggleMember(memberId)}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted border-2 border-background ring-1 ring-muted/10 text-[9px] font-bold">
                      {formatInitials(name)}
                    </div>
                    <div className="absolute -top-1 -right-1 hidden group-hover:flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-white scale-75">
                      <X className="h-2 w-2" />
                    </div>
                  </div>
                );
              })}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full border-dashed"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-1.5">
                  <Input
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    placeholder="Find members..."
                    className="mb-1.5 h-7 text-[11px]"
                  />
                  <div className="space-y-0.5">
                    {filteredMembers.map((m) => {
                      const isChecked = cardMemberIds.includes(m.publicId);
                      return (
                        <button
                          key={m.publicId}
                          className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-muted"
                          onClick={() => toggleMember(m.publicId)}
                        >
                          <span>{m.name || m.email}</span>
                          {isChecked && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-[80px_1fr] items-baseline gap-2">
            <div className="text-muted-foreground">Due date</div>
            <div>
              <Input
                type="date"
                value={dueDate ? dueDate.slice(0, 10) : ""}
                onChange={handleDueDateChange}
                className="h-auto p-0 border-none bg-transparent text-[13px] font-medium focus-visible:ring-0 cursor-pointer hover:underline"
              />
            </div>
          </div>

          <div className="pt-6 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-none px-0 h-auto text-[13px]"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete card
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete card</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteCardMut.mutate(cardId, {
                  onSuccess: () => {
                    setIsDeleteOpen(false);
                    router.push(`/workspaces/${workspaceId}/boards/${boardId}`);
                  },
                  onError: () => toast.error("Failed to delete card"),
                });
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
                    labelColor === c
                      ? "ring-2 ring-ring ring-offset-2 scale-110"
                      : "",
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setLabelColor(c)}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <div className="space-y-2">
              <label htmlFor="label-name" className="text-sm font-medium">
                Label name
              </label>
              <Input
                id="label-name"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="e.g. Bug, Feature, Urgent..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateLabelOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={createAndAddLabel}>Create Label</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
