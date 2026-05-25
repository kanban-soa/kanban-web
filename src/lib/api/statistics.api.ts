import api from "./axios";
import { STATISTICS } from "./routes";

export type StatisticsRange = "7d" | "30d" | "90d";
export type StatisticsExportFormat = "csv" | "json";

export type StatisticsMetrics = {
  completed: number;
  updated: number;
  created: number;
  dueSoon: number;
  completedTrend: number;
  updatedTrend: number;
  createdTrend: number;
  dueSoonTrend: number;
};

export type StatisticsPriority = {
  label: string;
  value: number;
  color: string;
};

export type StatisticsWorkload = {
  name: string;
  capacity: number;
  state: string;
};

export type StatisticsSummary = {
  range: StatisticsRange;
  metrics: StatisticsMetrics;
  priorities: StatisticsPriority[];
  workloads: StatisticsWorkload[];
};

export type StatisticsSelfPerformanceTask = {
  id: string | number;
  title: string;
  dueDate: string;
};

export type StatisticsSelfPerformance = {
  range: StatisticsRange;
  completedTotal: number;
  overdueTotal: number;
  comparisonPercentage: number;
  completedPercentage: number;
  overdueTasks: StatisticsSelfPerformanceTask[];
};

export enum ActivityAction {
  CARD_CREATED = "card.created",
  CARD_UPDATED = "card.updated",
  CARD_DELETED = "card.deleted",
  CARD_ARCHIVED = "card.archived",
  BOARD_CREATED = "board.created",
  BOARD_UPDATED = "board.updated",
  BOARD_DELETED = "board.deleted",
}

export type Activity = {
  id: number;
  publicId: string;
  workspaceId: number;
  actorUserId: string;
  actionType: ActivityAction;
  entityType: "card" | "board";
  entityId: string;
  metadata: {
    title?: string;
    name?: string;
    boardName?: string;
    listName?: string;
    actor?: {
      username?: string;
    };
    entity?: {
      title?: string;
    };
    [key: string]: any;
  };
  createdAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PagedActivityResponse = {
  items: Activity[];
  pagination: Pagination;
};

type PagedActivityRequest = {
  page?: number;
  limit?: number;
  actionType?: string;
  entityType?: "card" | "board";
  actorUserId?: string;
  from?: string;
  to?: string;
};

type StatisticsSummaryResponse = {
  data: StatisticsSummary;
};

type PagedActivityApiResponse = {
  data: PagedActivityResponse;
};

type StatisticsSelfPerformanceResponse = {
  data: StatisticsSelfPerformance;
};

const STATISTICS_BASE_URL =
  process.env.NEXT_PUBLIC_STATISTIC_SERVICE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";

const buildStatisticsUrl = (path: string) => new URL(path, STATISTICS_BASE_URL).toString();

export async function getStatisticsSummary(
  workspaceId: string,
  range: StatisticsRange = "7d",
): Promise<StatisticsSummary> {
  const { data } = await api.get<StatisticsSummaryResponse>(
    buildStatisticsUrl(STATISTICS.SUMMARY(workspaceId)),
    {
      params: { range },
    },
  );
  console.log("Fetched statistics summary:", JSON
      .stringify(data));
  return data.data;
}

export async function getWorkspaceActivities(
  workspaceId: string,
  params: PagedActivityRequest = {},
): Promise<PagedActivityResponse> {
  const { data } = await api.get<PagedActivityApiResponse>(
    buildStatisticsUrl(STATISTICS.ACTIVITIES(workspaceId)),
    { params },
  );
  return data.data;
}

export async function exportStatistics(
  workspaceId: string,
  range: StatisticsRange = "7d",
  format: StatisticsExportFormat = "csv",
): Promise<{ blob: Blob; contentType: string | undefined }> {
  const response = await api.get<Blob>(
    buildStatisticsUrl(STATISTICS.EXPORT(workspaceId)),
    {
      params: { range, format },
      responseType: "blob",
    },
  );

  return {
    blob: response.data,
    contentType: response.headers?.["content-type"],
  };
}

export async function getStatisticsSelfPerformance(
  workspaceId: string,
  range: StatisticsRange = "7d",
): Promise<StatisticsSelfPerformance> {
  const { data } = await api.get<StatisticsSelfPerformanceResponse>(
    buildStatisticsUrl(STATISTICS.SELF_PERFORMANCE(workspaceId)),
    {
      params: { range },
    },
  );

  return data.data;
}
