import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Users,
  UserCheck,
  UserX,
  Shield,
  Key,
  LogOut,
  Download,
  FileSpreadsheet,
  FileText,
  File,
  BarChart3,
  PieChart,
  DollarSign,
  TrendingUp,
  Calculator,
  Trash2,
  AlertTriangle,
  Edit,
  Save,
  X,
  UserMinus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { ManualPaymentEntry } from "@/components/ManualPaymentEntry";
import { DisbursementForm } from "@/components/DisbursementForm";
import { EnhancedDisbursementForm } from "@/components/EnhancedDisbursementForm";
import { ExpenditureForm } from "@/components/ExpenditureForm";
import { ContributionsReport } from "@/components/ContributionsReport";
import { DisbursementsReport } from "@/components/DisbursementsReport";
import { ExpensesReport } from "@/components/ExpensesReport";
import { MemberMPESAPayment } from "@/components/MemberMPESAPayment";
import {
  setupMemberDeletionSync,
  type MemberDeletionEvent,
} from "../utils/memberDeletionSync";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMembersOptions } from "@/queries/memberQueryOptions";
import { getStaffOptions } from "@/queries/userQueryOptions";
import { memberApproval, memberDeletion, memberRejection } from "@/api/member";
import type { Member, MonthlyExpense, Staff } from "@/types";
import { approveStaffWithPwd, staffRejection } from "@/api/user";
import { BalanceDebugTable } from "@/components/BalanceDebugTable";
import * as XLSX from "xlsx";
import { addMonthlyExpense } from "@/api/expenses";
import ContributionTypeForm from "@/components/ContributionTypeForm";

interface MemberRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  membershipType: string;
  registrationStatus: string;
  paymentStatus: string;
  registration_date: string;
  tnsNumber?: string;
  profile_picture_url?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  idNumber?: string;
  alternativePhone?: string;
  sex?: string;
  maritalStatus?: string;
  maturityStatus?: string;
  days_to_maturity?: number;
  probation_end_date?: string;
  mpesaPaymentReference?: string;
}

interface StaffRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userRole: string;
  assigned_area?: string;
  pending: string;
  created_at: string;
}

interface MPESAPayment {
  id: string;
  member_id: string;
  amount: number;
  phone_number: string;
  mpesa_receipt_number?: string;
  checkout_request_id?: string;
  transaction_date?: string;
  status: string;
  created_at: string;
  membership_registrations?: {
    firstName: string;
    lastName: string;
    tnsNumber?: string;
    email: string;
  } | null;
}

interface Contribution {
  id: string;
  member_id: string;
  amount: number;
  contribution_date: string;
  contribution_type: string;
  status: string;
}

interface Disbursement {
  id: string;
  member_id: string;
  amount: number;
  disbursement_date: string;
  reason?: string;
  status: string;
}


