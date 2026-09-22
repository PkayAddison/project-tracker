import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type {
  AppState,
  AuditEntry,
  Committee,
  Member,
  OrgSettings,
  ProgressUpdate,
  Project,
  Role,
  Task,
} from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

/** The single owner account allowed to sign in as Administrator. */
export const OWNER_ADMIN_EMAIL = "paakwesi.phbis@gmail.com";
export const OWNER_ADMIN_NAME = "Paa Kwesi Addison";

export type AuthResult = { ok: true } | { ok: false; error: string };

const defaultSettings: OrgSettings = {
  name: "Project Tracker",
  logo: "",
  address: "",
  email: "",
  phone: "",
  reportFooter: "",
};

const emptyState: AppState = {
  role: "member",
  currentUserId: "",
  session: null,
  committees: [],
  members: [],
  projects: [],
  tasks: [],
  updates: [],
  audit: [],
  settings: defaultSettings,
};

/* ---------- row mappers ---------- */

const toCommittee = (r: any): Committee => ({ id: r.id, name: r.name, description: r.description ?? "" });
const fromCommittee = (c: Committee) => ({ id: c.id, name: c.name, description: c.description });

const toMember = (r: any): Member => ({
  id: r.id,
  name: r.name,
  email: r.email ?? "",
  role: r.role ?? "",
  committeeId: r.committee_id ?? "",
  isAdmin: !!r.is_admin,
});
const fromMember = (m: Member) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  role: m.role,
  committee_id: m.committeeId,
  is_admin: !!m.isAdmin,
});

const toProject = (r: any): Project => ({
  id: r.id,
  name: r.name,
  description: r.description ?? "",
  objective: r.objective ?? "",
  leadId: r.lead_id ?? "",
  committeeId: r.committee_id ?? "",
  memberIds: r.member_ids ?? [],
  startDate: r.start_date ?? "",
  targetDate: r.target_date ?? "",
  priority: r.priority,
  status: r.status,
  createdAt: r.created_at ?? "",
});
const fromProject = (p: Project) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  objective: p.objective,
  lead_id: p.leadId,
  committee_id: p.committeeId,
  member_ids: p.memberIds,
  start_date: p.startDate,
  target_date: p.targetDate,
  priority: p.priority,
  status: p.status,
  created_at: p.createdAt,
});

const toTask = (r: any): Task => ({
  id: r.id,
  title: r.title,
  description: r.description ?? "",
  projectId: r.project_id ?? "",
  assigneeId: r.assignee_id ?? "",
  supportIds: r.support_ids ?? [],
  startDate: r.start_date ?? "",
  dueDate: r.due_date ?? "",
  priority: r.priority,
  status: r.status,
  percentComplete: r.percent_complete ?? 0,
  challenges: r.challenges ?? "",
  nextAction: r.next_action ?? "",
  nextReviewDate: r.next_review_date ?? "",
  createdAt: r.created_at ?? "",
});
const fromTask = (t: Task) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  project_id: t.projectId,
  assignee_id: t.assigneeId,
  support_ids: t.supportIds,
  start_date: t.startDate,
  due_date: t.dueDate,
  priority: t.priority,
  status: t.status,
  percent_complete: t.percentComplete,
  challenges: t.challenges,
  next_action: t.nextAction,
  next_review_date: t.nextReviewDate,
  created_at: t.createdAt,
});

const toUpdate = (r: any): ProgressUpdate => ({
  id: r.id,
  taskId: r.task_id ?? "",
  authorId: r.author_id ?? "",
  createdAt: r.created_at ?? "",
  status: r.status,
  percentComplete: r.percent_complete ?? 0,
  progressMade: r.progress_made ?? "",
  challenges: r.challenges ?? "",
  supportRequired: r.support_required ?? "",
  nextAction: r.next_action ?? "",
  expectedDate: r.expected_date ?? "",
  nextUpdateDate: r.next_update_date ?? "",
});
const fromUpdate = (u: ProgressUpdate) => ({
  id: u.id,
  task_id: u.taskId,
  author_id: u.authorId,
  created_at: u.createdAt,
  status: u.status,
  percent_complete: u.percentComplete,
  progress_made: u.progressMade,
  challenges: u.challenges,
  support_required: u.supportRequired,
  next_action: u.nextAction,
  expected_date: u.expectedDate,
  next_update_date: u.nextUpdateDate,
});

const toAudit = (r: any): AuditEntry => ({
  id: r.id,
  createdAt: r.created_at ?? "",
  entity: r.entity ?? "",
  entityId: r.entity_id ?? "",
  projectId: r.project_id ?? "",
  message: r.message ?? "",
});
const fromAudit = (a: AuditEntry) => ({
  id: a.id,
  created_at: a.createdAt,
  entity: a.entity,
  entity_id: a.entityId,
  project_id: a.projectId,
  message: a.message,
});

const toSettings = (r: any): OrgSettings => ({
  name: r?.name ?? defaultSettings.name,
  logo: r?.logo ?? "",
  address: r?.address ?? "",
  email: r?.email ?? "",
  phone: r?.phone ?? "",
  reportFooter: r?.report_footer ?? "",
});

