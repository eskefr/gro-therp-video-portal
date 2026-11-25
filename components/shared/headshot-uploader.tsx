"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadAsset } from "@/lib/upload-client";
import { MAX_HEADSHOT_BYTES } from "@/lib/constants";
import { formatBytes, IMAGE_MIME_TYPES } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { DraftHeadshot } from "@/types/app";

export function HeadshotUploader({
  value,
  onChange,
  purpose,
  invitationToken,
  label = "Headshot",
  hint = "A clean portrait, natural light. JPEG, PNG, or WebP.",
  required,
}: {
  value: DraftHeadshot | null;
  onChange: (value: DraftHeadshot | null) => void;
  purpose: "application-headshot" | "invitation-headshot" | "admin-headshot";
  invitationToken?: string;
  label?: string;
  hint?: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
      setError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_HEADSHOT_BYTES) {
      setError(`That image is too large. Maximum ${formatBytes(MAX_HEADSHOT_BYTES)}.`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadAsset({
        file,
        purpose,
        invitationToken,
      });
      onChange({
        path: uploaded.path,
        url: uploaded.publicUrl || URL.createObjectURL(file),
        name: uploaded.name,
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="micro-label text-graphite">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
        <span className="stamp text-[10px] text-graphite">
          Max {formatBytes(MAX_HEADSHOT_BYTES)}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_MIME_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {value ? (
        <div className="relative flex items-center gap-4 border border-ledger bg-manila/45 p-3">
          <img
            src={value.url}
            alt="Headshot preview"
            className="size-24 shrink-0 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[11px]">
              {value.name || "Headshot uploaded"}
            </p>
            <p className="mt-1 font-mono text-[10px] text-graphite">
              Uploaded and ready for review.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="micro-label mt-3 border-b border-ledger pb-0.5"
            >
              Replace image
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 flex size-7 items-center justify-center border border-ledger bg-paper text-graphite hover:bg-manila hover:text-ink"
            aria-label="Remove headshot"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex min-h-32 w-full flex-col items-center justify-center gap-3 border border-dashed border-ledger bg-manila/25 px-5 py-7 text-center transition hover:bg-manila/60",
            dragging && "bg-manila",
          )}
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-ledger" />
          ) : (
            <ImagePlus className="size-5 text-ledger" />
          )}
          <span className="micro-label text-ink">
            {uploading ? "Uploading headshot…" : "Choose a headshot"}
          </span>
          <span className="max-w-xs font-mono text-[10px] leading-5 text-graphite">
            {hint}
          </span>
        </button>
      )}

      {error && <p className="mt-2 font-mono text-[10px] text-destructive">{error}</p>}
    </div>
  );
}
