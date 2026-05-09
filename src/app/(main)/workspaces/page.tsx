"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaces } from "@/hooks/use-workspaces";

export default function WorkspacesPage() {
  const router = useRouter();
  const { data: workspaces, isLoading } = useWorkspaces();

  return (
    <div className="m-auto h-full max-w-[1100px] p-8 px-5 md:px-28 md:py-12">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div>
            <div className="text-lg font-semibold tracking-tight">Workspaces</div>
            <div className="text-xs text-muted-foreground">Select a workspace to view boards</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-[120px] rounded-lg" />
            ))}
          </div>
        ) : !workspaces || workspaces.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
            No workspaces yet. Create one from the sidebar.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/workspaces/${ws.id}/boards`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/workspaces/${ws.id}/boards`);
                  }
                }}
                className="group relative flex h-[120px] w-full items-center justify-center rounded-lg border border-dashed border-light-400 shadow-sm cursor-pointer transition hover:bg-muted/40"
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-lg font-bold">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4 text-left">
                  <div className="text-base font-semibold tracking-tight">{ws.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ws.members?.length ?? 0} members
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
