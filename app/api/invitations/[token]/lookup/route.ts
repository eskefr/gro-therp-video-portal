import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isReasonableToken } from "@/lib/invitations/tokens";
import {
  getEffectiveInvitationStatus,
  isInvitationOpen,
} from "@/lib/invitations/status";
import { normalizePhone } from "@/lib/phone";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import type { Invitation } from "@/types/app";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!isReasonableToken(token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!checkRateLimit(`lookup:${token}:${ip}`, 30, 10 * 60 * 1000).allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const phoneInput =
    body && typeof body === "object" && "phone" in body
      ? String((body as { phone?: unknown }).phone ?? "")
      : "";
  const phone = normalizePhone(phoneInput);

  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid phone number." },
      { status: 422 },
    );
  }

  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("id,cast_id,target_model_id,expires_at,status")
    .eq("token", token)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const status = getEffectiveInvitationStatus(invitation as Invitation);
  if (status === "expired") {
    return NextResponse.json(
      { error: "This invitation has expired." },
      { status: 410 },
    );
  }
  if (!isInvitationOpen(invitation as Invitation)) {
    return NextResponse.json(
      { error: "This invitation has already been submitted." },
      { status: 409 },
    );
  }
  if (invitation.target_model_id) {
    return NextResponse.json(
      { error: "This link is for a direct media request." },
      { status: 400 },
    );
  }

  const { data: model } = await admin
    .from("models")
    .select("id,name")
    .eq("phone", phone)
    .maybeSingle();

  if (!model) {
    return NextResponse.json({ found: false });
  }

  const { data: membership } = await admin
    .from("cast_members")
    .select("id")
    .eq("cast_id", invitation.cast_id)
    .eq("model_id", model.id)
    .maybeSingle();

  return NextResponse.json({
    found: true,
    name: model.name,
    alreadyOnCast: Boolean(membership),
  });
}
