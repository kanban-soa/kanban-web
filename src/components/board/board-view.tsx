"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Id } from "@/lib/board/types";
import { useBoardsManagement } from "@/hooks/use-board";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BoardView({
  workspaceId,
  boardId,
}: {
  workspaceId: Id;
  boardId: Id;
}) {
  const {
    getBoard,
    getListsForBoard,
    getcardsForList,
    isLoading,
    initBoard,
    createList,
    updateList,
    createcard,
    deleteList,
    updateBoard,
    deleteBoard,
    updatecard,
  } = useBoardsManagement(workspaceId);
  const board = getBoard(boardId);
  const lists = getListsForBoard(boardId);

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
      setBoardDescription(board.description);
    }
  }, [board]);

  const handleUpdateBoard = () => {
    if (board) {
      updateBoard(board.id, {
        title: boardTitle,
        description: boardDescription,
      });
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteBoard = () => {
    deleteBoard(boardId);
    setIsDeleteModalOpen(false);
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
              <div className="truncate text-lg font-semibold tracking-tight">Board not found</div>
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
              <strong>{board.title}</strong> and all its contents. This
              cannot be undone.
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
              This board has no lists yet. Click <span className="font-medium">Init</span> to
              create default columns, or add your own list above.
            </div>
          ) : (
            lists.map((list) => (
              <ListColumn
                key={list.id}
                workspaceId={workspaceId}
                boardId={boardId}
                listId={list.id}
                title={list.title}
                cards={getcardsForList(list.id)}
                onAddcard={(t, d) => createcard(boardId, list.id, t, d)}
                onUpdateList={(newTitle) => updateList(list.id, { title: newTitle })}
                onDeleteList={() => deleteList(boardId, list.id)}
                onMoveCard={(cardId, newListId) => updatecard(cardId, { listId: newListId })}
              />
            ))
          )}
        </div>
      </div>

      {isListOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setIsListOpen(false)} />
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
                <Button variant="outline" type="button" onClick={() => setIsListOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    createList(boardId, newListTitle);
                    setNewListTitle("");
                    setIsListOpen(false);
                  }}
                >
                  Create
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
  onAddcard,
  onUpdateList,
  onDeleteList,
  onMoveCard,
}: {
  workspaceId: Id;
  boardId: Id;
  listId: Id;
  title: string;
  cards: { id: Id; title: string; description: string; labels?: { text: string; color: string }[] }[];
  onAddcard: (title: string, description: string) => void;
  onUpdateList: (title: string) => void;
  onDeleteList: () => void;
  onMoveCard: (cardId: Id, newListId: Id) => void;
}) {
  const [cardTitle, setcardTitle] = React.useState("");
  const [cardDescription, setcardDescription] = React.useState("");
  const [iscardOpen, setIscardOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(title);
  const [isOver, setIsOver] = React.useState(false);

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
    if (e.key === 'Escape') {
      setEditTitle(title);
      setIsEditingTitle(false);
    }
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
          <div className="text-xs text-muted-foreground ml-1 mt-0.5">{cards.length} cards</div>
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
          isOver && "bg-primary/5"
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
          <Link
            key={t.id}
            href={`/workspaces/${workspaceId}/boards/${boardId}/cards/${t.id}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("cardId", t.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            className="block rounded-lg border bg-card px-3 py-2 text-sm shadow-sm transition hover:bg-muted/40 cursor-pointer"
          >
            <div className="font-medium leading-5">{t.title}</div>
            {t.labels && t.labels.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {t.labels.slice(0, 3).map((label, idx) => (
                  <span
                    key={idx}
                    className="rounded-full px-2 py-0.5 text-[11px] text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.text}
                  </span>
                ))}
                {t.labels.length > 3 ? (
                  <span className="text-[11px] text-muted-foreground">+{t.labels.length - 3}</span>
                ) : null}
              </div>
            ) : null}
            {t.description ? (
              <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {t.description}
              </div>
            ) : null}
          </Link>
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
              onClick={() => {
                onAddcard(cardTitle, cardDescription);
                setcardTitle("");
                setcardDescription("");
                setIscardOpen(false);
              }}
            >
              Create
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
              This will remove the list and all its cards. This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
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

