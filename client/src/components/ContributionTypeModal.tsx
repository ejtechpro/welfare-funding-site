import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContributionTypeForm } from "./ContributionTypeForm";
import ContributionTypeTable from "./ContributionTypeTable";
import { Table } from "lucide-react";

type Mode = "list" | "create" | "edit";

const ContributionTypeModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [mode, setMode] = useState<Mode>("list");
  const [selected, setSelected] = useState<any>(null);

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-h-[90vh] pt-0 min-h-[90vh] w-[95vw] max-w-6xl flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby="types_modal"
      >
        {/* HEADER */}
        <DialogHeader className="sticky top-0 py-2 z-10 border-b">
          <div className="flex flex-row items-center justify-between">
            <DialogTitle>Contribution Types</DialogTitle>

            <div className="flex gap-2">
              {mode === "list" && (
                <Button size="sm" onClick={() => setMode("create")}>
                  + New
                </Button>
              )}
              {(mode === "create" || mode === "edit") && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setMode("list")}
                >
                  <Table className="size-22 text-gray-500" />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
          <DialogDescription>
            Manage contribution types: create, edit or delete them.
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === "list" && (
            <ContributionTypeTable
              onEdit={(row) => {
                setSelected(row);
                setMode("edit");
              }}
            />
          )}

          {mode === "create" && (
            <ContributionTypeForm onCancel={() => setMode("list")} />
          )}

          {mode === "edit" && selected && (
            <ContributionTypeForm
              defaultValues={selected}
              onCancel={() => setMode("list")}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContributionTypeModal;
