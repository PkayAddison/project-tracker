import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader, PriorityBadge, ProgressBar, StatusBadge } from "@/components/Shared";
import { ProjectDialog } from "@/components/ProjectDialog";
import { fmtDate, projectProgress, useLookups, useStore } from "@/lib/store";
import { PROJECT_STATUSES, type Project } from "@/lib/types";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects | Project & Initiative Tracker" },
      { name: "description", content: "Browse, create and manage every project with status, priority and live progress." },
      { property: "og:title", content: "Projects | Project & Initiative Tracker" },
      { property: "og:description", content: "Every initiative with lead, committee, dates, priority and progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Projects,
});

function Projects() {
  const { state } = useStore();
  const { memberName, committeeName } = useLookups();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const isAdmin = state.role === "admin";

  const list = useMemo(
    () =>
      state.projects.filter(
        (p) =>
          (status === "all" || p.status === status) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase())),
      ),
    [state.projects, query, status],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="All initiatives across your committees and departments."
        action={
          isAdmin ? (
            <Button
              onClick={() => {
                setEditing(null);
                setDialog(true);
              }}
            >
              <Plus className="size-4" /> New project
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No projects match"
          hint="Try a different search or status filter, or create a new project."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const tasks = state.tasks.filter((t) => t.projectId === p.id);
            const pct = projectProgress(tasks);
            return (
              <article key={p.id} className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: p.id }}
                    className="min-w-0 truncate font-display font-semibold hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <PriorityBadge priority={p.priority} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between gap-2"><dt>Lead</dt><dd className="truncate text-foreground">{memberName(p.leadId)}</dd></div>
                  <div className="flex justify-between gap-2"><dt>Committee</dt><dd className="truncate text-foreground">{committeeName(p.committeeId)}</dd></div>
                  <div className="flex justify-between gap-2"><dt>Target</dt><dd className="text-foreground">{fmtDate(p.targetDate)}</dd></div>
                </dl>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <StatusBadge status={p.status} />
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link to="/projects/$projectId" params={{ projectId: p.id }}>Open</Link>
                  </Button>
                  {isAdmin ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(p);
                        setDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ProjectDialog open={dialog} onOpenChange={setDialog} project={editing} />
    </div>
  );
}
