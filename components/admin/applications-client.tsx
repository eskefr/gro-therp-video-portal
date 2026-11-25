"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MicroBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { formatDate } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";
import type { PendingApplication } from "@/types/app";

export function ApplicationsClient({
  applications,
}: {
  applications: PendingApplication[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PendingApplication | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return applications;
    return applications.filter((application) =>
      [application.name, application.phone, application.city, application.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [applications, query]);

  async function approve(application: PendingApplication) {
    setPendingAction(application.id);
    const result = await approveModelAction(application.id);
    setPendingAction(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${application.name} is now in the archive.`);
    setSelected(null);
    router.refresh();
  }

  async function reject(application: PendingApplication) {
    setPendingAction(application.id);
    const result = await rejectModelAction(application.id);
    setPendingAction(null);
    setRejectOpen(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${application.name} was rejected.`);
    setSelected(null);
    router.refresh();
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Applications"
        title="The pending queue"
        description="Direct applications and new faces from cast invitations. Approving a profile moves it to the archive; rejecting removes it."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search applications"
            className="h-10 rounded-none bg-card pl-9"
          />
        </div>
        <p className="micro-label text-muted-foreground">
          {filtered.length} pending
        </p>
      </div>

      {filtered.length ? (
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Applicant", "Contact", "Stats", "Source", "Received", ""].map(
                  (label) => (
                    <th
                      key={label}
                      className="micro-label px-4 py-3 text-muted-foreground"
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((application) => (
                <tr
                  key={application.id}
                  className="group cursor-pointer transition hover:bg-background/70"
                  onClick={() => setSelected(application)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={application.headshot_url}
                        alt={application.name}
                        className="size-11 shrink-0 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{application.name}</p>
                          {application.is_hidden && (
                            <MicroBadge tone="hidden">Hidden</MicroBadge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {application.city || "City not provided"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p>{formatPhone(application.phone)}</p>
                    <p className="mt-0.5 text-muted-foreground">
                      {application.email || "No email"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {application.height_cm ? `${application.height_cm} cm` : "—"}
                    <br />
                    {application.hair_color || "—"} / {application.eye_color || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {application.source ? (
                      <span className="text-xs">
                        Via cast invite
                        <span className="mt-0.5 block text-muted-foreground">
                          {application.source.castTitle}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Direct application
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(application.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ArrowUpRight className="ml-auto size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={applications.length ? "No matching applications." : "The queue is clear."}
          description={
            applications.length
              ? "Try a different name, phone number, or city."
              : "New applications and cast-invite registrations will appear here."
          }
        />
      )}

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto border-border bg-popover p-0 sm:max-w-xl">
          {selected && (
            <>
              <div className="border-b border-border px-6 py-5">
                <SheetHeader>
                  <p className="micro-label text-muted-foreground">
                    Pending application
                  </p>
                  <SheetTitle className="font-display text-3xl font-normal tracking-[-0.03em]">
                    {selected.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    Received {formatDate(selected.created_at)}
                    {selected.source ? ` · via ${selected.source.castTitle}` : " · direct"}
                  </SheetDescription>
                </SheetHeader>
              </div>

              <div className="space-y-6 px-6 py-6">
                <img
                  src={selected.headshot_url}
                  alt={selected.name}
                  className="aspect-[4/5] w-full max-w-sm object-cover"
                />

                <div className="grid grid-cols-2 gap-px border border-border bg-border text-sm">
                  {[
                    ["Phone", formatPhone(selected.phone)],
                    ["Email", selected.email || "—"],
                    ["City", selected.city || "—"],
                    ["Height", selected.height_cm ? `${selected.height_cm} cm` : "—"],
                    ["Bust", selected.bust_cm ? `${selected.bust_cm} cm` : "—"],
                    ["Waist", selected.waist_cm ? `${selected.waist_cm} cm` : "—"],
                    ["Hips", selected.hips_cm ? `${selected.hips_cm} cm` : "—"],
                    ["Shoe", selected.shoe_size ? `${selected.shoe_size}` : "—"],
                    ["Hair", selected.hair_color || "—"],
                    ["Eyes", selected.eye_color || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-card px-3 py-2.5">
                      <p className="micro-label text-muted-foreground">{label}</p>
                      <p className="mt-1 break-words text-xs">{value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="micro-label text-muted-foreground">About</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {selected.bio || "No bio provided."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <MicroBadge tone="pending">Pending review</MicroBadge>
                  {selected.is_hidden && (
                    <MicroBadge tone="hidden">Requested private profile</MicroBadge>
                  )}
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
                  <Button
                    className="micro-label h-10 flex-1 gap-2 rounded-none"
                    onClick={() => void approve(selected)}
                    disabled={pendingAction === selected.id}
                  >
                    {pendingAction === selected.id ? (
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
                    disabled={pendingAction === selected.id}
                  >
                    <X className="size-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent className="border-border bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-normal">
              Reject this application?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
              {selected?.name} will be permanently removed, along with any cast
              attachments. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="micro-label rounded-none">
              Keep application
            </AlertDialogCancel>
            <AlertDialogAction
              className="micro-label rounded-none bg-destructive text-white hover:bg-destructive/90"
              onClick={() => selected && void reject(selected)}
            >
              Reject permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
