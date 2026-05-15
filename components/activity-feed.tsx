import { AlertCircle, CheckCircle2, Circle, Loader2, RefreshCw, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type ActivityStatus =
  | "idle"
  | "thinking"
  | "processing"
  | "reviewing"
  | "approved"
  | "rejected"
  | "error";

export interface ActivityItem {
  id: string;
  label: string;
  description?: string;
  status: ActivityStatus;
  attempt?: number;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => {
        const icon = getStatusIcon(item.status);
        return (
          <div
            key={`${item.id}-${item.attempt ?? 0}`}
            className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/60 p-3"
          >
            <span className="mt-0.5 text-muted-foreground">{icon}</span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {item.label}
                {item.attempt ? <span className="ml-1 text-xs text-muted-foreground">(Attempt {item.attempt})</span> : null}
              </p>
              {item.description ? (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getStatusIcon(status: ActivityStatus) {
  const classes = "h-4 w-4";
  switch (status) {
    case "thinking":
      return <Search className={cn(classes, "text-primary animate-pulse")} aria-hidden />;
    case "processing":
      return <Loader2 className={cn(classes, "animate-spin text-primary")} aria-hidden />;
    case "reviewing":
      return <RefreshCw className={cn(classes, "animate-spin text-primary/80")} aria-hidden />;
    case "approved":
      return <CheckCircle2 className={cn(classes, "text-emerald-400")} aria-hidden />;
    case "rejected":
      return <AlertCircle className={cn(classes, "text-amber-400")} aria-hidden />;
    case "error":
      return <AlertCircle className={cn(classes, "text-destructive")} aria-hidden />;
    default:
      return <Circle className={cn(classes, "text-muted-foreground/60")} aria-hidden />;
  }
}
