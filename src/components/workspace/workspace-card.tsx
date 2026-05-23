"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface WorkspaceCardProps {
  id: string | number;
  name: string;
  members?: number | string[];
  onClick?: (id: string | number) => void;
  onInvite?: (e: React.MouseEvent, ws: { id: string | number; name: string }) => void;
}

export function WorkspaceCard({ id, name, members = 0, onClick, onInvite }: WorkspaceCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(id);
        }
      }}
      className="group relative flex h-[120px] w-full items-center justify-center rounded-lg border border-dashed border-light-400 shadow-sm cursor-pointer transition hover:bg-muted/40"
    >
      <div className="flex ml-4 size-12 items-center justify-center rounded-lg bg-muted text-lg font-bold">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="ml-4 text-left flex-1 min-w-0">
        <div className="text-base font-semibold tracking-tight">{name}</div>
        <div className="text-xs text-muted-foreground">{typeof members === 'number' ? members : (members as any)?.length ?? 0} members</div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => onInvite?.(e, { id, name })}
        className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
        title="Invite member"
      >
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default WorkspaceCard;
