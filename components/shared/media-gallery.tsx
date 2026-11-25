"use client";

import { useState } from "react";
import { Film, Image as ImageIcon, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SignedMedia } from "@/types/app";
import { cn } from "@/lib/utils";

function srcFor(media: SignedMedia) {
  return media.signedUrl || media.url || "";
}

export function MediaGallery({
  media,
  title = "Casting media",
  className,
}: {
  media: SignedMedia[];
  title?: string;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);

  if (!media.length) {
    return (
      <p className="text-xs leading-5 text-graphite">
        No casting media submitted yet.
      </p>
    );
  }

  const active = media[Math.min(activeIndex, media.length - 1)];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className={cn("grid grid-cols-3 gap-2", className)}>
        {media.map((item, index) => (
          <DialogTrigger asChild key={item.id}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative aspect-square overflow-hidden border border-ledger bg-muted text-left"
              aria-label={`Open ${item.name}`}
            >
              {item.kind === "video" ? (
                <video
                  src={srcFor(item)}
                  muted
                  playsInline
                  preload="metadata"
                  className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <img
                  src={srcFor(item)}
                  alt={item.name}
                  className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              )}
              <span className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />
              <span className="absolute right-1.5 bottom-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white">
                {item.kind === "video" ? (
                  <Play className="size-3 fill-current" />
                ) : (
                  <ImageIcon className="size-3" />
                )}
              </span>
            </button>
          </DialogTrigger>
        ))}
      </div>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden border-ledger bg-ink p-0 text-white sm:max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
          <DialogTitle className="font-display text-lg font-normal text-white">
            {title}
          </DialogTitle>
          <span className="micro-label flex items-center gap-1.5 text-white/50">
            {active.kind === "video" ? (
              <Film className="size-3" />
            ) : (
              <ImageIcon className="size-3" />
            )}
            {activeIndex + 1} / {media.length}
          </span>
        </DialogHeader>
        <div className="flex min-h-[300px] items-center justify-center bg-black p-3 sm:min-h-[480px]">
          {active.kind === "video" ? (
            <video
              key={active.id}
              src={srcFor(active)}
              controls
              autoPlay
              playsInline
              className="max-h-[70vh] w-full"
            />
          ) : (
            <img
              key={active.id}
              src={srcFor(active)}
              alt={active.name}
              className="max-h-[70vh] w-auto object-contain"
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-3">
          <p className="truncate text-xs text-white/60">{active.name}</p>
          <a
            href={srcFor(active)}
            target="_blank"
            rel="noreferrer"
            className="micro-label text-white/60 hover:text-white"
          >
            Open file
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
