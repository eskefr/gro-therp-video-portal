import { z } from "zod";
import {
  CASTING_MIME_TYPES,
  IMAGE_MIME_TYPES,
} from "@/lib/media";
import {
  MAX_CASTING_MEDIA_BYTES,
  MAX_CASTING_MEDIA_FILES,
  MAX_HEADSHOT_BYTES,
} from "@/lib/constants";

const emptyToNull = (value: unknown) => {
  if (value === "" || value === undefined || value === null) return null;
  return value;
};

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (value) => {
      const next = emptyToNull(value);
      if (next === null) return null;
      return Number(next);
    },
    z.number().int().min(min).max(max).nullable(),
  );

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (value) => {
      const next = emptyToNull(value);
      if (next === null) return null;
      return Number(next);
    },
    z.number().min(min).max(max).nullable(),
  );

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  email: z
    .preprocess(emptyToNull, z.string().email("Enter a valid email.").nullable())
    .optional(),
  city: z.preprocess(emptyToNull, z.string().max(80).nullable()).optional(),
  height_cm: optionalInt(130, 220),
  bust_cm: optionalInt(50, 160),
  waist_cm: optionalInt(45, 160),
  hips_cm: optionalInt(50, 170),
  shoe_size: optionalNumber(30, 52),
  hair_color: z.preprocess(emptyToNull, z.string().max(40).nullable()).optional(),
  eye_color: z.preprocess(emptyToNull, z.string().max(40).nullable()).optional(),
  bio: z.preprocess(emptyToNull, z.string().max(1200).nullable()).optional(),
});

export const partialProfileSchema = profileSchema.partial();

export const phoneSchema = z
  .string()
  .trim()
  .min(4, "Enter a phone number.")
  .max(30);

export const applicationSchema = z.object({
  phone: phoneSchema,
  profile: profileSchema,
  headshotPath: z.string().optional(),
  isHidden: z.boolean().default(false),
});

export const adminModelSchema = applicationSchema.extend({
  isHidden: z.boolean().default(false),
});

export const castSchema = z.object({
  title: z.string().trim().min(2, "Give this cast a title.").max(140),
  client_name: z.preprocess(emptyToNull, z.string().max(120).nullable()).optional(),
  description: z.preprocess(emptyToNull, z.string().max(2000).nullable()).optional(),
  location: z.preprocess(emptyToNull, z.string().max(120).nullable()).optional(),
  shoot_start: z.preprocess(emptyToNull, z.string().nullable()).optional(),
  shoot_end: z.preprocess(emptyToNull, z.string().nullable()).optional(),
});

export const mediaItemSchema = z.object({
  id: z.string(),
  kind: z.enum(["image", "video"]),
  path: z.string().optional(),
  url: z.string().optional(),
  name: z.string().min(1).max(240),
  mime: z.string().min(3).max(100),
  size: z.number().nonnegative().max(MAX_CASTING_MEDIA_BYTES),
});

export const draftLookupSchema = z.object({
  matched: z.boolean(),
  name: z.string().max(100).optional(),
  alreadyOnCast: z.boolean().optional(),
});

export const invitationDraftSchema = z.object({
  schemaVersion: z.number().int().optional(),
  step: z.enum(["phone", "existing", "register", "media"]).optional(),
  phone: z.string().max(30).optional(),
  profile: partialProfileSchema.optional(),
  isHidden: z.boolean().optional(),
  headshot: z
    .object({
      path: z.string().max(500).optional(),
      url: z.string().max(1000),
      name: z.string().max(240).optional(),
    })
    .nullable()
    .optional(),
  media: z.array(mediaItemSchema).max(MAX_CASTING_MEDIA_FILES).optional(),
  lookup: draftLookupSchema.optional(),
  clientUpdatedAt: z.string().optional(),
});

export const invitationSubmitSchema = z.object({
  phone: z.string().max(30).optional(),
  profile: profileSchema.optional(),
  isHidden: z.boolean().optional(),
  headshotPath: z.string().max(500).optional(),
  media: z.array(mediaItemSchema).max(MAX_CASTING_MEDIA_FILES).optional(),
});

export const createInvitationSchema = z.object({
  castId: z.string().uuid(),
  targetModelId: z.string().uuid().optional().nullable(),
  requireMedia: z.boolean(),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .refine((value) => new Date(value).getTime() > Date.now() + 60_000, {
      message: "Expiry must be in the future.",
    }),
});

export const uploadTicketSchema = z.object({
  purpose: z.enum([
    "invitation-media",
    "invitation-headshot",
    "application-headshot",
    "admin-headshot",
  ]),
  invitationToken: z.string().optional(),
  filename: z.string().min(1).max(240),
  contentType: z.string().min(3).max(100),
  size: z.number().positive(),
});

export const mediaSubmitSchema = z.object({
  media: z.array(mediaItemSchema).max(MAX_CASTING_MEDIA_FILES),
});

export const headshotUploadRules = {
  mimeTypes: IMAGE_MIME_TYPES,
  maxBytes: MAX_HEADSHOT_BYTES,
};

export const castingUploadRules = {
  mimeTypes: CASTING_MIME_TYPES,
  maxBytes: MAX_CASTING_MEDIA_BYTES,
};

export const roleNotesSchema = z.object({
  castId: z.string().uuid(),
  memberId: z.string().uuid(),
  roleNotes: z.string().max(1200),
});
