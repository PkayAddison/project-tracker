import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/Shared";
import { buildReport, type PdfSection } from "@/lib/pdf";
import { fmtDate, isOverdue, projectProgress, useLookups, useStore } from "@/lib/store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & PDF Export | Project & Initiative Tracker" },
      { name: "description", content: "Export branded PDF reports: project summary, team progress, overdue tasks and update logs." },
      { property: "og:title", content: "Reports & PDF Export | Project & Initiative Tracker" },
      { property: "og:description", content: "One-click branded PDF reports with headers, footers and page numbers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { state } = useStore();
  const { memberName, projectName, committeeName } = useLookups();
  const [projectId, setProjectId] = useState(state.projects[0]?.id ?? "");
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const run = (title: string, period: string, sections: PdfSection[], file: string, action: "save" | "print") =>
    buildReport(state.settings, title, period, sections, file, action);

  const projectSummary = (action: "save" | "print") => {
    const p = state.projects.find((x) => x.id === projectId);
    if (!p) return;
    const tasks = state.tasks.filter((t) => t.projectId === p.id);
    run(
      `Project Progress Summary — ${p.name}`,
      `${fmtDate(p.startDate)} to ${fmtDate(p.targetDate)}`,
      [
        {
          heading: "Project overview",
          head: ["Field", "Detail"],
          body: [
            ["Objective", p.objective || "—"],
            ["Lead", memberName(p.leadId)],
            ["Committee", committeeName(p.committeeId)],
            ["Status", p.status],
            ["Priority", p.priority],
            ["Overall progress", `${projectProgress(tasks)}%`],
            ["Tasks", `${tasks.length} total • ${tasks.filter((t) => t.status === "Completed").length} completed • ${tasks.filter(isOverdue).length} overdue`],
          ],
        },
        {
          heading: "Tasks",
          head: ["Task", "Assignee", "Due", "Status", "%", "Next action"],
          body: tasks.map((t) => [t.title, memberName(t.assigneeId), fmtDate(t.dueDate), t.status, t.percentComplete, t.nextAction || "—"]),
        },
      ],
      `project-summary-${p.name.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      action,
    );
  };

  const teamReport = (action: "save" | "print") =>
    run(
      "Team Progress Report",
      `As at ${fmtDate(new Date().toISOString())}`,
      [
        {
          heading: "Workload by team member",
          head: ["Member", "Role", "Committee", "Assigned", "In progress", "Completed", "Overdue"],
          body: state.members.map((m) => {
            const mine = state.tasks.filter((t) => t.assigneeId === m.id);
            return [
              m.name,
              m.role,
              committeeName(m.committeeId),
              mine.length,
              mine.filter((t) => t.status === "In Progress").length,
              mine.filter((t) => t.status === "Completed").length,
              mine.filter(isOverdue).length,
            ];
          }),
        },
      ],
      "team-progress-report.pdf",
      action,
    );

  const overdueReport = (action: "save" | "print") =>
    run(
      "Overdue Tasks Report",
      `As at ${fmtDate(new Date().toISOString())}`,
      [
        {
          heading: "Tasks past their due date",
          head: ["Task", "Project", "Assignee", "Due", "%", "Challenges"],
          body: state.tasks
            .filter(isOverdue)
            .map((t) => [t.title, projectName(t.projectId), memberName(t.assigneeId), fmtDate(t.dueDate), t.percentComplete, t.challenges || "—"]),
        },
      ],
      "overdue-tasks-report.pdf",
      action,
    );

  const updateLog = (action: "save" | "print") =>
    run(
      "Progress Update Log",
      `${fmtDate(from)} to ${fmtDate(to)}`,
      [
        {
          heading: "Submitted updates",
          head: ["Date", "Task", "By", "Status", "%", "Progress made", "Challenges"],
          body: state.updates
            .filter((u) => u.createdAt.slice(0, 10) >= from && u.createdAt.slice(0, 10) <= to)
            .map((u) => {
              const task = state.tasks.find((t) => t.id === u.taskId);
              return [
                fmtDate(u.createdAt),
                task?.title ?? "—",
                memberName(u.authorId),
                u.status,
                u.percentComplete,
                u.progressMade,
                u.challenges || "—",
              ];
            }),
        },
      ],
      "progress-update-log.pdf",
      action,
    );

  const cards = [
    {
      title: "Project Progress Summary",
      hint: "One-page overview of a single project with its full task table.",
      extra: (
        <div>
          <Label>Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
            <SelectContent>
              {state.projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ),
      run: projectSummary,
    },
    { title: "Team Progress Report", hint: "Workload and delivery per team member.", run: teamReport },
    { title: "Overdue Tasks Report", hint: "Everything past its due date and under 100%.", run: overdueReport },
    {
      title: "Progress Update Log",
      hint: "All progress updates within a date range.",
      extra: (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      ),
      run: updateLog,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & PDF export"
        subtitle={`Branded reports for ${state.settings.name}, ready to download or print.`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <article key={c.title} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div>
              <h2 className="font-display text-base font-semibold">{c.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.hint}</p>
            </div>
            {c.extra}
            <div className="mt-auto flex gap-2">
              <Button className="flex-1" onClick={() => c.run("save")}>
                <Download className="size-4" /> Download PDF
              </Button>
              <Button variant="outline" onClick={() => c.run("print")}>
                <Printer className="size-4" /> Print
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
