import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
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
import { EmptyState, OverdueBadge, PageHeader, PriorityBadge, ProgressBar, StatusBadge } from "@/components/Shared";
import { TaskDialog } from "@/components/TaskDialog";
import { UpdateDialog } from "@/components/UpdateDialog";
import { fmtDate, fmtDateTime, isOverdue, useLookups, useStore } from "@/lib/store";
import { TASK_STATUSES, type Task } from "@/lib/types";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks & Action Items | Project & Initiative Tracker" },
      { name: "description", content: "Assign action items, track percentage complete and flag overdue work automatically." },
      { property: "og:title", content: "Tasks & Action Items | Project & Initiative Tracker" },
      { property: "og:description", content: "Every action item with assignee, due date, progress and fast updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tasks,
});

function Tasks() {
  const { state, deleteTask } = useStore();
  const { memberName, projectName } = useLookups();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [updateTask, setUpdateTask] = useState<Task | null>(null);

  const isAdmin = state.role === "admin";

  const list = useMemo(() => {
    const base = isAdmin ? state.tasks : state.tasks.filter((t) => t.assigneeId === state.currentUserId);
    return base
      .filter(
        (t) =>
          (status === "all" ||
            (status === "overdue" ? isOverdue(t) : t.status === status)) &&
          (projectFilter === "all" || t.projectId === projectFilter) &&
          t.title.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  }, [state.tasks, isAdmin, state.currentUserId, status, projectFilter, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Tasks & action items" : "My tasks"}
        subtitle={isAdmin ? "Everything assigned across all projects." : "Tasks assigned to you — submit fast updates any time."}
        action={
          isAdmin ? (
            <Button onClick={() => { setEditing(null); setDialog(true); }}>
              <Plus className="size-4" /> New task
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search tasks…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="overdue">Overdue only</SelectItem>
            {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {state.projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No tasks to show" hint="Adjust your filters, or create a new action item." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-40">Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="max-w-56">
                    <p className="truncate font-medium">{t.title}</p>
                    {isOverdue(t) ? <OverdueBadge /> : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{projectName(t.projectId)}</TableCell>
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
                      <>
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(t); setDialog(true); }}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteTask(t.id)} aria-label="Delete task">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Progress history</h2>
        {state.updates.length === 0 ? (
          <EmptyState title="No progress updates yet" hint="Updates are saved permanently and shown in order." />
        ) : (
          <ol className="space-y-3 border-l-2 border-border pl-5">
            {state.updates.slice(0, 15).map((u) => {
              const task = state.tasks.find((t) => t.id === u.taskId);
              return (
                <li key={u.id} className="relative rounded-xl border border-border bg-card p-4">
                  <span className="absolute top-5 -left-[27px] size-3 rounded-full bg-gold ring-4 ring-background" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{task?.title ?? "Task"}</p>
                    <span className="text-xs text-muted-foreground">{fmtDateTime(u.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{u.progressMade}</p>
                  {u.challenges ? <p className="mt-1 text-sm text-destructive">Challenge: {u.challenges}</p> : null}
                  {u.supportRequired ? <p className="mt-1 text-sm">Support needed: {u.supportRequired}</p> : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {memberName(u.authorId)} • {u.status} • {u.percentComplete}% • next action: {u.nextAction || "—"}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <TaskDialog open={dialog} onOpenChange={setDialog} task={editing} />
      <UpdateDialog open={!!updateTask} onOpenChange={(v) => !v && setUpdateTask(null)} task={updateTask} />
    </div>
  );
}
