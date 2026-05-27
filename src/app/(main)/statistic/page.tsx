"use client";

import * as React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceContext } from "@/contexts/workspace.context";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  CheckCircle2,
  Clock3,
  Download,
  PlusCircle,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMember } from "@/hooks/use-workspaces";
import { useBoards } from "@/hooks/use-board";
import {
  useStatisticsSummary,
  useWorkspaceActivities,
} from "@/hooks/use-statistics";
import {
  exportStatistics,
  type Activity,
  type StatisticsPriority,
  type StatisticsRange,
} from "@/lib/api/statistics.api";
import { Badge } from "@/components/ui/badge";
import { MemberRequest, Board } from "@/lib/api/types";
import { formatDistanceToNow, format } from "date-fns";

const emptyPriorities: StatisticsPriority[] = [];

function formatInitials(value: string) {
  if (!value) return "NA";
  const parts = value.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return value.slice(0, 2).toUpperCase();
}

function formatMaybeDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d, yyyy");
}

function formatActivityAge(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatDistanceToNow(date, { addSuffix: true });
}

function normalizeChangeAction(action?: unknown): "added" | "removed" | "updated" {
  if (!action) return "updated";
  const value = String(action).toLowerCase();
  if (value.includes("add")) return "added";
  if (value.includes("remove") || value.includes("delete")) return "removed";
  return "updated";
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

function resolveLabelName(metadata: Record<string, unknown>): string {
  if (typeof metadata.labelName === "string" && metadata.labelName) {
    return metadata.labelName;
  }
  const label = metadata.label as { name?: string } | undefined;
  if (label?.name) return label.name;
  if (metadata.labelId != null) return `label ${metadata.labelId}`;
  return "a label";
}

function resolveListName(metadata: Record<string, unknown>, key: string): string {
  const direct = metadata[key];
  if (typeof direct === "string" && direct) return direct;
  const id = metadata[`${key}Id`];
  if (id != null) return `list ${id}`;
  return "a list";
}

function getActivityMessage(activity: Activity, members: MemberRequest[]): string {
  const fields: string[] = Array.isArray(activity.metadata?.fields)
    ? activity.metadata.fields
    : [];
  const metadata = (activity.metadata ?? {}) as Record<string, unknown>;

  if (activity.actionType === "card.created") return "created the card";
  if (activity.actionType === "card.deleted") return "deleted the card";
  if (activity.actionType === "card.archived") return "archived the card";
  if (activity.actionType === "board.created") return "created the board";
  if (activity.actionType === "board.deleted") return "deleted the board";
  if (activity.actionType === "board.updated") return "updated the board";

  if (activity.actionType !== "card.updated") {
    return activity.actionType.replace(".", " ");
  }

  if (fields.includes("list") || fields.includes("index")) {
    const fromListId = metadata.fromListId as number | string | undefined;
    const toListId = metadata.toListId as number | string | undefined;
    const listId = metadata.listId as string | undefined;
    const fromIndex = metadata.fromIndex as number | undefined;
    const toIndex = metadata.toIndex as number | undefined;

    if (fromListId != null && toListId != null) {
      const fromListName = resolveListName(metadata, "fromListName");
      const toListName = resolveListName(metadata, "toListName");
      if (String(fromListId) !== String(toListId)) {
        return `moved the card from ${fromListName} (${fromIndex ?? "?"}) to ${toListName} (${toIndex ?? "?"})`;
      }
      return `moved the card within ${fromListName}`;
    }

    if (listId) {
      const listName = resolveListName(metadata, "listName");
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

  if (fields.includes("title")) return "updated the card title";
  if (fields.includes("description")) return "updated the card description";

  if (fields.includes("label")) {
    const action = normalizeChangeAction(
      metadata.labelAction ?? metadata.action ?? metadata.operation,
    );
    return `${action} label ${resolveLabelName(metadata)}`;
  }

  if (fields.includes("member")) {
    const action = normalizeChangeAction(
      metadata.memberAction ?? metadata.action ?? metadata.operation,
    );
    const memberName = resolveMemberName(
      members,
      metadata.workspaceMemberPublicId as string | undefined,
    );
    return `${action} member ${memberName}`;
  }

  return "updated the card";
}

export default function StatisticPage() {
  const {
    currentWorkspace,
    setCurrentWorkspace,
    workspaces,
    isLoadingWorkspaces,
  } = useWorkspaceContext();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | undefined>(
    currentWorkspace?.id
  );
  const [selectedWorkspacePublicId, setSelectedWorkspacePublicId] = React.useState<string | undefined>(
    currentWorkspace?.publicId
  );
  const [range, setRange] = React.useState<StatisticsRange>("30d");
  const [selectedBoardId, setSelectedBoardId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setSelectedBoardId(undefined);
  }, [selectedWorkspaceId]);

  React.useEffect(() => {
    if (currentWorkspace) {
      setSelectedWorkspaceId(currentWorkspace.id);
      setSelectedWorkspacePublicId(currentWorkspace.publicId);
    }
  }, [currentWorkspace]);

  const [isExporting, setIsExporting] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<"csv" | "json">("csv");
  const {
    data: summary,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useStatisticsSummary(selectedWorkspaceId, range, selectedBoardId);
  const { data: activitiesData, isLoading: isActivitiesLoading } =
    useWorkspaceActivities(selectedWorkspaceId, {
      limit: 5,
    }, selectedBoardId);

  const { data: members = [], isLoading: isMembersLoading } = useMember(selectedWorkspaceId ?? "");
  const { data: boards = [], isLoading: isBoardsLoading } = useBoards(selectedWorkspacePublicId ?? "");

  const isLoading =
    isLoadingWorkspaces ||
    isStatsLoading ||
    isActivitiesLoading ||
    isMembersLoading ||
    isBoardsLoading;
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat(), []);
  const percentFormatter = React.useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }),
    [],
  );

  const metrics = summary?.metrics;
  const activities = activitiesData?.items ?? [];
  const priorities = summary?.priorities ?? emptyPriorities;
  const workloads = summary?.workloads ?? [];


  if (isLoadingWorkspaces && (!workspaces || workspaces.length === 0)) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
            No workspaces yet. Create one from the sidebar to view statistics.
          </div>
        </div>
      </main>
    );
  }

  const metricCards = [
    {
      title: "Created",
      value: metrics?.created,
      trend: metrics?.createdTrend,
      icon: PlusCircle,
    },
    {
      title: "Updated",
      value: metrics?.updated,
      trend: metrics?.updatedTrend,
      icon: Clock3,
    },
    {
      title: "Due Soon",
      value: metrics?.dueSoon,
      trend: metrics?.dueSoonTrend,
      icon: Bell,
    },
  ] as const;


  const formatMetric = (value: number | undefined) =>
    value === undefined || Number.isNaN(value) ? "—" : numberFormatter.format(value);
  const formatTrend = (value: number | undefined) => {
    if (value === undefined || Number.isNaN(value)) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${percentFormatter.format(value)}%`;
  };
  const formatPercent = (value: number | undefined) =>
    value === undefined || Number.isNaN(value) ? "—" : `${percentFormatter.format(value)}%`;

  const handleExport = async () => {
    if (!selectedWorkspaceId || isExporting) return;
    setIsExporting(true);
    try {
      const { blob, contentType } = await exportStatistics(selectedWorkspaceId, range, exportFormat);
      const fileName = `statistics-${selectedWorkspaceId}-${range}.${exportFormat}`;
      const downloadBlob = contentType ? new Blob([blob], { type: contentType }) : blob;
      const url = window.URL.createObjectURL(downloadBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export statistics", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-muted-foreground">
              Statistic overview from{" "}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="font-black text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1 focus:outline-none">
                    {currentWorkspace?.name}
                    <ChevronDown className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    {workspaces.map((ws) => (
                      <DropdownMenuItem
                        key={ws.publicId}
                        onClick={() => {
                          setCurrentWorkspace(ws);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-bold text-xs mr-2">
                          {ws.name.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="flex-1 truncate">{ws.name}</span>
                        {currentWorkspace?.publicId === ws.publicId && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ✓
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>{" "}
              workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              for the{" "}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="font-black text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1 focus:outline-none">
                    {selectedBoardId
                      ? boards.find((b) => b.publicId === selectedBoardId)?.title ?? "Select Board"
                      : "all"}
                    <ChevronDown className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Filter by Board</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setSelectedBoardId(undefined)}
                    className="cursor-pointer"
                  >
                    All Boards
                    {!selectedBoardId && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        ✓
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    {boards.map((board) => (
                      <DropdownMenuItem
                        key={board.publicId}
                        onClick={() => setSelectedBoardId(board.publicId)}
                        className="cursor-pointer"
                      >
                        <span className="flex-1 truncate">{board.title}</span>
                        {selectedBoardId === board.publicId && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ✓
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>{" "}
              boards, for the{" "}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="font-medium text-foreground hover:opacity-80 transition-opacity inline-flex items-center gap-0.5 focus:outline-none">
                    {range === "7d" ? "last 7 days" : range === "30d" ? "last 30 days" : "last 90 days"}
                    <ChevronDown className="size-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={() => setRange("7d")}>last 7 days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRange("30d")}>last 30 days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRange("90d")}>last 90 days</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
              <Button asChild size="sm" variant="secondary">
                <Link href="/statistic">Team</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/statistic/self">Self</Link>
              </Button>
            </div>
            <Select
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as "csv" | "json")}
              disabled={!selectedWorkspaceId || isLoading || isExporting}
            >
              <SelectTrigger className="h-9 w-[110px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={!selectedWorkspaceId || isLoading || isExporting}
            >
              <Download className="size-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>

        {isStatsError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load statistics at the moment. Please try again later.
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[130px] w-full rounded-xl" />
              ))
            : metricCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-lg bg-muted p-2 text-primary">
                      <card.icon className="size-4" />
                    </div>
                    <span className="rounded px-2 py-1 text-xs font-bold text-muted-foreground">
                      {formatTrend(card.trend)}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {card.title}
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-foreground">
                    {formatMetric(card.value)}
                  </h2>
                </article>
              ))}
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm lg:col-span-2">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-black">Recent Activity</h2>
              <Button
                asChild
                variant="link"
                className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
              >
                <Link href="/statistic/activities">View All Logs</Link>
              </Button>
            </div>
            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-2.5 w-1/3" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))
              ) : activities.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No recent activity available yet.
                </div>
              ) : (
                activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    members={members}
                    boards={boards}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">Priority Breakdown</h2>
                  <p className="text-xs text-muted-foreground">
                    Get a breakdown of work items by priority.
                  </p>
                </div>
                <Button
                  asChild
                  variant="link"
                  className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  <Link href="/statistic/activities">View all items</Link>
                </Button>
              </div>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="grid grid-cols-[140px_1fr] items-center gap-4 font-semibold">
                  <span>Type</span>
                  <span>Distribution</span>
                </div>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="grid grid-cols-[140px_1fr] items-center gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : priorities.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No priority data available.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {priorities.map((priority) => {
                      const valueLabel = formatPercent(priority.value);
                      return (
                        <div
                          key={priority.label}
                          className="grid grid-cols-[140px_1fr] items-center gap-4"
                        >
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <span
                              className="h-2.5 w-2.5 rounded-sm"
                              style={{ backgroundColor: priority.color }}
                            />
                            <span className="font-medium">{priority.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-full overflow-hidden rounded-md bg-muted">
                              <div
                                className="h-full rounded-md"
                                style={{
                                  width: valueLabel,
                                  backgroundColor: priority.color,
                                }}
                              />
                            </div>
                            <span className="w-12 text-right text-[10px] font-semibold text-muted-foreground">
                              {valueLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Team Workload</h2>
              <p className="text-sm text-muted-foreground">
                Real-time capacity tracking for active sprints
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-[86px] w-full rounded-lg" />
              ))
            ) : workloads.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No workload data available yet.
              </div>
            ) : (
              workloads.map((workload, index) => {
                const capacityValue = Number.isNaN(workload.capacity)
                  ? 0
                  : workload.capacity;
                const capacity = clampPercentage(capacityValue);
                return (
                  <div
                    key={`${workload.name}-${index}`}
                    className="rounded-lg border border-border/70 bg-muted/25 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary" />
                        <span className="text-sm font-semibold">
                          {workload.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {workload.state}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${capacity}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {formatPercent(capacityValue)} Capacity
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
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
  const actorName = React.useMemo(() => {
    if (activity.metadata?.actor?.username) return activity.metadata.actor.username;
    const member = members.find(
      (m) => m.userId === activity.actorUserId || m.publicId === activity.actorUserId,
    );
    return member?.name || activity.actorUserId;
  }, [activity, members]);

  const entityName = React.useMemo(() => {
    if (activity.metadata?.title) return activity.metadata.title;
    if (activity.metadata?.name) return activity.metadata.name;
    if (activity.metadata?.boardName) return activity.metadata.boardName;
    if (activity.metadata?.entity?.title) return activity.metadata.entity.title;
    if (activity.entityType === "board") {
      const board = boards.find(
        (b) => b.publicId === activity.entityId || b.id === activity.entityId,
      );
      return board?.title || activity.entityId;
    }
    return activity.entityId;
  }, [activity, boards]);

  const activityMessage = React.useMemo(
    () => getActivityMessage(activity, members),
    [activity, members],
  );

  const fullTimestamp = React.useMemo(() => {
    const date = new Date(activity.createdAt);
    if (Number.isNaN(date.getTime())) return activity.createdAt;
    return date.toLocaleString();
  }, [activity.createdAt]);

  return (
    <div className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/10 px-3 py-2">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold">
        {formatInitials(actorName)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-primary">{actorName}</span>
          <span className="text-muted-foreground">{activityMessage}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80">{entityName}</span>
          {activity.entityType === "card" && activity.metadata?.listName && (
            <span>in {activity.metadata.listName}</span>
          )}
          {activity.entityType === "card" && activity.metadata?.boardName && (
            <span>of {activity.metadata.boardName}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge variant="outline">{activity.actionType.split(".")[1]}</Badge>
        <span className="text-[10px] text-muted-foreground" title={fullTimestamp}>
          {formatActivityAge(activity.createdAt)}
        </span>
      </div>
    </div>
  );
}

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, value));
}
