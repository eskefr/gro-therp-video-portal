import type { DraftData, SubmissionMedia } from "@/types/app";
import { invitationDraftSchema } from "@/lib/validation/schemas";

const MAX_DRAFT_BYTES = 64 * 1024;

export function normalizeDraft(value: unknown): DraftData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { schemaVersion: 1 };
  }

  const candidate = value as DraftData;
  const media = Array.isArray(candidate.media)
    ? candidate.media.filter(
        (item): item is SubmissionMedia =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as SubmissionMedia).name === "string",
      )
    : [];

  return {
    ...candidate,
    schemaVersion: 1,
    media,
  };
}

export function parseDraftForStorage(value: unknown) {
  const parsed = invitationDraftSchema.parse(value);
  const serialized = JSON.stringify(parsed);
  if (serialized.length > MAX_DRAFT_BYTES) {
    throw new Error("This draft is larger than the allowed limit.");
  }
  return parsed;
}

export function draftHasProfile(draft: DraftData) {
  return Boolean(draft.profile?.name || draft.profile?.email || draft.profile?.city);
}

export function draftMediaPaths(draft: DraftData) {
  return (draft.media ?? [])
    .map((item) => item.path)
    .filter((path): path is string => Boolean(path));
}
