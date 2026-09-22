import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  OverdueBadge,
  PageHeader,
  PriorityBadge,
  ProgressBar,
  StatusBadge,
} from "@/components/Shared";
import { TaskDialog } from "@/components/TaskDialog";
import { UpdateDialog } from "@/components/UpdateDialog";
import { fmtDate, fmtDateTime, isOverdue, projectProgress, useLookups, useStore } from "@/lib/store";
import { TASK_STATUSES, type Task } from "@/lib/types";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project details | Project & Initiative Tracker" },
      { name: "description", content: "Project meta, task table, progress bars and a full audit timeline." },
      { property: "og:title", content: "Project details | Project & Initiative Tracker" },
      { property: "og:description", content: "Meta, tasks, progress and audit history for a single project." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectDetails,
});

function ProjectDetails() {
  const { projectId } = Route.useParams();
  const { state } = useStore();
  const { memberName, committeeName } = useLookups();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due");
  const [taskDialog, setTaskDialog] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [updateTask, setUpdateTask] = useState<Task | null>(null);

  const project = state.projects.find((p) => p.id === projectId);
  const isAdmin = state.role === "admin";

  const tasks = useMemo(() => state.tasks.filter((t) => t.projectId === projectId), [state.tasks, projectId]);

  const visible = useMemo(() => {
    const filtered = tasks.filter(
      (t) =>
        (status === "all" || t.status === status) && t.title.toLowerCase().includes(query.toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "due") return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      if (sort === "progress") return b.percentComplete - a.percentComplete;
      if (sort === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 } as const;
        return order[a.priority] - order[b.priority];
      }
      return a.title.localeCompare(b.title);
    });
  }, [tasks, query, status, sort]);

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        hint="It may have been deleted."
        action={<Button asChild><Link to="/projects">Back to projects</Link></Button>}
      />
    );
  }

  const pct = projectProgress(tasks);
  const audit = state.audit.filter((a) => a.projectId === projectId);

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All projects
      </Link>

      <PageHeader
        title={project.name}
        subtitle={project.description}
        action={
          isAdmin ? (
            <Button onClick={() => { setEditing(null); setTaskDialog(true); }}>
              <Plus className="size-4" /> New task
            </Button>
          ) : null
        }
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase">Objective</h2>
          <p className="mt-2 text-sm">{project.objective || "No objective recorded."}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-muted-foreground">Project lead</dt><dd>{memberName(project.leadId)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Committee</dt><dd>{committeeName(project.committeeId)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Start date</dt><dd>{fmtDate(project.startDate)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Target date</dt><dd>{fmtDate(project.targetDate)}</dd></div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Team members</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {project.memberIds.length === 0 ? "—" : project.memberIds.map((id) => (
                  <span key={id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{memberName(id)}</span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm"><span>Overall progress</span><span className="font-semibold">{pct}%</span></div>
            <ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} />
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-muted-foreground">Tasks</dt><dd className="font-semibold">{tasks.length}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Completed</dt><dd className="font-semibold">{tasks.filter((t) => t.status === "Completed").length}</dd></div>
            <div><dt className="text-xs text-muted-foreground">In progress</dt><dd className="font-semibold">{tasks.filter((t) => t.status === "In Progress").length}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Overdue</dt><dd className="font-semibold text-destructive">{tasks.filter(isOverdue).length}</dd></div>
          </dl>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search tasks…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="due">Sort: due date</SelectItem>
              <SelectItem value="priority">Sort: priority</SelectItem>
              <SelectItem value="progress">Sort: progress</SelectItem>
              <SelectItem value="title">Sort: title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {visible.length === 0 ? (
          <EmptyState title="No tasks here yet" hint="Add action items to start tracking delivery." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40">Progress</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="max-w-56">
                      <p className="truncate font-medium">{t.title}</p>
                      {isOverdue(t) ? <OverdueBadge /> : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{memberName(t.assigneeId)}</TableCell>
                    <TableCell className="whitespace-nowrap">{fmtDate(t.dueDate)}</TableCell>
                    <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={t.percentComplete} tone={isOverdue(t) ? "danger" : t.percentComplete === 100 ? "success" : "primary"} />
                        <span className="w-9 shrink-0 text-xs">{t.percentComplete}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => setUpdateTask(t)}>Update</Button>
                      {isAdmin ? (
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(t); setTaskDialog(true); }}>Edit</Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Audit timeline</h2>
        {audit.length === 0 ? (
          <EmptyState title="No activity recorded" hint="Changes and progress updates will appear here." />
        ) : (
          <ol className="space-y-3 border-l-2 border-border pl-5">
            {audit.map((a) => (
              <li key={a.id} className="relative rounded-lg border border-border bg-card p-3">
                <span className="absolute top-4 -left-[27px] size-3 rounded-full bg-primary ring-4 ring-background" />
                <p className="text-sm">{a.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{fmtDateTime(a.createdAt)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <TaskDialog open={taskDialog} onOpenChange={setTaskDialog} task={editing} defaultProjectId={projectId} />
      <UpdateDialog open={!!updateTask} onOpenChange={(v) => !v && setUpdateTask(null)} task={updateTask} />
    </div>
  );
}
