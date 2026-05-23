"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Workspace, WorkspaceContextType } from "@/contexts/context.type";
import { listWorkspaces } from "@/lib/api/workspace.api";

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Reset hasFetched if the user transitions from a public/auth page to a protected dashboard page
  useEffect(() => {
    const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
    const wasPublic = publicPaths.includes(prevPathname);
    const isNowProtected = !publicPaths.includes(pathname);

    if (wasPublic && isNowProtected) {
      setHasFetched(false);
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("kanban:token") : null;
    const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
    const isPublicPath = publicPaths.includes(pathname);

    // If on a public path and no token exists, don't attempt to fetch
    if (isPublicPath && !token) {
      return;
    }

    // Stop if we have already attempted to fetch (success or error), or if currently loading
    if (hasFetched || isLoadingWorkspaces) {
      return;
    }

    const fetchWorkspaces = async () => {
      setIsLoadingWorkspaces(true);
      try {
        const data = await listWorkspaces();
        setWorkspaces(data);
        if (data.length > 0) {
          setCurrentWorkspace((prev) => prev || data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch workspaces", error);
      } finally {
        setIsLoadingWorkspaces(false);
        setHasFetched(true); // Always set to true (success or error) to prevent retries
      }
    };

    fetchWorkspaces();
  }, [pathname, hasFetched, isLoadingWorkspaces]);

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