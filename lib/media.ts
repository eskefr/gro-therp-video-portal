import type { MediaKind } from "@/types/app";

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export const CASTING_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
] as const;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export function extensionForMime(mime: string) {
  return EXTENSION_BY_MIME[mime] ?? null;
}

export function isImageMime(mime: string) {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

export function isVideoMime(mime: string) {
  return (VIDEO_MIME_TYPES as readonly string[]).includes(mime);
}

export function mediaKindFromMime(mime: string): MediaKind {
  return isVideoMime(mime) ? "video" : "image";
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mediaKindFromUrl(url: string): MediaKind {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|mov|webm|m4v)$/.test(clean)) return "video";
  return "image";
}

export function sanitizeFilename(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
}
