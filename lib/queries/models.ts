import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  AdminStats,
  Model,
  PendingApplication,
  PublicModel,
  PublicModelFacets,
  PublicModelFilters,
} from "@/types/app";

export const ARCHIVE_PAGE_SIZE = 24;

const PUBLIC_MODEL_COLUMNS =
  "id,name,city,height_cm,bust_cm,waist_cm,hips_cm,shoe_size,hair_color,eye_color,bio,headshot_url,created_at";

const ADMIN_MODEL_COLUMNS =
  "id,name,phone,email,city,height_cm,bust_cm,waist_cm,hips_cm,shoe_size,hair_color,eye_color,bio,headshot_url,is_hidden,status,created_at,updated_at";

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
    if (clean) query = query.ilike("name", `%${clean}%`);
  }
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.hair) query = query.eq("hair_color", filters.hair);
  if (filters.eyes) query = query.eq("eye_color", filters.eyes);
  if (filters.heightMin) query = query.gte("height_cm", filters.heightMin);
  if (filters.heightMax) query = query.lte("height_cm", filters.heightMax);

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

export async function getPublicModelFacets(): Promise<PublicModelFacets> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("models")
    .select("city,hair_color,eye_color")
    .eq("status", "approved")
    .eq("is_hidden", false);

  if (error) throw new Error(error.message);

  const cities = new Set<string>();
  const hairColors = new Set<string>();
  const eyeColors = new Set<string>();

  for (const row of data ?? []) {
    if (row.city) cities.add(row.city);
    if (row.hair_color) hairColors.add(row.hair_color);
    if (row.eye_color) eyeColors.add(row.eye_color);
  }

  const sorted = (values: Set<string>) =>
    Array.from(values).sort((a, b) => a.localeCompare(b));

  return {
    cities: sorted(cities),
    hairColors: sorted(hairColors),
    eyeColors: sorted(eyeColors),
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
    .select("claimed_model_id,cast_id,token")
    .in("claimed_model_id", models.map((model) => model.id))
    .eq("status", "submitted");

  if (!invitations?.length) return models;

  const castIds = Array.from(new Set(invitations.map((row) => row.cast_id)));
  const { data: casts } = await admin
    .from("casts")
    .select("id,title")
    .in("id", castIds);

  const castTitle = new Map((casts ?? []).map((cast) => [cast.id, cast.title]));
  const source = new Map(
    invitations.map((invitation) => [
      invitation.claimed_model_id,
      {
        castTitle: castTitle.get(invitation.cast_id) ?? "Cast invitation",
        token: invitation.token,
      },
    ]),
  );

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
