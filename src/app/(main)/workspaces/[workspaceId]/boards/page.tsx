"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoardsManagement } from "@/hooks/use-board";
import { useWorkspace } from "@/hooks/use-workspaces";

export default function BoardsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  const router = useRouter();

  const { data: workspace, isLoading: isWorkspaceLoading } = useWorkspace(workspaceId);
  const { boards, createBoard, deleteBoard } = useBoardsManagement(workspaceId);
  const [title, setTitle] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [deleteBoardId, setDeleteBoardId] = React.useState<string | null>(null);

  const workspaceName = workspace?.name ?? workspaceId;

  return (
    <div className="m-auto h-full max-w-[1100px] p-8 px-5 md:px-28 md:py-12">
      <div className="sticky top-0 z-10  bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div>
            <div className="text-lg font-semibold tracking-tight">Boards</div>
            <div className="text-xs text-muted-foreground">
              {isWorkspaceLoading ? (
                <Skeleton className="inline-block h-4 w-24" />
              ) : (
                workspaceName
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="px-4 py-3 font-bold " type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus />
              New
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {boards.length === 0 ? (
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
                <div className="text-base flex align-center font-semibold tracking-tight">{b.title}</div>
                <div className="pointer-events-none absolute inset-0 scale-95 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.18),transparent_60%)] opacity-0 blur-[2px] transition duration-300 ease-out group-hover:scale-100 group-hover:opacity-100" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteBoardId(b.id);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsCreateOpen(false)}
          />
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
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const id = createBoard(title);
                    setTitle("");
                    setIsCreateOpen(false);
                    router.push(`/workspaces/${workspaceId}/boards/${id}`);
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteBoardId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setDeleteBoardId(null)}
          />
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
                onClick={() => {
                  deleteBoard(deleteBoardId);
                  setDeleteBoardId(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
