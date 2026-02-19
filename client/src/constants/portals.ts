import { Users, FileText, DollarSign, Settings, Shield } from "lucide-react";

export const PORTALS = {
  admin: {
    title: "Admin Portal",
    description: "Approve members and manage staff registrations",
    route: "admin",
    icon: Shield,
  },
  secretary: {
    title: "Secretary Portal",
    description: "Handle administrative tasks and documentation",
    route: "secretary",
    icon: FileText,
  },
  customer_service_personnel: {
    title: "Customer Service Portal",
    description: "Access all areas for customer support",
    route: "customer-service",
    icon: Users,
  },
  auditor: {
    title: "Auditor Portal",
    description: "Review financial data and generate reports",
    route: "auditor",
    icon: DollarSign,
  },
  area_coordinator: {
    title: "Area Coordinator Portal",
    description: "Manage members in your assigned area",
    route: "coordinator",
    icon: Users,
  },
  general_coordinator: {
    title: "General Coordinator Portal",
    description: "Oversee all coordinators and approve tasks",
    route: "general-coordinator",
    icon: Settings,
  },
  treasurer: {
    title: "Treasurer Portal",
    description: "Manage treasury and financial operations",
    route: "treasurer",
    icon: DollarSign,
  },
} as const;
