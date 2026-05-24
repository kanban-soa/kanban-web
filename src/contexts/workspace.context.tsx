"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Workspace, WorkspaceContextType } from "@/contexts/context.type";
import { useWorkspaces } from "@/hooks/use-workspaces";

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

function extractWorkspaceIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/workspaces\/([^/]+)/);
  const id = match?.[1];
  if (!id || id === "default") return null;
  return id;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: workspaces = [], isLoading: isLoadingWorkspaces } = useWorkspaces();

  const urlWorkspaceId = useMemo(
    () => extractWorkspaceIdFromPath(pathname),
    [pathname],
  );

  // Remember the most recently selected workspace so routes that don't carry a
  // workspaceId in the URL (e.g. /member, /statistic) still reflect the user's
  // last choice instead of snapping back to workspaces[0].
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (urlWorkspaceId) setLastSelectedId(urlWorkspaceId);
  }, [urlWorkspaceId]);

  const currentWorkspace = useMemo<Workspace | null>(() => {
    if (workspaces.length === 0) return null;
    const targetId = urlWorkspaceId ?? lastSelectedId;
    const match = targetId
      ? workspaces.find((ws) => ws.publicId === targetId)
      : undefined;
    return match ?? workspaces[0];
  }, [workspaces, urlWorkspaceId, lastSelectedId]);

  const setCurrentWorkspace = useCallback(
    (workspace: Workspace) => {
      setLastSelectedId(workspace.publicId);
      if (urlWorkspaceId && urlWorkspaceId !== workspace.publicId) {
        router.push(`/workspaces/${workspace.publicId}/boards`);
      }
    },
    [router, urlWorkspaceId],
  );

  return (
    <WorkspaceContext.Provider
      value={{ currentWorkspace, setCurrentWorkspace, workspaces, isLoadingWorkspaces }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider");
  }
  return context;
}