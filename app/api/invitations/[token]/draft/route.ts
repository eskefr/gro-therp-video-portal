import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isReasonableToken } from "@/lib/invitations/tokens";
import {
  getEffectiveInvitationStatus,
  isInvitationOpen,
} from "@/lib/invitations/status";
import { parseDraftForStorage } from "@/lib/invitations/draft";
import { invitationDraftSchema } from "@/lib/validation/schemas";
import type { Invitation } from "@/types/app";

const bodySchema = z.object({
  draft: invitationDraftSchema,
});

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
    return NextResponse.json({ error: "Invalid draft payload." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid draft." },
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
  const status = getEffectiveInvitationStatus(invitation);

  if (status === "expired") {
    if (invitation.status === "active" || invitation.status === "in_progress") {
      await admin
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id)
        .in("status", ["active", "in_progress"]);
    }
    return NextResponse.json(
      { error: "This invitation has expired." },
      { status: 410 },
    );
  }

  if (!isInvitationOpen(invitation)) {
    return NextResponse.json(
      { error: "This invitation has already been submitted." },
      { status: 409 },
    );
  }

  let draft;
  try {
    draft = parseDraftForStorage(parsed.data.draft);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "The draft could not be saved.",
      },
      { status: 422 },
    );
  }

  const expectedMediaPrefix = `invitations/${invitation.id}/`;
  const invalidMedia = (draft.media ?? []).some(
    (item) => item.path && !item.path.startsWith(expectedMediaPrefix),
  );
  if (invalidMedia) {
    return NextResponse.json({ error: "Invalid media path." }, { status: 422 });
  }

  const headshotPath = draft.headshot?.path;
  if (headshotPath && !headshotPath.startsWith(expectedMediaPrefix)) {
    return NextResponse.json({ error: "Invalid headshot path." }, { status: 422 });
  }

  const savedAt = new Date().toISOString();
  const nextStatus = invitation.status === "active" ? "in_progress" : invitation.status;

  const { data: updated, error } = await admin
    .from("invitations")
    .update({
      draft_data: {
        ...draft,
        savedAt,
        clientUpdatedAt: draft.clientUpdatedAt ?? savedAt,
      },
      status: nextStatus,
    })
    .eq("id", invitation.id)
    .in("status", ["active", "in_progress"])
    .gt("expires_at", new Date().toISOString())
    .select("status,updated_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "The draft could not be saved." },
      { status: 500 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: "This invitation is no longer accepting drafts." },
      { status: 410 },
    );
  }

  return NextResponse.json({
    savedAt,
    status: updated.status,
  });
}
