import type { EffectiveInvitationStatus } from "@/types/app";
import {
  invitationStatusLabel,
  invitationStatusTone,
} from "@/lib/invitations/status";
import { cn } from "@/lib/utils";

const dotTone: Record<EffectiveInvitationStatus, string> = {
  active: "bg-ledger",
  in_progress: "bg-ink",
  submitted: "bg-ledger",
  completed: "bg-ledger",
  expired: "bg-[#9a3b2e]",
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
        "inline-flex w-fit items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] leading-none tracking-[0.02em] uppercase",
        invitationStatusTone(status),
        className,
      )}
    >
      <span className={cn("size-1.5", dotTone[status])} />
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
    neutral: "border-ledger bg-transparent text-graphite",
    hidden: "border-ledger bg-manila text-ink",
    pending: "border-ledger bg-[#f3ead7] text-ink",
    approved: "border-ledger bg-paper text-ledger",
    open: "border-ledger bg-manila text-ink",
    closed: "border-graphite bg-transparent text-graphite",
  };

  return (
    <span
      className={cn(
        "micro-label inline-flex w-fit items-center gap-1 border px-2 py-1 leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
