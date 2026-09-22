import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, uid } from "@/lib/store";
import { PRIORITIES, PROJECT_STATUSES, type Priority, type Project, type ProjectStatus } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

const blank = (): Project => ({
  id: "",
  name: "",
  description: "",
  objective: "",
  leadId: "",
  committeeId: "",
  memberIds: [],
  startDate: today(),
  targetDate: "",
  priority: "Medium",
  status: "Planning",
  createdAt: new Date().toISOString(),
});

export function ProjectDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project?: Project | null;
}) {
  const { state, saveProject } = useStore();
  const [form, setForm] = useState<Project>(blank());
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(project ? { ...project } : blank());
      setError("");
    }
  }, [open, project]);

  const set = <K extends keyof Project>(k: K, v: Project[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return setError("Please give the project a name.");
    if (!form.leadId) return setError("Please choose a project lead.");
    if (form.targetDate && form.startDate && form.targetDate < form.startDate)
      return setError("The target date cannot be before the start date.");
    saveProject({ ...form, id: form.id || uid(), name: form.name.trim() });
    toast.success(project ? "Project updated" : "Project created");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>Capture the essentials — you can refine details later.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="pname">Project name</Label>
            <Input id="pname" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Website Development" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pdesc">Description</Label>
            <Textarea id="pdesc" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pobj">Objective</Label>
            <Textarea id="pobj" rows={2} value={form.objective} onChange={(e) => set("objective", e.target.value)} />
          </div>
          <div>
            <Label>Project lead</Label>
            <Select value={form.leadId} onValueChange={(v) => set("leadId", v)}>
              <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
              <SelectContent>
                {state.members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Committee / department</Label>
            <Select value={form.committeeId} onValueChange={(v) => set("committeeId", v)}>
              <SelectTrigger><SelectValue placeholder="Select committee" /></SelectTrigger>
              <SelectContent>
                {state.committees.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pstart">Start date</Label>
            <Input id="pstart" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ptarget">Target date</Label>
            <Input id="ptarget" type="date" value={form.targetDate} onChange={(e) => set("targetDate", e.target.value)} />
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => set("priority", v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v as ProjectStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Team members</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {state.members.map((m) => (
                <label key={m.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                  <Checkbox
                    checked={form.memberIds.includes(m.id)}
                    onCheckedChange={(c) =>
                      set(
                        "memberIds",
                        c ? [...form.memberIds, m.id] : form.memberIds.filter((x) => x !== m.id),
                      )
                    }
                  />
                  <span className="truncate">{m.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{project ? "Save changes" : "Create project"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
