"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock3, Download, PlusCircle } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useStatisticsSummary } from "@/hooks/use-statistics";
import {
  exportStatistics,
  type StatisticsPriority,
  type StatisticsRange,
} from "@/lib/api/statistics.api";

const range: StatisticsRange = "30d";
const emptyPriorities: StatisticsPriority[] = [];

function formatInitials(value: string) {
  if (!value) return "NA";
  const parts = value.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return value.slice(0, 2).toUpperCase();
}

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, value));
}

function buildPrioritySegments(priorities: StatisticsPriority[]) {
  const total = priorities.reduce((acc, item) => acc + item.value, 0);
  if (total <= 0) return [];
  const normalized = priorities.map((item) => ({
    ...item,
    value: (item.value / total) * 100,
  }));
  let offset = 0;
  return normalized.map((item) => {
    const segment = {
      ...item,
      dashArray: `${item.value} ${100 - item.value}`,
      dashOffset: -offset,
    };
    offset += item.value;
    return segment;
  });
}
export default function StatisticPage() {
  const { data: workspaces, isLoading: isWorkspaceLoading } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id;
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<"csv" | "json">("csv");
  //TODO
  const {
    data: summary,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useStatisticsSummary(workspaceId, range);

  console.log(`[54]Summary: ${JSON.stringify(summary)}`);

  const isLoading = isWorkspaceLoading || isStatsLoading;
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat(), []);
  const percentFormatter = React.useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }),
    [],
  );

  const metrics = summary?.metrics;
  const activities = summary?.activities ?? [];
  const priorities = summary?.priorities ?? emptyPriorities;
  const workloads = summary?.workloads ?? [];
  const prioritySegments = React.useMemo(
    () => buildPrioritySegments(priorities),
    [priorities],
  );

  if (!isWorkspaceLoading && (!workspaces || workspaces.length === 0)) {
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
      title: "Completed",
      value: metrics?.completed,
      trend: metrics?.completedTrend,
      icon: CheckCircle2,
    },
    {
      title: "Updated",
      value: metrics?.updated,
      trend: metrics?.updatedTrend,
      icon: Clock3,
    },
    {
      title: "Created",
      value: metrics?.created,
      trend: metrics?.createdTrend,
      icon: PlusCircle,
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
    if (!workspaceId || isExporting) return;
    setIsExporting(true);
    try {
      const { blob, contentType } = await exportStatistics(workspaceId, range, exportFormat);
      const fileName = `statistics-${workspaceId}-${range}.${exportFormat}`;
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
            <h1 className="text-2xl font-black">Statistics</h1>
            <p className="text-sm text-muted-foreground">Overview for the last 30 days</p>
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
              disabled={!workspaceId || isLoading || isExporting}
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
              disabled={!workspaceId || isLoading || isExporting}
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
              <button className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                View All Logs
              </button>
            </div>
            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
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
                activities.map((activity, index) => (
                  <div
                    key={`${activity.user}-${activity.time}-${index}`}
                    className="flex items-center gap-4"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {formatInitials(activity.user)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-primary">
                          {activity.user}
                        </span>{" "}
                        {activity.action}{" "}
                        <span className="italic">{activity.target}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {activity.time} in{" "}
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-foreground">
                          {activity.team}
                        </span>
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-foreground">
                      {activity.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-black">Priority Breakdown</h2>
              <div className="mx-auto flex w-48 flex-col items-center">
                {isLoading ? (
                  <>
                    <Skeleton className="size-48 rounded-full" />
                    <div className="mt-8 grid w-full gap-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-5 w-full" />
                      ))}
                    </div>
                  </>
                ) : priorities.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No priority data available yet.
                  </div>
                ) : (
                  <>
                    <div className="relative size-48">
                      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          fill="transparent"
                          r="15.915"
                          stroke="var(--muted)"
                          strokeWidth="4"
                        />
                        {prioritySegments.map((priority) => (
                          <circle
                            key={priority.label}
                            cx="18"
                            cy="18"
                            fill="transparent"
                            r="15.915"
                            stroke={priority.color}
                            strokeDasharray={priority.dashArray}
                            strokeDashoffset={priority.dashOffset}
                            strokeWidth="4"
                          />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black">100%</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">
                          Total cards
                        </span>
                      </div>
                    </div>
                    <div className="mt-8 grid w-full gap-3">
                      {priorities.map((priority) => (
                        <LegendItem
                          key={priority.label}
                          color={priority.color}
                          label={priority.label}
                          value={formatPercent(priority.value)}
                        />
                      ))}
                    </div>
                  </>
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

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <div className="size-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-bold text-muted-foreground">{label}</span>
      </div>
      <span className="font-black">{value}</span>
    </div>
  );
}
