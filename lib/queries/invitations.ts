import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Cast,
  Invitation,
  InvitationInspection,
  InvitationWithRelations,
  Model,
  SubmissionMedia,
} from "@/types/app";
import { getEffectiveInvitationStatus } from "@/lib/invitations/status";
import { normalizeDraft } from "@/lib/invitations/draft";
import { publicHeadshotUrl, signMediaItems } from "@/lib/storage/media";

export async function getInvitationByToken(
  token: string,
): Promise<InvitationWithRelations | null> {
  const admin = createAdminClient();
  const { data: invitation, error } = await admin
    .from("invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!invitation) return null;

  const [{ data: cast }, { data: target }, { data: claimed }] =
    await Promise.all([
      admin.from("casts").select("*").eq("id", invitation.cast_id).maybeSingle(),
      invitation.target_model_id
        ? admin
            .from("models")
            .select("*")
            .eq("id", invitation.target_model_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      invitation.claimed_model_id
        ? admin
            .from("models")
            .select("*")
            .eq("id", invitation.claimed_model_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (!cast) return null;

  return {
    ...(invitation as Invitation),
    cast: cast as Cast,
    target_model: (target as Model | null) ?? null,
    claimed_model: (claimed as Model | null) ?? null,
  };
}

export async function getPhoneMatchForCast(castId: string, phone: string) {
  const admin = createAdminClient();
  const { data: model } = await admin
    .from("models")
    .select("id,name")
    .eq("phone", phone)
    .maybeSingle();

  if (!model) return null;

  const { data: membership } = await admin
    .from("cast_members")
    .select("id")
    .eq("cast_id", castId)
    .eq("model_id", model.id)
    .maybeSingle();

  return {
    matched: true,
    name: model.name as string,
    alreadyOnCast: Boolean(membership),
  };
}

export async function getInvitationList(): Promise<InvitationWithRelations[]> {
  const admin = createAdminClient();
  const { data: invitations, error } = await admin
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (invitations ?? []) as Invitation[];
  if (!rows.length) return [];

  const castIds = Array.from(new Set(rows.map((row) => row.cast_id)));
  const modelIds = Array.from(
    new Set(
      rows
        .flatMap((row) => [row.target_model_id, row.claimed_model_id])
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const [{ data: casts }, { data: models }] = await Promise.all([
    admin.from("casts").select("*").in("id", castIds),
    modelIds.length
      ? admin.from("models").select("*").in("id", modelIds)
      : Promise.resolve({ data: [] }),
  ]);

  const castById = new Map(((casts ?? []) as Cast[]).map((cast) => [cast.id, cast]));
  const modelById = new Map(((models ?? []) as Model[]).map((model) => [model.id, model]));

  return rows
    .map((invitation) => {
      const cast = castById.get(invitation.cast_id);
      if (!cast) return null;
      return {
        ...invitation,
        cast,
        target_model: invitation.target_model_id
          ? modelById.get(invitation.target_model_id) ?? null
          : null,
        claimed_model: invitation.claimed_model_id
          ? modelById.get(invitation.claimed_model_id) ?? null
          : null,
      } as InvitationWithRelations;
    })
    .filter((row): row is InvitationWithRelations => Boolean(row));
}

export async function getInvitationInspection(
  invitationId: string,
): Promise<InvitationInspection | null> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("invitations")
    .select("*")
    .eq("id", invitationId)
    .maybeSingle();

  if (!row) return null;
  const invitation = row as Invitation;

  const [{ data: cast }, { data: target }, { data: claimed }] =
    await Promise.all([
      admin
        .from("casts")
        .select("id,title,client_name")
        .eq("id", invitation.cast_id)
        .maybeSingle(),
      invitation.target_model_id
        ? admin
            .from("models")
            .select("*")
            .eq("id", invitation.target_model_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      invitation.claimed_model_id
        ? admin
            .from("models")
            .select("*")
            .eq("id", invitation.claimed_model_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (!cast) return null;

  const model = (claimed as Model | null) ?? (target as Model | null) ?? null;
  let memberMedia: SubmissionMedia[] = [];

  if (invitation.claimed_model_id) {
    const { data: member } = await admin
      .from("cast_members")
      .select("submission_media")
      .eq("cast_id", invitation.cast_id)
      .eq("model_id", invitation.claimed_model_id)
      .maybeSingle();

    if (member && Array.isArray(member.submission_media)) {
      memberMedia = member.submission_media as SubmissionMedia[];
    }
  }

  const draft = normalizeDraft(invitation.draft_data);
  const draftProfile = draft.profile ?? {};
  const status = getEffectiveInvitationStatus(invitation);
  const isSubmitted = status === "submitted" || status === "completed";
  const draftMedia = draft.media ?? [];
  const media = isSubmitted
    ? memberMedia.length
      ? memberMedia
      : draftMedia
    : draftMedia;
  const mediaSource: InvitationInspection["mediaSource"] = media.length
    ? isSubmitted
      ? "submitted"
      : "draft"
    : null;

  const draftHeadshot = draft.headshot;
  const draftHeadshotUrl = draftHeadshot
    ? draftHeadshot.path
      ? publicHeadshotUrl(draftHeadshot.path)
      : draftHeadshot.url
    : null;

  return {
    id: invitation.id,
    token: invitation.token,
    status,
    castTitle: cast.title,
    clientName: cast.client_name ?? null,
    recipientName:
      model?.name ?? draftProfile.name ?? draft.lookup?.name ?? null,
    isMediaRequest: Boolean(invitation.target_model_id),
    requireMediaUpload: invitation.require_media_upload,
    expiresAt: invitation.expires_at,
    submittedAt: invitation.submitted_at,
    draftSavedAt: draft.savedAt ?? draft.clientUpdatedAt ?? null,
    modelId: model?.id ?? null,
    modelPhone: model?.phone ?? null,
    modelStatus: model?.status ?? null,
    profile: {
      name: model?.name ?? draftProfile.name ?? null,
      age: model?.age ?? draftProfile.age ?? null,
      phone: model?.phone ?? draft.phone ?? null,
      email: model?.email ?? draftProfile.email ?? null,
      city: model?.city ?? draftProfile.city ?? null,
      height_cm: model?.height_cm ?? draftProfile.height_cm ?? null,
      bust_cm: model?.bust_cm ?? draftProfile.bust_cm ?? null,
      waist_cm: model?.waist_cm ?? draftProfile.waist_cm ?? null,
      hips_cm: model?.hips_cm ?? draftProfile.hips_cm ?? null,
      shoe_size: model?.shoe_size ?? draftProfile.shoe_size ?? null,
      hair_color: model?.hair_color ?? draftProfile.hair_color ?? null,
      eye_color: model?.eye_color ?? draftProfile.eye_color ?? null,
      bio: model?.bio ?? draftProfile.bio ?? null,
      isHidden: model?.is_hidden ?? Boolean(draft.isHidden),
    },
    headshotUrl: model?.headshot_url ?? draftHeadshotUrl,
    media: await signMediaItems(media),
    mediaSource,
  };
}

export async function getRecentInvitations(limit = 5) {
  const invitations = await getInvitationList();
  return invitations
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);
}

export async function getInvitationSummaryCounts() {
  const invitations = await getInvitationList();
  const counts = {
    active: 0,
    inProgress: 0,
    submitted: 0,
    completed: 0,
    expired: 0,
  };

  for (const invitation of invitations) {
    const status = getEffectiveInvitationStatus(invitation);
    if (status === "active") counts.active += 1;
    if (status === "in_progress") counts.inProgress += 1;
    if (status === "submitted") counts.submitted += 1;
    if (status === "completed") counts.completed += 1;
    if (status === "expired") counts.expired += 1;
  }

  return counts;
}
