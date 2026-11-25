"use server";

import { revalidatePath } from "next/cache";
import { applicationSchema } from "@/lib/validation/schemas";
import { normalizePhone } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicHeadshotUrl, verifyStorageObjects } from "@/lib/storage/media";
import type { ActionResult } from "@/types/app";

export async function submitApplicationAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return { ok: false, error: "Enter a valid Danish or international number." };
  }

  const headshotPath = parsed.data.headshotPath;
  if (!headshotPath || !headshotPath.startsWith("applications/")) {
    return { ok: false, error: "Please upload a headshot before applying." };
  }

  const fileExists = await verifyStorageObjects("headshots", headshotPath.split("/").slice(0, 2).join("/"), [
    headshotPath,
  ]);
  if (!fileExists) {
    return { ok: false, error: "The headshot upload didn’t finish. Please try again." };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("models")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    return {
      ok: false,
      error:
        "A profile with this phone number already exists. Contact the agency if you need help.",
    };
  }

  const { data, error } = await admin
    .from("models")
    .insert({
      name: parsed.data.profile.name,
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
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A profile with this phone number already exists." };
    }
    return { ok: false, error: "We couldn’t send your application. Please try again." };
  }

  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  return { ok: true, data: { id: data.id } };
}
