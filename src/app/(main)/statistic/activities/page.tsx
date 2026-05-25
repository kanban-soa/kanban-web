"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { useMember } from "@/hooks/use-workspaces";
import { useWorkspaceContext } from "@/contexts/workspace.context";
import { useBoards } from "@/hooks/use-board";
import { useWorkspaceActivities } from "@/hooks/use-statistics";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity } from "@/lib/api/statistics.api";
import { Badge } from "@/components/ui/badge";
import { MemberRequest, Board } from "@/lib/api/types";

const PAGE_SIZE = 10;

function formatInitials(value: string) {
  if (!value) return "NA";
  const parts = value.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return value.slice(0, 2).toUpperCase();
}

function ActivityItem({
  activity,
  members,
  boards,
}: {
  activity: Activity;
  members: MemberRequest[];
  boards: Board[];
}) {
  const dateFormatter = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, []);

  const actorName = React.useMemo(() => {
    if (activity.metadata?.actor?.username) return activity.metadata.actor.username;
    const member = members.find((m) => m.userId === activity.actorUserId || m.publicId === activity.actorUserId);
    return member?.name || activity.actorUserId;
  }, [activity, members]);

  const entityName = React.useMemo(() => {
    // 1. Explicit title in metadata (common for cards)
    if (activity.metadata?.title) return activity.metadata.title;
    
    // 2. Explicit name in metadata (common for boards, especially deletions)
    if (activity.metadata?.name) return activity.metadata.name;
    
    // 3. Board name in metadata (common for board activities or card context)
    if (activity.metadata?.boardName) return activity.metadata.boardName;
    
    // 4. Nested entity title
    if (activity.metadata?.entity?.title) return activity.metadata.entity.title;
    
    // 5. Hook-based resolution for boards
    if (activity.entityType === "board") {
      const board = boards.find((b) => b.publicId === activity.entityId || b.id === activity.entityId);
      return board?.title || activity.entityId;
    }
    
    // 6. Fallback to ID
    return activity.entityId;
  }, [activity, boards]);

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold">
        {formatInitials(actorName)}
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold text-primary">{actorName}</span>{" "}
          <span className="italic">{activity.actionType}</span> on{" "}
          <span className="font-semibold">{activity.entityType}</span>{" "}
          <span className="text-muted-foreground">{entityName}</span>
          {activity.entityType === "card" && activity.metadata?.listName && (
            <>
              {" "}
              in <span className="font-medium">{activity.metadata.listName}</span>
            </>
          )}
          {activity.entityType === "card" && activity.metadata?.boardName && (
            <>
              {" "}
              of <span className="font-medium">{activity.metadata.boardName}</span>
            </>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {dateFormatter.format(new Date(activity.createdAt))}
        </p>
      </div>
      <Badge variant="outline">{activity.actionType.split(".")[1]}</Badge>
    </div>
  );
}

export default function ActivityLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWorkspace, isLoadingWorkspaces } = useWorkspaceContext();
  const workspaceId = currentWorkspace?.id;
  const workspacePublicId = currentWorkspace?.publicId;

  const { data: members = [], isLoading: isMembersLoading } = useMember(workspaceId?.toString() ?? "");
  const { data: boards = [], isLoading: isBoardsLoading } = useBoards(workspacePublicId ?? "");

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : PAGE_SIZE;

  const {
    data: activitiesData,
    isLoading: isActivitiesLoading,
    isError,
  } = useWorkspaceActivities(workspaceId?.toString(), {
    page,
    limit,
  });

  const isLoading =
    isLoadingWorkspaces ||
    isActivitiesLoading ||
    isMembersLoading ||
    isBoardsLoading;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  const totalPages = activitiesData?.pagination.totalPages ?? 1;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Activity Log</h1>
            <p className="text-sm text-muted-foreground">
              A log of all activities in the workspace.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/statistic">Back to Statistics</Link>
          </Button>
        </div>

        {isError && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            Failed to load activities. Please try again.
          </div>
        )}

        <div className="space-y-6">
          {isLoading
            ? Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              ))
            : activitiesData?.items.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  members={members}
                  boards={boards}
                />
              ))}
        </div>

        {activitiesData && activitiesData.pagination.total > 0 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Page {activitiesData.pagination.page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={page <= 1}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
