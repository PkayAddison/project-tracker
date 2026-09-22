import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  ListChecks,
  Loader2,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, ProgressBar, StatCard, StatusBadge } from "@/components/Shared";
import { UpdateDialog } from "@/components/UpdateDialog";
import { fmtDate, fmtDateTime, isOverdue, projectProgress, useLookups, useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Project & Initiative Tracker" },
      {
        name: "description",
        content:
          "Track projects, tasks, deadlines and team progress in one clear dashboard for schools, teams and organisations.",
      },
      { property: "og:title", content: "Dashboard | Project & Initiative Tracker" },
      {
        property: "og:description",
        content: "Plan, assign, monitor and report on projects with live progress and overdue alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state } = useStore();
  const { memberName, projectName } = useLookups();
  const [updateTask, setUpdateTask] = useState<Task | null>(null);

  const isMember = state.role === "member";
  const tasks = useMemo(
    () => (isMember ? state.tasks.filter((t) => t.assigneeId === state.currentUserId) : state.tasks),
    [state.tasks, isMember, state.currentUserId],
  );
  const projects = state.projects;

  const overdue = tasks.filter(isOverdue);
  const upcoming = tasks
    .filter((t) => t.dueDate && !isOverdue(t) && t.status !== "Completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);
  const recent = state.updates.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isMember ? `My work, ${memberName(state.currentUserId)}` : "Dashboard"}
        subtitle={
          isMember
            ? "Your assigned tasks, deadlines and quick progress updates."
            : "Everything happening across projects, tasks and teams right now."
        }
        action={
          <Button asChild>
            <Link to="/tasks">
              <Plus className="size-4" /> Go to tasks
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={projects.length} icon={<FolderKanban className="size-5" />} />
        <StatCard
          label="Active projects"
          value={projects.filter((p) => p.status === "In Progress" || p.status === "Planning").length}
          icon={<TrendingUp className="size-5" />}
          tone="gold"
        />
        <StatCard
          label="Completed projects"
          value={projects.filter((p) => p.status === "Completed").length}
          icon={<CheckCircle2 className="size-5" />}
          tone="success"
        />
        <StatCard label="Total tasks" value={tasks.length} icon={<ListChecks className="size-5" />} />
        <StatCard
          label="Completed tasks"
          value={tasks.filter((t) => t.status === "Completed").length}
          icon={<CheckCircle2 className="size-5" />}
          tone="success"
        />
        <StatCard
          label="In progress"
          value={tasks.filter((t) => t.status === "In Progress").length}
          icon={<Loader2 className="size-5" />}
        />
        <StatCard
          label="Overdue tasks"
          value={overdue.length}
          icon={<AlertTriangle className="size-5" />}
          tone="danger"
        />
        <StatCard
          label="Upcoming deadlines"
          value={upcoming.length}
          icon={<CalendarClock className="size-5" />}
          tone="gold"
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Project progress</h2>
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" hint="Create your first project to start tracking progress." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => {
              const pTasks = state.tasks.filter((t) => t.projectId === p.id);
              const pct = projectProgress(pTasks);
              return (
                <Link
                  key={p.id}
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="group rounded-lg border border-border bg-card p-4 shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-tech"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate font-display font-semibold">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{pTasks.length} tasks</span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Target: {fmtDate(p.targetDate)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-destructive">Overdue tasks</h2>
          {overdue.length === 0 ? (
            <EmptyState title="Nothing overdue" hint="Every task is on schedule — nice work." />
          ) : (
            <ul className="space-y-2">
              {overdue.map((t) => (
                <li
                  key={t.id}
                   className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 shadow-panel"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {projectName(t.projectId)} • {memberName(t.assigneeId)} • due {fmtDate(t.dueDate)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setUpdateTask(t)}>
                    Update
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Upcoming deadlines</h2>
          {upcoming.length === 0 ? (
            <EmptyState title="No upcoming deadlines" hint="New task deadlines will appear here." />
          ) : (
            <ul className="space-y-2">
              {upcoming.map((t) => (
                 <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-panel">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {projectName(t.projectId)} • {memberName(t.assigneeId)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">{fmtDate(t.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Recent progress updates</h2>
        {recent.length === 0 ? (
          <EmptyState title="No updates yet" hint="Submit a fast progress update from any task." />
        ) : (
          <ol className="space-y-3 border-l-2 border-border pl-5">
            {recent.map((u) => {
              const task = state.tasks.find((t) => t.id === u.taskId);
              return (
                 <li key={u.id} className="relative rounded-lg border border-border bg-card p-4 shadow-panel">
                  <span className="absolute top-5 -left-[27px] size-3 rounded-full bg-gold ring-4 ring-background" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{task?.title ?? "Task"}</p>
                    <span className="text-xs text-muted-foreground">{fmtDateTime(u.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{u.progressMade}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {memberName(u.authorId)} • {u.status} • {u.percentComplete}%
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <UpdateDialog open={!!updateTask} onOpenChange={(v) => !v && setUpdateTask(null)} task={updateTask} />
    </div>
  );
}
