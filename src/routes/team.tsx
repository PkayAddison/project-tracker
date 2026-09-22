import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader } from "@/components/Shared";
import { isOverdue, uid, useLookups, useStore } from "@/lib/store";
import type { Member } from "@/lib/types";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Directory | Project & Initiative Tracker" },
      { name: "description", content: "Team members with role, email, department and live task counts." },
      { property: "og:title", content: "Team Directory | Project & Initiative Tracker" },
      { property: "og:description", content: "See who is doing what, with assigned, in-progress, completed and overdue counts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Team,
});

function Team() {
  const { state, saveMember, deleteMember } = useStore();
  const { committeeName } = useLookups();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Member>({ id: "", name: "", email: "", role: "", committeeId: "" });
  const isAdmin = state.role === "admin";

  const submit = () => {
    if (!form.name.trim()) return setError("Please enter a name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please enter a valid email address.");
    saveMember({ ...form, id: form.id || uid(), name: form.name.trim() });
    toast.success("Team member saved");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team directory"
        subtitle="Everyone involved, with live workload at a glance."
        action={
          isAdmin ? (
            <Button onClick={() => { setForm({ id: "", name: "", email: "", role: "", committeeId: "" }); setError(""); setOpen(true); }}>
              <Plus className="size-4" /> Add member
            </Button>
          ) : null
        }
      />

      {state.members.length === 0 ? (
        <EmptyState title="No team members yet" hint="Add people so tasks can be assigned." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.members.map((m) => {
            const mine = state.tasks.filter((t) => t.assigneeId === m.id);
            const counts = [
              { label: "Assigned", value: mine.length, cls: "bg-secondary text-secondary-foreground" },
              { label: "In progress", value: mine.filter((t) => t.status === "In Progress").length, cls: "bg-primary/10 text-primary" },
              { label: "Completed", value: mine.filter((t) => t.status === "Completed").length, cls: "bg-success/15 text-success" },
              { label: "Overdue", value: mine.filter(isOverdue).length, cls: "bg-destructive/10 text-destructive" },
            ];
            return (
              <article key={m.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                      {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-display font-semibold">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.role}</p>
                    </div>
                  </div>
                  {isAdmin ? (
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setForm(m); setError(""); setOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMember(m.id)} aria-label="Remove">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ) : null}
                </div>
                <p className="mt-3 flex items-center gap-2 truncate text-sm text-muted-foreground">
                  <Mail className="size-4 shrink-0" /> {m.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{committeeName(m.committeeId)}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {counts.map((c) => (
                    <span key={c.label} className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.cls}`}>
                      {c.label}: {c.value}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit member" : "Add team member"}</DialogTitle>
            <DialogDescription>Members can be assigned tasks and set as project leads.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="mname">Full name</Label>
              <Input id="mname" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="memail">Email</Label>
              <Input id="memail" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="mrole">Role / title</Label>
              <Input id="mrole" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
            </div>
            <div>
              <Label>Committee</Label>
              <Select value={form.committeeId} onValueChange={(v) => setForm((f) => ({ ...f, committeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {state.committees.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
