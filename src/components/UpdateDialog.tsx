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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, uid } from "@/lib/store";
import { TASK_STATUSES, type ProgressUpdate, type Task, type TaskStatus } from "@/lib/types";

export function UpdateDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: Task | null;
}) {
  const { state, addUpdate } = useStore();
  const [form, setForm] = useState({
    status: "In Progress" as TaskStatus,
    percentComplete: 0,
    progressMade: "",
    challenges: "",
    supportRequired: "",
    nextAction: "",
    expectedDate: "",
    nextUpdateDate: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && task) {
      setForm({
        status: task.status,
        percentComplete: task.percentComplete,
        progressMade: "",
        challenges: task.challenges,
        supportRequired: "",
        nextAction: task.nextAction,
        expectedDate: task.dueDate,
        nextUpdateDate: task.nextReviewDate,
      });
      setError("");
    }
  }, [open, task]);

  if (!task) return null;

  const submit = () => {
    if (!form.progressMade.trim()) return setError("Tell the team what progress was made.");
    const update: ProgressUpdate = {
      id: uid(),
      taskId: task.id,
      authorId: state.currentUserId,
      createdAt: new Date().toISOString(),
      ...form,
    };
    addUpdate(update);
    toast.success("Progress update saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Fast progress update</DialogTitle>
          <DialogDescription>{task.title} — takes under 30 seconds.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as TaskStatus }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Complete — {form.percentComplete}%</Label>
            <Slider
              className="mt-3"
              value={[form.percentComplete]}
              max={100}
              step={5}
              onValueChange={([v]) => setForm((f) => ({ ...f, percentComplete: v ?? 0 }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="uprog">Progress made</Label>
            <Textarea id="uprog" rows={2} value={form.progressMade} onChange={(e) => setForm((f) => ({ ...f, progressMade: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="uchal">Challenges / issues</Label>
            <Textarea id="uchal" rows={2} value={form.challenges} onChange={(e) => setForm((f) => ({ ...f, challenges: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="usup">Support required</Label>
            <Input id="usup" value={form.supportRequired} onChange={(e) => setForm((f) => ({ ...f, supportRequired: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="unext">Next action</Label>
            <Input id="unext" value={form.nextAction} onChange={(e) => setForm((f) => ({ ...f, nextAction: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="uexp">Expected completion</Label>
            <Input id="uexp" type="date" value={form.expectedDate} onChange={(e) => setForm((f) => ({ ...f, expectedDate: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="unu">Next update date</Label>
            <Input id="unu" type="date" value={form.nextUpdateDate} onChange={(e) => setForm((f) => ({ ...f, nextUpdateDate: e.target.value }))} />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Submit update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
