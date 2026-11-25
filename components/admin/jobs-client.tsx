"use client";

import Link from "next/link";
import { ArrowUpRight, Film, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CreateCastDialog } from "@/components/admin/create-cast-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { MicroBadge } from "@/components/shared/status-badge";
import { formatShootDates } from "@/lib/dates";
import type { CastWithCount } from "@/types/app";

export function JobsClient({ casts }: { casts: CastWithCount[] }) {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Casts & jobs"
        title="Casting board"
        description="Open casts, attached talent, and the links that keep everything moving."
        action={<CreateCastDialog />}
      />

      {casts.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {casts.map((cast) => (
            <Link
              key={cast.id}
              href={`/admin/jobs/${cast.id}`}
              className="group flex flex-col justify-between border border-border bg-card p-5 transition hover:border-foreground/30"
            >
              <div className="flex items-start justify-between gap-3">
                <MicroBadge tone={cast.status}>{cast.status}</MicroBadge>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </div>
              <div className="mt-8">
                <p className="micro-label text-muted-foreground">
                  {cast.client_name || "Independent"}
                </p>
                <h2 className="mt-2 font-display text-3xl leading-[1.02] tracking-[-0.03em]">
                  {cast.title}
                </h2>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatShootDates(cast.shoot_start, cast.shoot_end)}
                  {cast.location ? ` · ${cast.location}` : ""}
                </p>
              </div>
              <div className="mt-7 flex items-center gap-5 border-t border-border pt-4">
                <span className="micro-label inline-flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-3" />
                  {cast.memberCount} models
                </span>
                <span className="micro-label inline-flex items-center gap-1.5 text-muted-foreground">
                  <Film className="size-3" />
                  {cast.mediaCount} media
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No casts yet."
          description="Create your first cast, add talent from the archive, and send a magic link."
        />
      )}
    </div>
  );
}
