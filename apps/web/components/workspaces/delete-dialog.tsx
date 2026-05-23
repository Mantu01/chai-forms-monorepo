"use client";

import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface WorkspaceDeleteDialogProps {
  workspaceId: string | null;
  open: boolean;
  onClose: () => void;
}

export function WorkspaceDeleteDialog({
  workspaceId,
  open,
  onClose,
}: WorkspaceDeleteDialogProps) {
  const utils = trpc.useUtils();

  const deleteWorkspace = trpc.workspace.deleteWorkspace.useMutation({
    onSuccess: () => {
      toast.success("Workspace deleted successfully");
      utils.workspace.getUserWorkspaces.invalidate();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete workspace");
    },
  });

  const handleDelete = () => {
    if (!workspaceId) return;
    deleteWorkspace.mutate({ workspaceId });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-red-500">
            Delete Workspace
          </DialogTitle>
          <DialogDescription className="text-sm">
            Are you sure you want to delete this workspace? This action is permanent and cannot be undone. All forms, fields, and submissions inside this workspace will be deleted forever.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-xl"
            disabled={deleteWorkspace.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="rounded-xl"
            disabled={deleteWorkspace.isPending}
          >
            {deleteWorkspace.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
