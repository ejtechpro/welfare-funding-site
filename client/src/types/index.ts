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
  userRole: UserRole;
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

export interface MemberRegistration {
  member: {
    name: string;
    email: string;
    idNumber: string;
    phone: string;
    altPhone?: string;
    sex: string;
    maritalStatus: string;
    areaOfResidence: string;
    country?: string;
    photo?: File | null;
  };
  spouse?: {
    name: string;
    idNumber: string;
    phone: string;
    altPhone?: string;
    sex: string;
    areaOfResidence: string;
    photo?: File | null;
  };
  children?: {
    name: string;
    dob: string;
    age: string;
    birthCertificate?: File | null;
  }[];
  parents?: {
    parent1: {
      name: string;
      idNumber?: string;
      phone: string;
      altPhone?: string;
      areaOfResidence: string;
    };
    parent2: {
      name: string;
      idNumber?: string;
      phone: string;
      altPhone?: string;
      areaOfResidence: string;
    };
  };
}

export interface Member {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photo: string;
  };
  address?: string;
  country: string;
  city?: string;
  state?: string;
  zipCode: string;
  membershipType: "family" | "individual";
  registrationStatus: "approved" | "pending" | "rejected";
  paymentStatus: "paid" | "pending";
  tnsNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  idNumber?: string;
  alternativePhone?: string;
  sex?: string;
  maritalStatus?: string;
  maturityStatus?: "probation" | "matured";
  daysToMaturity?: number;
  probationEndEate?: string;
  mpesaPaymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userRole: UserRole;
  assignedArea?: string;
  approval: "pending" | "approved" | "rejected";
  status: "active" | "banned" | "inactive" | "suspended";
  requestedRole: UserRole;
  verificationCode: string;
  password: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Each member object in the health check
export type MemberBalance = {
  memberId: string;
  tnsNumber: string | null;
  balance: string; // decimal string
  billingDate: string | null; // ISO string
  registrationStatus: string;
  userStatus: "active" | "inactive";
  reason: string;
};

// Response type for the health check route
export type MemberBalanceHealthCheckResponse = {
  totalMembers: number;
  members: MemberBalance[];
  anomalyCount: number;
};

export interface MonthlyExpense {
  id: string;
  amount: number;
  expenseDate: string;
  expenseCategory: string;
  description?: string;
  status: "paid" | "pending" | "rejected" | "cancelled" | "approved";
}
