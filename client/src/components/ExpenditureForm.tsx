import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types";
import { addExpenditure } from "@/api/expendidure";

export const ExpenditureForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const { mutate, isPending } = useMutation({
    mutationFn: addExpenditure,
    onSuccess: () => {
      toast.success("Expense recorded successfully!");

      setAmount("");
      setCategory("");
      setDescription("");
      setExpenseDate(new Date().toISOString().split("T")[0]);

      onSuccess?.();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to record expense");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    mutate({
      amount: numAmount,
      expenseCategory: category,
      description,
      expenseDate: new Date(expenseDate),
      status: "pending",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Expenditure</CardTitle>
        <CardDescription>Record an organizational expense</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CATEGORY */}
          <div className="space-y-2">
            <Label>Expense Category *</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ExpenseCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AMOUNT */}
          <div className="space-y-2">
            <Label>Amount (KES) *</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          {/* DATE */}
          <div className="space-y-2">
            <Label>Expense Date *</Label>
            <Input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              "Record Expenditure"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
