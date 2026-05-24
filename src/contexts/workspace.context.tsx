"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Workspace, WorkspaceContextType } from "@/contexts/context.type";
import { useWorkspaces } from "@/hooks/use-workspaces";

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const { data: workspacesData, isLoading: isWorkspacesLoading } = useWorkspaces();

  // Reset currentWorkspace if the user transitions from a public/auth page to a protected dashboard page
  useEffect(() => {
    const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
    const wasPublic = publicPaths.includes(prevPathname);
    const isNowProtected = !publicPaths.includes(pathname);

    if (wasPublic && isNowProtected) {
      setCurrentWorkspace(null);
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname]);

  // Sync workspaces data from React Query
  useEffect(() => {
    const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
    const isPublicPath = publicPaths.includes(pathname);

    // Don't set workspaces on public paths
    if (isPublicPath) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      return;
    }

    // Update workspaces when React Query data is available
    if (workspacesData && workspacesData.length > 0) {
      setWorkspaces(workspacesData);
      
      // Check if currentWorkspace still exists in the new workspacesData
      if (currentWorkspace) {
        const stillExists = workspacesData.some((ws) => ws.id === currentWorkspace.id);
        if (!stillExists) {
          // Current workspace was removed, switch to the first available workspace
          setCurrentWorkspace(workspacesData[0]);
        }
      } else {
        // No current workspace set, pick the first one
        setCurrentWorkspace(workspacesData[0]);
      }
      // setCurrentWorkspace(workspacesData[0]);
    } else {
      // No workspaces available
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }
  }, [workspacesData, pathname, currentWorkspace]);

  return (
    <WorkspaceContext.Provider
      value={{ currentWorkspace, setCurrentWorkspace, workspaces, setWorkspaces, isLoadingWorkspaces: isWorkspacesLoading }}
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