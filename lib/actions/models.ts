"use server";

import { adminModelSchema } from "@/lib/validation/schemas";
import { normalizePhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicHeadshotUrl, verifyStorageObjects } from "@/lib/storage/media";
import { hasAdminSession, revalidateAdminSurfaces } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/app";

export async function createApprovedModelAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const parsed = adminModelSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the model details.",
    };
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return { ok: false, error: "Enter a valid Danish or international number." };
  }

  const headshotPath = parsed.data.headshotPath;
  if (!headshotPath || !headshotPath.startsWith("archive/")) {
    return { ok: false, error: "Upload a headshot for this model." };
  }

  const folder = headshotPath.split("/").slice(0, 2).join("/");
  if (!(await verifyStorageObjects("headshots", folder, [headshotPath]))) {
    return { ok: false, error: "The headshot upload didn’t finish. Try again." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("models")
    .insert({
      name: parsed.data.profile.name,
      age: parsed.data.profile.age,
      phone,
      email: parsed.data.profile.email ?? null,
      city: parsed.data.profile.city ?? null,
      height_cm: parsed.data.profile.height_cm,
      bust_cm: parsed.data.profile.bust_cm,
      waist_cm: parsed.data.profile.waist_cm,
      hips_cm: parsed.data.profile.hips_cm,
      shoe_size: parsed.data.profile.shoe_size,
      hair_color: parsed.data.profile.hair_color ?? null,
      eye_color: parsed.data.profile.eye_color ?? null,
      bio: parsed.data.profile.bio ?? null,
      headshot_url: publicHeadshotUrl(headshotPath),
      is_hidden: parsed.data.isHidden,
      status: "approved",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That phone number is already on file." };
    }
    return { ok: false, error: "The model could not be created." };
  }

  revalidateAdminSurfaces({ archive: true });
  return { ok: true, data: { id: data.id } };
}

export async function approveModelAction(
  modelId: string,
): Promise<ActionResult> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("models")
    .update({ status: "approved" })
    .eq("id", modelId)
    .eq("status", "pending");

  if (error) return { ok: false, error: "The model could not be approved." };

  await admin
    .from("invitations")
    .update({ status: "completed" })
    .eq("claimed_model_id", modelId)
    .eq("status", "submitted");

  revalidateAdminSurfaces({ archive: true });
  return { ok: true };
}

export async function rejectModelAction(
  modelId: string,
): Promise<ActionResult> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("models").delete().eq("id", modelId);

  if (error) return { ok: false, error: "The application could not be rejected." };

  revalidateAdminSurfaces({ archive: true });
  return { ok: true };
}