/* ---------- context ---------- */

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  isAdmin: boolean;
  setRole: (role: Role) => void;
  signUpAdmin: (name: string, email: string, password: string) => Promise<AuthResult>;
  signInAdmin: (email: string, password: string) => Promise<AuthResult>;
  signOutAdmin: () => Promise<void>;
  setCurrentUser: (id: string) => void;
  saveProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  saveTask: (t: Task) => void;
  deleteTask: (id: string) => void;
  addUpdate: (u: ProgressUpdate) => void;
  saveCommittee: (c: Committee) => void;
  deleteCommittee: (id: string) => void;
  saveMember: (m: Member) => void;
  deleteMember: (id: string) => void;
  saveSettings: (s: OrgSettings) => void;
  resetSampleData: () => void;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const adminRef = useRef(false);

  const loadData = useCallback(async () => {
    const [committees, members, projects, tasks, updates, audit, settings] = await Promise.all([
      supabase.from("committees").select("*").order("name"),
      supabase.from("members").select("*").order("name"),
      supabase.from("projects").select("*"),
      supabase.from("tasks").select("*"),
      supabase.from("progress_updates").select("*").order("created_at", { ascending: false }),
      supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("org_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    setState((s) => ({
      ...s,
      committees: (committees.data ?? []).map(toCommittee),
      members: (members.data ?? []).map(toMember),
      projects: (projects.data ?? []).map(toProject),
      tasks: (tasks.data ?? []).map(toTask),
      updates: (updates.data ?? []).map(toUpdate),
      audit: (audit.data ?? []).map(toAudit),
      settings: toSettings(settings.data),
      currentUserId: s.currentUserId || (members.data?.[0]?.id ?? ""),
    }));
  }, []);

  const applySession = useCallback(async (session: { user: { email?: string | undefined; user_metadata?: any } } | null) => {
    if (!session) {
      adminRef.current = false;
      setState((s) => ({ ...s, session: null, role: "member" }));
      return;
    }
    const email = session.user.email ?? "";
    if (email.toLowerCase() === OWNER_ADMIN_EMAIL) {
      await supabase.rpc("claim_owner_admin");
    }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("role", "admin");
    const admin = (roles?.length ?? 0) > 0;
    adminRef.current = admin;
    setState((s) => ({
      ...s,
      session: { name: session.user.user_metadata?.full_name || OWNER_ADMIN_NAME, email },
      role: admin ? "admin" : "member",
    }));
  }, []);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      void applySession(session);
    });
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      await applySession(data.session);
      await loadData();
      if (active) setHydrated(true);
    })();
    // Pick up other people's changes whenever the tab regains focus.
    const onFocus = () => {
      if (document.visibilityState === "visible") void loadData();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [applySession, loadData]);

  const value = useMemo<StoreValue>(() => {
    const upsert = <T extends { id: string }>(list: T[], item: T) =>
      list.some((x) => x.id === item.id)
        ? list.map((x) => (x.id === item.id ? item : x))
        : [item, ...list];

    const guard = () => {
      if (!adminRef.current) {
        toast.error("Only the administrator can make changes.");
        return false;
      }
      return true;
    };

    const fail = (error: { message: string } | null) => {
      if (error) {
        toast.error("Could not save to the shared database. Please try again.");
        console.error(error);
        void loadData();
      }
    };

    const writeAudit = async (entry: Omit<AuditEntry, "id" | "createdAt">) => {
      const full: AuditEntry = { id: uid(), createdAt: new Date().toISOString(), ...entry };
      setState((s) => ({ ...s, audit: [full, ...s.audit].slice(0, 200) }));
      await supabase.from("audit_log").insert(fromAudit(full));
    };

    return {
      state,
      hydrated,
      isAdmin: state.role === "admin",
      refresh: loadData,
      setRole: (role) =>
        setState((s) => {
          if (role === "admin" && !adminRef.current) return s;
          return { ...s, role };
        }),
      signUpAdmin: async (name, email, password) => {
        const mail = email.trim().toLowerCase();
        if (mail !== OWNER_ADMIN_EMAIL)
          return { ok: false, error: `Administrator sign-up is only allowed for ${OWNER_ADMIN_EMAIL}.` };
        if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
        const { error } = await supabase.auth.signUp({
          email: mail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.trim() || OWNER_ADMIN_NAME },
          },
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      signInAdmin: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) return { ok: false, error: "Incorrect email or password." };
        return { ok: true };
      },
      signOutAdmin: async () => {
        await supabase.auth.signOut();
      },
      setCurrentUser: (id) => setState((s) => ({ ...s, currentUserId: id })),
      saveProject: (p) => {
        if (!guard()) return;
        setState((s) => ({ ...s, projects: upsert(s.projects, p) }));
        void (async () => {
          const { error } = await supabase.from("projects").upsert(fromProject(p));
          fail(error);
          if (!error)
            await writeAudit({
              entity: "project",
              entityId: p.id,
              projectId: p.id,
              message: `Project "${p.name}" saved (${p.status}, ${p.priority} priority)`,
            });
        })();
      },
      deleteProject: (id) => {
        if (!guard()) return;
        setState((s) => ({
          ...s,
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.filter((t) => t.projectId !== id),
        }));
        void (async () => {
          await supabase.from("tasks").delete().eq("project_id", id);
          const { error } = await supabase.from("projects").delete().eq("id", id);
          fail(error);
        })();
      },
      saveTask: (t) => {
        if (!guard()) return;
        setState((s) => ({ ...s, tasks: upsert(s.tasks, t) }));
        void (async () => {
          const { error } = await supabase.from("tasks").upsert(fromTask(t));
          fail(error);
          if (!error)
            await writeAudit({
              entity: "task",
              entityId: t.id,
              projectId: t.projectId,
              message: `Task "${t.title}" saved (${t.status}, ${t.percentComplete}%)`,
            });
        })();
      },
      deleteTask: (id) => {
        if (!guard()) return;
        setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
        void (async () => {
          const { error } = await supabase.from("tasks").delete().eq("id", id);
          fail(error);
        })();
      },
      addUpdate: (u) => {
        if (!guard()) return;
        const task = state.tasks.find((t) => t.id === u.taskId);
        const author = state.members.find((m) => m.id === u.authorId)?.name ?? "Someone";
        const nextTask: Task | undefined = task
          ? {
              ...task,
              status: u.status,
              percentComplete: u.percentComplete,
              challenges: u.challenges,
              nextAction: u.nextAction,
              nextReviewDate: u.nextUpdateDate || task.nextReviewDate,
            }
          : undefined;
        setState((s) => ({
          ...s,
          updates: [u, ...s.updates],
          tasks: nextTask ? s.tasks.map((t) => (t.id === nextTask.id ? nextTask : t)) : s.tasks,
        }));
        void (async () => {
          const { error } = await supabase.from("progress_updates").insert(fromUpdate(u));
          fail(error);
          if (nextTask) await supabase.from("tasks").upsert(fromTask(nextTask));
          if (!error)
            await writeAudit({
              entity: "update",
              entityId: u.id,
              projectId: task?.projectId ?? "",
              message: `Progress update on "${task?.title ?? "task"}" by ${author} (${u.percentComplete}%)`,
            });
        })();
      },
      saveCommittee: (c) => {
        if (!guard()) return;
        setState((s) => ({ ...s, committees: upsert(s.committees, c) }));
        void (async () => {
          const { error } = await supabase.from("committees").upsert(fromCommittee(c));
          fail(error);
        })();
      },
      deleteCommittee: (id) => {
        if (!guard()) return;
        setState((s) => ({ ...s, committees: s.committees.filter((c) => c.id !== id) }));
        void (async () => {
          const { error } = await supabase.from("committees").delete().eq("id", id);
          fail(error);
        })();
      },
      saveMember: (m) => {
        if (!guard()) return;
        setState((s) => ({ ...s, members: upsert(s.members, m) }));
        void (async () => {
          const { error } = await supabase.from("members").upsert(fromMember(m));
          fail(error);
        })();
      },
      deleteMember: (id) => {
        if (!guard()) return;
        setState((s) => ({ ...s, members: s.members.filter((m) => m.id !== id) }));
        void (async () => {
          const { error } = await supabase.from("members").delete().eq("id", id);
          fail(error);
        })();
      },
      saveSettings: (settings) => {
        if (!guard()) return;
        setState((s) => ({ ...s, settings }));
        void (async () => {
          const { error } = await supabase.from("org_settings").upsert({
            id: 1,
            name: settings.name,
            logo: settings.logo,
            address: settings.address,
            email: settings.email,
            phone: settings.phone,
            report_footer: settings.reportFooter,
          });
          fail(error);
        })();
      },
      resetSampleData: () => {
        if (!guard()) return;
        void (async () => {
          const { error } = await supabase.rpc("reset_sample_data");
          if (error) {
            toast.error("Could not reset the sample data.");
            console.error(error);
            return;
          }
          await loadData();
        })();
      },
    };
  }, [state, hydrated, loadData]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/* ---------- derived helpers ---------- */

export const isOverdue = (t: Task) =>
  !!t.dueDate &&
  t.percentComplete < 100 &&
  t.status !== "Completed" &&
  t.status !== "Cancelled" &&
  new Date(t.dueDate) < new Date(new Date().toDateString());

export const projectProgress = (tasks: Task[]) =>
  tasks.length === 0
    ? 0
    : Math.round(tasks.reduce((sum, t) => sum + t.percentComplete, 0) / tasks.length);

export function useLookups() {
  const { state } = useStore();
  return useMemo(() => {
    const memberName = (id: string) => state.members.find((m) => m.id === id)?.name ?? "Unassigned";
    const committeeName = (id: string) =>
      state.committees.find((c) => c.id === id)?.name ?? "Unassigned";
    const projectName = (id: string) => state.projects.find((p) => p.id === id)?.name ?? "—";
    return { memberName, committeeName, projectName };
  }, [state]);
}

export function useCan() {
  const { state } = useStore();
  return useCallback(() => state.role === "admin", [state.role]);
}

export const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const fmtDateTime = (d: string) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
