import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  AdminStats,
  Model,
  PendingApplication,
  PublicModel,
  PublicModelFilters,
} from "@/types/app";

export const ARCHIVE_PAGE_SIZE = 24;

const PUBLIC_MODEL_COLUMNS =
  "id,initials,age,headshot_url,created_at";

const ADMIN_MODEL_COLUMNS =
  "id,name,phone,email,city,height_cm,bust_cm,waist_cm,hips_cm,shoe_size,hair_color,eye_color,bio,age,initials,headshot_url,media_history,is_hidden,status,created_at,updated_at";

export async function getPublicModels(filters: PublicModelFilters) {
  const supabase = createPublicClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * ARCHIVE_PAGE_SIZE;
  const to = from + ARCHIVE_PAGE_SIZE - 1;

  let query = supabase
    .from("models")
    .select(PUBLIC_MODEL_COLUMNS, { count: "exact" })
    .eq("status", "approved")
    .eq("is_hidden", false);

  if (filters.q) {
    const clean = filters.q.replace(/[%,()]/g, "").trim();
    if (clean) query = query.ilike("initials", `%${clean}%`);
  }
  if (filters.ageMin) query = query.gte("age", filters.ageMin);
  if (filters.ageMax) query = query.lte("age", filters.ageMax);

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    models: (data ?? []) as PublicModel[],
    total: count ?? 0,
    page,
    pageSize: ARCHIVE_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / ARCHIVE_PAGE_SIZE)),
  };
}

export async function getApprovedModels() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("models")
    .select(ADMIN_MODEL_COLUMNS)
    .eq("status", "approved")
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []) as Model[];
}

export async function getPendingApplications(): Promise<PendingApplication[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("models")
    .select(ADMIN_MODEL_COLUMNS)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const models = (data ?? []) as Model[];
  if (!models.length) return models;

  const { data: invitations } = await admin
    .from("invitations")
    .select("id,claimed_model_id,cast_id,token,created_at")
    .in("claimed_model_id", models.map((model) => model.id))
    .in("status", ["submitted", "completed"])
    .order("created_at", { ascending: false });

  if (!invitations?.length) return models;

  const castIds = Array.from(new Set(invitations.map((row) => row.cast_id)));
  const { data: casts } = await admin
    .from("casts")
    .select("id,title")
    .in("id", castIds);

  const castTitle = new Map((casts ?? []).map((cast) => [cast.id, cast.title]));
  const source = new Map<
    string,
    NonNullable<PendingApplication["source"]>
  >();

  for (const invitation of invitations) {
    if (!invitation.claimed_model_id || source.has(invitation.claimed_model_id)) {
      continue;
    }
    source.set(invitation.claimed_model_id, {
      castTitle: castTitle.get(invitation.cast_id) ?? "Cast invitation",
      token: invitation.token,
      invitationId: invitation.id,
    });
  }

  return models.map((model) => ({
    ...model,
    source: source.get(model.id) ?? null,
  }));
}

export async function getModelById(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("models")
    .select(ADMIN_MODEL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Model | null) ?? null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient();

  const [approved, hidden, pending, openCasts, invitations] = await Promise.all([
    admin
      .from("models")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    admin
      .from("models")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_hidden", true),
    admin
      .from("models")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("casts")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    admin.from("invitations").select("status,expires_at"),
  ]);

  const activeInvitations = (invitations.data ?? []).filter((invitation) => {
    if (invitation.status === "expired") return false;
    if (invitation.status === "submitted" || invitation.status === "completed") {
      return false;
    }
    return new Date(invitation.expires_at).getTime() > Date.now();
  }).length;

  return {
    approved: approved.count ?? 0,
    hidden: hidden.count ?? 0,
    pending: pending.count ?? 0,
    openCasts: openCasts.count ?? 0,
    activeInvitations,
  };
}
