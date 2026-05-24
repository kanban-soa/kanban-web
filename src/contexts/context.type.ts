// import { Workspace } from "@/lib/api/types";

export interface Workspace {
  id: number;
  publicId: string;
  slug: string;
  plan: string;
  name: string;
  description: string | null;
  showEmailsToMembers: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  // Fields present in list/detail responses:
  boardIds?: string[];
  members?: number;
};

export interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  isLoadingWorkspaces: boolean;
}