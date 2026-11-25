"use client";

import { createBrowserClient } from "@/lib/supabase/browser";
import type { MediaKind } from "@/types/app";

export interface UploadedAsset {
  path: string;
  publicUrl?: string;
  name: string;
  mime: string;
  size: number;
}

interface SignedUploadResponse {
  bucket: "headshots" | "casting-media";
  path: string;
  token: string;
  publicUrl?: string;
  error?: string;
}

export async function uploadAsset(input: {
  file: File;
  purpose:
    | "invitation-media"
    | "invitation-headshot"
    | "application-headshot"
    | "admin-headshot";
  invitationToken?: string;
}): Promise<UploadedAsset> {
  const { file, purpose, invitationToken } = input;

  const ticketResponse = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purpose,
      invitationToken,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  const ticket = (await ticketResponse.json()) as SignedUploadResponse;

  if (!ticketResponse.ok) {
    throw new Error(ticket.error || "Could not prepare this upload.");
  }

  const supabase = createBrowserClient();
  const { error } = await supabase.storage
    .from(ticket.bucket)
    .uploadToSignedUrl(ticket.path, ticket.token, file, {
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error("The file upload failed. Please try again.");
  }

  return {
    path: ticket.path,
    publicUrl: ticket.publicUrl,
    name: file.name,
    mime: file.type,
    size: file.size,
  };
}

export function mediaKind(file: File): MediaKind {
  return file.type.startsWith("video/") ? "video" : "image";
}
