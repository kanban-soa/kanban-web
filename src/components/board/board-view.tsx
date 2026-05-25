"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  MoreHorizontal,
  Plus,
  Tag,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Id } from "@/lib/board/types";
import {
  useBoard,
  useBoardLists,
  useBoardLabels,
  useUpdateBoard,
  useDeleteBoard,
  useCreateList,
  useUpdateList,
  useDeleteList,
  useCreateCard,
  useUpdateCard,
  useAttachLabelToCard,
  useDetachLabelFromCard,
  useAssignMemberToCard,
  useRemoveMemberFromCard,
  useSetCardDueDate,
  useClearCardDueDate,
} from "@/hooks/use-board";
import { useMember } from "@/hooks/use-workspaces";
import type { Card, Label as ApiLabel, MemberRequest } from "@/lib/api/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DisplayCard = {
  id: Id;
  title: string;
  description: string;
  labels: ApiLabel[];
  memberIds: string[];
  dueDate: string | null;
};

function normalizeListTitle<T extends { title?: string; name?: string }>(l: T) {
  return { ...l, title: l.title ?? l.name ?? "" };
}

function toDisplayCard(c: Card & { name?: string }): DisplayCard {
  return {
    id: String(c.id ?? c.publicId ?? ""),
    title: c.title ?? c.name ?? "",
    description: c.description ?? "",
    labels: c.labels ?? [],
    memberIds: c.members ?? [],
    dueDate: c.dueDate ?? null,
  };
}

function formatDueDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BoardView({
  workspaceId,
  boardId,
}: {
  workspaceId: Id;
  boardId: Id;
}) {
  const { data: board, isLoading: isBoardLoading } = useBoard(
    workspaceId,
    boardId,
  );
  const { data: rawLists = [], isLoading: isListsLoading } = useBoardLists(
    workspaceId,
    boardId,
  );

  const lists = React.useMemo(
    () =>
      rawLists.map((l) => {
        const normalized = normalizeListTitle(l);
        const cards = ((l as unknown as { cards?: Card[] }).cards ?? []).map(
          toDisplayCard,
        );
        return { ...normalized, cards };
      }),
    [rawLists],
  );

  const updateBoardMut = useUpdateBoard(workspaceId, boardId);
  const deleteBoardMut = useDeleteBoard(workspaceId);
  const createListMut = useCreateList(workspaceId, boardId);
  const updateListMut = useUpdateList(workspaceId, boardId);
  const deleteListMut = useDeleteList(workspaceId, boardId);
  const updateCardMut = useUpdateCard(workspaceId, boardId);
  const attachLabelMut = useAttachLabelToCard(workspaceId, boardId);
  const detachLabelMut = useDetachLabelFromCard(workspaceId, boardId);
  const assignMemberMut = useAssignMemberToCard(workspaceId, boardId);
  const removeMemberMut = useRemoveMemberFromCard(workspaceId, boardId);
  const setDueDateMut = useSetCardDueDate(workspaceId, boardId);
  const clearDueDateMut = useClearCardDueDate(workspaceId, boardId);

  const { data: boardLabels = [] } = useBoardLabels(boardId);
  const { data: workspaceMembers = [] } = useMember(workspaceId);

  const toggleLabelOnCard = React.useCallback(
    (cardId: Id, label: ApiLabel, isAttached: boolean) => {
      if (isAttached) {
        detachLabelMut.mutate({ cardId, labelId: label.id });
      } else {
        attachLabelMut.mutate({ cardId, labelId: label.id });
      }
    },
    [attachLabelMut, detachLabelMut],
  );

  const toggleMemberOnCard = React.useCallback(
    (cardId: Id, memberPublicId: string, isAssigned: boolean) => {
      if (isAssigned) {
        removeMemberMut.mutate({ cardId, memberId: memberPublicId });
      } else {
        assignMemberMut.mutate({
          cardId,
          workspaceMemberPublicId: memberPublicId,
        });
      }
    },
    [assignMemberMut, removeMemberMut],
  );

  const setDueDateOnCard = React.useCallback(
    (cardId: Id, dueDate: string | null) => {
      if (dueDate) {
        setDueDateMut.mutate({ cardId, dueDate });
      } else {
        clearDueDateMut.mutate(cardId);
      }
    },
    [setDueDateMut, clearDueDateMut],
  );

  const isLoading = isBoardLoading || isListsLoading;

  const [newListTitle, setNewListTitle] = React.useState("");
  const [isListOpen, setIsListOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [boardTitle, setBoardTitle] = React.useState(board?.title ?? "");
  const [boardDescription, setBoardDescription] = React.useState(
    board?.description ?? "",
  );

  React.useEffect(() => {
    if (board) {
      setBoardTitle(board.title);
      setBoardDescription(board.description ?? "");
    }
  }, [board]);

  const handleUpdateBoard = () => {
    if (!board) return;
    updateBoardMut.mutate(
      { title: boardTitle, description: boardDescription },
      {
        onSuccess: () => setIsEditModalOpen(false),
        onError: () => toast.error("Failed to update board"),
      },
    );
  };

  const handleDeleteBoard = () => {
    deleteBoardMut.mutate(boardId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        toast.success("Board deleted");
      },
      onError: () => toast.error("Failed to delete board"),
    });
  };

  if (isLoading) {
    return (
      <div className="h-full w-full">
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between gap-3 px-6 py-4">
            <div className="min-w-0">
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-0.5 h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="h-full w-full">
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between gap-3 px-6 py-4">
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-tight">
                Board not found
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold tracking-tight">
              {board.title}
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              {board.description}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {lists.length} lists
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/workspaces/${workspaceId}/boards`}
              className={cn(
                "inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm font-medium hover:bg-muted",
              )}
            >
              Back to boards
            </Link>
          </div>
        </div>
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              Create a new list for this board.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsListOpen(true)}
              >
                <Plus />
                Add list
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    Edit Board
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-red-600"
                  >
                    Delete Board
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={boardDescription}
                onChange={(e) => setBoardDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateBoard}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div>
            <p>
              This action will permanently delete the board{" "}
              <strong>{board.title}</strong> and all its contents. This cannot
              be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBoard}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="h-[calc(100vh-8.5rem)] w-full overflow-x-auto px-6 py-6">
        <div className="flex min-w-full items-start gap-4">
          {lists.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
              This board has no lists yet. Click{" "}
              <span className="font-medium">Add list</span> to create one.
            </div>
          ) : (
            lists.map((list) => (
              <ListColumn
                key={list.id}
                workspaceId={workspaceId}
                boardId={boardId}
                listId={list.id}
                title={list.title}
                cards={list.cards}
                boardLabels={boardLabels}
                workspaceMembers={workspaceMembers}
                onUpdateList={(newTitle) =>
                  updateListMut.mutate({
                    listId: list.id,
                    payload: { name: newTitle },
                  })
                }
                onDeleteList={() => deleteListMut.mutate(list.id)}
                onMoveCard={(cardId, newListId) =>
                  updateCardMut.mutate({
                    cardId,
                    payload: { targetListId: newListId },
                  })
                }
                onToggleLabel={toggleLabelOnCard}
                onToggleMember={toggleMemberOnCard}
                onSetDueDate={setDueDateOnCard}
              />
            ))
          )}
        </div>
      </div>

      {isListOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsListOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border bg-background p-5 shadow-lg"
          >
            <div className="text-base font-semibold">New list</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Add a list title to create a new column.
            </div>
            <div className="mt-4 space-y-3">
              <Input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="List title…"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsListOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!newListTitle.trim() || createListMut.isPending}
                  onClick={() => {
                    createListMut.mutate(
                      { name: newListTitle.trim() },
                      {
                        onSuccess: () => {
                          setNewListTitle("");
                          setIsListOpen(false);
                        },
                        onError: () => toast.error("Failed to create list"),
                      },
                    );
                  }}
                >
                  {createListMut.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ListColumn({
  workspaceId,
  boardId,
  listId,
  title,
  cards,
  boardLabels,
  workspaceMembers,
  onUpdateList,
  onDeleteList,
  onMoveCard,
  onToggleLabel,
  onToggleMember,
  onSetDueDate,
}: {
  workspaceId: Id;
  boardId: Id;
  listId: Id;
  title: string;
  cards: DisplayCard[];
  boardLabels: ApiLabel[];
  workspaceMembers: MemberRequest[];
  onUpdateList: (title: string) => void;
  onDeleteList: () => void;
  onMoveCard: (cardId: Id, newListId: Id) => void;
  onToggleLabel: (cardId: Id, label: ApiLabel, isAttached: boolean) => void;
  onToggleMember: (
    cardId: Id,
    memberPublicId: string,
    isAssigned: boolean,
  ) => void;
  onSetDueDate: (cardId: Id, dueDate: string | null) => void;
}) {
  const createCardMut = useCreateCard(workspaceId, boardId, listId);

  const [cardTitle, setcardTitle] = React.useState("");
  const [cardDescription, setcardDescription] = React.useState("");
  const [iscardOpen, setIscardOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(title);
  const [isOver, setIsOver] = React.useState(false);

  React.useEffect(() => {
    setEditTitle(title);
  }, [title]);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim() && editTitle !== title) {
      onUpdateList(editTitle);
    } else {
      setEditTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditTitle(title);
      setIsEditingTitle(false);
    }
  };

  const handleCreateCard = () => {
    if (!cardTitle.trim()) return;
    createCardMut.mutate(
      { title: cardTitle.trim(), description: cardDescription || undefined },
      {
        onSuccess: () => {
          setcardTitle("");
          setcardDescription("");
          setIscardOpen(false);
        },
        onError: () => toast.error("Failed to create card"),
      },
    );
  };

  return (
    <div className="w-[320px] shrink-0 rounded-xl border bg-muted/10">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit}>
              <Input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleKeyDown}
                className="h-7 w-full px-2 py-1 text-sm font-semibold"
              />
            </form>
          ) : (
            <div
              className="truncate text-sm font-semibold cursor-pointer rounded px-1 -ml-1 hover:bg-muted/50"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </div>
          )}
          <div className="text-xs text-muted-foreground ml-1 mt-0.5">
            {cards.length} cards
          </div>
        </div>
        <div className="relative flex items-center gap-1">
          <Button
            size="icon-sm"
            type="button"
            variant="ghost"
            className="rounded-full bg-muted/60 text-muted-foreground hover:bg-muted cursor-pointer"
            onClick={() => setIscardOpen(true)}
          >
            <Plus />
            <span className="sr-only">New card</span>
          </Button>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                type="button"
                className="rounded-full bg-muted/60 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <MoreHorizontal />
                <span className="sr-only">List actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditingTitle(true);
                }}
                className="cursor-pointer"
              >
                Rename list
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDeleteOpen(true);
                }}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                Delete list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        className={cn(
          "space-y-2 p-3 min-h-[100px] transition-colors rounded-b-xl",
          isOver && "bg-primary/5",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          const cardId = e.dataTransfer.getData("cardId");
          if (cardId) {
            onMoveCard(cardId, listId);
          }
        }}
      >
        {cards.map((t) => (
          <CardItem
            key={t.id}
            workspaceId={workspaceId}
            boardId={boardId}
            card={t}
            boardLabels={boardLabels}
            workspaceMembers={workspaceMembers}
            onToggleLabel={onToggleLabel}
            onToggleMember={onToggleMember}
            onSetDueDate={onSetDueDate}
          />
        ))}
      </div>

      <Dialog open={iscardOpen} onOpenChange={setIscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New card</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="card-title" className="text-right">
                Title
              </Label>
              <Input
                id="card-title"
                value={cardTitle}
                onChange={(e) => setcardTitle(e.target.value)}
                className="col-span-3"
                placeholder="Card title…"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="card-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="card-description"
                value={cardDescription}
                onChange={(e) => setcardDescription(e.target.value)}
                className="col-span-3"
                placeholder="Card description…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleCreateCard}
              disabled={createCardMut.isPending}
            >
              {createCardMut.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete list</DialogTitle>
          </DialogHeader>
          <div>
            <p>
              This will remove the list and all its cards. This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDeleteList();
                setIsDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CardItem({
  workspaceId,
  boardId,
  card,
  boardLabels,
  workspaceMembers,
  onToggleLabel,
  onToggleMember,
  onSetDueDate,
}: {
  workspaceId: Id;
  boardId: Id;
  card: DisplayCard;
  boardLabels: ApiLabel[];
  workspaceMembers: MemberRequest[];
  onToggleLabel: (cardId: Id, label: ApiLabel, isAttached: boolean) => void;
  onToggleMember: (
    cardId: Id,
    memberPublicId: string,
    isAssigned: boolean,
  ) => void;
  onSetDueDate: (cardId: Id, dueDate: string | null) => void;
}) {
  const [memberQuery, setMemberQuery] = React.useState("");

  const detailHref = `/workspaces/${workspaceId}/boards/${boardId}/cards/${card.id}`;
  const memberLabel = (publicId: string): string => {
    const m = workspaceMembers.find((mm) => String(mm.id) === publicId);
    const email = m?.email?.trim();
    const shortEmail = email ? email.split("@")[0] : "";
    return shortEmail || m?.name?.trim() || email || publicId || "Member";
  };

  const memberInitial = (publicId: string) =>
    memberLabel(publicId).charAt(0).toUpperCase() || "?";

  const filteredMembers = workspaceMembers.filter((m) => {
    const haystack = (m.name ?? m.email ?? "").toLowerCase();
    return haystack.includes(memberQuery.trim().toLowerCase());
  });

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("cardId", card.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="group relative rounded-lg border bg-card px-3 py-2 text-sm shadow-sm transition hover:bg-muted/40"
    >
      {/* Quick actions — always visible in top-right corner */}
      <div className="absolute right-2 top-2 flex gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              type="button"
              className="size-6 rounded-full bg-background/80 text-muted-foreground hover:bg-muted"
              title="Labels"
              onClick={(e) => e.stopPropagation()}
            >
              <Tag className="size-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-1 pb-1 text-xs font-semibold text-muted-foreground">
              Labels
            </div>
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {boardLabels.length === 0 ? (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  No labels yet.
                </div>
              ) : (
                boardLabels.map((label) => {
                  const isAttached = card.labels.some(
                    (l) => l.id === label.id,
                  );
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() =>
                        onToggleLabel(card.id, label, isAttached)
                      }
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </span>
                      {isAttached && (
                        <Check className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              type="button"
              className="size-6 rounded-full bg-background/80 text-muted-foreground hover:bg-muted"
              title="Members"
              onClick={(e) => e.stopPropagation()}
            >
              <UserPlus className="size-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-1 pb-1 text-xs font-semibold text-muted-foreground">
              Members
            </div>
            <Input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Search..."
              className="mb-2 h-7"
            />
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  No matches.
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const memberId = String(m.id);
                  const isAssigned = card.memberIds.includes(memberId);
                  return (
                    <button
                      key={memberId}
                      type="button"
                      onClick={() =>
                        onToggleMember(card.id, memberId, isAssigned)
                      }
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      <span>{memberLabel(memberId)}</span>
                      {isAssigned && (
                        <Check className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              type="button"
              className="size-6 rounded-full bg-background/80 text-muted-foreground hover:bg-muted"
              title="Due date"
              onClick={(e) => e.stopPropagation()}
            >
              <Calendar className="size-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-semibold text-muted-foreground">
              Due date
            </div>
            <Input
              type="date"
              value={card.dueDate ? card.dueDate.slice(0, 10) : ""}
              onChange={(e) =>
                onSetDueDate(card.id, e.target.value || null)
              }
              className="mt-2 h-8"
            />
            {card.dueDate && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="mt-2 h-7 w-full text-xs"
                onClick={() => onSetDueDate(card.id, null)}
              >
                Clear due date
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Main clickable area: title, labels, members, description */}
      <Link href={detailHref} className="block cursor-pointer">
        <div className="font-medium leading-5 pr-14">{card.title}</div>
        {card.labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {card.labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="rounded-full px-2 py-0.5 text-[11px] text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
            {card.labels.length > 3 && (
              <span className="text-[11px] text-muted-foreground">
                +{card.labels.length - 3}
              </span>
            )}
          </div>
        )}
        {card.memberIds.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {card.memberIds.slice(0, 4).map((mid) => (
              <span
                key={mid}
                title={memberLabel(mid)}
                className="inline-flex size-5 items-center justify-center rounded-full bg-muted-foreground/20 text-[9px] uppercase"
              >
                {memberInitial(mid)}
              </span>
            ))}
            {card.memberIds.length > 4 && (
              <span className="text-[11px] text-muted-foreground">
                +{card.memberIds.length - 4}
              </span>
            )}
          </div>
        )}
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="size-3" />
          {card.dueDate ? formatDueDate(card.dueDate) : "No due date"}
        </div>
        {card.description && (
          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {card.description}
          </div>
        )}
      </Link>
    </div>
  );
}
