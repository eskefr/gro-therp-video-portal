"use server";

import { revalidatePath } from "next/cache";
import {
  castSchema,
  createInvitationSchema,
  roleNotesSchema,
} from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInvitationToken } from "@/lib/invitations/tokens";
import { hasAdminSession, revalidateAdminSurfaces } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/app";

export async function createCastAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const parsed = castSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the cast details.",
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("casts")
    .insert({
      title: parsed.data.title,
      client_name: parsed.data.client_name ?? null,
      description: parsed.data.description ?? null,
      location: parsed.data.location ?? null,
      shoot_start: parsed.data.shoot_start ?? null,
      shoot_end: parsed.data.shoot_end ?? null,
      status: "open",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: "The cast could not be created." };

  revalidateAdminSurfaces();
  return { ok: true, data: { id: data.id } };
}

export async function updateCastStatusAction(
  castId: string,
  status: "open" | "closed",
): Promise<ActionResult> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("casts")
    .update({ status })
    .eq("id", castId);

  if (error) return { ok: false, error: "The cast status could not be updated." };

  revalidateAdminSurfaces();
  revalidatePath(`/admin/jobs/${castId}`);
  return { ok: true };
}

export async function addCastMemberAction(
  castId: string,
  modelId: string,
): Promise<ActionResult> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const admin = createAdminClient();
  const { data: model } = await admin
    .from("models")
    .select("id,status")
    .eq("id", modelId)
    .maybeSingle();

  if (!model || model.status !== "approved") {
    return { ok: false, error: "Only approved models can be added." };
  }

  const { error } = await admin.from("cast_members").insert({
    cast_id: castId,
    model_id: modelId,
    role_notes: null,
    submission_media: [],
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That model is already in this cast." };
    }
    return { ok: false, error: "The model could not be added." };
  }

  revalidateAdminSurfaces();
  revalidatePath(`/admin/jobs/${castId}`);
  return { ok: true };
}

export async function removeCastMemberAction(
  castId: string,
  memberId: string,
): Promise<ActionResult> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("cast_members")
    .delete()
    .eq("id", memberId)
    .eq("cast_id", castId);

  if (error) return { ok: false, error: "The model could not be removed." };

  revalidateAdminSurfaces();
  revalidatePath(`/admin/jobs/${castId}`);
  return { ok: true };
}

export async function updateRoleNotesAction(
  input: unknown,
): Promise<ActionResult> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const parsed = roleNotesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Check the role notes." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("cast_members")
    .update({ role_notes: parsed.data.roleNotes || null })
    .eq("id", parsed.data.memberId)
    .eq("cast_id", parsed.data.castId);

  if (error) return { ok: false, error: "Role notes could not be saved." };

  revalidatePath(`/admin/jobs/${parsed.data.castId}`);
  return { ok: true };
}

export async function createInvitationAction(
  input: unknown,
): Promise<ActionResult<{ token: string }>> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const parsed = createInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the invitation details.",
    };
  }

  const admin = createAdminClient();
  const { data: cast } = await admin
    .from("casts")
    .select("id,status")
    .eq("id", parsed.data.castId)
    .maybeSingle();

  if (!cast) return { ok: false, error: "That cast no longer exists." };
  if (cast.status === "closed") {
    return { ok: false, error: "Reopen this cast before generating a link." };
  }

  if (parsed.data.targetModelId) {
    const { data: membership } = await admin
      .from("cast_members")
      .select("id")
      .eq("cast_id", parsed.data.castId)
      .eq("model_id", parsed.data.targetModelId)
      .maybeSingle();

    if (!membership) {
      return {
        ok: false,
        error: "Media request links can only target models already in this cast.",
      };
    }
  }

  const token = generateInvitationToken();
  const { error } = await admin.from("invitations").insert({
    token,
    cast_id: parsed.data.castId,
    target_model_id: parsed.data.targetModelId ?? null,
    require_media_upload: parsed.data.targetModelId
      ? true
      : parsed.data.requireMedia,
    expires_at: parsed.data.expiresAt,
    status: "active",
    draft_data: {},
  });

  if (error) return { ok: false, error: "The link could not be generated." };

  revalidateAdminSurfaces();
  revalidatePath(`/admin/jobs/${parsed.data.castId}`);
  return { ok: true, data: { token } };
}

export async function markInvitationCompletedAction(
  invitationId: string,
): Promise<ActionResult> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("invitations")
    .update({ status: "completed" })
    .eq("id", invitationId)
    .eq("status", "submitted");

  if (error) return { ok: false, error: "The invitation could not be completed." };

  revalidateAdminSurfaces();
  return { ok: true };
}
