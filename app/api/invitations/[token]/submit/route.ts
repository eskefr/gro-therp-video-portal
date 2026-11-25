import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isReasonableToken } from "@/lib/invitations/tokens";
import {
  getEffectiveInvitationStatus,
  isInvitationOpen,
} from "@/lib/invitations/status";
import { invitationSubmitSchema, profileSchema } from "@/lib/validation/schemas";
import { normalizePhone } from "@/lib/phone";
import { CASTING_MIME_TYPES, mediaKindFromMime } from "@/lib/media";
import {
  isStoragePathForInvitation,
  publicHeadshotUrl,
  verifyStorageObjects,
} from "@/lib/storage/media";
import type { Invitation, Model, SubmissionMedia } from "@/types/app";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!isReasonableToken(token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const parsed = invitationSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the form." },
      { status: 422 },
    );
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const invitation = row as Invitation;
  const effective = getEffectiveInvitationStatus(invitation);

  if (effective === "submitted" || effective === "completed") {
    return NextResponse.json({
      status: effective,
      alreadySubmitted: true,
      modelId: invitation.claimed_model_id,
    });
  }

  if (effective === "expired") {
    await admin
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", invitation.id)
      .in("status", ["active", "in_progress"]);
    return NextResponse.json(
      { error: "This invitation has expired." },
      { status: 410 },
    );
  }

  if (!isInvitationOpen(invitation)) {
    return NextResponse.json(
      { error: "This invitation is no longer open." },
      { status: 409 },
    );
  }

  const submittedMedia: SubmissionMedia[] = [];
  for (const item of parsed.data.media ?? []) {
    if (!item.path || !isStoragePathForInvitation(item.path, invitation.id)) {
      return NextResponse.json(
        { error: "One of the uploaded files could not be verified." },
        { status: 422 },
      );
    }
    if (!(CASTING_MIME_TYPES as readonly string[]).includes(item.mime)) {
      return NextResponse.json(
        { error: "One of the uploaded file types is not supported." },
        { status: 422 },
      );
    }
    submittedMedia.push({
      ...item,
      id: item.id || randomUUID(),
      kind: mediaKindFromMime(item.mime),
    });
  }

  if (invitation.require_media_upload && submittedMedia.length === 0) {
    return NextResponse.json(
      { error: "Please upload at least one casting photo or video." },
      { status: 422 },
    );
  }

  if (submittedMedia.length) {
    const folder = `invitations/${invitation.id}`;
    const confirmed = await verifyStorageObjects(
      "casting-media",
      folder,
      submittedMedia.map((item) => item.path as string),
    );
    if (!confirmed) {
      return NextResponse.json(
        { error: "One of your media uploads is missing. Please upload it again." },
        { status: 422 },
      );
    }
  }

  let model: Model | null = null;

  if (invitation.target_model_id) {
    const { data: target } = await admin
      .from("models")
      .select("*")
      .eq("id", invitation.target_model_id)
      .maybeSingle();

    if (!target) {
      return NextResponse.json(
        { error: "This casting request is no longer available." },
        { status: 409 },
      );
    }

    const { data: membership } = await admin
      .from("cast_members")
      .select("id")
      .eq("cast_id", invitation.cast_id)
      .eq("model_id", target.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: "This model is no longer attached to the cast." },
        { status: 409 },
      );
    }

    model = target as Model;
  } else {
    const phone = normalizePhone(parsed.data.phone ?? "");
    if (!phone) {
      return NextResponse.json(
        { error: "Please provide a valid phone number." },
        { status: 422 },
      );
    }

    const { data: existing } = await admin
      .from("models")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      model = existing as Model;
    } else {
      const profileResult = profileSchema.safeParse(parsed.data.profile);
      if (!profileResult.success) {
        return NextResponse.json(
          {
            error:
              profileResult.error.issues[0]?.message ??
              "Please complete your registration details.",
          },
          { status: 422 },
        );
      }

      const headshotPath = parsed.data.headshotPath;
      if (
        !headshotPath ||
        !isStoragePathForInvitation(headshotPath, invitation.id) ||
        !(await verifyStorageObjects("headshots", `invitations/${invitation.id}`, [
          headshotPath,
        ]))
      ) {
        return NextResponse.json(
          { error: "Please upload a headshot before submitting." },
          { status: 422 },
        );
      }

      const { data: created, error: createError } = await admin
        .from("models")
        .insert({
          name: profileResult.data.name,
          age: profileResult.data.age,
          phone,
          email: profileResult.data.email ?? null,
          city: profileResult.data.city ?? null,
          height_cm: profileResult.data.height_cm,
          bust_cm: profileResult.data.bust_cm,
          waist_cm: profileResult.data.waist_cm,
          hips_cm: profileResult.data.hips_cm,
          shoe_size: profileResult.data.shoe_size,
          hair_color: profileResult.data.hair_color ?? null,
          eye_color: profileResult.data.eye_color ?? null,
          bio: profileResult.data.bio ?? null,
          headshot_url: publicHeadshotUrl(headshotPath),
          is_hidden: Boolean(parsed.data.isHidden),
          status: "pending",
        })
        .select("*")
        .single();

      if (createError) {
        if (createError.code === "23505") {
          const { data: raced } = await admin
            .from("models")
            .select("*")
            .eq("phone", phone)
            .maybeSingle();
          if (!raced) {
            return NextResponse.json(
              { error: "Your profile could not be created. Please try again." },
              { status: 500 },
            );
          }
          model = raced as Model;
        } else {
          return NextResponse.json(
            { error: "Your profile could not be created. Please try again." },
            { status: 500 },
          );
        }
      } else {
        model = created as Model;
      }
    }
  }

  if (!model) {
    return NextResponse.json(
      { error: "We couldn’t match this submission to a profile." },
      { status: 422 },
    );
  }

  const { data: existingMember } = await admin
    .from("cast_members")
    .select("id")
    .eq("cast_id", invitation.cast_id)
    .eq("model_id", model.id)
    .maybeSingle();

  if (existingMember) {
    if (submittedMedia.length > 0) {
      const { error: mediaError } = await admin
        .from("cast_members")
        .update({ submission_media: submittedMedia })
        .eq("id", existingMember.id);
      if (mediaError) {
        return NextResponse.json(
          { error: "Your media could not be attached to the cast." },
          { status: 500 },
        );
      }
    }
  } else {
    const { error: memberError } = await admin.from("cast_members").insert({
      cast_id: invitation.cast_id,
      model_id: model.id,
      role_notes: null,
      submission_media: submittedMedia,
    });
    if (memberError) {
      return NextResponse.json(
        { error: "You could not be added to the cast. Please try again." },
        { status: 500 },
      );
    }
  }

  const submittedAt = new Date().toISOString();
  const { error: invitationError } = await admin
    .from("invitations")
    .update({
      status: "submitted",
      claimed_model_id: model.id,
      submitted_at: submittedAt,
      draft_data: {
        ...invitation.draft_data,
        media: submittedMedia,
        savedAt: submittedAt,
      },
    })
    .eq("id", invitation.id)
    .in("status", ["active", "in_progress"]);

  if (invitationError) {
    return NextResponse.json(
      { error: "Your submission was saved, but the link could not be closed." },
      { status: 500 },
    );
  }

  revalidatePath("/admin/invitations");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/jobs", "layout");
  revalidatePath("/admin");
  revalidatePath("/archive");

  return NextResponse.json({
    status: "submitted",
    mode: invitation.target_model_id ? "media-request" : "cast-invite",
    modelId: model.id,
  });
}
