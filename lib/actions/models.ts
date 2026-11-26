"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { adminModelSchema, updateModelSchema } from "@/lib/validation/schemas";
import { MODEL_PLACEHOLDER_HEADSHOT } from "@/lib/constants";
import { normalizePhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicHeadshotUrl, verifyStorageObjects } from "@/lib/storage/media";
import { hasAdminSession, revalidateAdminSurfaces } from "@/lib/actions/helpers";
import type { ActionResult, SubmissionMedia } from "@/types/app";

function mediaHistoryWithHeadshot(
  history: unknown,
  headshotUrl: string | null | undefined,
) {
  const items = Array.isArray(history)
    ? (history as SubmissionMedia[])
    : [];

  if (
    !headshotUrl ||
    headshotUrl === MODEL_PLACEHOLDER_HEADSHOT ||
    items.some((item) => item.url === headshotUrl)
  ) {
    return items;
  }

  const extension = headshotUrl.split("?")[0].split(".").pop()?.toLowerCase();
  const mime =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  return [
    ...items,
    {
      id: randomUUID(),
      kind: "image" as const,
      url: headshotUrl,
      name: "Previous profile photo",
      mime,
      size: 0,
    },
  ];
}

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

export async function updateModelAction(
  input: unknown,
): Promise<ActionResult<{ phone: string }>> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const parsed = updateModelSchema.safeParse(input);
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

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("models")
    .select("id,phone,headshot_url,media_history")
    .eq("id", parsed.data.modelId)
    .maybeSingle();

  if (!current) return { ok: false, error: "That profile no longer exists." };

  let headshotUrl = current.headshot_url as string;
  let mediaHistory = Array.isArray(current.media_history)
    ? (current.media_history as SubmissionMedia[])
    : [];

  const headshotPath = parsed.data.headshotPath;
  if (headshotPath) {
    if (!headshotPath.startsWith("archive/")) {
      return { ok: false, error: "Upload a headshot for this model." };
    }

    const folder = headshotPath.split("/").slice(0, 2).join("/");
    if (!(await verifyStorageObjects("headshots", folder, [headshotPath]))) {
      return { ok: false, error: "The headshot upload didn’t finish. Try again." };
    }

    const nextHeadshotUrl = publicHeadshotUrl(headshotPath);
    if (nextHeadshotUrl !== headshotUrl) {
      mediaHistory = mediaHistoryWithHeadshot(mediaHistory, headshotUrl);
      headshotUrl = nextHeadshotUrl;
    }
  }

  const { data, error } = await admin
    .from("models")
    .update({
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
      headshot_url: headshotUrl,
      media_history: mediaHistory,
      is_hidden: parsed.data.isHidden,
    })
    .eq("id", parsed.data.modelId)
    .select("phone")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That phone number is already on file." };
    }
    return { ok: false, error: "The profile could not be saved." };
  }

  revalidateAdminSurfaces({ archive: true });
  revalidatePath(`/admin/models/${String(current.phone).replace(/\D/g, "")}`);
  revalidatePath(`/admin/models/${String(data.phone).replace(/\D/g, "")}`);
  return { ok: true, data: { phone: data.phone } };
}

export async function approveModelAction(
  modelId: string,
  options?: { usePlaceholder?: boolean },
): Promise<ActionResult> {
  if (!(await hasAdminSession())) {
    return { ok: false, error: "Admin session required." };
  }

  const admin = createAdminClient();
  const usePlaceholder = options?.usePlaceholder ?? true;
  const { data: current } = await admin
    .from("models")
    .select("headshot_url,media_history")
    .eq("id", modelId)
    .eq("status", "pending")
    .maybeSingle();

  if (!current) {
    return { ok: false, error: "This application is no longer pending." };
  }

  const update: {
    status: "approved";
    headshot_url?: string;
    media_history?: SubmissionMedia[];
  } = { status: "approved" };

  if (
    usePlaceholder &&
    current.headshot_url &&
    current.headshot_url !== MODEL_PLACEHOLDER_HEADSHOT
  ) {
    update.headshot_url = MODEL_PLACEHOLDER_HEADSHOT;
    update.media_history = mediaHistoryWithHeadshot(
      current.media_history,
      current.headshot_url,
    );
  }

  const { error } = await admin
    .from("models")
    .update(update)
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
