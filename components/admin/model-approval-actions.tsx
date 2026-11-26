"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { approveModelAction, rejectModelAction } from "@/lib/actions/models";

export function ModelApprovalActions({
  modelId,
  modelName,
}: {
  modelId: string;
  modelName: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  async function approve() {
    setPending("approve");
    const result = await approveModelAction(modelId);
    setPending(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${modelName} is now in the archive.`);
    router.push("/admin/applications");
    router.refresh();
  }

  async function reject() {
    setPending("reject");
    const result = await rejectModelAction(modelId);
    setPending(null);
    setRejectOpen(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${modelName} was rejected.`);
    router.push("/admin/applications");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="micro-label h-10 flex-1 gap-2 rounded-none"
          onClick={() => void approve()}
          disabled={pending !== null}
        >
          {pending === "approve" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Approve & add to archive
        </Button>
        <Button
          variant="outline"
          className="micro-label h-10 gap-2 rounded-none border-destructive/30 text-destructive hover:bg-destructive/5"
          onClick={() => setRejectOpen(true)}
          disabled={pending !== null}
        >
          <X className="size-3.5" />
          Reject
        </Button>
      </div>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent className="border-ledger bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-normal">
              Reject this application?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-graphite">
              {modelName} will be permanently removed, along with any cast
              attachments. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="micro-label rounded-none">
              Keep application
            </AlertDialogCancel>
            <AlertDialogAction
              className="micro-label rounded-none bg-destructive text-white hover:bg-destructive/90"
              onClick={() => void reject()}
            >
              Reject permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
