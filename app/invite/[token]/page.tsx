import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteShell } from "@/components/invite/invite-shell";
import { ExpiredState } from "@/components/invite/expired-state";
import { SuccessState } from "@/components/invite/success-state";
import { InvitationFlow } from "@/components/invite/invitation-flow";
import {
  getInvitationByToken,
  getPhoneMatchForCast,
} from "@/lib/queries/invitations";
import {
  getEffectiveInvitationStatus,
} from "@/lib/invitations/status";
import { normalizeDraft } from "@/lib/invitations/draft";
import { isReasonableToken } from "@/lib/invitations/tokens";
import { signMediaItems } from "@/lib/storage/media";
import { normalizePhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private cast invitation",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isReasonableToken(token)) notFound();

  const invitation = await getInvitationByToken(token);
  if (!invitation) notFound();

  const status = getEffectiveInvitationStatus(invitation);
  const targetName = invitation.target_model?.name ?? null;

  if (status === "expired") {
    return (
      <InviteShell cast={invitation.cast} expiresAt={invitation.expires_at}>
        <ExpiredState />
      </InviteShell>
    );
  }

  if (status === "submitted" || status === "completed") {
    return (
      <InviteShell cast={invitation.cast} expiresAt={invitation.expires_at}>
        <SuccessState
          castTitle={invitation.cast.title}
          targetName={invitation.target_model_id ? targetName : null}
          alreadySubmitted
        />
      </InviteShell>
    );
  }

  const draft = normalizeDraft(invitation.draft_data);
  const signedMedia = await signMediaItems(draft.media ?? []);
  const isMediaRequest = Boolean(invitation.target_model_id);
  let targetStillCast = true;

  if (invitation.target_model_id) {
    const admin = createAdminClient();
    const { data: membership } = await admin
      .from("cast_members")
      .select("id")
      .eq("cast_id", invitation.cast_id)
      .eq("model_id", invitation.target_model_id)
      .maybeSingle();
    targetStillCast = Boolean(membership);
  }

  let initialStep: "phone" | "existing" | "register" | "media" = "phone";
  let initialLookup = null;

  if (isMediaRequest) {
    initialStep = "media";
  } else {
    const normalized = draft.phone ? normalizePhone(draft.phone) : null;
    if (normalized) {
      initialLookup = await getPhoneMatchForCast(
        invitation.cast_id,
        normalized,
      );
      if (initialLookup?.matched) {
        initialStep = "existing";
      } else {
        initialStep = "register";
      }
    }
  }

  return (
    <InviteShell
      cast={invitation.cast}
      expiresAt={invitation.expires_at}
      targetName={isMediaRequest ? targetName : null}
    >
      <InvitationFlow
        token={token}
        mode={isMediaRequest ? "media-request" : "general"}
        requireMedia={invitation.require_media_upload}
        initialStep={initialStep}
        initialDraft={draft}
        initialMedia={signedMedia}
        initialLookup={initialLookup}
        castTitle={invitation.cast.title}
        targetName={targetName}
        targetStillCast={targetStillCast}
      />
    </InviteShell>
  );
}
