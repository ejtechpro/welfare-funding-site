export const UserRole = {
  admin: "admin",
  advisory_committee: "advisory_committee",
  general_coordinator: "general_coordinator",
  area_coordinator: "area_coordinator",
  secretary: "secretary",
  customer_service_personnel: "customer_service_personnel",
  organizing_secretary: "organizing_secretary",
  treasurer: "treasurer",
  auditor: "auditor",
  staff: "staff",
  member: "member",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];


export const Userpproval = {
  pending: "pending",
  rejected: "rejected",
  approved: "approved",
} as const;

export type Userpproval = typeof Userpproval[keyof typeof Userpproval];


export const UserStatus = {
  active: "active",
  inactive: "inactive",
  suspended: "suspended",
  banned: "banned",
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];


export type User = {
  id: string;
  surname?: string | null;
  firstName: string;
  lastName: string;
  otherNames?: string | null;
  email: string;
  gender?: string | null;
  dateOfBirth?: Date | null;
  phoneNumber?: string | null;
  password?: string | null;
  title?: string | null;
  address?: Record<string, unknown> | null;
  employmentDate: Date;
  department?: string | null;
  supervisorId?: string | null;
  role: UserRole;
  requestedRole?: string | null,
  assignedArea?: string | null;
  approval: Userpproval;
  qualifications?: Record<string, unknown> | null;
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
