import api from "./axios";
import { STATISTICS } from "./routes";

export type StatisticsRange = "7d" | "30d" | "90d";

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

type StatisticsSummaryResponse = {
  data: StatisticsSummary;
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
