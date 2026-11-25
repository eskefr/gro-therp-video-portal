import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SignedMedia, SubmissionMedia } from "@/types/app";

const SIGNED_URL_TTL = 60 * 60;

export async function signMediaItems(
  items: SubmissionMedia[],
): Promise<SignedMedia[]> {
  if (!items.length) return [];

  const admin = createAdminClient();
  const paths = items
    .map((item) => item.path)
    .filter((path): path is string => Boolean(path));

  const signedByPath = new Map<string, string>();

  if (paths.length) {
    const { data } = await admin.storage
      .from("casting-media")
      .createSignedUrls(paths, SIGNED_URL_TTL);

    for (const entry of data ?? []) {
      if (entry.path && entry.signedUrl) {
        signedByPath.set(entry.path, entry.signedUrl);
      }
    }
  }

  return items.map((item) => ({
    ...item,
    signedUrl: item.path ? signedByPath.get(item.path) : item.url,
  }));
}

export async function signMediaCollections(
  collections: SubmissionMedia[][],
): Promise<SignedMedia[][]> {
  const all = collections.flat();
  const signed = await signMediaItems(all);
  let cursor = 0;
  return collections.map((collection) => {
    const next = signed.slice(cursor, cursor + collection.length);
    cursor += collection.length;
    return next;
  });
}

export function publicHeadshotUrl(path: string) {
  const admin = createAdminClient();
  return admin.storage.from("headshots").getPublicUrl(path).data.publicUrl;
}

export async function verifyStorageObjects(
  bucket: "headshots" | "casting-media",
  folder: string,
  paths: string[],
) {
  if (!paths.length) return true;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(bucket)
    .list(folder, { limit: 100 });

  if (error) return false;

  const names = new Set((data ?? []).map((entry) => entry.name));
  return paths.every((path) => names.has(path.split("/").pop() ?? ""));
}

export function isStoragePathForInvitation(path: string, invitationId: string) {
  return path.startsWith(`invitations/${invitationId}/`);
}
