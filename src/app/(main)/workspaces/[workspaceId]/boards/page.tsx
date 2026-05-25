"use client";

import * as React from "react";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceContext } from "@/contexts/workspace.context";
import { useBoards, useCreateBoard, useDeleteBoard } from "@/hooks/use-board";

// ── Inner component — only rendered when currentWorkspace is truthy ───────────
function BoardsContent({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const router = useRouter();

  const { data: boards = [], isLoading } = useBoards(workspaceId);
  const createBoardMutation = useCreateBoard(workspaceId);
  const deleteBoardMutation = useDeleteBoard(workspaceId);

  const [title, setTitle] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [deleteBoardId, setDeleteBoardId] = React.useState<string | null>(null);

  return (
    <div className="m-auto h-full max-w-[1100px] p-8 px-5 md:px-28 md:py-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div>
            <div className="text-lg font-semibold tracking-tight">Boards</div>
            <div className="text-xs text-muted-foreground">{workspaceName}</div>
          </div>
          <Button
            className="px-4 py-3 font-bold"
            type="button"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus />
            New
          </Button>
        </div>
      </div>

      {/* Board Grid */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[150px] rounded-xl" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
            No boards yet. Create your first board above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <div
                key={b.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/workspaces/${workspaceId}/boards/${b.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/workspaces/${workspaceId}/boards/${b.id}`);
                  }
                }}
                className="group relative mr-5 flex h-[150px] w-full items-center justify-center rounded-md border border-dashed border-light-400 shadow-sm cursor-pointer"
              >
                <div className="text-base font-semibold tracking-tight">{b.name}</div>
                <div className="pointer-events-none absolute inset-0 scale-95 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.18),transparent_60%)] opacity-0 blur-[2px] transition duration-300 ease-out group-hover:scale-100 group-hover:opacity-100" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteBoardId(String(b.id));
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setIsCreateOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border bg-background p-5 shadow-lg"
          >
            <div className="text-base font-semibold">New board</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Give your board a name to get started.
            </div>
            <div className="mt-4 space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Board title…"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && title.trim()) {
                    createBoardMutation.mutate(
                      { name: title.trim() },
                      {
                        onSuccess: (board) => {
                          setTitle("");
                          setIsCreateOpen(false);
                          router.push(`/workspaces/${workspaceId}/boards/${board.id}`);
                        },
                      },
                    );
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!title.trim() || createBoardMutation.isPending}
                  onClick={() =>
                    createBoardMutation.mutate(
                      { name: title.trim() },
                      {
                        onSuccess: (board) => {
                          setTitle("");
                          setIsCreateOpen(false);
                          router.push(`/workspaces/${workspaceId}/boards/${board.id}`);
                        },
                      },
                    )
                  }
                >
                  {createBoardMutation.isPending ? "Creating…" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteBoardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setDeleteBoardId(null)} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border bg-background p-5 shadow-lg"
          >
            <div className="text-base font-semibold">Delete board</div>
            <div className="mt-1 text-xs text-muted-foreground">
              This will remove the board and all its lists and cards. This action cannot be undone.
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setDeleteBoardId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                type="button"
                disabled={deleteBoardMutation.isPending}
                onClick={() =>
                  deleteBoardMutation.mutate(deleteBoardId, {
                    onSuccess: () => setDeleteBoardId(null),
                  })
                }
              >
                {deleteBoardMutation.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page entry point — guards on currentWorkspace ────────────────────────────
export default function BoardsPage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const urlWorkspaceId = params.workspaceId;

  const { currentWorkspace, workspaces, isLoadingWorkspaces } =
    useWorkspaceContext();

  // Resolve the "default" placeholder → the current (or first) workspace's id,
  // then replace the URL so the rest of the app sees a real id.
  React.useEffect(() => {
    if (urlWorkspaceId !== "default") return;
    if (isLoadingWorkspaces) return;
    const target = currentWorkspace ?? workspaces[0];
    if (target) {
      router.replace(`/workspaces/${target.publicId}/boards`);
    } else {
      router.replace("/workspaces");
    }
  }, [urlWorkspaceId, isLoadingWorkspaces, currentWorkspace, workspaces, router]);

  // Loading state (also while resolving the "default" placeholder)
  if (isLoadingWorkspaces || urlWorkspaceId === "default") {
    return (
      <div className="m-auto h-full max-w-[1100px] p-8 px-5 md:px-28 md:py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[150px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Workspace not found in the user's list
  if (!currentWorkspace) {
    return (
      <div className="m-auto h-full max-w-[1100px] p-8 px-5 md:px-28 md:py-12">
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-16 text-center">
          <LayoutGrid className="size-10 text-muted-foreground/50" />
          <div className="text-lg font-semibold">Workspace not found</div>
          <p className="text-sm text-muted-foreground">
            The workspace you are looking for does not exist or you do not have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BoardsContent
      workspaceId={currentWorkspace.publicId}
      workspaceName={currentWorkspace.name}
    />
  );
}
