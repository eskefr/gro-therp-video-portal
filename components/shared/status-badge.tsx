import type { EffectiveInvitationStatus } from "@/types/app";
import {
  invitationStatusLabel,
  invitationStatusTone,
} from "@/lib/invitations/status";
import { cn } from "@/lib/utils";

const dotTone: Record<EffectiveInvitationStatus, string> = {
  active: "bg-[#6d7f49]",
  in_progress: "bg-[#a87c34]",
  submitted: "bg-[#746a5b]",
  completed: "bg-[#4f7958]",
  expired: "bg-[#a45041]",
};

export function InvitationStatusBadge({
  status,
  hasTarget,
  compact,
  className,
}: {
  status: EffectiveInvitationStatus;
  hasTarget?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-none font-medium",
        invitationStatusTone(status),
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotTone[status])} />
      {compact ? invitationStatusLabel(status, hasTarget).split(" – ")[0] : invitationStatusLabel(status, hasTarget)}
    </span>
  );
}

export function MicroBadge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "hidden" | "pending" | "approved" | "open" | "closed";
}) {
  const tones = {
    neutral: "border-border bg-transparent text-muted-foreground",
    hidden: "border-[#d8c7a7] bg-[#efe4d0] text-[#75592f]",
    pending: "border-[#dfcfad] bg-[#f2e8d5] text-[#7c5b22]",
    approved: "border-[#c5d2bd] bg-[#e5ecdf] text-[#40553a]",
    open: "border-[#c5d2bd] bg-[#e5ecdf] text-[#40553a]",
    closed: "border-border bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "micro-label inline-flex w-fit items-center gap-1 rounded-full border px-2 py-1 leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
