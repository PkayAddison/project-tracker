import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Priority, ProjectStatus, TaskStatus } from "@/lib/types";

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "success" | "danger" }) {
  const toneClass =
    tone === "success" ? "bg-success" : tone === "danger" ? "bg-destructive" : "bg-primary";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full border border-border/70 bg-muted">
      <div
        className={cn("h-full rounded-full shadow-tech transition-all duration-500", toneClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

const statusTone: Record<string, string> = {
  Planning: "bg-secondary text-secondary-foreground",
  "Not Started": "bg-muted text-muted-foreground",
  "In Progress": "bg-primary/10 text-primary",
  "On Hold": "bg-warning/20 text-warning-foreground",
  Completed: "bg-success/15 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: ProjectStatus | TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        statusTone[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

const priorityTone: Record<Priority, string> = {
  Low: "border-border text-muted-foreground",
  Medium: "border-gold/60 bg-gold/15 text-gold-foreground",
  High: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium", priorityTone[priority])}>
      {priority}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
      Overdue
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon?: ReactNode;
  tone?: "default" | "success" | "danger" | "gold";
}) {
  const ring =
    tone === "success"
      ? "text-success bg-success/10"
      : tone === "danger"
        ? "text-destructive bg-destructive/10"
        : tone === "gold"
          ? "text-gold-foreground bg-gold/20"
          : "text-primary bg-primary/10";
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-tech">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
        </div>
        {icon ? <div className={cn("grid size-10 shrink-0 place-items-center rounded-lg", ring)}>{icon}</div> : null}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-bold text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center shadow-panel">
      <p className="font-display text-base font-semibold text-foreground">{title}</p>
      {hint ? <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
