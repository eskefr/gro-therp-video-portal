import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Cast,
  CastDetail,
  CastMemberWithModel,
  CastWithCount,
  Invitation,
  Model,
  SubmissionMedia,
} from "@/types/app";

const CAST_COLUMNS =
  "id,title,client_name,description,location,shoot_start,shoot_end,status,created_at,updated_at";

export async function getCastsWithCounts(): Promise<CastWithCount[]> {
  const admin = createAdminClient();
  const { data: casts, error } = await admin
    .from("casts")
    .select(CAST_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const { data: members } = await admin
    .from("cast_members")
    .select("cast_id,submission_media");

  const counts = new Map<string, { members: number; media: number }>();
  for (const member of members ?? []) {
    const current = counts.get(member.cast_id) ?? { members: 0, media: 0 };
    current.members += 1;
    current.media += Array.isArray(member.submission_media)
      ? (member.submission_media as SubmissionMedia[]).length
      : 0;
    counts.set(member.cast_id, current);
  }

  return ((casts ?? []) as Cast[]).map((cast) => ({
    ...cast,
    memberCount: counts.get(cast.id)?.members ?? 0,
    mediaCount: counts.get(cast.id)?.media ?? 0,
  }));
}

export async function getCastById(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("casts")
    .select(CAST_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Cast | null) ?? null;
}

export async function getCastDetail(id: string): Promise<CastDetail | null> {
  const admin = createAdminClient();
  const cast = await getCastById(id);
  if (!cast) return null;

  const { data: memberRows, error: membersError } = await admin
    .from("cast_members")
    .select("*")
    .eq("cast_id", id)
    .order("created_at");

  if (membersError) throw new Error(membersError.message);

  const modelIds = Array.from(
    new Set((memberRows ?? []).map((member) => member.model_id)),
  );
  const { data: models } = modelIds.length
    ? await admin.from("models").select("*").in("id", modelIds)
    : { data: [] };

  const modelById = new Map(
    ((models ?? []) as Model[]).map((model) => [model.id, model]),
  );

  const members = (memberRows ?? [])
    .map((member) => {
      const model = modelById.get(member.model_id);
      if (!model) return null;
      return {
        ...member,
        submission_media: Array.isArray(member.submission_media)
          ? member.submission_media
          : [],
        model,
      } as CastMemberWithModel;
    })
    .filter((member): member is CastMemberWithModel => Boolean(member));

  const { data: invitations } = await admin
    .from("invitations")
    .select("*")
    .eq("cast_id", id)
    .order("created_at", { ascending: false });

  return {
    cast,
    members,
    invitations: (invitations ?? []) as Invitation[],
  };
}

export async function getRecentCasts(limit = 4) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("casts")
    .select(CAST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Cast[];
}
