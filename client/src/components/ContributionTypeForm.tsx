import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import {
  addContributionType,
  updateContributionType,
} from "@/api/contributions";
import { toast } from "sonner";

/* ---------------- VALIDATION ---------------- */
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.enum(["monthly", "case", "project", "registration", "other"]),
  defaultAmount: z.coerce.number().min(0),
  status: z
    .enum(["active", "inactive", "completed", "cancelled"])
    .default("inactive"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ContributionTypeForm({
  defaultValues,
  onCancel,
}: {
  defaultValues?: any;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: "",
      category: "monthly",
      defaultAmount: 0,
      status: "inactive",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (defaultValues?.id) {
        return updateContributionType(data, defaultValues?.id);
      }
      return addContributionType(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contribution-types"],
      });
      onCancel();
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error(error?.response?.data?.error, { duration: 7000 });
        return;
      }
      toast.error(error.message, { duration: 8000 });
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
      className="space-y-4"
    >
      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field className="sm:col-span-2">
          <Label>Name</Label>
          <Input
            {...form.register("name")}
            placeholder="e.g  Monthly Contribution"
          />
        </Field>

        <Field>
          <Label>Category</Label>
          <Select
            value={form.watch("category")}
            onValueChange={(v) => form.setValue("category", v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="case">Case</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <Label>Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v as any)}
            defaultValue={form.watch("status")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active" className=" text-green-500">Active</SelectItem>
              <SelectItem value="inactive" className=" text-yellow-500">Inactive</SelectItem>
              {defaultValues?.id && (
                <>
                  <SelectItem value="completed" className=" text-blue-500">
                    Completed
                  </SelectItem>
                  <SelectItem value="cancelled" className=" text-red-500">
                    Cancelled
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <Label>Default Amount</Label>
          <Input type="number" {...form.register("defaultAmount")} />
        </Field>

        <Field className="sm:col-span-2">
          <Label>Description</Label>
          <Textarea {...form.register("description")} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Back
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
