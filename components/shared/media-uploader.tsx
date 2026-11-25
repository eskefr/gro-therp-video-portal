"use client";

import { useEffect, useRef, useState } from "react";
import { Film, ImagePlus, Loader2, Play, Upload, X } from "lucide-react";
import { MAX_CASTING_MEDIA_BYTES, MAX_CASTING_MEDIA_FILES } from "@/lib/constants";
import { CASTING_MIME_TYPES, formatBytes } from "@/lib/media";
import { mediaKind, uploadAsset } from "@/lib/upload-client";
import type { SignedMedia } from "@/types/app";
import { cn } from "@/lib/utils";

export function MediaUploader({
  token,
  media,
  onChange,
  onBusyChange,
  disabled,
}: {
  token: string;
  media: SignedMedia[];
  onChange: (media: SignedMedia[]) => void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const localUrls = useRef<Map<string, string>>(new Map());
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const busy = uploading > 0;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    const urls = localUrls.current;
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;
    setError(null);

    const slots = MAX_CASTING_MEDIA_FILES - media.length;
    if (slots <= 0) {
      setError(`You can upload up to ${MAX_CASTING_MEDIA_FILES} files.`);
      return;
    }

    const accepted: File[] = [];
    for (const file of files.slice(0, slots)) {
      if (!(CASTING_MIME_TYPES as readonly string[]).includes(file.type)) {
        setError("Use JPEG, PNG, WebP, MP4, MOV, or WebM files.");
        continue;
      }
      if (file.size > MAX_CASTING_MEDIA_BYTES) {
        setError(
          `Each file must be under ${formatBytes(MAX_CASTING_MEDIA_BYTES)}.`,
        );
        continue;
      }
      accepted.push(file);
    }

    if (!accepted.length) return;

    setUploading(accepted.length);
    const uploadedItems: SignedMedia[] = [];
    const failures: string[] = [];

    await Promise.all(
      accepted.map(async (file) => {
        try {
          const uploaded = await uploadAsset({
            file,
            purpose: "invitation-media",
            invitationToken: token,
          });
          const localUrl = URL.createObjectURL(file);
          localUrls.current.set(uploaded.path, localUrl);
          uploadedItems.push({
            id: crypto.randomUUID(),
            kind: mediaKind(file),
            path: uploaded.path,
            name: file.name,
            mime: file.type,
            size: file.size,
            signedUrl: localUrl,
          });
        } catch (uploadError) {
          failures.push(
            uploadError instanceof Error
              ? uploadError.message
              : "An upload failed.",
          );
        } finally {
          setUploading((count) => Math.max(0, count - 1));
        }
      }),
    );

    if (uploadedItems.length) {
      onChange([...media, ...uploadedItems]);
    }
    if (failures.length) {
      setError(failures[0]);
    }
  }

  function remove(item: SignedMedia) {
    const local = item.path ? localUrls.current.get(item.path) : null;
    if (local) {
      URL.revokeObjectURL(local);
      localUrls.current.delete(item.path as string);
    }
    onChange(media.filter((entry) => entry.id !== item.id));
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="micro-label text-ink">
          Casting photos & video
          <span className="ml-1 text-destructive">*</span>
        </span>
        <span className="stamp text-[12px] text-graphite">
          {media.length} / {MAX_CASTING_MEDIA_FILES} · Max{" "}
          {formatBytes(MAX_CASTING_MEDIA_BYTES)} each
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={CASTING_MIME_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {media.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {media.map((item) => {
            const src = item.signedUrl || item.url;
            return (
              <div
                key={item.id}
                className="group relative aspect-[3/4] overflow-hidden border border-ledger bg-manila/40"
              >
                {item.kind === "video" ? (
                  <>
                    <video
                      src={src}
                      muted
                      playsInline
                      preload="metadata"
                      className="size-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                      <span className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white">
                        <Play className="size-3.5 fill-current" />
                      </span>
                    </span>
                  </>
                ) : (
                  <img
                    src={src}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pt-8 pb-1.5">
                  <p className="truncate text-[12px] text-white/85">{item.name}</p>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="size-3" />
                  </button>
                )}
                <span className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-black/45 text-white">
                  {item.kind === "video" ? (
                    <Film className="size-3" />
                  ) : (
                    <ImagePlus className="size-3" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {media.length < MAX_CASTING_MEDIA_FILES && (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!disabled) void handleFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 border border-dashed border-ledger bg-manila/25 px-5 py-7 text-center transition hover:bg-manila/60 disabled:opacity-60",
            dragging && "bg-manila",
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin text-ledger" />
          ) : (
            <Upload className="size-5 text-ledger" />
          )}
          <span className="micro-label text-ink">
            {busy
              ? `Uploading ${uploading} file${uploading === 1 ? "" : "s"}…`
              : "Drop files or choose from your device"}
          </span>
          <span className="font-mono text-[12px] leading-5 text-graphite">
            Photos and short casting clips. Keep it natural and current.
          </span>
        </button>
      )}

      {error && <p className="mt-2 font-mono text-[12px] text-destructive">{error}</p>}
    </div>
  );
}
