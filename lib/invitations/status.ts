import type {
  EffectiveInvitationStatus,
  Invitation,
  InvitationStatus,
} from "@/types/app";

export function getEffectiveInvitationStatus(
  invitation: Pick<Invitation, "status" | "expires_at">,
): EffectiveInvitationStatus {
  if (invitation.status === "expired") return "expired";
  if (invitation.status === "submitted" || invitation.status === "completed") {
    return invitation.status;
  }
  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    return "expired";
  }
  return invitation.status;
}

export function isInvitationExpired(
  invitation: Pick<Invitation, "status" | "expires_at">,
) {
  return getEffectiveInvitationStatus(invitation) === "expired";
}

export function isInvitationOpen(
  invitation: Pick<Invitation, "status" | "expires_at">,
) {
  const status = getEffectiveInvitationStatus(invitation);
  return status === "active" || status === "in_progress";
}

export function invitationStatusLabel(
  status: EffectiveInvitationStatus,
  hasTarget = false,
) {
  switch (status) {
    case "active":
      return "Active";
    case "in_progress":
      return "In Progress (Draft Saved)";
    case "submitted":
      return hasTarget ? "Submitted – Media Received" : "Submitted – Awaiting Approval";
    case "completed":
      return "Completed";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

export function invitationStatusTone(status: InvitationStatus | EffectiveInvitationStatus) {
  switch (status) {
    case "active":
      return "border-ledger bg-manila text-ink";
    case "in_progress":
      return "border-ledger bg-[#f3ead7] text-ink";
    case "submitted":
      return "border-ledger bg-paper text-ink";
    case "completed":
      return "border-ledger bg-ledger-soft text-ledger";
    case "expired":
      return "border-[#9a3b2e] bg-[#f1e5e1] text-[#7f3b31]";
    default:
      return "border-ledger bg-paper text-graphite";
  }
}
