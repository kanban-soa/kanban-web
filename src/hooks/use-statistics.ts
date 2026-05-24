import { useQuery } from "@tanstack/react-query";
import {
  getStatisticsSelfPerformance,
  getStatisticsSummary,
  getWorkspaceActivities,
} from "@/lib/api/statistics.api";
import type { StatisticsRange } from "@/lib/api/statistics.api";

export type UseWorkspaceActivitiesOptions = {
  page?: number;
  limit?: number;
  actionType?: string;
  entityType?: "card" | "board";
  actorUserId?: string;
  from?: string;
  to?: string;
};

export function useStatisticsSummary(
  workspaceId: string | undefined,
  range: StatisticsRange = "7d",
) {
  return useQuery({
    queryKey: ["statistics", workspaceId, range],
    queryFn: () => getStatisticsSummary(workspaceId as string, range),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceActivities(
  workspaceId: string | undefined,
  options: UseWorkspaceActivitiesOptions = {},
) {
  const { page = 1, limit = 10, ...rest } = options;
  return useQuery({
    queryKey: ["activities", workspaceId, page, limit, rest],
    queryFn: () =>
      getWorkspaceActivities(workspaceId as string, { page, limit, ...rest }),
    enabled: !!workspaceId,
  });
}

export function useStatisticsSelfPerformance(
  workspaceId: string | undefined,
  range: StatisticsRange = "7d",
) {
  return useQuery({
    queryKey: ["statistics-self", workspaceId, range],
    queryFn: () => getStatisticsSelfPerformance(workspaceId as string, range),
    enabled: !!workspaceId,
  });
}
