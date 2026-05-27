"use client";

import React from "react";
import { Lock, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkspaceCardProps {
  avatar?: string;
  initials: string;
  title: string;
  description: string;
  onSwitchWorkspace?: () => void;
}

export function WorkspaceCard({
  avatar,
  initials = "DC",
  title = "Design Collective",
  description = "Collaborate on design projects and brand assets",
}: WorkspaceCardProps) {
  return (
    <div className="rounded-xl bg-card border border-transparent shadow-sm p-6 space-y-6">
      {/* Header with Lock Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Workspace (Read-Only)
          </span>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-lg font-bold text-lg text-white",
            "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"
          )}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Workspace
          </p>
          <h3 className="text-lg font-semibold text-foreground truncate">
            {title}
          </h3>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Info Section - Display Only */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Title
          </label>
          <div className="w-full px-3 py-2 rounded-lg bg-muted border border-transparent shadow-sm text-foreground text-sm font-medium">
            {title}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Description
          </label>
          <div className="w-full px-3 py-2 rounded-lg bg-muted border border-transparent shadow-sm text-foreground text-sm">
            {description}
          </div>
        </div>
      </div>

      {/* Locked Message */}
      <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-transparent shadow-sm p-3">
        <p className="text-xs text-amber-900 dark:text-amber-200">
          This workspace information is managed by administrators. Contact your workspace owner to make changes.
        </p>
      </div>

      {/* Switch Workspace Button */}
      {/* <Button
        onClick={onSwitchWorkspace}
        variant="outline"
        className="w-full bg-muted-700 border-muted-700 text-white hover:bg-muted-600 gap-2"
      >
        <ArrowRightLeft className="h-4 w-4" />
        Switch Workspace
      </Button> */}
    </div>
  );
}
