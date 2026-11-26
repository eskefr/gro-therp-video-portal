"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Film,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CopyButton } from "@/components/shared/copy-button";
import { Countdown } from "@/components/shared/countdown";
import { InvitationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { markInvitationCompletedAction } from "@/lib/actions/casts";
import { modelProfilePath } from "@/lib/admin-links";
import { formatDateTime } from "@/lib/dates";
import { getEffectiveInvitationStatus } from "@/lib/invitations/status";
import type {
  EffectiveInvitationStatus,
  InvitationWithRelations,
} from "@/types/app";
import { cn } from "@/lib/utils";

type Filter = "all" | EffectiveInvitationStatus;

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "in_progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
];

export function InvitationsClient({
  invitations,
}: {
  invitations: InvitationWithRelations[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 25_000);
    return () => window.clearInterval(timer);
  }, [router]);

  const withStatus = useMemo(
    () =>
      invitations.map((invitation) => ({
        invitation,
        status: getEffectiveInvitationStatus(invitation),
      })),
    [invitations],
  );

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([["all", withStatus.length]]);
    for (const item of withStatus) {
      map.set(item.status, (map.get(item.status) ?? 0) + 1);
    }
    return map;
  }, [withStatus]);

  const filtered =
    filter === "all"
      ? withStatus
      : withStatus.filter((item) => item.status === filter);

  async function complete(invitation: InvitationWithRelations) {
    setPendingId(invitation.id);
    const result = await markInvitationCompletedAction(invitation.id);
    setPendingId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Invitation marked complete.");
    router.refresh();
  }

  function refresh() {
    setRefreshing(true);
    router.refresh();
    window.setTimeout(() => setRefreshing(false), 700);
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Magic links"
        title="Invitation tracker"
        action={
          <Button
            variant="outline"
            onClick={refresh}
            className="micro-label h-10 gap-2 rounded-none"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1 border-b border-ledger pb-3">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "micro-label flex items-center gap-1.5 px-3 py-2 text-graphite transition hover:text-ink",
              filter === item.value && "bg-ledger text-paper",
            )}
          >
            {item.label}
            <span
              className={cn(
                "text-[12px] opacity-60",
                filter === item.value && "opacity-80",
              )}
            >
              {counts.get(item.value) ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="double-rule overflow-x-auto border border-ledger bg-card">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead>
              <tr className="border-b border-ledger">
                {["Cast", "Recipient", "Type", "Requirements", "Expires", "Status", "Actions"].map(
                  (label) => (
                    <th key={label} className="micro-label px-4 py-3 text-graphite">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(({ invitation, status }) => {
                const linkedModel =
                  invitation.claimed_model ?? invitation.target_model;
                const recipient =
                  linkedModel?.name ||
                  "Any talent";
                const isMediaRequest = Boolean(invitation.target_model_id);
                const href = linkedModel
                  ? modelProfilePath(linkedModel.phone, {
                      from: "invitations",
                      invitationId: invitation.id,
                    })
                  : `/admin/invitations/${invitation.id}`;
                return (
                  <tr
                    key={invitation.id}
                    onClick={() => router.push(href)}
                    className="cursor-pointer align-middle transition hover:bg-manila/25"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">
                        {invitation.cast.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-graphite">
                        {invitation.cast.client_name || "Independent"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <Link
                        href={href}
                        onClick={(event) => event.stopPropagation()}
                        className="hover:underline"
                      >
                        {recipient}
                      </Link>
                      <p className="mt-0.5 text-graphite">
                        {isMediaRequest ? "Targeted" : "Open invite"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="micro-label text-graphite">
                        {isMediaRequest ? "Media request" : "Cast invite"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {invitation.require_media_upload ? (
                        <span className="micro-label inline-flex items-center gap-1.5 text-graphite">
                          <Film className="size-3" />
                          Media required
                        </span>
                      ) : (
                        <span className="micro-label inline-flex items-center gap-1.5 text-graphite">
                          <ImageIcon className="size-3" />
                          No media
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-[12px]">
                      <p>{formatDateTime(invitation.expires_at)}</p>
                      <Countdown
                        expiresAt={invitation.expires_at}
                        className="mt-0.5 block font-mono text-[12px] text-graphite"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <InvitationStatusBadge
                        status={status}
                        hasTarget={isMediaRequest}
                      />
                    </td>
                    <td
                      className="px-4 py-4"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5">
                        <CopyButton
                          value={`/invite/${invitation.token}`}
                          label="Copy"
                          variant="ghost"
                          className="h-8 px-2"
                        />
                        {status === "submitted" && (
                          <button
                            type="button"
                            onClick={() => void complete(invitation)}
                            disabled={pendingId === invitation.id}
                            className="micro-label inline-flex h-8 items-center gap-1 px-2 text-graphite hover:text-ink disabled:opacity-50"
                          >
                            {pendingId === invitation.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Check className="size-3" />
                            )}
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No invitations in this view."
          description="Generate a cast invite or media request from a cast to see it here."
        />
      )}
    </div>
  );
}
