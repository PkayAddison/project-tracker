import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/Shared";
import { cn } from "@/lib/utils";
import { isOverdue, useLookups, useStore } from "@/lib/store";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar & Deadlines | Project & Initiative Tracker" },
      { name: "description", content: "Month view of task deadlines, project targets and review dates with status colours." },
      { property: "og:title", content: "Calendar & Deadlines | Project & Initiative Tracker" },
      { property: "og:description", content: "See every deadline, target and review date in one month view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarView,
});

type Kind = "completed" | "overdue" | "upcoming";

interface Event {
  date: string;
  label: string;
  kind: Kind;
  type: string;
}

const key = (d: Date) => d.toISOString().slice(0, 10);

function CalendarView() {
  const { state } = useStore();
  const { projectName } = useLookups();
  const [cursor, setCursor] = useState(() => new Date());

  const events = useMemo(() => {
    const list: Event[] = [];
    state.tasks.forEach((t) => {
      if (t.dueDate)
        list.push({
          date: t.dueDate,
          label: `${t.title} (${projectName(t.projectId)})`,
          kind: t.status === "Completed" ? "completed" : isOverdue(t) ? "overdue" : "upcoming",
          type: "Task due",
        });
      if (t.nextReviewDate)
        list.push({ date: t.nextReviewDate, label: `Review: ${t.title}`, kind: "upcoming", type: "Review" });
    });
    state.projects.forEach((p) => {
      if (p.targetDate)
        list.push({
          date: p.targetDate,
          label: `Target: ${p.name}`,
          kind: p.status === "Completed" ? "completed" : new Date(p.targetDate) < new Date() ? "overdue" : "upcoming",
          type: "Project target",
        });
    });
    return list;
  }, [state.tasks, state.projects, projectName]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  const todayKey = key(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar & deadlines"
        subtitle="Task deadlines, project targets and review dates."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="w-40 text-center font-display font-semibold">
              {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-success" /> Completed</span>
        <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-primary" /> Upcoming</span>
        <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-destructive" /> Overdue</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card p-2">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 gap-1 border-b border-border pb-2 text-center text-xs font-semibold text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 pt-2">
            {cells.map((date, i) => {
              if (!date) return <div key={`e${i}`} className="min-h-24 rounded-lg bg-muted/30" />;
              const k = key(date);
              const dayEvents = events.filter((e) => e.date === k);
              return (
                <div
                  key={k}
                  className={cn(
                    "min-h-24 rounded-lg border border-border p-1.5",
                    k === todayKey && "border-gold bg-gold/10",
                  )}
                >
                  <p className="text-xs font-semibold text-muted-foreground">{date.getDate()}</p>
                  <ul className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <li
                        key={idx}
                        title={`${e.type}: ${e.label}`}
                        className={cn(
                          "truncate rounded px-1.5 py-0.5 text-[11px] font-medium",
                          e.kind === "completed" && "bg-success/15 text-success",
                          e.kind === "overdue" && "bg-destructive/10 text-destructive",
                          e.kind === "upcoming" && "bg-primary/10 text-primary",
                        )}
                      >
                        {e.label}
                      </li>
                    ))}
                    {dayEvents.length > 3 ? (
                      <li className="px-1.5 text-[11px] text-muted-foreground">+{dayEvents.length - 3} more</li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
