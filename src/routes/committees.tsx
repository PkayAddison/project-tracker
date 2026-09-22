import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader } from "@/components/Shared";
import { uid, useStore } from "@/lib/store";
import type { Committee } from "@/lib/types";

export const Route = createFileRoute("/committees")({
  head: () => ({
    meta: [
      { title: "Committees & Departments | Project & Initiative Tracker" },
      { name: "description", content: "Organise projects and people into committees and departments." },
      { property: "og:title", content: "Committees & Departments | Project & Initiative Tracker" },
      { property: "og:description", content: "Academic, ICT, Events, Admin, Marketing and any unit you need." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Committees,
});

function Committees() {
  const { state, saveCommittee, deleteCommittee } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Committee>({ id: "", name: "", description: "" });
  const [error, setError] = useState("");
  const isAdmin = state.role === "admin";

  const submit = () => {
    if (!form.name.trim()) return setError("Please name the committee or department.");
    saveCommittee({ ...form, id: form.id || uid(), name: form.name.trim() });
    toast.success("Committee saved");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Committees & departments"
        subtitle="Organisational units that own projects and people."
        action={
          isAdmin ? (
            <Button onClick={() => { setForm({ id: "", name: "", description: "" }); setError(""); setOpen(true); }}>
              <Plus className="size-4" /> New committee
            </Button>
          ) : null
        }
      />

      {state.committees.length === 0 ? (
        <EmptyState title="No committees yet" hint="Add units like ICT, Academic or Events." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.committees.map((c) => {
            const projects = state.projects.filter((p) => p.committeeId === c.id);
            const members = state.members.filter((m) => m.committeeId === c.id);
            return (
              <article key={c.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="min-w-0 truncate font-display font-semibold">{c.name}</h2>
                  {isAdmin ? (
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setForm(c); setError(""); setOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteCommittee(c.id)} aria-label="Delete">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">{projects.length} projects</span>
                  <span className="rounded-full bg-gold/20 px-2.5 py-1 font-medium text-gold-foreground">{members.length} members</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit committee" : "New committee"}</DialogTitle>
            <DialogDescription>Give the unit a clear name so projects are easy to group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cname">Name</Label>
              <Input id="cname" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="cdesc">Description</Label>
              <Textarea id="cdesc" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