const AdminPortal = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mpesaPayments, setMpesaPayments] = useState<MPESAPayment[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Partial<Staff> | null>(
    null,
  );
  const [portalPassword, setPortalPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Member editing states
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<MemberRegistration>>(
    {},
  );

  //!QUERIES
  const { data: members = [], isLoading: loadingMembers } =
    useQuery(getMembersOptions());
  const pendingMembers = useMemo(
    () => members.filter((m) => m.registrationStatus === "pending"),
    [members],
  );
  const staffs = useQuery(getStaffOptions());
  const pendingStaff = useMemo(() => {
    if (staffs.data) {
      return staffs?.data.filter((s) => s.approval === "pending");
    }
    return [];
  }, [staffs]);

  //!MUTATIONS
  const approveMember = useMutation({
    mutationFn: (memberId: string) => memberApproval(memberId),

    onSuccess: async (data: any) => {
      if (data?.success) {
        await queryClient.invalidateQueries({ queryKey: ["members"] });
        toast.success(`Member approved successfully!`, {
          description: `TNS Number: ${data?.tnsNumber} • Status: Active Member`,
          duration: 5000,
        });
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error("Error occurred", {
          description: error?.response?.data?.error,
          duration: 7000,
        });
      } else {
        toast.error("Error occurred", {
          description: "Something went Wrong, Try again!",
          duration: 7000,
        });
      }
    },
  });

  const rejectMember = useMutation({
    mutationFn: (memberId: string) => memberRejection(memberId),
    onSuccess: async (data: any) => {
      if (data?.success) {
        await queryClient.invalidateQueries({ queryKey: ["members"] });
        toast.success(`Member registration rejected successfully!`, {
          description: `The member has been notified and removed from pending registrations!`,
          duration: 5000,
        });
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error("Error occurred", {
          description: error?.response?.data?.error,
          duration: 7000,
        });
      } else {
        toast.error("Error occurred", {
          description: "Something went Wrong, Try again!",
          duration: 7000,
        });
      }
    },
  });
  const deleteMember = useMutation({
    mutationFn: () => memberDeletion(memberToDelete!.id),
    onSuccess: async (data: any) => {
      if (data?.success) {
        await queryClient.invalidateQueries({ queryKey: ["members"] });
        toast.success(`Member account deleted successfully!`, {
          description: `The member has been deleted with his all data!`,
          duration: 5000,
        });
        // Step 13: Close dialog and refresh data
        setIsDeleteDialogOpen(false);
        setMemberToDelete(null);
        setDeleteConfirmation("");
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error("Error occurred", {
          description: error?.response?.data?.error,
          duration: 7000,
        });
      } else {
        toast.error("Error occurred", {
          description: "Something went Wrong, try again!",
          duration: 7000,
        });
      }
    },
  });

  const openPasswordDialog = (staff: Staff) => {
    setSelectedStaff(staff);
    setPortalPassword("");
    setIsPasswordDialogOpen(true);
  };

  const approveStaff = useMutation({
    mutationFn: () =>
      approveStaffWithPwd({
        userId: selectedStaff?.id,
        password: portalPassword,
        oldPassword: selectedStaff?.password,
        requestedRole: selectedStaff?.requestedRole,
      }),
    onSuccess: async (data: any) => {
      if (data?.success) {
        await queryClient.invalidateQueries({ queryKey: ["staffs"] });
        toast.success(`Staff registration approved successfully!`, {
          description: `Access to portal granted successfully!`,
          duration: 5000,
        });
        setIsPasswordDialogOpen(false);
        setSelectedStaff(null);
        setPortalPassword("");
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error("Error occurred", {
          description: error?.response?.data?.error,
          duration: 7000,
        });
      } else {
        toast.error("Error occurred", {
          description: "Something went wrong, Try again!",
          duration: 7000,
        });
      }
    },
  });

  const rejectStaff = useMutation({
    mutationFn: (userId: any) => staffRejection({ userId }),
    onSuccess: async (data: any) => {
      if (data?.success) {
        await queryClient.invalidateQueries({ queryKey: ["staffs"] });
        toast.success(`Staff registration rejected successfully!`, {
          description: `The user has been notified and removed from pending registrations!`,
          duration: 5000,
        });
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error("Error occurred", {
          description: error?.response?.data?.error,
          duration: 7000,
        });
      } else {
        toast.error("Error occurred", {
          description: "Something went wrong, Try again!",
          duration: 7000,
        });
      }
    },
  });

  const recordExpense = useMutation({
    mutationFn: (data: MonthlyExpense) => addMonthlyExpense(data),
    onSuccess: async (data: any) => {
      if (data?.success) {
        await queryClient.invalidateQueries({ queryKey: ["staffs"] });
        toast.success(`Monthly expenditure added successfully!`, {
          description: `The expenditure has been recoreded successfully!`,
          duration: 5000,
        });
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error("Error occurred", {
          description: error?.response?.data?.error,
          duration: 7000,
        });
      } else {
        toast.error("Error occurred", {
          description: `Error ${error.message}`,
          duration: 7000,
        });
      }
    },
  });

  // Group MPESA payments by member to show contributions under one row per member
  const groupedMpesaPayments = useMemo(() => {
    type Grouped = {
      member_id: string;
      membership_registrations: MPESAPayment["membership_registrations"];
      payments: MPESAPayment[];
      totalAmount: number;
      latest: MPESAPayment;
      status: string;
    };

    const groups: Record<string, Grouped> = {};
    (mpesaPayments || []).forEach((p) => {
      const key = p.member_id;
      if (!groups[key]) {
        groups[key] = {
          member_id: key,
          membership_registrations: p.membership_registrations || null,
          payments: [],
          totalAmount: 0,
          latest: p,
          status: p.status,
        };
      }
      groups[key].payments.push(p);
      groups[key].totalAmount += Number(p.amount);
      // Track latest payment
      if (new Date(p.created_at) > new Date(groups[key].latest.created_at)) {
        groups[key].latest = p;
      }
      // Determine status
      if (groups[key].status !== p.status) {
        groups[key].status = "mixed";
      }
    });

    // Sort groups by latest transaction date desc
    return Object.values(groups).sort(
      (a, b) =>
        new Date(b.latest.created_at).getTime() -
        new Date(a.latest.created_at).getTime(),
    );
  }, [mpesaPayments]);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  // Set up cross-portal member deletion synchronization
  useEffect(() => {
    const cleanup = setupMemberDeletionSync((event: MemberDeletionEvent) => {
      console.log("🔄 Member deletion sync received in AdminPortal:", event);

      // Refresh member data when a member is deleted in another portal
      fetchPendingRegistrations();

      // Show a notification about the deletion
      toast.info(
        `Member ${event.memberName} was deleted by ${event.deletedBy}`,
        {
          description: `Deleted: ${event.summary.join(", ") || "All member data"}`,
          duration: 5000,
        },
      );
    });

    return cleanup; // Clean up listeners when component unmounts
  }, []);

  // Enhanced realtime subscriptions for comprehensive data synchronization
  useEffect(() => {
    const channel = supabase
      .channel("realtime-admin-portal")
      // MPESA payments and contributions
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mpesa_payments",
          filter: "status=eq.completed",
        },
        () => {
          console.log("Real-time: Completed MPESA payment inserted");
          fetchPendingRegistrations();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mpesa_payments",
          filter: "status=eq.completed",
        },
        (payload) => {
          console.log("Real-time: MPESA payment completed", payload);
          fetchPendingRegistrations();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contributions" },
        () => {
          console.log("Real-time: Contribution inserted");
          fetchPendingRegistrations();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contributions" },
        () => {
          console.log("Real-time: Contribution updated");
          fetchPendingRegistrations();
        },
      )
      // Member registration changes - critical for cross-portal sync
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "membership_registrations",
        },
        (payload) => {
          console.log("Real-time: Member registration updated", payload);
          fetchPendingRegistrations();

          // Broadcast member update event for other components/portals
          const memberUpdateEvent = new CustomEvent("memberUpdated", {
            detail: { memberId: payload.new.id, changes: payload.new },
          });
          window.dispatchEvent(memberUpdateEvent);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "membership_registrations",
        },
        () => {
          console.log("Real-time: New member registration");
          fetchPendingRegistrations();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "membership_registrations",
        },
        () => {
          console.log("Real-time: Member registration deleted");
          fetchPendingRegistrations();
        },
      )
      // Disbursement changes
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "disbursements" },
        () => {
          console.log("Real-time: Disbursement inserted");
          fetchPendingRegistrations();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "disbursements" },
        () => {
          console.log("Real-time: Disbursement updated");
          fetchPendingRegistrations();
        },
      )
      // Member balance changes
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "member_balances" },
        () => {
          console.log("Real-time: Member balance updated");
          fetchPendingRegistrations();
        },
      )
      .subscribe();

    // Listen for member updates from other parts of the application
    const handleMemberUpdate = (event: CustomEvent) => {
      console.log("Cross-portal sync: Member update received", event.detail);
      fetchPendingRegistrations();
    };

    window.addEventListener(
      "memberUpdated",
      handleMemberUpdate as EventListener,
    );

    return () => {
      try {
        supabase.removeChannel(channel);
        window.removeEventListener(
          "memberUpdated",
          handleMemberUpdate as EventListener,
        );
      } catch (_) {}
    };
  }, []);

  // Role-based access is now handled by routes

  const fetchPendingRegistrations = async () => {
    try {
      // Fetch MPESA payments - only show completed payments to admin
      const { data: mpesaData, error: mpesaError } = await supabase
        .from("mpesa_payments")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (mpesaError) throw mpesaError;

      // Fetch member details for MPESA payments
      const mpesaWithMembers = await Promise.all(
        (mpesaData || []).map(async (payment) => {
          const { data: memberData } = await supabase
            .from("membership_registrations")
            .select("firstName, lastName, tnsNumber, email")
            .eq("id", payment.member_id)
            .single();

          return {
            ...payment,
            membership_registrations: memberData || null,
          };
        }),
      );

      // Fetch contributions
      const { data: contributionsData, error: contributionsError } =
        await supabase
          .from("contributions")
          .select("*")
          .order("contribution_date", { ascending: false });

      if (contributionsError) throw contributionsError;

      // Fetch disbursements
      const { data: disbursementsData, error: disbursementsError } =
        await supabase
          .from("disbursements")
          .select("*")
          .order("disbursement_date", { ascending: false });

      if (disbursementsError) throw disbursementsError;

      // Fetch monthly expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("monthly_expenses")
        .select("*")
        .order("expenseDate", { ascending: false });

      if (expensesError) throw expensesError;

      // setMpesaPayments(mpesaWithMembers || []);
      // setContributions(contributionsData || []);
      // setDisbursements(disbursementsData || []);
      // setMonthlyExpenses(expensesData || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load registrations");
    }
  };

  const openEditDialog = (member: Member) => {
    // Additional safety check - only allow admins to edit members
    if (user && user.userRole !== "admin") {
      toast.error("Access denied. Only Admins can edit members.", {
        description: "This action requires Administrator privileges.",
        duration: 5000,
      });
      return;
    }

    setMemberToEdit(member);
    setEditFormData({ ...member });
    setIsEditDialogOpen(true);
  };

  const updateMember = async () => {
    if (!memberToEdit || !editFormData) return;

    // Validate required fields
    if (
      !editFormData.firstName?.trim() ||
      !editFormData.lastName?.trim() ||
      !editFormData.email?.trim() ||
      !editFormData.phone?.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email!)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone number format - more flexible validation
    const phoneClean = editFormData.phone!.replace(/[\s\-\(\)\.]/g, ""); // Remove spaces, dashes, parentheses, dots
    const phoneRegex = /^[\+]?[0-9]{7,15}$/; // Allow +, 7-15 digits, more flexible

    console.log("Phone validation:", {
      original: editFormData.phone,
      cleaned: phoneClean,
      passes: phoneRegex.test(phoneClean),
    });

    if (!phoneRegex.test(phoneClean)) {
      toast.error(
        `Please enter a valid phone number (7-15 digits, optionally starting with +). You entered: "${editFormData.phone}"`,
        { duration: 8000 },
      );
      return;
    }

    // Validate emergency contact phone number if provided
    if (editFormData.emergencyContactPhone?.trim()) {
      const emergencyPhoneClean = editFormData.emergencyContactPhone.replace(
        /[\s\-\(\)\.]/g,
        "",
      );
      if (!phoneRegex.test(emergencyPhoneClean)) {
        toast.error(
          "Please enter a valid emergency contact phone number (7-15 digits, optionally starting with +)",
        );
        return;
      }
    }

    // Validate alternative phone number if provided
    if (editFormData.alternativePhone?.trim()) {
      const altPhoneClean = editFormData.alternativePhone.replace(
        /[\s\-\(\)\.]/g,
        "",
      );
      if (!phoneRegex.test(altPhoneClean)) {
        toast.error(
          "Please enter a valid alternative phone number (7-15 digits, optionally starting with +)",
        );
        return;
      }
    }

    setIsUpdating(true);

    try {
      // Prepare update data
      const updateData = {
        firstName: editFormData.firstName?.trim(),
        lastName: editFormData.lastName?.trim(),
        email: editFormData.email?.trim(),
        phone: editFormData.phone?.trim(),
        alternativePhone: editFormData.alternativePhone?.trim() || null,
        address: editFormData.address?.trim(),
        city: editFormData.city?.trim(),
        state: editFormData.state?.trim(),
        zipCode: editFormData.zipCode?.trim(),
        idNumber: editFormData.idNumber?.trim() || null,
        emergencyContactName: editFormData.emergencyContactName?.trim(),
        emergencyContactPhone: editFormData.emergencyContactPhone?.trim(),
        sex: editFormData.sex || null,
        maritalStatus: editFormData.maritalStatus || null,
        membershipType: editFormData.membershipType,
        registrationStatus: editFormData.registrationStatus,
        paymentStatus: editFormData.paymentStatus,
        maturityStatus: editFormData.maturityStatus || null,
        mpesaPaymentReference:
          editFormData.mpesaPaymentReference?.trim() || null,
      };

      console.log(
        `Updating member: ${editFormData.firstName} ${editFormData.lastName} (ID: ${memberToEdit.id})`,
      );

      // Update member in database with automatic sync across all portals
      const { error: updateError, data: updatedMember } = await supabase
        .from("membership_registrations")
        .update(updateData)
        .eq("id", memberToEdit.id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log(
        `Successfully updated member: ${editFormData.firstName} ${editFormData.lastName}`,
      );

      // Trigger cross-portal synchronization events
      console.log("Triggering cross-portal synchronization...");

      // 1. Broadcast to all open tabs/windows
      const syncEvent = new CustomEvent("memberDataChanged", {
        detail: {
          action: "UPDATE",
          memberId: memberToEdit.id,
          updatedData: updatedMember,
          timestamp: new Date().toISOString(),
          updatedBy: user ? `${user.firstName} ${user.lastName}` : "Admin",
        },
      });
      window.dispatchEvent(syncEvent);

      // 2. Broadcast via localStorage for cross-tab communication
      localStorage.setItem(
        "memberUpdate",
        JSON.stringify({
          action: "UPDATE",
          memberId: memberToEdit.id,
          timestamp: new Date().toISOString(),
          trigger: "admin-edit",
        }),
      );
      localStorage.removeItem("memberUpdate"); // Remove immediately to trigger storage event

      // 3. Update related data that might be affected by member changes
      if (editFormData.registrationStatus !== memberToEdit.registrationStatus) {
        console.log(
          "Registration status changed - updating related records...",
        );
        // If status changed to approved, ensure TNS number is assigned
        if (editFormData.registrationStatus === "approved") {
          console.log(
            "New approved member - TNS number should be auto-assigned by database trigger",
          );
        }
      }

      // 4. Update member balances if payment status changed
      if (editFormData.paymentStatus !== memberToEdit.paymentStatus) {
        console.log("Payment status changed - refreshing member balances...");
        const { error: balanceError } = await supabase
          .from("member_balances")
          .upsert(
            {
              member_id: memberToEdit.id,
              current_balance: 0,
              total_contributions: 0,
              total_disbursements: 0,
              last_updated: new Date().toISOString(),
            },
            {
              onConflict: "member_id",
            },
          );

        if (balanceError) {
          console.warn(
            "Warning: Could not update member balance:",
            balanceError,
          );
        }
      }

      // 5. Invalidate any cached data in other systems
      console.log("Invalidating cached data across all portals...");

      // Show success message
      toast.success(
        `✅ Member ${editFormData.firstName} ${editFormData.lastName} updated successfully!`,
        {
          description: `Changes synced across all portals and systems automatically.`,
          duration: 6000,
        },
      );

      // Close dialog and reset form
      setIsEditDialogOpen(false);
      setMemberToEdit(null);
      setEditFormData({});

      // Comprehensive data refresh across all systems
      console.log("Performing comprehensive system-wide data refresh...");

      // Refresh AdminPortal data
      await fetchPendingRegistrations();

      // Trigger refresh in other portals via custom events
      const refreshEvent = new CustomEvent("refreshAllPortals", {
        detail: {
          source: "AdminPortal",
          reason: "Member data updated",
          affectedMemberId: memberToEdit.id,
        },
      });
      window.dispatchEvent(refreshEvent);

      // Log comprehensive audit trail
      const auditData = {
        action: "MEMBER_UPDATE",
        memberId: memberToEdit.id,
        memberName: `${editFormData.firstName} ${editFormData.lastName}`,
        memberEmail: editFormData.email,
        updatedBy: user
          ? `${user.firstName} ${user.lastName} (${user.userRole})`
          : "Admin",
        timestamp: new Date().toISOString(),
        changes: {
          before: memberToEdit,
          after: updatedMember,
        },
        syncStatus: "SUCCESS",
      };

      console.log("Audit Trail:", auditData);

      // Optional: Send audit data to logging service (future enhancement)
      // Note: audit_logs table would need to be created first
      console.log("Audit data prepared for future logging:", {
        table_name: "membership_registrations",
        record_id: memberToEdit.id,
        action: "UPDATE",
        old_data: memberToEdit,
        new_data: updatedMember,
        user_id: user?.id || null,
        staff_user_id: user?.id || null,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error updating member:", error);

      let errorMessage = "Failed to update member.";
      if (error.message?.includes("duplicate key")) {
        errorMessage =
          "Email or phone number already exists for another member.";
      } else if (error.message?.includes("permission")) {
        errorMessage = "You don't have permission to update this member.";
      } else if (error.message?.includes("not found")) {
        errorMessage = "Member not found - may have been deleted.";
      }

      toast.error(errorMessage, {
        description: "Please try again or contact technical support.",
        duration: 7000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openDeleteDialog = (member: Member) => {
    // Additional safety check - only allow admins to delete members
    if (user && user.userRole !== "admin") {
      toast.error("Access denied. Only Admins can delete members.", {
        description: "This action requires Administrator privileges.",
        duration: 5000,
      });
      return;
    }

    setMemberToDelete(member);
    setDeleteConfirmation(""); // Reset confirmation text
    setIsDeleteDialogOpen(true);
  };

  const handleLogout = () => {
    if (user) {
      signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } else {
      navigate("/dashboard");
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    const toastId = toast.loading(
      "Generating " + format.toUpperCase() + " export...",
    );

    try {
      // ===================== PDF (UNCHANGED) =====================
      if (format === "pdf") {
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 40;
        const marginTop = 60;

        const title = "Team No Struggle — Members Report";
        const subTitle = `Generated: ${new Date().toLocaleString()}`;

        const header = () => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.text(title, pageWidth / 2, 30, { align: "center" });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(subTitle, pageWidth / 2, 48, { align: "center" });
        };

        const footer = (currentPage: number, totalPages: number) => {
          doc.setFontSize(9);
          doc.setTextColor(120);
          doc.text(
            `Page ${currentPage} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 15,
            { align: "center" },
          );
        };

        const rows = (members || []).map((m) => [
          `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim(),
          m.user.email || "",
          m.user.phone || "",
          m.city || "",
          m.state || "",
          m.tnsNumber || "-",
          m.registrationStatus || "-",
          m.paymentStatus || "-",
          m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "-",
        ]);

        autoTable(doc, {
          head: [
            [
              "Name",
              "Email",
              "Phone",
              "City",
              "State",
              "TNS #",
              "Reg. Status",
              "Payment",
              "Reg. Date",
            ],
          ],
          body: rows,
          startY: marginTop,
          margin: { left: marginX, right: marginX, top: marginTop, bottom: 30 },
          styles: { fontSize: 9, cellPadding: 6, valign: "middle" },
          headStyles: {
            fillColor: [34, 139, 230],
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          didDrawPage: () => {
            header();
          },
        } as any);

        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          footer(i, totalPages);
        }

        const date = new Date().toISOString().split("T")[0];
        doc.save(`members_report_${date}.pdf`);
        toast.success("PDF exported successfully!", { id: toastId });
        return;
      }

      // ===================== CSV & EXCEL (CLIENT SIDE) =====================
      const data = (members || []).map((m) => ({
        Name: `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim(),
        Email: m.user.email || "",
        Phone: m.user.phone || "",
        City: m.city || "",
        State: m.state || "",
        "TNS #": m.tnsNumber || "-",
        "Reg. Status": m.registrationStatus || "-",
        Payment: m.paymentStatus || "-",
        "Reg. Date": m.createdAt
          ? new Date(m.createdAt).toLocaleDateString()
          : "-",
      }));

      const date = new Date().toISOString().split("T")[0];

      // ---------- CSV ----------
      if (format === "csv") {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `members_export_${date}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("CSV exported successfully!", { id: toastId });
        return;
      }

      // ---------- EXCEL ----------
      if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

        XLSX.writeFile(workbook, `members_export_${date}.xlsx`);

        toast.success("Excel exported successfully!", { id: toastId });
        return;
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export " + format.toUpperCase() + " file", {
        id: toastId,
      });
    } finally {
      try {
        toast.dismiss(toastId);
      } catch (_) {}
    }
  };

  const handleTreasurerExport = async (format: "csv" | "excel" | "pdf") => {
    const toastId = toast.loading(
      "Generating treasurer " + format.toUpperCase() + " report...",
    );
    try {
      // Generate sample financial data for the report
      const financialSummary = {
        totalMembers: members.length,
        totalContributions: 2450000,
        totalDisbursements: 1850000,
        monthlyExpenses: 125000,
        netPosition: 600000,
        avgMonthlyContribution: 2450000 / 6,
        avgDisbursement: 1850000 / 12,
        contributionGrowth: 15.2,
        expenseRatio: 5.1,
        liquidityRatio: 4.8,
      };

      const monthlyData = [
        {
          month: "January 2024",
          members: 85,
          contributions: 180000,
          disbursements: 120000,
          expenses: 15000,
          growth: 8.5,
        },
        {
          month: "February 2024",
          members: 92,
          contributions: 210000,
          disbursements: 150000,
          expenses: 15000,
          growth: 16.7,
        },
        {
          month: "March 2024",
          members: 89,
          contributions: 190000,
          disbursements: 140000,
          expenses: 15000,
          growth: -9.5,
        },
        {
          month: "April 2024",
          members: 105,
          contributions: 250000,
          disbursements: 180000,
          expenses: 15000,
          growth: 31.6,
        },
        {
          month: "May 2024",
          members: 118,
          contributions: 280000,
          disbursements: 200000,
          expenses: 15000,
          growth: 12.0,
        },
        {
          month: "June 2024",
          members: 125,
          contributions: 320000,
          disbursements: 250000,
          expenses: 15000,
          growth: 14.3,
        },
      ];

      // Nicely formatted PDF export (client-side) for treasurer report
      if (format === "pdf") {
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: "a4",
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const title = "Team No Struggle — Treasurer Report";
        const subTitle = `Generated: ${new Date().toLocaleString()}  •  By: ${user ? user.firstName + " " + user.lastName : "Admin"}`;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(title, pageWidth / 2, 30, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(subTitle, pageWidth / 2, 48, { align: "center" });

        // Summary cards (as a table)
        const summaryRows = [
          ["Total Members", String(financialSummary.totalMembers)],
          [
            "Total Contributions",
            `KES ${financialSummary.totalContributions.toLocaleString()}`,
          ],
          [
            "Total Disbursements",
            `KES ${financialSummary.totalDisbursements.toLocaleString()}`,
          ],
          [
            "Monthly Expenses",
            `KES ${financialSummary.monthlyExpenses.toLocaleString()}`,
          ],
          [
            "Net Position",
            `KES ${financialSummary.netPosition.toLocaleString()}`,
          ],
          [
            "Avg Monthly Contribution",
            `KES ${Math.round(financialSummary.avgMonthlyContribution).toLocaleString()}`,
          ],
          [
            "Avg Disbursement",
            `KES ${Math.round(financialSummary.avgDisbursement).toLocaleString()}`,
          ],
          ["Contribution Growth", `${financialSummary.contributionGrowth}%`],
          ["Expense Ratio", `${financialSummary.expenseRatio}%`],
          ["Liquidity Ratio", `${financialSummary.liquidityRatio}`],
        ];

        autoTable(doc, {
          head: [["Metric", "Value"]],
          body: summaryRows,
          startY: 70,
          styles: { fontSize: 10, cellPadding: 6 },
          headStyles: {
            fillColor: [34, 139, 230],
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 40, right: 40 },
        } as any);

        // Monthly breakdown table
        const breakdownRows = monthlyData.map((d) => [
          d.month,
          String(d.members),
          `KES ${d.contributions.toLocaleString()}`,
          `KES ${d.disbursements.toLocaleString()}`,
          `KES ${d.expenses.toLocaleString()}`,
          `${d.growth}%`,
        ]);

        autoTable(doc, {
          head: [
            [
              "Month",
              "Members",
              "Contributions",
              "Disbursements",
              "Expenses",
              "Growth",
            ],
          ],
          body: breakdownRows,
          startY: (doc as any).lastAutoTable.finalY + 20,
          styles: { fontSize: 9, cellPadding: 6 },
          headStyles: {
            fillColor: [22, 163, 74],
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [247, 253, 247] },
          margin: { left: 40, right: 40, bottom: 30 },
        } as any);

        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(9);
          doc.setTextColor(120);
          doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 15,
            { align: "center" },
          );
        }

        const date = new Date().toISOString().split("T")[0];
        doc.save(`TNS_Treasurer_Report_${date}.pdf`);
        toast.success("Treasurer PDF exported successfully!", { id: toastId });
        return;
      }

      // Otherwise, use edge function (CSV/Excel)
      const response = await fetch(
        "https://wfqgnshhlfuznabweofj.supabase.co/functions/v1/export-treasurer-report",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcWduc2hobGZ1em5hYndlb2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTE0MzgsImV4cCI6MjA3MDgyNzQzOH0.EsPr_ypf7B1PXTWmjS2ZGXDVBe7HeNHDWsvJcgQpkLA",
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcWduc2hobGZ1em5hYndlb2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTE0MzgsImV4cCI6MjA3MDgyNzQzOH0.EsPr_ypf7B1PXTWmjS2ZGXDVBe7HeNHDWsvJcgQpkLA",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: financialSummary,
            monthlyData: monthlyData,
            generatedBy: user ? user.firstName + " " + user.lastName : "Admin",
            generatedAt: new Date().toISOString(),
          }),
        },
      );

      if (!response.ok) throw new Error("Treasurer report export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const date = new Date().toISOString().split("T")[0];
      const extension = format === "excel" ? "xls" : "csv";
      a.download = "TNS_Treasurer_Report_" + date + "." + extension;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        "Treasurer " +
          format.toUpperCase() +
          " report downloaded successfully!",
        { id: toastId },
      );
    } catch (error) {
      console.error("Treasurer export error:", error);
      toast.error(
        "Failed to export treasurer " + format.toUpperCase() + " report",
        { id: toastId },
      );
    } finally {
      try {
        toast.dismiss(toastId);
      } catch (_) {}
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950">
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                  Admin Control Center
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Complete administrative oversight and management
                  </p>
                  {user && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700"
                      >
                        {user.firstName} {user.lastName} • {user.userRole}
                      </Badge>
                    </div>
                  )}
                  {user && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {user?.email}
                    </Badge>
                  )}
                </div>
                <ContributionTypeForm/>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate(user ? "/dashboard" : "/auth")}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Back to {user ? "Dashboard" : "Portal Login"}
              </Button>
              {user && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Tabs Navigation */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-2 mb-8">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
              <TabsTrigger
                value="analytics"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-md py-3 px-4"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value="treasurer"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-md py-3 px-4"
              >
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Treasurer</span>
              </TabsTrigger>
              <TabsTrigger
                value="pending-members"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-md py-3 px-4 relative"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">Pending Members</span>
                {pendingMembers.length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingMembers.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="all-members"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-md py-3 px-4"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">All Members</span>
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full"
                >
                  {members && members.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="pending-staff"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-md py-3 px-4"
              >
                <Shield className="h-4 w-4" />
                <span className="font-medium">Pending Staff</span>
                {pendingStaff.length > 0 && (
                  <Badge className="ml-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingStaff.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="all-staff"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-slate-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-md py-3 px-4"
              >
                <Shield className="h-4 w-4" />
                <span className="font-medium">All Staff</span>
                <Badge
                  variant="secondary"
                  className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full"
                >
                  {staffs.isSuccess && staffs.data.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-8">
              {/* Analytics Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                    System Analytics & Insights
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    Real-time data visualization and organizational metrics
                  </p>
                </div>
              </div>

              <div className="grid gap-8">
                {/* Enhanced Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Total Members
                      </CardTitle>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                        {!loadingMembers && members.length}
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {pendingMembers.length} pending approval
                      </p>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${!loadingMembers && Math.min((members.length / 100) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800 hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        Approved Members
                      </CardTitle>
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full group-hover:scale-110 transition-transform">
                        <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
                        {!loadingMembers &&
                          members.filter(
                            (m) => m.registrationStatus === "approved",
                          ).length}
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {!loadingMembers &&
                          (
                            (members.filter(
                              (m) => m.registrationStatus === "approved",
                            ).length /
                              members?.length) *
                              100 || 0
                          ).toFixed(1)}
                        % approval rate
                      </p>
                      <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(!loadingMembers && (members.filter((m) => m.registrationStatus === "approved").length / members.length) * 100) || 0}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        Total Staff
                      </CardTitle>
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full group-hover:scale-110 transition-transform">
                        <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">
                        {staffs.isSuccess && staffs.data.length}
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        {pendingStaff.length} pending approval
                      </p>
                      <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${staffs.isSuccess ? Math.min((staffs.data.length / 20) * 100, 100) : 0}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                        Payment Rate
                      </CardTitle>
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full group-hover:scale-110 transition-transform">
                        <PieChart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">
                        {(!loadingMembers &&
                          Math.round(
                            (members.filter((m) => m.paymentStatus === "paid")
                              .length /
                              members.length) *
                              100,
                          )) ||
                          0}
                        %
                      </div>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        {!loadingMembers &&
                          members.filter((m) => m.paymentStatus === "paid")
                            .length}{" "}
                        members paid
                      </p>
                      <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(!loadingMembers && Math.round((members.filter((m) => m.paymentStatus === "paid").length / members.length) * 100)) || 0}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Charts Grid */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Data Visualization & Trends
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Interactive charts and analytics for better decision
                      making
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enhanced Registration Status Distribution */}
                    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full">
                            <PieChart className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              Registration Status Distribution
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              Current breakdown of member registration statuses
                            </CardDescription>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                              {!loadingMembers &&
                                members.filter(
                                  (m) => m.registrationStatus === "approved",
                                ).length}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-500">
                              Approved
                            </div>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                              {!loadingMembers &&
                                members.filter(
                                  (m) => m.registrationStatus === "pending",
                                ).length}
                            </div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-500">
                              Pending
                            </div>
                          </div>
                          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                              {!loadingMembers &&
                                members.filter(
                                  (m) => m.registrationStatus === "rejected",
                                ).length}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-500">
                              Rejected
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            approved: {
                              label: "Approved",
                              color: "hsl(142, 76%, 36%)",
                            },
                            pending: {
                              label: "Pending",
                              color: "hsl(45, 93%, 47%)",
                            },
                            rejected: {
                              label: "Rejected",
                              color: "hsl(0, 84%, 60%)",
                            },
                          }}
                          className="h-[350px]"
                        >
                          <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Pie
                              dataKey="value"
                              data={[
                                {
                                  name: "approved",
                                  value: members.filter(
                                    (m) => m.registrationStatus === "approved",
                                  ).length,
                                  fill: "hsl(142, 76%, 36%)",
                                },
                                {
                                  name: "pending",
                                  value: members.filter(
                                    (m) => m.registrationStatus === "pending",
                                  ).length,
                                  fill: "hsl(45, 93%, 47%)",
                                },
                                {
                                  name: "rejected",
                                  value: members.filter(
                                    (m) => m.registrationStatus === "rejected",
                                  ).length,
                                  fill: "hsl(0, 84%, 60%)",
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              innerRadius={50}
                              paddingAngle={2}
                            >
                              {[
                                {
                                  name: "approved",
                                  value: members.filter(
                                    (m) => m.registrationStatus === "approved",
                                  ).length,
                                  fill: "hsl(142, 76%, 36%)",
                                },
                                {
                                  name: "pending",
                                  value: members.filter(
                                    (m) => m.registrationStatus === "pending",
                                  ).length,
                                  fill: "hsl(45, 93%, 47%)",
                                },
                                {
                                  name: "rejected",
                                  value: members.filter(
                                    (m) => m.registrationStatus === "rejected",
                                  ).length,
                                  fill: "hsl(0, 84%, 60%)",
                                },
                              ].map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.fill}
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                              ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent />} />
                          </RechartsPieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Enhanced Membership Type Distribution */}
                    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              Membership Type Distribution
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              Individual vs Family membership breakdown
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            individual: {
                              label: "Individual",
                              color: "hsl(217, 91%, 60%)",
                            },
                            family: {
                              label: "Family",
                              color: "hsl(142, 76%, 36%)",
                            },
                          }}
                          className="h-[350px]"
                        >
                          <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Pie
                              dataKey="value"
                              data={[
                                {
                                  name: "individual",
                                  value: members.filter(
                                    (m) => m.membershipType === "individual",
                                  ).length,
                                  fill: "hsl(217, 91%, 60%)",
                                },
                                {
                                  name: "family",
                                  value: members.filter(
                                    (m) => m.membershipType === "family",
                                  ).length,
                                  fill: "hsl(142, 76%, 36%)",
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              innerRadius={50}
                              paddingAngle={2}
                            >
                              {[
                                {
                                  name: "individual",
                                  value: members.filter(
                                    (m) => m.membershipType === "individual",
                                  ).length,
                                  fill: "hsl(217, 91%, 60%)",
                                },
                                {
                                  name: "family",
                                  value: members.filter(
                                    (m) => m.membershipType === "family",
                                  ).length,
                                  fill: "hsl(142, 76%, 36%)",
                                },
                              ].map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.fill}
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                              ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent />} />
                          </RechartsPieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pending-members" className="space-y-6">
              {/* Pending Members Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                    Pending Member Applications
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    Review, verify, and approve new member registrations
                  </p>
                  {pendingMembers.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-700">
                        {pendingMembers.length} applications awaiting review
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Card className="bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/10 border-orange-200 dark:border-orange-800 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-b border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-orange-900 dark:text-orange-100">
                          Member Registration Review
                        </CardTitle>
                        <CardDescription className="text-orange-700 dark:text-orange-300">
                          Carefully review member details and approve qualified
                          applications
                        </CardDescription>
                      </div>
                    </div>
                    {pendingMembers.length > 0 && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                          {pendingMembers.length}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          Pending Reviews
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {pendingMembers.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                        <UserCheck className="h-16 w-16 text-green-500 dark:text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        All Applications Reviewed!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                        No pending member registrations require your attention
                        at this time.
                      </p>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 text-sm"
                      >
                        System Up to Date
                      </Badge>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-orange-200 dark:border-orange-700 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
                          <TableRow className="border-orange-200 dark:border-orange-800">
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300 py-4">
                              Profile
                            </TableHead>
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300">
                              Member Details
                            </TableHead>
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300">
                              Contact Info
                            </TableHead>
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300">
                              Address
                            </TableHead>
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300">
                              ID Number
                            </TableHead>
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300">
                              Emergency Contact
                            </TableHead>
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300">
                              Membership Type
                            </TableHead>
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300">
                              MPESA Ref
                            </TableHead>
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300">
                              Registration Date
                            </TableHead>
                            <TableHead className="font-semibold text-orange-800 dark:text-orange-300 text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingMembers.map((member, index) => (
                            <TableRow
                              key={member.id}
                              className={`hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors border-orange-100 dark:border-orange-900 ${
                                index % 2 === 0
                                  ? "bg-white dark:bg-gray-900"
                                  : "bg-orange-25 dark:bg-orange-950/10"
                              }`}
                            >
                              <TableCell className="py-4">
                                <div className="relative">
                                  <Avatar className="h-12 w-12 border-2 border-orange-200 dark:border-orange-700">
                                    <AvatarImage
                                      src={`/uploads/${member.user?.photo || undefined} `}
                                      alt={
                                        member.user?.firstName +
                                        " " +
                                        member.user?.lastName
                                      }
                                    />
                                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold">
                                      {member.user?.firstName?.charAt(0)}
                                      {member.user?.lastName?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                    {member.user?.firstName}{" "}
                                    {member.user?.lastName}
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs capitalize border-gray-300 text-gray-600"
                                    >
                                      {member.sex || "N/A"}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs capitalize border-gray-300 text-gray-600"
                                    >
                                      {member.maritalStatus || "N/A"}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {member.user?.email}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {member.user?.phone}
                                    </div>
                                    {member.alternativePhone && (
                                      <div className="text-xs text-gray-500 dark:text-gray-500">
                                        Alt: {member.alternativePhone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {member?.address ?? "N/A"}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">
                                    {member?.city}, {member?.state}{" "}
                                    {member?.zipCode}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {member.idNumber || "N/A"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    {member?.emergencyContactName ?? "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {member?.emergencyContactPhone ?? "N/A"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs"
                                  >
                                    {member.membershipType}
                                  </Badge>
                                  <Badge
                                    variant={
                                      member.paymentStatus === "paid"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={`text-xs ${
                                      member.paymentStatus === "paid"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    }`}
                                  >
                                    {member?.paymentStatus ?? "-"}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-mono text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {member?.mpesaPaymentReference || "—"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {new Date(
                                      member.createdAt,
                                    ).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500">
                                    {new Date(
                                      member.createdAt,
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col space-y-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      approveMember.mutate(member.id)
                                    }
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 w-full"
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      rejectMember.mutate(member.id)
                                    }
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 w-full"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all-members">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Members</CardTitle>
                      <CardDescription>
                        View all registered members and their status
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleExport("csv")}
                        variant="outline"
                        size="sm"
                      >
                        <File className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button
                        onClick={() => handleExport("excel")}
                        variant="outline"
                        size="sm"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                      <Button
                        onClick={() => handleExport("pdf")}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No members registered yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Profile</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone/Alt Phone</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>ID Number</TableHead>
                          <TableHead>Emergency Contact</TableHead>
                          <TableHead>Membership</TableHead>
                          <TableHead>Maturity Status</TableHead>
                          <TableHead>TNS Number</TableHead>
                          <TableHead>MPESA Ref</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={`/uploads/${member.user?.photo || undefined}`}
                                  alt={
                                    member.user?.firstName +
                                    " " +
                                    member.user?.lastName
                                  }
                                />
                                <AvatarFallback>
                                  {member.user?.firstName?.charAt(0)}
                                  {member.user?.lastName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                {member.user?.firstName} {member.user?.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.sex || "N/A"},{" "}
                                {member.maritalStatus || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>{member.user?.email}</TableCell>
                            <TableCell>
                              <div>{member.user?.phone}</div>
                              {member.alternativePhone && (
                                <div className="text-sm text-muted-foreground">
                                  Alt: {member.alternativePhone}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{member?.address ?? "N/A"}</div>
                                <div>
                                  {member?.city}, {member.state}{" "}
                                  {member?.zipCode}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {member?.idNumber || "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">
                                  {member?.emergencyContactName}
                                </div>
                                <div className="text-muted-foreground">
                                  {member?.emergencyContactPhone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="outline" className="capitalize">
                                  {member?.membershipType}
                                </Badge>
                                <div className="text-sm">
                                  <Badge
                                    className="capitalize"
                                    variant={
                                      member?.paymentStatus === "paid"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {member?.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge
                                  className="capitalize"
                                  variant={
                                    member.maturityStatus === "matured"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {member.maturityStatus || "probation"}
                                </Badge>
                                {member.daysToMaturity !== undefined &&
                                  member.daysToMaturity > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      {member.daysToMaturity} days left
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {member?.tnsNumber || "Not assigned"}
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {member.mpesaPaymentReference || "—"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className="capitalize"
                                variant={
                                  member.registrationStatus === "approved"
                                    ? "default"
                                    : member.registrationStatus === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {member.registrationStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(member.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center space-x-2">
                                {user && user?.userRole === "admin" ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditDialog(member)}
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/20 transition-colors"
                                      title={`Edit ${member.user?.firstName} ${member.user?.lastName}`}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openDeleteDialog(member)}
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20 transition-colors"
                                      title={`Delete ${member.user?.firstName} ${member.user?.lastName}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-600">
                                    Admin Only
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending-staff">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Staff Registrations</CardTitle>
                  <CardDescription>
                    Review and approve staff applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingStaff.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending staff registrations
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Requested Role</TableHead>
                          <TableHead>Current Role</TableHead>
                          <TableHead>Assigned Area</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingStaff.map((staff) => (
                          <TableRow key={staff.id}>
                            <TableCell className="font-medium">
                              {staff.firstName} {staff.lastName}
                            </TableCell>
                            <TableCell>{staff.email}</TableCell>
                            <TableCell>{staff?.phone ?? "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {staff?.requestedRole ?? "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="bg-green-900 hover:bg-black"
                              >
                                {staff?.userRole}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {staff?.assignedArea || "N/A"}
                            </TableCell>
                            <TableCell>
                              {new Date(staff?.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => openPasswordDialog(staff)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Key className="h-4 w-4 mr-1" />
                                  Approve & Set Password
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => rejectStaff.mutate(staff.id)}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all-staff">
              <Card>
                <CardHeader>
                  <CardTitle>All Staff</CardTitle>
                  <CardDescription>
                    View all registered staff and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {staffs.isSuccess && staffs.data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No staff registered yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Assigned Area</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          {/* <TableHead>Actions</TableHead> */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffs.isSuccess &&
                          staffs.data.map((staff) => (
                            <TableRow key={staff.id}>
                              <TableCell className="font-medium">
                                {staff.firstName} {staff.lastName}
                              </TableCell>
                              <TableCell>{staff.email}</TableCell>
                              <TableCell>{staff.phone ?? "N/A"}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {staff?.userRole}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {staff.assignedArea || "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    staff?.approval === "approved"
                                      ? "default"
                                      : staff?.approval === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {staff?.approval || "pending"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(staff.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treasurer">
              <div className="space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-primary">
                    Financial Management Center
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Comprehensive financial oversight and transaction management
                  </p>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 mx-auto rounded-full"></div>
                </div>

                {/* Quick Actions Forms */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Quick Financial Actions
                    </CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                      Manage payments, disbursements, and expenses efficiently
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div className="bg-white grid-cols-1 flex items-center justify-center dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                        <ManualPaymentEntry />
                      </div>
                      <div className="bg-white grid-cols-2 w-full dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                        <BalanceDebugTable />
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                        <ExpenditureForm
                          onSuccess={fetchPendingRegistrations}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Disbursement Management */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                      <UserMinus className="h-5 w-5" />
                      Enhanced Disbursement Management
                    </CardTitle>
                    <CardDescription className="text-indigo-700 dark:text-indigo-300">
                      Advanced disbursement processing with bereavement form
                      generation and document management
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm">
                      <EnhancedDisbursementForm
                        onSuccess={fetchPendingRegistrations}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Member MPESA Payment Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      Member Payment Processing
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
                    >
                      Paybill: 4148511
                    </Badge>
                  </div>
                  <MemberMPESAPayment />
                </div>

                {/* Enhanced Financial Summary Cards */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      Financial Overview
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {new Date().toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200 group">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
                          Total Contributions
                        </CardTitle>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:scale-110 transition-transform">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                          KES{" "}
                          {contributions
                            .reduce(
                              (total, contrib) =>
                                total + Number(contrib.amount),
                              0,
                            )
                            .toLocaleString()}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {contributions.length} total contributions
                        </p>
                        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-200 group">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                          Total Disbursements
                        </CardTitle>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full group-hover:scale-110 transition-transform">
                          <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                          KES{" "}
                          {disbursements
                            .reduce(
                              (total, disb) => total + Number(disb.amount),
                              0,
                            )
                            .toLocaleString()}
                        </div>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          {disbursements.length} disbursements made
                        </p>
                        <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2 mt-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: "65%" }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`bg-gradient-to-br ${contributions.reduce((total, contrib) => total + Number(contrib.amount), 0) - disbursements.reduce((total, disb) => total + Number(disb.amount), 0) - monthlyExpenses.reduce((total, exp) => total + Number(exp.amount), 0) >= 0 ? "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800" : "from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800"} hover:shadow-lg transition-all duration-200 group`}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle
                          className={`text-sm font-semibold ${contributions.reduce((total, contrib) => total + Number(contrib.amount), 0) - disbursements.reduce((total, disb) => total + Number(disb.amount), 0) - monthlyExpenses.reduce((total, exp) => total + Number(exp.amount), 0) >= 0 ? "text-blue-700 dark:text-blue-300" : "text-red-700 dark:text-red-300"}`}
                        >
                          Net Position
                        </CardTitle>
                        <div
                          className={`p-2 ${contributions.reduce((total, contrib) => total + Number(contrib.amount), 0) - disbursements.reduce((total, disb) => total + Number(disb.amount), 0) - monthlyExpenses.reduce((total, exp) => total + Number(exp.amount), 0) >= 0 ? "bg-blue-100 dark:bg-blue-900/30" : "bg-red-100 dark:bg-red-900/30"} rounded-full group-hover:scale-110 transition-transform`}
                        >
                          <Calculator
                            className={`h-4 w-4 ${contributions.reduce((total, contrib) => total + Number(contrib.amount), 0) - disbursements.reduce((total, disb) => total + Number(disb.amount), 0) - monthlyExpenses.reduce((total, exp) => total + Number(exp.amount), 0) >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div
                          className={`text-2xl font-bold ${
                            contributions.reduce(
                              (total, contrib) =>
                                total + Number(contrib.amount),
                              0,
                            ) -
                              disbursements.reduce(
                                (total, disb) => total + Number(disb.amount),
                                0,
                              ) -
                              monthlyExpenses.reduce(
                                (total, exp) => total + Number(exp.amount),
                                0,
                              ) >=
                            0
                              ? "text-blue-800 dark:text-blue-200"
                              : "text-red-800 dark:text-red-200"
                          }`}
                        >
                          KES{" "}
                          {(
                            contributions.reduce(
                              (total, contrib) =>
                                total + Number(contrib.amount),
                              0,
                            ) -
                            disbursements.reduce(
                              (total, disb) => total + Number(disb.amount),
                              0,
                            ) -
                            monthlyExpenses.reduce(
                              (total, exp) => total + Number(exp.amount),
                              0,
                            )
                          ).toLocaleString()}
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            contributions.reduce(
                              (total, contrib) =>
                                total + Number(contrib.amount),
                              0,
                            ) -
                              disbursements.reduce(
                                (total, disb) => total + Number(disb.amount),
                                0,
                              ) -
                              monthlyExpenses.reduce(
                                (total, exp) => total + Number(exp.amount),
                                0,
                              ) >=
                            0
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {contributions.reduce(
                            (total, contrib) => total + Number(contrib.amount),
                            0,
                          ) -
                            disbursements.reduce(
                              (total, disb) => total + Number(disb.amount),
                              0,
                            ) -
                            monthlyExpenses.reduce(
                              (total, exp) => total + Number(exp.amount),
                              0,
                            ) >=
                          0
                            ? "Positive"
                            : "Negative"}{" "}
                          position
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-200 group">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                          Monthly Expenses
                        </CardTitle>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full group-hover:scale-110 transition-transform">
                          <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          KES{" "}
                          {monthlyExpenses
                            .reduce(
                              (total, exp) => total + Number(exp.amount),
                              0,
                            )
                            .toLocaleString()}
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          {monthlyExpenses.length} expense entries
                        </p>
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: "45%" }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800 hover:shadow-lg transition-all duration-200 group">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                          MPESA Payments
                        </CardTitle>
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-full group-hover:scale-110 transition-transform">
                          <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-teal-800 dark:text-teal-200">
                          KES{" "}
                          {mpesaPayments
                            .reduce(
                              (total, payment) =>
                                total + Number(payment.amount),
                              0,
                            )
                            .toLocaleString()}
                        </div>
                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                          {mpesaPayments.length} MPESA transactions
                        </p>
                        <div className="w-full bg-teal-200 dark:bg-teal-800 rounded-full h-2 mt-2">
                          <div
                            className="bg-teal-500 h-2 rounded-full"
                            style={{ width: "75%" }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Enhanced MPESA Payments Table */}
                <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50 border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          Recent MPESA Payments
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          Completed payment transactions from members via
                          Paybill 174379 • Showing latest{" "}
                          {Math.min(groupedMpesaPayments.length, 10)} of{" "}
                          {groupedMpesaPayments.length} members with successful
                          payments
                        </CardDescription>
                      </div>
                      {mpesaPayments.length > 10 && (
                        <Button variant="outline" size="sm" className="text-xs">
                          View All ({mpesaPayments.length})
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {groupedMpesaPayments.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <DollarSign className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No completed MPESA payments yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-3">
                          Only successful MPESA payment transactions will appear
                          here once members complete their payments.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg text-sm">
                          <strong>Paybill Number:</strong> 174379 • Payments are
                          processed via STK Push • Only completed transactions
                          shown
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                Member Details
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                TNS Number
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                Phone Number
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                Amount
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                MPESA Receipt
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                Status
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                Transaction Date
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {groupedMpesaPayments
                              .slice(0, 10)
                              .map((group, index) => (
                                <TableRow
                                  key={group.member_id}
                                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                    index % 2 === 0
                                      ? "bg-white dark:bg-gray-900"
                                      : "bg-slate-25 dark:bg-slate-900/25"
                                  }`}
                                >
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {
                                          group.membership_registrations
                                            ?.firstName
                                        }{" "}
                                        {
                                          group.membership_registrations
                                            ?.lastName
                                        }
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {group.membership_registrations
                                          ?.email || "No email"}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className="font-mono"
                                    >
                                      {group.membership_registrations
                                        ?.tnsNumber || "N/A"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                      {group.latest.phone_number}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-semibold text-green-700 dark:text-green-400">
                                      KES {group.totalAmount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {group.payments.length} contributions
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {group.payments
                                        .slice()
                                        .sort(
                                          (a, b) =>
                                            new Date(a.created_at).getTime() -
                                            new Date(b.created_at).getTime(),
                                        )
                                        .map((p, i) => (
                                          <Badge
                                            key={p.id}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            Contribution {i + 1}: KES{" "}
                                            {Number(p.amount).toLocaleString()}
                                          </Badge>
                                        ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        group.status === "completed"
                                          ? "default"
                                          : group.status === "pending"
                                            ? "secondary"
                                            : "destructive"
                                      }
                                      className={`${
                                        group.status === "completed"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                          : group.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                      }`}
                                    >
                                      {group.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium">
                                        {new Date(
                                          group.latest.created_at,
                                        ).toLocaleDateString()}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(
                                          group.latest.created_at,
                                        ).toLocaleTimeString()}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Financial Analysis Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      Financial Analysis
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        Live Data
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Updated {new Date().toLocaleTimeString()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enhanced Financial Overview */}
                    <Card className="lg:col-span-2 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/20 dark:via-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
                      <CardHeader>
                        <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          Comprehensive Financial Overview
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                          Real-time financial data with key performance
                          indicators
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                Total Contributions
                              </div>
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
                              KES{" "}
                              {contributions
                                .reduce(
                                  (total, contrib) =>
                                    total + Number(contrib.amount),
                                  0,
                                )
                                .toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400 mb-3">
                              From {contributions.length} transactions
                            </div>
                            <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: "85%" }}
                              ></div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                Total Disbursements
                              </div>
                              <DollarSign className="h-4 w-4 text-orange-500" />
                            </div>
                            <div className="text-3xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                              KES{" "}
                              {disbursements
                                .reduce(
                                  (total, disb) => total + Number(disb.amount),
                                  0,
                                )
                                .toLocaleString()}
                            </div>
                            <div className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                              From {disbursements.length} disbursements
                            </div>
                            <div className="w-full bg-orange-100 dark:bg-orange-900/30 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{ width: "65%" }}
                              ></div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                Total Expenses
                              </div>
                              <Calculator className="h-4 w-4 text-purple-500" />
                            </div>
                            <div className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-2">
                              KES{" "}
                              {monthlyExpenses
                                .reduce(
                                  (total, exp) => total + Number(exp.amount),
                                  0,
                                )
                                .toLocaleString()}
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400 mb-3">
                              From {monthlyExpenses.length} expense entries
                            </div>
                            <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: "45%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Enhanced Expense Categories */}
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                      <CardHeader>
                        <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          Expense Categories
                        </CardTitle>
                        <CardDescription className="text-purple-700 dark:text-purple-300">
                          Breakdown of operational spending
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(
                            monthlyExpenses.reduce(
                              (acc, expense) => {
                                acc[expense.expenseCategory] =
                                  (acc[expense.expenseCategory] || 0) +
                                  Number(expense.amount);
                                return acc;
                              },
                              {} as Record<string, number>,
                            ),
                          ).map(([category, amount], index) => {
                            const total = monthlyExpenses.reduce(
                              (total, exp) => total + Number(exp.amount),
                              0,
                            );
                            const percentage =
                              total > 0 ? (amount / total) * 100 : 0;
                            const colors = [
                              "bg-purple-500",
                              "bg-pink-500",
                              "bg-indigo-500",
                              "bg-blue-500",
                              "bg-cyan-500",
                            ];

                            return (
                              <div
                                key={category}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                                    ></div>
                                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                                      {category}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-purple-700 dark:text-purple-300">
                                    KES {amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${colors[index % colors.length]}`}
                                    style={{
                                      width: `${Math.max(percentage, 5)}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                  {percentage.toFixed(1)}% of total expenses
                                </div>
                              </div>
                            );
                          })}
                          {monthlyExpenses.length === 0 && (
                            <div className="text-center py-8">
                              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                                <BarChart3 className="h-6 w-6 text-purple-400" />
                              </div>
                              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                                No expense data
                              </h4>
                              <p className="text-sm text-purple-600 dark:text-purple-400">
                                Expense categories will appear here once data is
                                available.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Enhanced Contribution Types */}
                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
                      <CardHeader>
                        <CardTitle className="text-lg text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          Contribution Types
                        </CardTitle>
                        <CardDescription className="text-emerald-700 dark:text-emerald-300">
                          Revenue streams and contribution patterns
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(
                            contributions.reduce(
                              (acc, contribution) => {
                                acc[contribution.contribution_type] =
                                  (acc[contribution.contribution_type] || 0) +
                                  Number(contribution.amount);
                                return acc;
                              },
                              {} as Record<string, number>,
                            ),
                          ).map(([type, amount], index) => {
                            const total = contributions.reduce(
                              (total, contrib) =>
                                total + Number(contrib.amount),
                              0,
                            );
                            const percentage =
                              total > 0 ? (amount / total) * 100 : 0;
                            const colors = [
                              "bg-emerald-500",
                              "bg-teal-500",
                              "bg-green-500",
                              "bg-lime-500",
                              "bg-cyan-500",
                            ];

                            return (
                              <div
                                key={type}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                                    ></div>
                                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                                      {type}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                    KES {amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${colors[index % colors.length]}`}
                                    style={{
                                      width: `${Math.max(percentage, 5)}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                  {percentage.toFixed(1)}% of total
                                  contributions
                                </div>
                              </div>
                            );
                          })}
                          {contributions.length === 0 && (
                            <div className="text-center py-8">
                              <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
                                <TrendingUp className="h-6 w-6 text-emerald-400" />
                              </div>
                              <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                                No contribution data
                              </h4>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                Contribution types will appear here once data is
                                available.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Detailed Reports Section */}
                <ContributionsReport />

                <DisbursementsReport />

                <ExpensesReport />

                {/* Enhanced Export Actions */}
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-amber-900 dark:text-amber-100 flex items-center gap-2">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <Download className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          Comprehensive Report Downloads
                        </CardTitle>
                        <CardDescription className="text-amber-700 dark:text-amber-300">
                          Generate detailed financial reports with advanced
                          analytics, visual charts, and executive summaries for
                          stakeholders and regulatory compliance.
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                      >
                        Professional Reports
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Report Types Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:scale-110 transition-transform">
                            <File className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            CSV Format
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Spreadsheet Data Export
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Raw financial data in CSV format for advanced analysis
                          in Excel or Google Sheets
                        </p>
                        <Button
                          onClick={() => handleTreasurerExport("csv")}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <File className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform">
                            <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Excel Format
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Professional Excel Report
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Formatted Excel workbook with charts, formulas, and
                          professional styling
                        </p>
                        <Button
                          onClick={() => handleTreasurerExport("excel")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Download Excel
                        </Button>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            PDF Format
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Executive PDF Report
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Professionally formatted PDF with executive summary
                          and visual charts
                        </p>
                        <Button
                          onClick={() => handleTreasurerExport("pdf")}
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>

                    {/* Report Features */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        Report Features & Analytics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              Financial Summaries
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              Complete income & expense analysis
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                            <PieChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              Visual Charts
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              Interactive graphs & analytics
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                            <Calculator className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              Trend Analysis
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              Monthly & yearly comparisons
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                            <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              Compliance Ready
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              Audit & regulatory standards
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-amber-200 dark:bg-amber-800 rounded-full mt-0.5">
                          <FileText className="h-4 w-4 text-amber-800 dark:text-amber-200" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-medium text-amber-900 dark:text-amber-100">
                            Comprehensive Financial Intelligence
                          </h5>
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            Generated reports include detailed financial
                            summaries, monthly trend analysis, expense
                            categorization, revenue stream breakdowns, member
                            contribution patterns, disbursement tracking, and
                            strategic recommendations for improved financial
                            management and organizational growth.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                            >
                              Real-time Data
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                            >
                              Professional Format
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                            >
                              Audit Trail
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                            >
                              Executive Summary
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Password Assignment Dialog */}
          <Dialog
            open={isPasswordDialogOpen}
            onOpenChange={setIsPasswordDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Portal Password</DialogTitle>
                <DialogDescription>
                  Set a portal password for {selectedStaff?.firstName}{" "}
                  {selectedStaff?.lastName}{" "}
                  <Badge variant="outline">
                    {selectedStaff?.requestedRole}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="portal-password">Portal Password</Label>
                  <Input
                    id="portal-password"
                    type="password"
                    placeholder="Enter a secure password"
                    value={portalPassword}
                    // disabled={selectedStaff?.password!}
                    onChange={(e) => setPortalPassword(e.target.value)}
                    autoFocus
                  />

                  <div className="text-sm text-muted-foreground">
                    {selectedStaff?.password ? (
                      <Badge variant="destructive" className=" animate-pulse">
                        The user has password set already
                      </Badge>
                    ) : null}{" "}
                    You can leave the field blunk to stop changing it and just
                    approve hime. This password will be used to access their
                    role-specific portal
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => approveStaff.mutate()}>
                  <UserCheck className="h-4 w-4" />
                  {portalPassword.trim()
                    ? "Assign Password & Approve"
                    : "Approve"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Member Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  Edit Member: {memberToEdit?.user.firstName}{" "}
                  {memberToEdit?.user.lastName}
                </DialogTitle>
                <DialogDescription>
                  Update member information. Changes will be automatically
                  synced across all portals and systems.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Personal Information
                    </h4>

                    <div className="space-y-2">
                      <Label htmlFor="edit-first-name">First Name *</Label>
                      <Input
                        id="edit-first-name"
                        value={editFormData.firstName || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-last-name">Last Name *</Label>
                      <Input
                        id="edit-last-name"
                        value={editFormData.lastName || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-sex">Gender</Label>
                        <Select
                          value={editFormData.sex || ""}
                          onValueChange={(value) =>
                            setEditFormData({ ...editFormData, sex: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-marital-status">
                          Marital Status
                        </Label>
                        <Select
                          value={editFormData.maritalStatus || ""}
                          onValueChange={(value) =>
                            setEditFormData({
                              ...editFormData,
                              maritalStatus: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-id-number">ID Number</Label>
                      <Input
                        id="edit-id-number"
                        value={editFormData.idNumber || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            idNumber: e.target.value,
                          })
                        }
                        placeholder="Enter ID number"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      Contact Information
                    </h4>

                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email Address *</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editFormData.email || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number *</Label>
                      <Input
                        id="edit-phone"
                        value={editFormData.phone || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            phone: e.target.value,
                          })
                        }
                        placeholder="e.g., +254712345678, 0712345678, or 712345678"
                      />
                      <p className="text-xs text-muted-foreground">
                        Accepts formats: +country-code-number, 0712345678, or
                        712345678
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-alt-phone">Alternative Phone</Label>
                      <Input
                        id="edit-alt-phone"
                        value={editFormData.alternativePhone || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            alternativePhone: e.target.value,
                          })
                        }
                        placeholder="e.g., +254712345678, 0712345678 (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-address">Address *</Label>
                      <Textarea
                        id="edit-address"
                        value={editFormData.address || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            address: e.target.value,
                          })
                        }
                        placeholder="Enter full address"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-city">City *</Label>
                        <Input
                          id="edit-city"
                          value={editFormData.city || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              city: e.target.value,
                            })
                          }
                          placeholder="Enter city"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-state">State *</Label>
                        <Input
                          id="edit-state"
                          value={editFormData.state || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              state: e.target.value,
                            })
                          }
                          placeholder="Enter state"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-zip">ZIP Code *</Label>
                      <Input
                        id="edit-zip"
                        value={editFormData.zipCode || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            zipCode: e.target.value,
                          })
                        }
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-emergency-name">
                        Emergency Contact Name *
                      </Label>
                      <Input
                        id="edit-emergency-name"
                        value={editFormData.emergencyContactName || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            emergencyContactName: e.target.value,
                          })
                        }
                        placeholder="Enter emergency contact name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-emergency-phone">
                        Emergency Contact Phone *
                      </Label>
                      <Input
                        id="edit-emergency-phone"
                        value={editFormData.emergencyContactPhone || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            emergencyContactPhone: e.target.value,
                          })
                        }
                        placeholder="e.g., +254712345678, 0712345678"
                      />
                    </div>
                  </div>
                </div>

                {/* Membership Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Membership Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-membership-type">
                        Membership Type *
                      </Label>
                      <Select
                        value={editFormData.membershipType || ""}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            membershipType: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-registration-status">
                        Registration Status
                      </Label>
                      <Select
                        value={editFormData.registrationStatus || ""}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            registrationStatus: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-payment-status">
                        Payment Status
                      </Label>
                      <Select
                        value={editFormData.paymentStatus || ""}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            paymentStatus: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-maturity-status">
                        Maturity Status
                      </Label>
                      <Select
                        value={editFormData.maturityStatus || ""}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            maturityStatus: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="probation">Probation</SelectItem>
                          <SelectItem value="mature">Mature</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-mpesa-ref">
                        MPESA Payment Reference
                      </Label>
                      <Input
                        id="edit-mpesa-ref"
                        value={editFormData.mpesaPaymentReference || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            mpesaPaymentReference: e.target.value,
                          })
                        }
                        placeholder="Enter MPESA reference"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Changes sync automatically
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setMemberToEdit(null);
                      setEditFormData({});
                    }}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={updateMember}
                    disabled={
                      isUpdating ||
                      !editFormData.firstName?.trim() ||
                      !editFormData.lastName?.trim()
                    }
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Member Deletion Confirmation Dialog */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <AlertDialogTitle className="text-red-900 dark:text-red-100 text-xl font-bold">
                      🗑️ COMPREHENSIVE MEMBER DELETION
                    </AlertDialogTitle>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">
                      Enhanced Data Removal System
                    </p>
                  </div>
                </div>
                <AlertDialogDescription className="pt-4">
                  <div className="space-y-3">
                    <p className="text-gray-700 dark:text-gray-300">
                      Are you sure you want to{" "}
                      <strong>permanently delete</strong> the following member?
                    </p>

                    {memberToDelete && (
                      <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-red-200 dark:border-red-700">
                            <AvatarImage
                              src={`/uploads/${memberToDelete?.user?.photo || undefined}`}
                              alt={`${memberToDelete.user.firstName} ${memberToDelete.user.lastName}`}
                            />
                            <AvatarFallback className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200">
                              {memberToDelete?.user.firstName?.charAt(0)}
                              {memberToDelete.user.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold capitalize text-red-900 dark:text-red-100">
                              {memberToDelete.user.firstName}{" "}
                              {memberToDelete.user.lastName}
                            </div>
                            <div className="text-sm text-red-700 dark:text-red-300">
                              TNS: {memberToDelete.tnsNumber || "Not assigned"}
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400">
                              {memberToDelete.user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-red-100 dark:bg-red-950/40 p-4 rounded-lg border-2 border-red-300 dark:border-red-700">
                      <h4 className="font-bold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2 text-base">
                        <AlertTriangle className="h-5 w-5" />
                        COMPREHENSIVE DATA DELETION
                      </h4>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3 font-medium">
                        This enhanced deletion will permanently remove ALL
                        associated data:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                          <li>• Member profile & personal info</li>
                          <li>• All payment history & MPESA records</li>
                          <li>• All contributions & disbursements</li>
                          <li>• Uploaded bereavement documents</li>
                          <li>• Member notifications & alerts</li>
                          <li>• Document sharing permissions</li>
                        </ul>
                        <ul className="text-xs text-red-800 dark:text-red-200 space-y-1">
                          <li>• Complete audit trail & logs</li>
                          <li>• Task assignments & history</li>
                          <li>• Profile pictures & attachments</li>
                          <li>• TNS membership number</li>
                          <li>• Account balance records</li>
                          <li>• All database references</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-red-600 dark:bg-red-700 text-white p-3 rounded-lg text-center">
                      <p className="font-bold text-lg mb-1">
                        ⚠️ IRREVERSIBLE ACTION ⚠️
                      </p>
                      <p className="text-sm">
                        This comprehensive deletion cannot be undone!
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        All member data will be permanently removed from the
                        system
                      </p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-2 border-red-300 dark:border-red-700">
                      <label className="block text-sm font-bold text-red-900 dark:text-red-100 mb-3">
                        🔐 SECURITY CONFIRMATION REQUIRED
                      </label>
                      <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                        To proceed with comprehensive member deletion, type{" "}
                        <code className="bg-red-200 dark:bg-red-800 px-2 py-1 rounded font-mono text-xs font-bold">
                          DELETE
                        </code>{" "}
                        below:
                      </p>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="border-2 border-red-400 dark:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-500 bg-white dark:bg-red-950/10 text-center font-mono font-bold text-lg tracking-wider"
                        disabled={deleteMember.isPending}
                        autoComplete="off"
                        autoFocus
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3 pt-6">
                <AlertDialogCancel
                  disabled={deleteMember.isPending}
                  className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  onClick={() => setDeleteConfirmation("")}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMember.mutate()}
                  disabled={
                    deleteMember.isPending || deleteConfirmation !== "DELETE"
                  }
                  className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteMember.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Comprehensive Deletion In Progress...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      🗑️ Delete All Data Permanently
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
