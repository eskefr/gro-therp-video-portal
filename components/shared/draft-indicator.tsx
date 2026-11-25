"use client";

import { Check, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DraftIndicator({
  status,
  savedAt,
  error,
  onRetry,
  className,
}: {
  status: string;
  savedAt: string | null;
  error: string | null;
  onRetry?: () => void;
  className?: string;
}) {
  if (status === "idle") return null;

  const time = savedAt
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(savedAt))
    : null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 font-mono text-[10px] leading-4 tracking-[0.02em] text-graphite uppercase",
        status === "error" && "text-destructive",
        className,
      )}
      aria-live="polite"
    >
      {status === "pending" && (
        <>
          <span className="size-1.5 border border-ledger bg-manila" />
          Autosave on
        </>
      )}
      {status === "saving" && (
        <>
          <Loader2 className="size-3 animate-spin text-ledger" />
          Saving draft…
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="size-3 text-ledger" />
          Draft saved{time ? ` · ${time}` : ""}
        </>
      )}
      {status === "error" && (
        <>
          <CloudOff className="size-3" />
          {error || "Draft not saved"}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-1 underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </>
      )}
    </div>
  );
}
