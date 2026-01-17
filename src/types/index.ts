// Workspace
export type Workspace = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

// Roles
export type Role = "ADMIN" | "MANAGER" | "LEAD" | "QE" | "DEVELOPER" | "MEMBER";

// Teams & Members
export type Team = {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Member = {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  roles: Role[];
  teamIds: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Program Increments (PIs)
export type ProgramIncrement = {
  id: string;
  workspaceId: string;
  name: string; // Format: PI 2026-01
  startDate: Date;
  endDate: Date;
  goal?: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Test Types, Statuses, Workflows
export type TestType =
  | "regression"
  | "smoke"
  | "exploratory"
  | "performance"
  | "security"
  | "uat"
  | "system_integration"
  | "other";

export type TestTypeDefinition = {
  id: string;
  workspaceId: string;
  name: string; // e.g., "Performance Testing", "System Integration"
  description?: string;
  ownerTeamId?: string; // Primary team responsible (assigned later via test efforts)
  participatingTeamIds: string[]; // Other teams that may contribute
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Status =
  | "planned"
  | "in_progress"
  | "blocked"
  | "done"
  | "verified";

export type WorkflowTransition = {
  from: Status;
  to: Status;
  allowedRoles?: Role[];
};

// Environments
export type Environment = {
  id: string;
  workspaceId: string;
  name: string;
  type: "qa" | "uat" | "staging" | "performance" | "other";
  url?: string;
  ownerId?: string;
  notes?: string;
  active: boolean;
  health: "green" | "yellow" | "red";
  healthReason?: string;
  healthUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type EnvironmentReservation = {
  id: string;
  workspaceId: string;
  environmentId: string;
  memberId: string;
  effortId?: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Sprints
export type Sprint = {
  id: string;
  workspaceId: string;
  piId: string; // Reference to Program Increment
  name: string; // e.g., "Sprint 0", "Sprint 1", "Hardening Sprint"
  sprintNumber: number; // 0-4 for regular, 5 for hardening
  startDate: Date;
  endDate: Date;
  goal?: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Test Efforts
export type TestEffort = {
  id: string;
  workspaceId: string;
  piId: string; // Reference to Program Increment
  sprintId: string;
  teamId: string;
  testTypeDefinitionId: string; // Reference to TestTypeDefinition
  title: string;
  description?: string;
  status: Status;
  priority: "low" | "medium" | "high";
  assigneeId?: string;
  secondaryAssigneeIds?: string[];
  environmentIds: string[];
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  estimate?: number;
  estimateUnit?: "hours" | "points";
  progress?: number;
  tags?: string[];
  blockers?: EffortBlocker[];
  links?: EffortLink[];
  createdAt: Date;
  updatedAt: Date;
};

export type EffortBlocker = {
  id: string;
  effortId: string;
  title: string;
  description?: string;
  category?: "environment" | "resource" | "dependency" | "other";
  severity: "low" | "medium" | "high";
  createdAt: Date;
};

export type EffortLink = {
  id: string;
  effortId: string;
  title: string;
  url: string;
  type?: "jira" | "build" | "pipeline" | "docs" | "other";
  createdAt: Date;
};

// Notifications
export type Notification = {
  id: string;
  workspaceId: string;
  recipientId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  link?: string;
  createdAt: Date;
};

// Audit Events
export type AuditEvent = {
  id: string;
  workspaceId: string;
  userId: string;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "archived"
    | "status_changed"
    | "assigned";
  entityType:
    | "team"
    | "member"
    | "environment"
    | "sprint"
    | "pi"
    | "test_type"
    | "effort"
    | "reservation";
  entityId: string;
  entityName?: string;
  changes?: Record<string, {old?: unknown; new?: unknown}>;
  description?: string;
  createdAt: Date;
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
