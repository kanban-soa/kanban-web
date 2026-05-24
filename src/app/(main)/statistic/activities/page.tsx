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

import { useWorkspaces } from "@/hooks/use-workspaces";
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

const PAGE_SIZE = 10;

function formatInitials(value: string) {
  if (!value) return "NA";
  const parts = value.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return value.slice(0, 2).toUpperCase();
}

function ActivityItem({ activity }: { activity: Activity }) {
  const dateFormatter = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold">
        {formatInitials(activity.actorUserId)}
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold text-primary">{activity.actorUserId}</span>{" "}
          <span className="italic">{activity.actionType}</span> on{" "}
          <span className="font-semibold">{activity.entityType}</span>{" "}
          <span className="text-muted-foreground">{activity.entityId}</span>
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
  const { data: workspaces, isLoading: isWorkspaceLoading } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id;

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : PAGE_SIZE;

  const {
    data: activitiesData,
    isLoading: isActivitiesLoading,
    isError,
  } = useWorkspaceActivities(workspaceId, {
    page,
    limit,
  });

  const isLoading = isWorkspaceLoading || isActivitiesLoading;

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
                <ActivityItem key={activity.id} activity={activity} />
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
