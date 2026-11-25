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
      return "bg-[#e7ead9] text-[#4c5d30] border-[#cbd3b4]";
    case "in_progress":
      return "bg-[#f2e8d3] text-[#7c5b22] border-[#e2d0ad]";
    case "submitted":
      return "bg-[#e7e4dd] text-[#5b5346] border-[#d4cec2]";
    case "completed":
      return "bg-[#dfe9df] text-[#385a3d] border-[#bfd0bf]";
    case "expired":
      return "bg-[#f1dfdb] text-[#8c3f32] border-[#e2c5bf]";
    default:
      return "bg-muted text-muted-foreground";
  }
}
