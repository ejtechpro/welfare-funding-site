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
import { getContributionType } from "@/api/contributions";

export const ManualPaymentEntry = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const members = useQuery(getMembersOptions());

  const contributionTypes = useQuery({
    queryKey: ["contribution-types"],
    queryFn: async () => {
      const res = await getContributionType();
      return res?.types;
    },
  });

  const [contributionType, setPaymentType] = useState<string>(() => {
    const typeId = contributionTypes?.data?.find(
      (t: any) => t?.category == "monthly",
    );
    return typeId?.id;
  });

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
        setPaymentType("");
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error("Error occurred", {
          description: error?.response?.data?.error,
          duration: 7000,
        });
        return;
      }

      toast.error("Error occurred", {
        description: `${error.message}`,
        duration: 7000,
      });
      setAmount("");
      setSelectedMember("");
      setReferenceNumber("");
      setPaymentType("");
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

    if (paymentMethod === "mpesa" && !referenceNumber?.trim()) {
      toast.error(
        "You selected M-Pesa. Please provide the transaction reference number.",
        { duration: 30000 },
      );
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
    const selectedType = contributionTypes?.data?.find(
      (t: any) => t.id === contributionType,
    );

    const paymentData = {
      transactionMethod: paymentMethod,
      memberId: selectedMember,
      amount: parseFloat(amount),
      contributionType: selectedType?.category,
      paymentDate,
      referenceNumber,
      projectId: selectedType?.category == "project" ? selectedType?.id : null,
      caseId: selectedType?.category == "case" ? selectedType?.id : null,
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
                  {contributionTypes.isLoading ? (
                    <div className="text-gray-500">Loading...</div>
                  ) : contributionTypes.data?.length > 0 ? (
                    contributionTypes.data?.map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>
                        <span className="font-bold capitalize text-gray-500">
                          ({type.category})
                        </span>
                        {" - "}
                        <span className=" capitalize">{type.name}</span>
                      </SelectItem>
                    ))
                  ) : (
                    <p className=" text-gray-500">
                      No contribution type added by admin.
                    </p>
                  )}
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
              <Label htmlFor="PymentMethod">Payment Method *</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: string) => setPaymentMethod(value)}
                required={paymentMethod == "mpesa"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="mpesa" value="mpesa">
                    M-Pesa
                  </SelectItem>
                  <SelectItem key="cash" value="cash">
                    Cash
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Method used by the member to make payment.
              </p>
            </div>

            {paymentMethod == "mpesa" && (
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number *</Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="MPESA receipt or reference"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            )}

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
