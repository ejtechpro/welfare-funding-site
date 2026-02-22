import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMembersOptions } from "@/queries/memberQueryOptions";
import { manualPayment } from "@/api/member";

// Define allowed payment types as constants for consistency
const PAYMENT_TYPES = {
  MONTHLY: "monthly_contribution",
  // CASES: "case",
  // PROJECTS: "project",
  // REGISTRATION: "registration",
  // OTHERS: "other",
} as const;

const PAYMENT_TYPE_LABELS = {
  [PAYMENT_TYPES.MONTHLY]: "Monthly contribution",
  // [PAYMENT_TYPES.CASES]: "Cases",
  // [PAYMENT_TYPES.PROJECTS]: "Projects",
  // [PAYMENT_TYPES.REGISTRATION]: "Registration",
  // [PAYMENT_TYPES.OTHERS]: "Others",
} as const;

export const ManualPaymentEntry = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [contributionType, setPaymentType] = useState<string>(
    PAYMENT_TYPES.MONTHLY,
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const members = useQuery(getMembersOptions());

  const approvedMembers = useMemo(() => {
    if (members?.data) {
      return members?.data.filter((m) => m.registrationStatus === "approved");
    }
    return [];
  }, [members]);

  const makeManualPayment = useMutation({
    mutationFn: (data: any) => manualPayment(data),
    onSuccess: async (data: any) => {
      if (data?.success) {
        await queryClient.invalidateQueries({ queryKey: ["balances"] });
        toast.success(`Payment completed successfully!`, {
          description: `Your payments have been received successfully!`,
          duration: 5000,
        });
        // Reset form
        setAmount("");
        setSelectedMember("");
        setReferenceNumber("");
        // setPaymentDate(new Date().toISOString());
        setPaymentType(PAYMENT_TYPES.MONTHLY);
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error("Error occurred", {
          description: error?.response?.data?.error,
          duration: 7000,
        });
      } else {
        console.log(error);
        toast.error("Error occurred", {
          description: "Something went wrong, during processing!",
          duration: 7000,
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember || !amount || !paymentDate || !contributionType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    // Validate payment type is one of the allowed types
    const allowedPaymentTypes = Object.values(PAYMENT_TYPES);
    if (!allowedPaymentTypes.includes(contributionType as any)) {
      toast.error("Invalid payment type selected");
      return;
    }

    // Check staff permissions - allow Admin, Treasurer, and super admin
    const allowedRole =
      user && ["super_admin", "admin", "treasurer"].includes(user.userRole);

    if (!allowedRole) {
      toast.error(
        `Access denied. Admin/Treasurer role required or super admin access.`,
      );
      return;
    }

    const paymentData = {
      transactionMethod: "manual_payment",
      memberId: selectedMember,
      amount: parseFloat(amount),
      contributionType,
      paymentDate,
      referenceNumber,
    };
    makeManualPayment.mutate(paymentData);
  };

  return (
    <div className="flex gap-5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            Manual Payment Entry
          </CardTitle>
          <CardDescription>
            Record paybill or cash payments manually
            <br />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Access: Admin • Treasurer • Super Admin
            </span>
            <br />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Payment Types: Monthly contribution • Cases • Projects •
              Registration • Others
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member">Select Member</Label>
              <Select
                value={selectedMember}
                onValueChange={setSelectedMember}
                onOpenChange={() => {}}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {!approvedMembers ? (
                    <SelectItem value="loading" disabled>
                      Loading members...
                    </SelectItem>
                  ) : (
                    approvedMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <span className=" capitalize font-bold">
                          {member.tnsNumber}
                        </span>{" "}
                        -{" "}
                        <span className="capitalize">
                          {member.user.firstName}
                        </span>{" "}
                        <span className=" capitalize">
                          {member.user.lastName}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KSH)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contributionType">Payment Type *</Label>
              <Select
                value={contributionType}
                onValueChange={(value: string) => setPaymentType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_TYPES).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {PAYMENT_TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only these payment types are allowed for manual entry
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number (Optional)</Label>
              <Input
                id="reference"
                type="text"
                placeholder="MPESA receipt or reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                makeManualPayment.isPending || !selectedMember || !amount
              }
            >
              {makeManualPayment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording Payment...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Record Payment
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Paybill: 4148511</p>
            <p>
              Use this form to record manual payments made via paybill or cash
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
