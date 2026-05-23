"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Workspace, WorkspaceContextType } from "@/contexts/context.type";
import { listWorkspaces } from "@/lib/api/workspace.api";

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoadingWorkspaces(true);
      try {
        const data = await listWorkspaces();
        setWorkspaces(data);
        // Auto-set the most recently created workspace (first in list) as current
        if (data.length > 0 && !currentWorkspace) {
          setCurrentWorkspace(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch workspaces", error);
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };

    fetchWorkspaces();
  }, []);

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