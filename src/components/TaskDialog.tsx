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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, uid } from "@/lib/store";
import { PRIORITIES, TASK_STATUSES, type Priority, type Task, type TaskStatus } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

const blank = (projectId: string): Task => ({
  id: "",
  title: "",
  description: "",
  projectId,
  assigneeId: "",
  supportIds: [],
  startDate: today(),
  dueDate: "",
  priority: "Medium",
  status: "Not Started",
  percentComplete: 0,
  challenges: "",
  nextAction: "",
  nextReviewDate: "",
  createdAt: new Date().toISOString(),
});

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultProjectId = "",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task | null;
  defaultProjectId?: string;
}) {
  const { state, saveTask } = useStore();
  const [form, setForm] = useState<Task>(blank(defaultProjectId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(task ? { ...task } : blank(defaultProjectId));
      setError("");
    }
  }, [open, task, defaultProjectId]);

  const set = <K extends keyof Task>(k: K, v: Task[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.title.trim()) return setError("Please give the task a title.");
    if (!form.projectId) return setError("Please choose the project this task belongs to.");
    if (!form.assigneeId) return setError("Please choose an assignee.");
    if (!form.dueDate) return setError("Please set a due date.");
    saveTask({ ...form, id: form.id || uid(), title: form.title.trim() });
    toast.success(task ? "Task updated" : "Task created");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>Action items keep projects moving. Two minutes, tops.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="ttitle">Title</Label>
            <Input id="ttitle" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Finalise homepage design" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="tdesc">Description</Label>
            <Textarea id="tdesc" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <Label>Project</Label>
            <Select value={form.projectId} onValueChange={(v) => set("projectId", v)}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {state.projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Assignee</Label>
            <Select value={form.assigneeId} onValueChange={(v) => set("assigneeId", v)}>
              <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
              <SelectContent>
                {state.members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tstart">Start date</Label>
            <Input id="tstart" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tdue">Due date</Label>
            <Input id="tdue" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
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
            <Select value={form.status} onValueChange={(v) => set("status", v as TaskStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Percentage complete — {form.percentComplete}%</Label>
            <Slider
              className="mt-3"
              value={[form.percentComplete]}
              max={100}
              step={5}
              onValueChange={([v]) => set("percentComplete", v ?? 0)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Supporting members</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {state.members.map((m) => (
                <label key={m.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                  <Checkbox
                    checked={form.supportIds.includes(m.id)}
                    onCheckedChange={(c) =>
                      set("supportIds", c ? [...form.supportIds, m.id] : form.supportIds.filter((x) => x !== m.id))
                    }
                  />
                  <span className="truncate">{m.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="tchal">Challenges</Label>
            <Textarea id="tchal" rows={2} value={form.challenges} onChange={(e) => set("challenges", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tnext">Next action</Label>
            <Input id="tnext" value={form.nextAction} onChange={(e) => set("nextAction", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="treview">Next review date</Label>
            <Input id="treview" type="date" value={form.nextReviewDate} onChange={(e) => set("nextReviewDate", e.target.value)} />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{task ? "Save changes" : "Create task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
