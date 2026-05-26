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
import { formatDistanceToNow, format } from "date-fns";
import { Calendar as UICalendar } from "@/components/ui/calendar";

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
import { useWorkspaceContext } from "@/contexts/workspace.context";
import { useWorkspaceActivities } from "@/hooks/use-statistics";
import type { Label as ApiLabel, MemberRequest } from "@/lib/api/types";
import { ActivityAction, type Activity } from "@/lib/api/statistics.api";
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

type DisplayList = { id: string; publicId?: string; title: string };

type ActivityLookupContext = {
  lists: DisplayList[];
  labels: ApiLabel[];
  members: MemberRequest[];
};

function formatInitials(name: string) {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatMaybeDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d, yyyy");
}

function normalizeChangeAction(action?: unknown): "added" | "removed" | "updated" {
  if (!action) return "updated";
  const value = String(action).toLowerCase();
  if (value.includes("add")) return "added";
  if (value.includes("remove") || value.includes("delete")) return "removed";
  return "updated";
}

function resolveListTitle(lists: DisplayList[], listId?: string | number): string {
  if (!listId) return "a list";
  const target = String(listId);
  const list = lists.find((l) => l.id === target || l.publicId === target);
  return list?.title || "a list";
}

function resolveLabelName(
  labels: ApiLabel[],
  labelId?: string | number,
): string {
  if (!labelId) return "a label";
  const target = String(labelId);
  const label = labels.find(
    (l) => String(l.id) === target || l.publicId === target,
  );
  return label?.name || "a label";
}

function resolveMemberName(
  members: MemberRequest[],
  workspaceMemberPublicId?: string,
): string {
  if (!workspaceMemberPublicId) return "a member";
  const target = String(workspaceMemberPublicId);
  const member = members.find(
    (m) =>
      m.publicId === target ||
      String(m.id) === target ||
      m.userId === target,
  );
  return member?.name || member?.email || "a member";
}

function formatIndexPosition(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "a new position";
  return `position ${value + 1}`;
}

