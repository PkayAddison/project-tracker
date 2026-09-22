import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users2,
  Building2,
  CalendarDays,
  FileBarChart,
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import phbisLogo from "@/assets/PHBIS.png.asset.json";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/committees", label: "Committees", icon: Building2 },
  { to: "/team", label: "Team", icon: Users2 },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { state, setRole, setCurrentUser, signOutAdmin } = useStore();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-tech-grid opacity-40" />
      <div className="relative flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-md border border-sidebar-primary/35 bg-sidebar-accent/70 p-1 shadow-tech">
          <img src={phbisLogo.url} alt="PHBIS logo" className="size-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-sidebar-accent-foreground">PHBIS Command</p>
          <p className="truncate text-[11px] font-medium text-sidebar-foreground/60">{state.settings.name}</p>
        </div>
      </div>
      <nav className="relative flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "border-sidebar-primary/30 bg-sidebar-accent text-sidebar-accent-foreground shadow-tech"
                  : "border-transparent text-sidebar-foreground/70 hover:border-sidebar-border hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("size-4 shrink-0 transition-colors", active ? "text-sidebar-primary" : "group-hover:text-sidebar-primary")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="relative border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/60">
        Signed in as{" "}
        {state.role === "admin" ? state.session?.name ?? "Administrator" : "Team Member"}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-64">{sidebar}</div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/90 px-4 py-3 shadow-tech backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-foreground">
                Project &amp; Initiative Tracker
              </p>
              <p className="truncate text-xs font-medium text-primary">{state.settings.name}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {state.role === "member" ? (
              <Select value={state.currentUserId} onValueChange={setCurrentUser}>
                <SelectTrigger className="hidden w-44 sm:flex">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {state.members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Select
              value={state.role}
              onValueChange={(v) => {
                if (v === "admin" && !state.session) {
                  setAuthOpen(true);
                  return;
                }
                setRole(v as "admin" | "member");
              }}
            >
              <SelectTrigger className="w-36 border-gold/40 bg-gold/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="member">Team Member</SelectItem>
              </SelectContent>
            </Select>
            {state.session ? (
              <Button variant="outline" size="sm" onClick={signOutAdmin}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            ) : null}
          </div>
        </header>
        <main className="relative min-w-0 flex-1 space-y-6 overflow-hidden p-4 sm:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-tech-grid opacity-20" />
          <div className="relative mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
