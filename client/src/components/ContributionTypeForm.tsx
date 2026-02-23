import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
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

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

/* ---------------- VALIDATION ---------------- */
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.enum([
    "monthly_contribution",
    "case",
    "project",
    "registration",
    "other",
  ]),
  defaultAmount: z.coerce.number().min(0),
  status: z.enum(["pending", "active", "disabled"]),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function ContributionTypeForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      category: "monthly_contribution",
      defaultAmount: 0,
      status: "pending",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return axios.post("/api/contributions/type/add", data);
    },
    onSuccess: () => {
      form.reset();
      alert("Contribution type created ✅");
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Contribution Type</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] sm:max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Contribution Type</DialogTitle>
          <DialogDescription>
            Define a new contribution category and default amount
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NAME */}
            <Field className="sm:col-span-2">
              <Label>Name</Label>
              <Input
                placeholder="Name of contribution"
                {...form.register("name")}
              />
              <p className="text-red-500 text-xs">
                {form.formState.errors.name?.message}
              </p>
            </Field>

            {/* CATEGORY */}
            <Field>
              <Label>Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly_contribution">
                    Monthly Contribution
                  </SelectItem>
                  <SelectItem value="case">Case</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* STATUS */}
            <Field>
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* DEFAULT AMOUNT */}
            <Field>
              <Label>Default Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("defaultAmount")}
              />
            </Field>

            {/* DESCRIPTION */}
            <Field className="sm:col-span-2">
              <Label>Description (optional)</Label>
              <Textarea
                rows={3}
                placeholder="Explain what this contribution is for..."
                {...form.register("description")}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ContributionTypeForm;