function getCardActivityMessage(
  activity: Activity,
  ctx: ActivityLookupContext,
): string {
  const fields: string[] = Array.isArray(activity.metadata?.fields)
    ? activity.metadata.fields
    : [];
  const metadata = activity.metadata ?? {};

  if (activity.actionType === ActivityAction.CARD_CREATED) {
    return "created this card";
  }
  if (activity.actionType === ActivityAction.CARD_DELETED) {
    return "deleted this card";
  }
  if (activity.actionType === ActivityAction.CARD_ARCHIVED) {
    return "archived this card";
  }
  if (activity.actionType !== ActivityAction.CARD_UPDATED) {
    return activity.actionType.replace("card.", "");
  }

  if (fields.includes("list") || fields.includes("index")) {
    const fromListId = metadata.fromListId as number | string | undefined;
    const toListId = metadata.toListId as number | string | undefined;
    const listId = metadata.listId as string | undefined;
    const fromIndex = metadata.fromIndex as number | undefined;
    const toIndex = metadata.toIndex as number | undefined;

    if (fromListId != null && toListId != null) {
      if (String(fromListId) !== String(toListId)) {
        const fromListName = resolveListTitle(ctx.lists, fromListId);
        const toListName = resolveListTitle(ctx.lists, toListId);
        return `moved the card from ${fromListName} (${formatIndexPosition(fromIndex)}) to ${toListName} (${formatIndexPosition(toIndex)})`;
      }
      const listName = resolveListTitle(ctx.lists, fromListId);
      if (fromIndex != null && toIndex != null) {
        return `moved the card within ${listName} from ${formatIndexPosition(fromIndex)} to ${formatIndexPosition(toIndex)}`;
      }
      return `updated the card position in ${listName}`;
    }

    if (listId) {
      const listName = resolveListTitle(ctx.lists, listId);
      return `reordered cards in ${listName}`;
    }

    return "updated the card position";
  }

  if (fields.includes("dueDate")) {
    const fromDueDate = metadata.fromDueDate as string | null | undefined;
    const toDueDate = metadata.toDueDate as string | null | undefined;
    if (!fromDueDate && toDueDate) {
      return `set the due date to ${formatMaybeDate(toDueDate)}`;
    }
    if (fromDueDate && !toDueDate) {
      return "removed the due date";
    }
    if (fromDueDate && toDueDate) {
      return `changed the due date from ${formatMaybeDate(fromDueDate)} to ${formatMaybeDate(toDueDate)}`;
    }
    return "updated the due date";
  }

  if (fields.includes("title")) {
    return "updated the title";
  }

  if (fields.includes("description")) {
    return "updated the description";
  }

  if (fields.includes("label")) {
    const action = normalizeChangeAction(
      metadata.labelAction ?? metadata.action ?? metadata.operation,
    );
    const labelName = resolveLabelName(ctx.labels, metadata.labelId as string | number | undefined);
    return `${action} label ${labelName}`;
  }

  if (fields.includes("member")) {
    const action = normalizeChangeAction(
      metadata.memberAction ?? metadata.action ?? metadata.operation,
    );
    const memberName = resolveMemberName(
      ctx.members,
      metadata.workspaceMemberPublicId as string | undefined,
    );
    return `${action} member ${memberName}`;
  }

  return "updated this card";
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
  const { currentWorkspace } = useWorkspaceContext();
  const workspaceContextId = currentWorkspace?.id
    ? String(currentWorkspace.id)
    : undefined;
  const { data: activitiesData } = useWorkspaceActivities(workspaceContextId, {
    limit: 50,
    entityType: "card",
    entityId: String(cardId),
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
        const withTitle = l as { title?: string; name?: string; publicId?: string };
        return {
          id: String(l.id),
          publicId: withTitle.publicId,
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
    const internalId = String(cardId);
    return activitiesData.items.filter(
      (a) => a.entityType === "card" && a.entityId === internalId,
    );
  }, [activitiesData, cardId]);

  const [title, setTitle] = React.useState(card?.title ?? "");
  const [description, setDescription] = React.useState(card?.description ?? "");
  const [comment, setComment] = React.useState("");
  const [listId, setListId] = React.useState(card?.listId ?? "");
  const [dueDate, setDueDate] = React.useState(card?.dueDate ?? "");
  const [labelInput, setLabelInput] = React.useState("");
  const [labelColor, setLabelColor] = React.useState("#3b82f6");
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
          attachLabelMut.mutate({ cardId, labelId: newLabel.publicId });
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
    const member = workspaceMembers.find((m) => String(m.id) === publicId);
    const email = member?.email?.trim();
    const shortEmail = email ? email.split("@")[0] : "";
    return shortEmail || member?.name?.trim() || email || publicId || "Member";
  };

  const memberInitial = (publicId: string) =>
    memberLabel(publicId).charAt(0).toUpperCase() || "?";

  const filteredMembers = workspaceMembers;

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
                  const activityText = getCardActivityMessage(activity, {
                    lists,
                    labels: boardLabels,
                    members: workspaceMembers,
                  });

                  return (
                    <div key={activity.id} className="relative flex gap-4 pl-0">
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                        {formatInitials(actorName)}
                      </div>
                      <div className="flex flex-col text-[13px] pt-1.5">
                        <div>
                          <span className="font-semibold">{actorName}</span>{" "}
                          <span className="text-muted-foreground">{activityText}</span>
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
        <div className="border-l bg-muted/[0.03] px-8 py-8 space-y-8 text-[13px]">
          <div className="grid grid-cols-[72px_1fr] items-center gap-3">
            <div className="text-muted-foreground">List</div>
            <div className="font-medium text-foreground">
              {lists.find(
                (l) =>
                  l.id === listId ||
                  l.publicId === listId ||
                  l.id === card?.list?.publicId ||
                  l.publicId === card?.list?.publicId,
              )?.title || "Unknown"}
            </div>
          </div>

          <div className="grid grid-cols-[72px_1fr] items-start gap-3">
            <div className="text-muted-foreground pt-1">Labels</div>
            <div className="flex flex-wrap items-center gap-2">
              {cardLabels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-foreground shadow-sm hover:bg-muted/40"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </button>
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
                <div
                  key={memberId}
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-background text-[11px] font-semibold text-muted-foreground"
                  title={memberLabel(memberId)}
                >
                  {memberInitial(memberId)}
                </div>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-dashed"
                    aria-label="Add member"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-2">
                  <div className="space-y-0.5">
                    {filteredMembers.length === 0 ? (
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        No members.
                      </div>
                    ) : (
                      filteredMembers.map((m) => {
                        const memberId = String(m.id);
                        const isChecked = cardMemberIds.includes(memberId);
                        return (
                          <button
                            key={memberId}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-muted"
                            onClick={() => toggleMember(memberId)}
                          >
                            <span
                              className={
                                "flex h-4 w-4 items-center justify-center rounded border " +
                                (isChecked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/40")
                              }
                            >
                              {isChecked && (
                                <Check className="h-3 w-3" />
                              )}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-muted-foreground/20 text-[10px] flex items-center justify-center">
                                {memberInitial(memberId)}
                              </div>
                              <span className="text-foreground">
                                {memberLabel(memberId)}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                    <button
                      type="button"
                      className="mt-1 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5" /> Invite member
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-[72px_1fr] items-center gap-3">
            <div className="text-muted-foreground">Due date</div>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="h-8 w-full bg-transparent text-[13px] font-medium text-left focus:outline-none hover:underline">
                    {dueDate ? format(new Date(dueDate), "MMMM d, yyyy") : "Set due date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0 border-none shadow-2xl">
                  <UICalendar
                    mode="single"
                    selected={dueDate ? new Date(dueDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const isoDate = date.toISOString();
                        setDueDate(isoDate);
                        setDueDateMut.mutate({ cardId, dueDate: isoDate });
                      } else {
                        setDueDate("");
                        clearDueDateMut.mutate(cardId);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-0"
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
