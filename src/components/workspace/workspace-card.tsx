"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceCardProps {
  id: string | number;
  name: string;
  members?: number | string[];
  onClick?: (id: string | number) => void;
  onInvite?: (e: React.MouseEvent, ws: { id: string | number; name: string }) => void;
  onEdit?: (ws: { id: string | number; name: string }) => void;
  onDelete?: (ws: { id: string | number; name: string }) => void;
}

export function WorkspaceCard({ id, name, members = 0, onClick, onInvite, onEdit, onDelete }: WorkspaceCardProps) {
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
        <div className="truncate text-base font-semibold tracking-tight" title={name}>{name}</div>
        <div className="text-xs text-muted-foreground">{typeof members === 'number' ? members : (members as any)?.length ?? 0} members</div>
      </div>
      <div className="mr-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => onInvite?.(e, { id, name })}
          title="Invite member"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              title="Workspace actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              onSelect={() => onEdit?.({ id, name })}
              className="cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              Edit workspace
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete?.({ id, name })}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default WorkspaceCard;
