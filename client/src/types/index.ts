export const UserRole = {
  super_admin: "super_admin",
  admin: "admin",
  user: "user",
  member: "member",
  advisory_committee: "advisory_committee",
  general_coordinator: "general_coordinator",
  area_coordinator: "area_coordinator",
  secretary: "secretary",
  customer_service_personnel: "customer_service_personnel",
  organizing_secretary: "organizing_secretary",
  treasurer: "treasurer",
  auditor: "auditor",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Userpproval = {
  pending: "pending",
  rejected: "rejected",
  approved: "approved",
} as const;

export type Userpproval = (typeof Userpproval)[keyof typeof Userpproval];

export const UserStatus = {
  active: "active",
  inactive: "inactive",
  suspended: "suspended",
  banned: "banned",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string | null;
  dateOfBirth?: Date | null;
  phone?: string | null;
  password?: string | null;
  role: UserRole;
  requestedRole?: string | null;
  assignedArea?: string | null;
  approval: Userpproval;
  status: UserStatus;
  verificationCode?: string | null;
  isVerified: boolean;
  createdAt: Date;
};

export type RegisterPayload = Partial<User>;

export type LoginInput = {
  email: string;
  password: string;
};

export type Session = {
  id: string;
  sessionId: string;
  userId: string;
  deviceId?: string | null;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  location?: string | null;
  compositeKey: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Contribution = {
  id: string;
  member_id: string;
  amount: number;
  contribution_type:
    | "monthly_contribution"
    | "cases"
    | "project"
    | "registration"
    | "other";
  contribution_date: string; // or Date if you parse it
  month?: number; // only for monthly contributions
  year?: number; // only for monthly contributions or general tracking
  project_id?: string; // only if type = project
  case_id?: string; // only if type = cases
  status: string; // e.g., "paid", "pending", "failed"
  created_at: string; // timestamps as string or Date
  updated_at: string;
};
