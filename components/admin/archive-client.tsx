"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CreateModelDialog } from "@/components/admin/create-model-dialog";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MicroBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { modelProfilePath } from "@/lib/admin-links";
import type { Model } from "@/types/app";
import { formatPhone } from "@/lib/phone";

type VisibilityFilter = "all" | "visible" | "hidden";

export function AdminArchiveClient({ models }: { models: Model[] }) {
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return models.filter((model) => {
      if (visibility === "hidden" && !model.is_hidden) return false;
      if (visibility === "visible" && model.is_hidden) return false;
      if (!normalized) return true;
      return [model.name, model.city, model.hair_color, model.eye_color]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [models, query, visibility]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Talent archive"
        title="All approved models"
        action={<CreateModelDialog />}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-graphite" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search archive"
            className="h-10 rounded-none bg-paper pl-9"
          />
        </div>
        <div className="flex border border-ledger bg-card p-1">
          {(
            [
              ["all", "All"],
              ["visible", "Public"],
              ["hidden", "Hidden"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setVisibility(value)}
              className={`micro-label px-3 py-1.5 transition ${
                visibility === value
                  ? "bg-ledger text-paper"
                  : "text-graphite hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((model) => (
            <Link
              key={model.id}
              href={modelProfilePath(model.phone, { from: "archive" })}
              className="group border border-ledger bg-card transition hover:bg-manila/20"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={model.headshot_url}
                  alt={model.name}
                  className="size-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
                {model.is_hidden && (
                  <MicroBadge
                    tone="hidden"
                    className="absolute top-2 left-2 bg-manila/95 backdrop-blur"
                  >
                    Hidden
                  </MicroBadge>
                )}
              </div>
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-xl leading-tight">
                      {model.name}
                    </h2>
                    <p className="mt-1 font-mono text-[12px] text-graphite">
                      {model.city || "City TBC"}
                      {model.age ? ` · ${model.age}` : ""}
                      {model.height_cm ? ` · ${model.height_cm} cm` : ""}
                    </p>
                  </div>
                  <MicroBadge tone="approved">Live</MicroBadge>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-ledger pt-2.5">
                  <span className="font-mono text-[12px] text-graphite">
                    {formatPhone(model.phone)}
                  </span>
                  <span className="font-mono text-[12px] text-graphite">
                    {model.hair_color || "—"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No models match that filter."
          description="Try a different search or visibility filter."
        />
      )}
    </div>
  );
}
