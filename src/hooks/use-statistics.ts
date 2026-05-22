import { useQuery } from "@tanstack/react-query";
import { getStatisticsSummary } from "@/lib/api/statistics.api";
import type { StatisticsRange } from "@/lib/api/statistics.api";

export function useStatisticsSummary(workspaceId: string | undefined, range: StatisticsRange = "7d") {
  return useQuery({
    queryKey: ["statistics", workspaceId, range],
    queryFn: () => getStatisticsSummary(workspaceId as string, range),
    enabled: !!workspaceId,
  });
}
