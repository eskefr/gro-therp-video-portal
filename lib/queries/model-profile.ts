import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getEffectiveInvitationStatus } from "@/lib/invitations/status";
import { normalizeDraft } from "@/lib/invitations/draft";
import { signMediaCollections } from "@/lib/storage/media";
import type {
  Cast,
  CastMember,
  Invitation,
  Model,
  ModelCastHistoryEntry,
  ModelInvitationHistoryEntry,
  ModelProfile,
  SubmissionMedia,
} from "@/types/app";

function modelKey(segment: string) {
  const decoded = decodeURIComponent(segment).trim();
  if (!decoded) return null;

  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      decoded,
    )
  ) {
    return { column: "id" as const, value: decoded };
  }

  const digits = decoded.replace(/\D/g, "");
  return digits ? { column: "phone" as const, value: `+${digits}` } : null;
}

function mediaArray(value: unknown): SubmissionMedia[] {
  return Array.isArray(value) ? (value as SubmissionMedia[]) : [];
}

function castTime(cast: Cast) {
  return new Date(cast.shoot_start ?? cast.created_at).getTime();
}

export async function getModelProfile(
  segment: string,
): Promise<ModelProfile | null> {
  const key = modelKey(segment);
  if (!key) return null;

  const admin = createAdminClient();
  const { data: modelRow } = await admin
    .from("models")
    .select("*")
    .eq(key.column, key.value)
    .maybeSingle();

  if (!modelRow) return null;
  const model = modelRow as Model;

  const [{ data: memberRows }, { data: targetRows }, { data: claimedRows }] =
    await Promise.all([
      admin
        .from("cast_members")
        .select("*")
        .eq("model_id", model.id)
        .order("created_at", { ascending: false }),
      admin.from("invitations").select("*").eq("target_model_id", model.id),
      admin.from("invitations").select("*").eq("claimed_model_id", model.id),
    ]);

  const members = (memberRows ?? []) as CastMember[];
  const invitationById = new Map<string, Invitation>();

  for (const invitation of [...(targetRows ?? []), ...(claimedRows ?? [])]) {
    invitationById.set(invitation.id, invitation as Invitation);
  }

  const invitations = [...invitationById.values()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const castIds = Array.from(
    new Set([
      ...members.map((member) => member.cast_id),
      ...invitations.map((invitation) => invitation.cast_id),
    ]),
  );

  const { data: castRows } = castIds.length
    ? await admin.from("casts").select("*").in("id", castIds)
    : { data: [] };

  const castById = new Map(
    ((castRows ?? []) as Cast[]).map((cast) => [cast.id, cast]),
  );
  const memberByCast = new Map(
    members.map((member) => [member.cast_id, member]),
  );
  const drafts = new Map(
    invitations.map((invitation) => [
      invitation.id,
      normalizeDraft(invitation.draft_data),
    ]),
  );

  const invitationMedia = invitations.map((invitation) => {
    const memberMedia = mediaArray(
      memberByCast.get(invitation.cast_id)?.submission_media,
    );
    const draftMedia = drafts.get(invitation.id)?.media ?? [];
    const status = getEffectiveInvitationStatus(invitation);
    const isSubmitted = status === "submitted" || status === "completed";

    return isSubmitted
      ? memberMedia.length
        ? memberMedia
        : draftMedia
      : draftMedia;
  });

  const signed = await signMediaCollections([
    ...members.map((member) => mediaArray(member.submission_media)),
    ...invitationMedia,
  ]);

  const casts: ModelCastHistoryEntry[] = members
    .map((member, index) => {
      const cast = castById.get(member.cast_id);
      if (!cast) return null;
      return {
        memberId: member.id,
        cast,
        roleNotes: member.role_notes,
        media: signed[index] ?? [],
        addedAt: member.created_at,
      };
    })
    .filter((entry): entry is ModelCastHistoryEntry => Boolean(entry))
    .sort((a, b) => castTime(b.cast) - castTime(a.cast));

  const invitationHistory: ModelInvitationHistoryEntry[] = invitations
    .map((invitation, index) => {
      const cast = castById.get(invitation.cast_id);
      if (!cast) return null;
      const draft = drafts.get(invitation.id);
      const status = getEffectiveInvitationStatus(invitation);
      const isSubmitted = status === "submitted" || status === "completed";
      const media = invitationMedia[index];

      return {
        id: invitation.id,
        token: invitation.token,
        type: invitation.target_model_id ? "media" : "cast",
        status,
        castId: invitation.cast_id,
        castTitle: cast.title,
        clientName: cast.client_name,
        requireMediaUpload: invitation.require_media_upload,
        expiresAt: invitation.expires_at,
        submittedAt: invitation.submitted_at,
        createdAt: invitation.created_at,
        draftSavedAt:
          draft?.savedAt ?? draft?.clientUpdatedAt ?? null,
        media: signed[members.length + index] ?? [],
        mediaSource: media.length
          ? isSubmitted
            ? "submitted"
            : "draft"
          : null,
      };
    })
    .filter(
      (entry): entry is ModelInvitationHistoryEntry => Boolean(entry),
    );

  const sourceEntry =
    model.status === "pending"
      ? invitationHistory.find(
          (entry) =>
            entry.type === "cast" &&
            (entry.status === "submitted" || entry.status === "completed"),
        )
      : undefined;

  return {
    model,
    casts,
    invitations: invitationHistory,
    applicationSource: sourceEntry
      ? {
          castTitle: sourceEntry.castTitle,
          invitationId: sourceEntry.id,
          token: sourceEntry.token,
        }
      : null,
  };
}
