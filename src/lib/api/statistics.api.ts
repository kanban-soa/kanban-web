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

export type StatisticsActivity = {
  user: string;
  action: string;
  target: string;
  time: string;
  team: string;
  status: string;
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
  activities: StatisticsActivity[];
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

type StatisticsSummaryResponse = {
  data: StatisticsSummary;
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
