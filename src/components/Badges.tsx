import React from "react";
import { Badge } from "@/components/ui/badge";
import { Status } from "@/types";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
    planned: "outline",
    in_progress: "default",
    blocked: "destructive",
    done: "secondary",
    verified: "secondary",
  };

  const labels: Record<Status, string> = {
    planned: "Planned",
    in_progress: "In Progress",
    blocked: "Blocked",
    done: "Done",
    verified: "Verified",
  };

  return (
    <Badge variant={variants[status]} className={className}>
      {labels[status]}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high";
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const variants: Record<"low" | "medium" | "high", "default" | "secondary" | "destructive"> = {
    low: "secondary",
    medium: "default",
    high: "destructive",
  };

  const labels: Record<"low" | "medium" | "high", string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return (
    <Badge variant={variants[priority]} className={className}>
      {labels[priority]}
    </Badge>
  );
}

interface HealthBadgeProps {
  health: "green" | "yellow" | "red";
  className?: string;
}

export function HealthBadge({ health, className }: HealthBadgeProps) {
  const variants: Record<"green" | "yellow" | "red", "default" | "secondary" | "destructive"> = {
    green: "secondary",
    yellow: "default",
    red: "destructive",
  };

  const labels: Record<"green" | "yellow" | "red", string> = {
    green: "Healthy",
    yellow: "Degraded",
    red: "Down",
  };

  return (
    <Badge variant={variants[health]} className={className}>
      {labels[health]}
    </Badge>
  );
}
