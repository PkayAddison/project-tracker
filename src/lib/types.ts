export type Role = "admin" | "member";

export const PROJECT_STATUSES = [
  "Planning",
  "Not Started",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TASK_STATUSES = [
  "Not Started",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PRIORITIES = ["Low", "Medium", "High"] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Committee {
  id: string;
  name: string;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  committeeId: string;
  isAdmin?: boolean;
}

export interface Session {
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  objective: string;
  leadId: string;
  committeeId: string;
  memberIds: string[];
  startDate: string;
  targetDate: string;
  priority: Priority;
  status: ProjectStatus;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  supportIds: string[];
  startDate: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  percentComplete: number;
  challenges: string;
  nextAction: string;
  nextReviewDate: string;
  createdAt: string;
}

export interface ProgressUpdate {
  id: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  status: TaskStatus;
  percentComplete: number;
  progressMade: string;
  challenges: string;
  supportRequired: string;
  nextAction: string;
  expectedDate: string;
  nextUpdateDate: string;
}

export interface AuditEntry {
  id: string;
  createdAt: string;
  entity: string;
  entityId: string;
  projectId: string;
  message: string;
}

export interface OrgSettings {
  name: string;
  logo: string;
  address: string;
  email: string;
  phone: string;
  reportFooter: string;
}

export interface AppState {
  role: Role;
  currentUserId: string;
  session: Session | null;
  committees: Committee[];
  members: Member[];
  projects: Project[];
  tasks: Task[];
  updates: ProgressUpdate[];
  audit: AuditEntry[];
  settings: OrgSettings;
}
