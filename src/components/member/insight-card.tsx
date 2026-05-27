"use client";

import React from "react";
import { Zap } from "lucide-react";

interface InsightCardProps {
  teamVelocity?: number;
  focusScore?: number;
  description?: string;
}

export function InsightCard({
  teamVelocity = 12,
  focusScore = 92,
  description = "Your team is performing exceptionally well this sprint. Keep up the momentum!",
}: InsightCardProps) {
  return (
    <div className="rounded-xl bg-card border border-transparent shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-sm text-foreground">Curation Insights</h3>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Team Velocity
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              +{teamVelocity}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              ↑ vs last sprint
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Focus Score
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{focusScore}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs italic text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
