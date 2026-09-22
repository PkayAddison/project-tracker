import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageHeader } from "@/components/Shared";
import { useStore } from "@/lib/store";
import type { OrgSettings } from "@/lib/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Project & Initiative Tracker" },
      { name: "description", content: "Organisation branding, logo, contact details, report footer and sample data reset." },
      { property: "og:title", content: "Settings | Project & Initiative Tracker" },
      { property: "og:description", content: "Brand your reports and manage organisational setup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { state, saveSettings, resetSampleData } = useStore();
  const [form, setForm] = useState<OrgSettings>(state.settings);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setForm(state.settings), [state.settings]);

  if (state.role !== "admin") {
    return <EmptyState title="Admin only" hint="Switch to the Admin role in the header to manage settings." />;
  }

  const set = <K extends keyof OrgSettings>(k: K, v: OrgSettings[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onLogo = (file?: File) => {
    if (!file) return;
    if (file.size > 1_500_000) {
      toast.error("Please choose an image under 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("logo", String(reader.result));
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Organisation name is required.");
      return;
    }
    saveSettings({ ...form, name: form.name.trim() });
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Branding and organisation details used across reports." />

      <section className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="oname">Organisation name</Label>
          <Input id="oname" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Logo</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
              {form.logo ? (
                <img src={form.logo} alt="Organisation logo preview" className="size-full object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground">No logo</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" /> Upload logo
              </Button>
              {form.logo ? <Button variant="ghost" onClick={() => set("logo", "")}>Remove</Button> : null}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => onLogo(e.target.files?.[0])}
              />
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="oaddr">Address</Label>
          <Input id="oaddr" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="oemail">Email</Label>
          <Input id="oemail" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ophone">Phone</Label>
          <Input id="ophone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ofooter">Report footer</Label>
          <Textarea id="ofooter" rows={2} value={form.reportFooter} onChange={(e) => set("reportFooter", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={save}>Save settings</Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-semibold">Committees</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {state.committees.length} units configured: {state.committees.map((c) => c.name).join(", ") || "none"}.
          Manage them on the Committees page.
        </p>
      </section>

      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="font-display text-base font-semibold">Reset sample data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Restores the demo projects, tasks and updates. Everything you have added will be removed.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            resetSampleData();
            toast.success("Sample data restored");
          }}
        >
          <RotateCcw className="size-4" /> Reset to sample data
        </Button>
      </section>
    </div>
  );
}
