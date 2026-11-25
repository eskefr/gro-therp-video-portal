import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { uploadTicketSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CASTING_MIME_TYPES,
  IMAGE_MIME_TYPES,
  extensionForMime,
} from "@/lib/media";
import {
  MAX_CASTING_MEDIA_BYTES,
  MAX_HEADSHOT_BYTES,
} from "@/lib/constants";
import { getAdminSession } from "@/lib/auth/admin-session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { isReasonableToken } from "@/lib/invitations/tokens";
import {
  getEffectiveInvitationStatus,
  isInvitationOpen,
} from "@/lib/invitations/status";
import { publicHeadshotUrl } from "@/lib/storage/media";
import type { Invitation } from "@/types/app";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const parsed = uploadTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid upload request." },
      { status: 422 },
    );
  }

  const { purpose, filename, contentType, size, invitationToken } = parsed.data;
  const admin = createAdminClient();
  let bucket: "headshots" | "casting-media" = "headshots";
  let folder = "";
  let maxBytes = MAX_HEADSHOT_BYTES;
  let allowed: readonly string[] = IMAGE_MIME_TYPES;

  if (purpose === "invitation-media" || purpose === "invitation-headshot") {
    if (!invitationToken || !isReasonableToken(invitationToken)) {
      return NextResponse.json({ error: "Invalid invitation." }, { status: 403 });
    }

    const { data: invitation } = await admin
      .from("invitations")
      .select("id,status,expires_at,target_model_id")
      .eq("token", invitationToken)
      .maybeSingle();

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation." }, { status: 403 });
    }

    if (
      getEffectiveInvitationStatus(invitation as Invitation) === "expired" ||
      !isInvitationOpen(invitation as Invitation)
    ) {
      return NextResponse.json(
        { error: "This invitation is no longer accepting uploads." },
        { status: 410 },
      );
    }

    folder = `invitations/${invitation.id}`;

    if (purpose === "invitation-media") {
      bucket = "casting-media";
      allowed = CASTING_MIME_TYPES;
      maxBytes = MAX_CASTING_MEDIA_BYTES;
    }
  } else if (purpose === "application-headshot") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (!checkRateLimit(`apply-upload:${ip}`, 10, 10 * 60 * 1000).allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait and try again." },
        { status: 429 },
      );
    }
    folder = `applications/${randomUUID()}`;
  } else if (purpose === "admin-headshot") {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: "Admin session required." }, { status: 403 });
    }
    folder = `archive/${randomUUID()}`;
  }

  if (!allowed.includes(contentType)) {
    return NextResponse.json(
      { error: "That file type is not supported." },
      { status: 415 },
    );
  }

  if (size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return NextResponse.json(
      { error: `Files must be smaller than ${limitMb} MB.` },
      { status: 413 },
    );
  }

  const extension = extensionForMime(contentType);
  if (!extension) {
    return NextResponse.json(
      { error: "That file type is not supported." },
      { status: 415 },
    );
  }

  const baseName = filename.replace(/\.[^.]+$/, "").slice(0, 40);
  const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "-") || "upload";
  const path = `${folder}/${safeName}-${randomUUID()}.${extension}`;

  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not prepare the upload. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    bucket,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl:
      bucket === "headshots" ? publicHeadshotUrl(path) : undefined,
  });
}
