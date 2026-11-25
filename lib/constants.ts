export const BRAND = {
  name: "GRO-THERP",
  fullName: "Gro-Therp Casting",
  email: "casting@gro-therp.com",
  city: "Copenhagen",
  country: "Denmark",
} as const;

export const MAX_HEADSHOT_BYTES = 8 * 1024 * 1024;
export const MAX_CASTING_MEDIA_BYTES = 50 * 1024 * 1024;
export const MAX_CASTING_MEDIA_FILES = 6;

export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const DEFAULT_PHONE_COUNTRY =
  process.env.NEXT_PUBLIC_DEFAULT_PHONE_COUNTRY || "DK";

export const DEMO_INVITE_TOKEN =
  process.env.NEXT_PUBLIC_DEMO_CAST_INVITE_TOKEN || "demo-cast-active";

export const DEMO_MEDIA_REQUEST_TOKEN =
  process.env.NEXT_PUBLIC_DEMO_MEDIA_REQUEST_TOKEN || "demo-media-request";

export const DEMO_EXPIRED_TOKEN =
  process.env.NEXT_PUBLIC_DEMO_EXPIRED_TOKEN || "demo-expired";
