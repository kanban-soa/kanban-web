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
  entityId?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
};

export function useStatisticsSummary(
  workspaceId: string | undefined,
  range: StatisticsRange = "7d",
  boardId?: string,
) {
  return useQuery({
    queryKey: ["statistics", workspaceId, range, boardId],
    queryFn: () => getStatisticsSummary(workspaceId as string, range, boardId),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceActivities(
  workspaceId: string | undefined,
  options: UseWorkspaceActivitiesOptions = {},
  boardId?: string,
) {
  const { page = 1, limit = 10, ...rest } = options;
  return useQuery({
    queryKey: ["activities", workspaceId, page, limit, rest, boardId],
    queryFn: () =>
      getWorkspaceActivities(workspaceId as string, { page, limit, ...rest }, boardId),
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
