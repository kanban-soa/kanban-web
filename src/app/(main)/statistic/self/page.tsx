"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useStatisticsSelfPerformance } from "@/hooks/use-statistics";
import type { StatisticsRange } from "@/lib/api/statistics.api";

const ranges: StatisticsRange[] = ["7d", "30d", "90d"];

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, value));
}

function formatRangeLabel(value: StatisticsRange) {
  return value === "7d" ? "7 days" : value === "30d" ? "30 days" : "90 days";
}

export default function SelfPerformancePage() {
  const { data: workspaces, isLoading: isWorkspaceLoading } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id;
  const [range, setRange] = React.useState<StatisticsRange>("7d");
  const {
    data: performance,
    isLoading: isPerformanceLoading,
    isError: isPerformanceError,
  } = useStatisticsSelfPerformance(workspaceId, range);

  const isLoading = isWorkspaceLoading || isPerformanceLoading;
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat(), []);
  const percentFormatter = React.useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }),
    [],
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

  const completedTotal = performance?.completedTotal ?? 0;
  const overdueTotal = performance?.overdueTotal ?? 0;
  const comparisonPercentage = performance?.comparisonPercentage ?? 0;
  const completedPercentage = clampPercentage(performance?.completedPercentage ?? 0);
  const overdueTasks = performance?.overdueTasks ?? [];

  const formatMetric = (value: number | undefined) =>
    value === undefined || Number.isNaN(value) ? "—" : numberFormatter.format(value);
  const formatPercent = (value: number | undefined) =>
    value === undefined || Number.isNaN(value) ? "—" : `${percentFormatter.format(value)}%`;
  const formatComparison = (value: number | undefined) => {
    if (value === undefined || Number.isNaN(value)) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${percentFormatter.format(value)}%`;
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Self Performance</h1>
            <p className="text-sm text-muted-foreground">
              Overview for the last {formatRangeLabel(range)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
              <Button asChild size="sm" variant="ghost">
                <Link href="/statistic">Team</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/statistic/self">Self</Link>
              </Button>
            </div>
            <Select value={range} onValueChange={(value) => setRange(value as StatisticsRange)}>
              <SelectTrigger className="h-9 w-[110px]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                {ranges.map((rangeValue) => (
                  <SelectItem key={rangeValue} value={rangeValue}>
                    {rangeValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isPerformanceError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load self performance at the moment. Please try again later.
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[130px] w-full rounded-xl" />
            ))
          ) : (
            <>
              <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                    <CheckCircle2 className="size-4" />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Completed Tasks
                </p>
                <h2 className="mt-1 text-3xl font-black text-foreground">
                  {formatMetric(completedTotal)}
                </h2>
              </article>
              <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                    <AlertTriangle className="size-4" />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Overdue Tasks
                </p>
                <h2 className="mt-1 text-3xl font-black text-foreground">
                  {formatMetric(overdueTotal)}
                </h2>
              </article>
              <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <TrendingUp className="size-4" />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Vs Team Average
                </p>
                <h2 className="mt-1 text-3xl font-black text-foreground">
                  {formatComparison(comparisonPercentage)}
                </h2>
              </article>
            </>
          )}
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-black">Completion Rate</h2>
            {isLoading ? (
              <div className="flex flex-col items-center gap-6">
                <Skeleton className="size-48 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
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
                    <circle
                      cx="18"
                      cy="18"
                      fill="transparent"
                      r="15.915"
                      stroke="var(--primary)"
                      strokeDasharray={`${completedPercentage} ${100 - completedPercentage}`}
                      strokeDashoffset="0"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">
                      {formatPercent(completedPercentage)}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      Completed
                    </span>
                  </div>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  Completed vs total tasks in the selected range.
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-8 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Overdue Alerts</h2>
                <p className="text-sm text-muted-foreground">
                  Tasks that missed their deadlines
                </p>
              </div>
              <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                {formatMetric(overdueTotal)} Overdue
              </span>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton key={index} className="h-[70px] w-full rounded-lg" />
                ))}
              </div>
            ) : overdueTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                No overdue tasks in this range.
              </div>
            ) : (
              <div className="space-y-4">
                {overdueTasks.map((task) => (
                  <div
                    key={`${task.id}-${task.dueDate}`}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{task.title}</p>
                      <p className="mt-1 text-xs text-destructive">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-destructive/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-destructive">
                      Overdue
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
