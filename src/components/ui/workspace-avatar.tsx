// import { useWorkspaceContext } from "@/contexts/workspace.context";
import { Workspace } from "@/contexts/context.type";

type WorkspaceAvatarProps = {
  currentWorkspace: Workspace | null;
};

export default function WorkspaceAvatar({ currentWorkspace }: WorkspaceAvatarProps) {

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-bold text-xs">
        {currentWorkspace?.name
            ? currentWorkspace.name.substring(0, 1).toUpperCase()
            : "W"}
    </div>
  );
}
